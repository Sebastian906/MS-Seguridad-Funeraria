import {Entity, model, property} from '@loopback/repository';

@model()
export class RolMenu extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  Guardar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  Editar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  Listar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  Eliminar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  Descargar: boolean;

  @property({
    type: 'string',
  })
  rolId?: string;

  @property({
    type: 'string',
  })
  menuId?: string;

  constructor(data?: Partial<RolMenu>) {
    super(data);
  }
}

export interface RolMenuRelations {
  // describe navigational properties here
}

export type RolMenuWithRelations = RolMenu & RolMenuRelations;
