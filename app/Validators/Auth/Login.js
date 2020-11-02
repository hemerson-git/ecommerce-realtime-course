'use strict';

class Login {
  get validateAll () {
    return true;
  }
  
  get rules () {
    return {
      // validation rules
      email: 'required|email',
      password: 'required',
    };
  }

  get messages() {
    return {
      'email.required': 'O e-mail é obrigatório',
      'email.email': 'E-mail incorreto',
      'password': 'A senha é obrigatória',
    };
  }
}

module.exports = Login;
