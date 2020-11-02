'use strict';

class StoreCategory {
  get rules () {
    return {
      // validation rules
      title: 'required',
      description: 'required',
    };
  }
}

module.exports = StoreCategory;
