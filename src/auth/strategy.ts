import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {RolMenuRepository} from '../repositories';
import {SeguridadUsuarioService} from '../services';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private servicioSeguridad: SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository
  ) {

  }

  /**
   * Autenticación de un usuario frente a una acción en la base de datos
   * @param request la solicitud con el token
   * @returns el perfil de usuario, undefined cuando no tiene el permiso o un HttpError
   */
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let token = parseBearerToken(request);
    if(token) {
      let idRol = this.servicioSeguridad.obtenerRolDesdeToken(token);
      let idMenu: string = this.metadata.options![0];
      let accion: string = this.metadata.options![1];

      let permiso = await this.repositorioRolMenu.findOne({
        where: {
          rolId: idRol,
          menuId: idMenu,
        }
      });
      let continuar: boolean = false;
      if(permiso) {
        switch(accion) {
          case "Guardar":
            continuar = permiso.Guardar;
            break;
          case "Editar":
            continuar = permiso.Editar;
            break;
          case "Eliminar":
            continuar = permiso.Eliminar;
            break;
          case "Listar":
            continuar = permiso.Listar;
            break;
          case "Descargar":
            continuar = permiso.Descargar;
            break;
          default:
            throw new HttpErrors[401]("No es posible ejecutar la acción porque no existe.");
        }
        if (continuar) {
          let perfil: UserProfile = Object.assign({
            permitido: "OK"
          });
          return perfil;
        } else {
          return undefined;
        }
      } else {
        throw new HttpErrors[401]("No es posible ejecutar la acción por falta de permisos.");
      }
    }
    throw new HttpErrors[401]("No es posible ejecutar la acción por falta de un token.");
  }

}
