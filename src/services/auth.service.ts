import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {RolMenuRepository} from '../repositories';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository
  ) {}

  async VerificarPermisoDeUsuarioPorRol(idRol: string, idMenu: string, accion: string): Promise<UserProfile | undefined> {
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

}
