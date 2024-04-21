import {Model, model, property} from '@loopback/repository';

@model()
export class PermisosRolMenu extends Model {
  @property({
    type: 'string',
    required: true,
  })
  idRol: string;

  @property({
    type: 'string',
    required: true,
  })
  idMenu: string;

  @property({
    type: 'string',
    required: true,
  })
  accion: string;


  constructor(data?: Partial<PermisosRolMenu>) {
    super(data);
  }
}

export interface PermisosRolMenuRelations {
  // describe navigational properties here
}

export type PermisosRolMenuWithRelations = PermisosRolMenu & PermisosRolMenuRelations;
