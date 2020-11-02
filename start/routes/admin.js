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

  Route.resource('categories', 'CategoryController').apiOnly().validator(new Map([
    [['categories.store'], ['Admin/StoreCategory']],
    [['categories.update'], ['Admin/StoreCategory']],
  ]));

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
  Route.resource('orders', 'OrderController').apiOnly().validator(new Map([
    [['orders.store'], ['Admin/StoreOrder']],
  ]));

  /**
   * User resource routes
   */

  Route.resource('images', 'ImageController').apiOnly();

  /**
   * Image resource routes
   */

  Route.resource('users', 'UserController').apiOnly().validator(new Map([
    [['users.store'], ['Admin/StoreUser']],
    [['users.update'], ['Admin/StoreUser']],
  ]));
}).prefix('v1/admin').namespace('Admin').middleware(['auth', 'is:( admin || manager )']);
