'use strict';

class Register {
  get rules () {
    return {
      // validation rules
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed',
    };
  }
}

module.exports = Register;
