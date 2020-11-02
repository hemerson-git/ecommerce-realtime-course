'use strict';

class StoreUser {
  get rules () {
    let userID = this.ctx.params.id;
    let rule = '';
    // Significa que o usuário está atulaizando 
    
    if(userID) {
      rule = `unique:users,email,id,${userID}`;
    } else {
      rule = 'unique:users,email|required';
    }
    
    return {
      // validation rules
      email: rule,
      image_id: 'exists:images,id',
    };
  }
}

module.exports = StoreUser;
