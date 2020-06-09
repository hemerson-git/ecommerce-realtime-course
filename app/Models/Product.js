'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Product extends Model {
  image() {
    return this.belongsTo('App/Models/Image');
  }

  /**
   * Relacionamento entre produto e imagens
   * Faleria de imagens do produto
   */

  images() {
    return this.belongsTo('App/Models/Image');
  }

  /**
   * Relacinamento entre produto e categorias
   */

  categories() {
    return this.belongsToMany('App/Models/Category');
  }

  /**
   * Relacionamento entre produto e cupons de desconto
   */

  coupons() {
    return this.belongsToMany('App/Models/Coupon');
  }
}

module.exports = Product;
