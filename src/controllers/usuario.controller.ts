import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
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
  Request,
  requestBody,
  response,
  RestBindings
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {ConfiguracionNotificaciones} from '../config/notificaciones.config';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, HashValidacionUsuario, Login, PermisosRolMenu, Usuario} from '../models';
import {CredencialesRecuperarClave} from '../models/credenciales-recuperar-clave.model';
import {LoginRepository, UsuarioRepository} from '../repositories';
import {AuthService, NotificacionesService, SeguridadUsuarioService} from '../services';


export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(SeguridadUsuarioService)
    public servicioSeguridad: SeguridadUsuarioService,
    @repository(LoginRepository)
    public respositorioLogin: LoginRepository,
    @service(AuthService)
    private servicioAuth: AuthService,
    @service(NotificacionesService)
    public servicioNotificaciones: NotificacionesService
  ) { }

  @authenticate({
    strategy: "auth",
    options: ["Usuario", "guardar"]
  })

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
    usuario.estadoValidacion = true;
    // enviar correo electrónico de notificación
    return this.usuarioRepository.create(usuario);
  }

  @post('/usuario-publico')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async creacionPublica(
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
    // has de validacion de correo
    let hash = this.servicioSeguridad.crearTextoAleatorio(100);
    usuario.hasValidacion = hash;
    usuario.estadoValidacion = false;
    usuario.aceptado = false;
    usuario.rolId = ConfiguracionSeguridad.rolUsuarioPublico;

    // Notificacion del hash
    let enlace = `<a href="${ConfiguracionNotificaciones.urlValidacionCorreoFrontend}/${hash}" target='_blank'>Validar</a>`;
    let datos = {
      destination: usuario.Correo,
      message: "Hola " + usuario.PrimerNombre + " Por favor visite este link para validar su correo " + ConfiguracionNotificaciones.contenidoCorreo + `${enlace}`,
      subject: ConfiguracionNotificaciones.asuntoVerificacionCorreo,
    };
    let url = ConfiguracionNotificaciones.urlNotificaciones + "/email";
    this.servicioNotificaciones.EnviarCorreoElectronico(datos, url);

    // Envio de Clave
    let datosCorreo = {
      destination: usuario.Correo,
      message: "Hola  " + usuario.PrimerNombre + " Su clave de acceso es: " + `${clave}`,
      subject: ConfiguracionNotificaciones.claveAsignada,
    };
    this.servicioNotificaciones.EnviarCorreoElectronico(datosCorreo, url);

    // enviar correo electrónico de notificación
    return this.usuarioRepository.create(usuario);
  }

  @post('/cambiar-clave')
  @response(200, {
    description: 'Se cambia la clave de un usuario',
  })
  async cambiarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['usuario', 'claveActual', 'nuevaClave'],
            properties: {
              usuario: {type: 'string'},
              claveActual: {type: 'string'},
              nuevaClave: {type: 'string'},
            },
          },
        },
      },
    })
    datos: { usuario: string, claveActual: string, nuevaClave: string },
    //@inject(RestBindings.Http.REQUEST) request: Request
  ): Promise<void> {
    console.log('Datos recibidos del frontend:', datos);
    console.log("Datos usuarioRepository", this.usuarioRepository)
    let usuario = await this.usuarioRepository.findOne({
      where: {
        Correo: datos.usuario
      }
    });

    if (!usuario) {
      throw new HttpErrors.Unauthorized('No se encontró el usuario');
    }

    const claveCifradaActual = this.servicioSeguridad.cifrarTexto(datos.claveActual);
    console.log('Contraseña cifrada actual:', claveCifradaActual);
    console.log('Contraseña almacenada en la base de datos:', usuario.Clave);
    if (usuario.Clave !== claveCifradaActual) {
      throw new HttpErrors.Unauthorized('Las credenciales no son correctas');
    }

    const claveCifradaNueva = this.servicioSeguridad.cifrarTexto(datos.nuevaClave);
    console.log('Contraseña cifrada nueva:', claveCifradaNueva);
    usuario.Clave = claveCifradaNueva;

    await this.usuarioRepository.replaceById(usuario._id, usuario);
    console.log('Contraseña actualizada correctamente en la base de datos');

    let datosClaveNueva= { //
      destination: usuario.Correo,
      message: "Hola " + usuario.PrimerNombre + " Su clave de acceso ha sido cambiada exitosamente " + ConfiguracionNotificaciones.cambioCalve + `${datos.nuevaClave}`,
      subject: ConfiguracionNotificaciones.asuntoCambiodeClave,
    };
    console.log('Datos de correo:', datosClaveNueva);
    return this.servicioNotificaciones.EnviarCorreoElectronico(datosClaveNueva, ConfiguracionNotificaciones.urlNotificaciones + "/email");
  }

  @post('/validar-hash-usuario')
  @response(200, {
    description: 'Se valida el hash de un usuario',
  })
  async ValidarHashUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(HashValidacionUsuario, {}),
        },
      },
    })
    hash: HashValidacionUsuario,
  ): Promise<boolean> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        hasValidacion: hash.codigoHash,
        estadoValidacion: false
      }
    });
    if (usuario) {
      usuario.estadoValidacion = true;
      this.usuarioRepository.replaceById(usuario._id, usuario);
      return true;
    }
    return false;
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

  @authenticate({
    strategy: "auth",
    options: [ConfiguracionSeguridad.menuUsuarioId, ConfiguracionSeguridad.listarAccion]
  })
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

  @post('/recuperar-clave')
  @response(200, {
    description: 'Envía la contraseña al usuario con el correo correspondiente',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async RecuperarClaveUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredencialesRecuperarClave),
        },
      },
    })
    credenciales: CredencialesRecuperarClave,
  ): Promise<object> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        Correo: credenciales.correo,
      },
    });
    if (usuario) {
      let nuevaClave = this.servicioSeguridad.crearTextoAleatorio(5);
      console.log(nuevaClave);
      let claveCifrada = this.servicioSeguridad.cifrarTexto(nuevaClave);
      usuario.Clave = claveCifrada;
      this.usuarioRepository.updateById(usuario._id, usuario);

      // notificar al usuario via correo o sms

      let datos = {
        destination: usuario.Correo,
        message: "Hola" + usuario.PrimerNombre + ConfiguracionNotificaciones.contenidoCorreo + `${nuevaClave}`,
        subject: ConfiguracionNotificaciones.nuevaClave,
      };
      let url = ConfiguracionNotificaciones.urlNotificaciones + "/email";
      this.servicioNotificaciones.EnviarCorreoElectronico(datos, url);
      return usuario;
    }
    return new HttpErrors[401]('Credenciales incorrectas.');
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
      let datos = {
        destination: usuario.Correo,
        message: "Hola" + usuario.PrimerNombre + ConfiguracionNotificaciones.contenidoCorreo + `${codigo2fa}`,
        subject: ConfiguracionNotificaciones.asunto2fa,
      };
      let url = ConfiguracionNotificaciones.urlNotificaciones + "/email";
      this.servicioNotificaciones.EnviarCorreoElectronico(datos, url);
      return usuario;
    }
    return new HttpErrors[401]("Las credenciales no son correctas");
  }

  @post('/validar-permisos')
  @response(200, {
    description: 'Validación de permisos de un usuario para lógica de negocio.',
    content: {'application/json': {schema: getModelSchemaRef(PermisosRolMenu)}}
  })
  async ValidarPermisosDeUsuario(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(PermisosRolMenu)
          }
        }
      }
    )
    datos: PermisosRolMenu
  ): Promise<UserProfile | undefined> {
    let idRol = this.servicioSeguridad.obtenerRolDesdeToken(datos.token);
    return this.servicioAuth.VerificarPermisoDeUsuarioPorRol(idRol, datos.idMenu, datos.accion);
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
      let menu = [];
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
        menu = await this.servicioSeguridad.ConsultarPermisosDeMenuPorUsuario(usuario.rolId);

        return {
          user: usuario,
          token: token,
          menu: menu
        };
      }

    }
    return new HttpErrors[401]("Codigo de 2fa invalido para el usuario seleccionado");
  }

}
