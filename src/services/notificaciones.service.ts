import { /* inject, */ BindingScope, injectable} from '@loopback/core';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class NotificacionesService {
  constructor(/* Add @inject to inject parameters */) {}

  EnviarCorreoElectronico(datos: any, url: string) {
    console.log('Enviando correo electrónico a: ' +  JSON.stringify(datos));
    fetch(url, {
      method: 'post',
      body:    JSON.stringify(datos),
      headers: { 'Content-Type': 'application/json'},
    })
  }

}
