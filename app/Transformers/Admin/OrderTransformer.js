'use strict';

const UserTransformer = require('App/Transformers/Admin/UserTransformer');
const OrderItemTransformer = require('App/Transformers/Admin/OrderItemTransformer');
const CouponTransformer = require('App/Transformers/Admin/CouponTransformer');
const DiscountTransformer = require('App/Transformers/Admin/DiscountTransformer');

const BumblebeeTransformer = use('Bumblebee/Transformer');

/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {
  availableInclude() {
    return ['user', 'coupons', 'discounts', 'items' ];
  }
  
  /**
   * This method is used to transform the data.
   */
  transform (order) {
    order = order.toJSON();
    return {
      // add your transformation object here
      id: order.id,
      status: order.status,
      total: order.total ? parseFloat(order.total.toFixed(2)) : 0,
      date: order.created_at,
      qty_items: order.__meta__ && order.__meta__.qty_items ? order.__meta__.qty_items : 0,
      discount: order.__meta__ && order.__meta__.discount ? order.__meta__.discount : 0,
      subtotal: order.__meta__ && order.__meta__.subtotal ? order.__meta__.subtotal : 0,
    };
  }

  includeUser(order) {
    return this.item(order.getRelated('user', UserTransformer));
  }

  includeItems(order) {
    return this.item(order.getRelated('items', OrderItemTransformer));
  }

  includeCoupons(order) {
    return this.item(order.getRelated('coupons', CouponTransformer));
  }

  includeDiscounts(order) {
    return this.item(order.getRelated('discounts', DiscountTransformer));
  }
}

module.exports = OrderTransformer;
