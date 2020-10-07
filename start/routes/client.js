'use strict';

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

/**
 * Client Routes
 */

Route.group(() => {
  /**
   *  Product Resource Routes
   */

  Route.get('products', 'ProductController.index');
  Route.get('products/:id', 'ProductController.show');

  /**
   * Order Resource Routes
   */

  Route.get('orders', 'OrdersController.index');
  Route.get('orders/:id', 'OrdersController.show');
  Route.post('orders', 'OrderController.store');
  Route.put('orders/:id', 'OrderController.put');
}).prefix('v1').namespace('client');
