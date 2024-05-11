import {Model, model, property} from '@loopback/repository';

@model()
export class HashValidacionUsuario extends Model {
  @property({
    type: 'string',
    required: true,
  })
  codigoHash: string;


  constructor(data?: Partial<HashValidacionUsuario>) {
    super(data);
  }
}

export interface HashValidacionUsuarioRelations {
  // describe navigational properties here
}

export type HashValidacionUsuarioWithRelations = HashValidacionUsuario & HashValidacionUsuarioRelations;
