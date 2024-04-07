import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Usuario} from './usuario.model';

@model()
export class Login extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  Codigo2FA: string;

  @property({
    type: 'string',
    required: true,
  })
  EstadoCodigo2FA: boolean;

  @property({
    type: 'string',
  })
  Token?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  EstadoToken: boolean;

  @belongsTo(() => Usuario)
  usuarioId: string;

  constructor(data?: Partial<Login>) {
    super(data);
  }
}

export interface LoginRelations {
  // describe navigational properties here
}

export type LoginWithRelations = Login & LoginRelations;
