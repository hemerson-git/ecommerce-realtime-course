'use strict';

class Register {
  get validateAll () {
    return true;
  }
  
  get rules () {
    return {
      // validation rules
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed',
    };
  }

  get messages() {
    return {
      'name.required': 'O Nome é obrigatório!',
      'surname.required': 'O Sobrenome é obrigatório!',
      'email.required' : 'O e-mail é obrigatório',
      'email.email' : 'E-mail inválido',
      'email.unique' : 'Este E-mail já existe',
      'password.required' : 'A senha é obrigatória',
      'password.confirmed': 'As senhas não são iguais',
    };
  }
}

module.exports = Register;
