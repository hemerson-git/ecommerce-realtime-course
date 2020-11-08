'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

/**
 * Retorna o usuário logado atualmente
 */

Route.get('v1/me', 'UserController.me').as('me').middleware('auth');

/**
 * Import Authentication routes
 */

require('./auth');

/**
 * Import Admin routes
 */

require('./admin');

/**
 * Import Client routes
 */

require('./client');
