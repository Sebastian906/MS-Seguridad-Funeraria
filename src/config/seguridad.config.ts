export namespace ConfiguracionSeguridad {
  export const claveJWT = process.env.SECRET_PASSWORD_JWT;
  export const menuUsuarioId = "660c36a5f2d17933082d1122";
  export const listarAccion = "Listar";
  export const guardarAccion = "Guardar";
  export const editarAccion = "Editar";
  export const eliminarAccion = "Eliminar";
  export const descargarAccion = "Descargar";
  export const mongodbConnectionString = process.env.CONNECTION_STRING_MONGODB;
  export const rolUsuarioPublico = "66441670b3f05d3abcda979e";
}
