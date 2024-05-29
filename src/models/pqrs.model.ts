import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Pqrs extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id_Pqrs?: number;

  @property({
    type: 'string',
    required: true,
  })
  nombreCompleto: string;

  @property({
    type: 'string',
    required: true,
  })
  Correo: string;

  @property({
    type: 'string',
    required: true,
  })
  Asunto: string;

  @property({
    type: 'string',
    required: true,
  })
  Descripcion: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Pqrs>) {
    super(data);
  }
}

export interface PqrsRelations {
  // describe navigational properties here
}

export type PqrsWithRelations = Pqrs & PqrsRelations;
