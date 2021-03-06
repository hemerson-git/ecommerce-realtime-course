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

  Route.get('orders', 'OrderController.index').middleware(['auth']);
  Route.get('orders/:id', 'OrderController.show').middleware(['auth']);
  Route.post('orders', 'OrderController.store').middleware(['auth']);
  Route.put('orders/:id', 'OrderController.put').middleware(['auth']);
}).prefix('v1').namespace('client');
