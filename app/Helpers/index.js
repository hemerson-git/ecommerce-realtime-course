'use strict';

const crypto = use('crypto');
const Helpers = use('Helpers');

/**
 * Generate ramdom strings
 * 
 * @param { int } length - O tamanho da string desejada
 * @return { string } - A string gerada
 */

const str_random = async (length = 40) => {
  let str = '';
  let len = str.length;

  if(len < length) {
    let size = length - len;
    let bytes = await crypto.randomBytes(size);
    let buffer = new Buffer.from(bytes);
    str += buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, size);
  }

  return str;
};

/**
 *  Move um único arquivo para o caminho especificado, se nunhum for especificado
 *  então 'public/uploads' será utilizada
 * @param { FileJar } file o arquivo a ser  gerenciado
 * @param { string } path o caminho para onde o arquivo dece ser movido
 */


const manage_single_upload = async (file, path = null) => {
  path = path ? path : Helpers.publicPath('upload');

  // gera um nome aleatorio
  const random_name = await str_random(30);
  let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`;
  
  // renomeia o arquivo e move ele para o path
  await file.move(path, {
    name: filename,
  });

  return file;
};
 
module.exports = {
  str_random,
};
