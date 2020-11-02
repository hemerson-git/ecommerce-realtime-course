'use strict';

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

/**
 * Admin Routes
 */

Route.group(() => {
  /**
   * Categories resource routes
   */

  Route.resource('categories', 'CategoryController').apiOnly();

  /**
   * Product resource routes
   */

  Route.resource('products', 'ProductController').apiOnly();

  /**
   * Coupon resource routes
   */

  Route.resource('coupons', 'CouponController').apiOnly();

  /**
   * Image resource routes
   */

  Route.post('orders/:id/discount', 'OrderController.applyDiscount');
  Route.delete('orders:id/discount', 'OrderController.removeDiscount');
  Route.resource('orders', 'OrderController').apiOnly();

  /**
   * User resource routes
   */

  Route.resource('images', 'ImageController').apiOnly();

  /**
   * Image resource routes
   */

  Route.resource('users', 'UserController').apiOnly();
}).prefix('v1/admin').namespace('Admin');
