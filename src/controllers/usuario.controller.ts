import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response
} from '@loopback/rest';
import {Credenciales, FactorDeAutenticacionPorCodigo, Login, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
import {SeguridadUsuarioService} from '../services';


export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(SeguridadUsuarioService)
    public servicioSeguridad: SeguridadUsuarioService,
    @repository(LoginRepository)
    public respositorioLogin: LoginRepository
  ) { }

  @post('/usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>
  ): Promise<Usuario> {

    // crear la clave
    let clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    // cifrar la clave
    let claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    // asignar la clave cifrada al usuario
    usuario.Clave = claveCifrada;
    // enviar correo electrónico de notificación
    return this.usuarioRepository.create(usuario);
  }

  @get('/usuario/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @authenticate("auth")
  @get('/usuario')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuario')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuario/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuario/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuario/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuario/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  /**
   * Metodos Personalizados para la API
  */
  /**
   *  Identificar un Usuario
   * @param credenciales  Credenciales de acceso
   * @returns  Usuario
   */
  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificar un Usuario por un correo y clave',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}}
  })
  async identificarUsuario(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(Credenciales)
          }
        }
      }
    )
    credenciales: Credenciales
  ): Promise<object> {
    let usuario = await this.servicioSeguridad.identificarUsuario(credenciales);
    if (usuario) {
      let codigo2fa = this.servicioSeguridad.crearTextoAleatorio(6);
      console.log(codigo2fa);
      let login: Login = new Login();
      login.usuarioId = usuario._id!;
      login.Codigo2FA = codigo2fa;
      login.EstadoCodigo2FA = false;
      login.Token = "";
      login.EstadoToken = false;
      this.respositorioLogin.create(login);
      usuario.Clave = "";
      //notificar al usuario via correo o sms
      return usuario;
    }
    return new HttpErrors[401]("Las credenciales no son correctas");

  }

  // Verificar el segundo factor de autenticación

  @post('/verificar-2fa')
  @response(200, {
    description: 'Validar un codigo de 2fa',
  })
  async VerificarCodigo2fa(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo)
          }
        }
      }
    )
    credenciales: FactorDeAutenticacionPorCodigo
  ): Promise<object> {
    let usuario = await this.servicioSeguridad.validarCodigo2fa(credenciales);
    if (usuario) {
      let token = this.servicioSeguridad.crearToken(usuario);
      if (usuario) {
        usuario.Clave = "";
        try {
          this.usuarioRepository.logins(usuario._id).patch(
            {
              EstadoCodigo2FA: true,
              Token: token
            },
            {
              EstadoCodigo2FA: false
            });
        } catch {
          console.log("No se ha almacenado el cammbio del estado de token en la base de datos.")
        }

        return {
          user: usuario,
          token: token
        };
      }

    }
    return new HttpErrors[401]("Codigo de 2fa invalido para el usuario seleccionado");
  }

}
