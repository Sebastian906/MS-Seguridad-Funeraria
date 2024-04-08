import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require("crypto-js/md5");
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
      @repository(UsuarioRepository) // Inyectar el repositorio de usuario
      public repositoryUsuario : UsuarioRepository, // Guardar el repositorio en una variable
      @repository(LoginRepository) // Inyectar el repositorio de login
      public repositoryLogin : LoginRepository, // Guardar el repositorio en una variable
    ) {}

  /**
   * Crear una clave aleatoria
   * @returns Cadena Aleatoria de n caracteres
   */
  crearTextoAleatorio(n: number): string{
    let clave = generator.generate({
      length: n,
      numbers: true
    });
    return clave;
  }

  /**
   * Cifrar una cadena de texto con metodo md5
   * @param cadena Cadena de texto a cifrar
   * @returns Cadena cifrada con md5
   */
  cifrarTexto(cadena:string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

  /**
   * Se busca un usuario por sus credenciales de acceso
   * @param credenciales  credenciales del usuario
   * @returns usuario o null
   */
  async identificarUsuario(credenciales: Credenciales): Promise <Usuario | null> {
    let usuario = await this.repositoryUsuario.findOne({
      where:{
        Correo: credenciales.correo,
        Clave: credenciales.clave,
      }
    });
    return usuario as Usuario;
  }

  /**
   * Valida el codigo de 2fa de un usuario
   * @param   credenciales2fa credenciales del usuario con el codig del 2fa
   * @returns registro de login o null
   */
  async validarCodigo2fa(credenciales2fa: FactorDeAutenticacionPorCodigo): Promise <Usuario | null> {
    let login = await this.repositoryLogin.findOne({
      where:{
        usuarioId: credenciales2fa.usuarioId,
        Codigo2FA: credenciales2fa.Codigo2fa,
        EstadoCodigo2FA: false
      }
    });
    if (login){
      let usuario = await this.repositoryUsuario.findById(credenciales2fa.usuarioId);
      return usuario;
    }
    return null;
  }

  /**
   * Genración del JWT
   * @param usuario información del usuario
   * @returns Token de acceso
   */
  crearToken(usuario: Usuario): string {
    let datos = {
      name: `${usuario.PrimerNombre} ${usuario.SegundoNombre} ${usuario.PrimerApellido} ${usuario.SegundoApellido}`,
      role: usuario.rolId,
      email: usuario.Correo,
    }
    let token = jwt.sign(datos, ConfiguracionSeguridad.claveJWT);
    return token;

  }

  /**
   * Valida y obtiene el rol de un token
   * @param tk el token
   * @returns el _id del tol
   */
  obtenerRolDesdeToken(tk:string):string {
    let obj = jwt.verify(tk, ConfiguracionSeguridad.claveJWT);
    return obj.role;
  }

}
