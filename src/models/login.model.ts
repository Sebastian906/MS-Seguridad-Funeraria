import {Entity, model, property} from '@loopback/repository';

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
    required: true,
  })
  Token: string;

  @property({
    type: 'boolean',
    required: true,
  })
  EstadoToken: boolean;


  constructor(data?: Partial<Login>) {
    super(data);
  }
}

export interface LoginRelations {
  // describe navigational properties here
}

export type LoginWithRelations = Login & LoginRelations;
