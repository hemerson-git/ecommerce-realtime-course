'use strict';

class AdminStoreCoupon {
  get rules () {
    return {
      // validation rules
      can_use_for: 'required',
    };
  }

  get messages() {
    return {
      'can_use_for' : 'required',
    };
  }
}

module.exports = AdminStoreCoupon;
