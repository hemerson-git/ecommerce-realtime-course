'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class CouponUserSchema extends Schema {
  up () {
    this.create('coupon_user', (table) => {
      table.increments();
      table.integer('coupon_id').unsigned();
      table.integer('item_id').unsigned();
      table.timestamps();

      table
        .foreign('coupon_id')
        .references('id')
        .inTable('coupons')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
      
      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    });
  }

  down () {
    this.drop('coupon_user');
  }
}

module.exports = CouponUserSchema;
