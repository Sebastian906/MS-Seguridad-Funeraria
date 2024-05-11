export namespace ConfiguracionNotificaciones {
  export const asunto2fa: string = 'Código de Verificación ';
  export const asuntoVerificacionCorreo: string = 'Validación de Correo Electrónico ';
  export const claveAsignada:string = 'Asignación de Clave'
  export const contenidoCorreo: string = `Su código de autenticación es: `;
  export const urlNotificaciones: string = 'http://localhost:5000';
  export const urlValidacionCorreoFrontend: string = 'http://localhost:4200/seguridad/validar-hash-usuario-publico';
}
