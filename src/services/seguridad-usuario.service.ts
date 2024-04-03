import { /* inject, */ BindingScope, injectable} from '@loopback/core';
const generator = require('generate-password');
const MD5 = require("crypto-js/md5");

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(/* Add @inject to inject parameters */) {}

  crearClave(): string{
    let clave = generator.generate({
      length: 10,
      numbers: true
    });
    return clave;
  }

  cifrarTexto(cadena:string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

}
