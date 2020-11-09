'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Product = use('App/Models/Product');
const Transformer = use('App/Transformers/Admin/ProductTransformer');

/**
 * Resourceful controller for interacting with products
 */
class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, pagination, transform }) {
    const title = request.input('title');
    const query = Product.query();  

    if (title) {
      query.where('name', 'LIKE', `%${title}%`);
    }

    let products = await query.paginate(pagination.page, pagination.limit || 10);
    products = await transform.paginate(products, Transformer);

    return response.send(products);
  }

  /**
   * Display a single product.
   * GET products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, transform, response}) {
    let product = await Product.findOrFail(id);
    product = await transform.item(product, Transformer);

    return response.send(product);
  }
}

module.exports = ProductController;
