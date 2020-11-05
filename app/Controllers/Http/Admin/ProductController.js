'use strict';

const Pagination = require('../../../Middleware/Pagination');

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
    const name = request.input('name');
    const query = Product.query();
    if (name) {
      query.where('name', 'LIKE', `%${name}%`);
    }
    let products = await query.paginate(pagination.page, pagination.limit || 10);
    products = await transform.paginate(products, Transformer);
    return response.send(products);
  }

  /**
   * Create/save a new product.
   * POST products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    try {
      const { name, description, price, image_id } = request.all();
      let product = await Product.create({ name, description, price, image_id });
      product = await transform.item(product, Transformer);

      return response.status(201).send(product);
    } catch(error) {
      return response.status(400).send({ message: 'Não foi possível criar o produto. Tente novamente!' });
    }

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
  async show ({ params: {id}, request, response, transform }) {
    let product = await Product.findOrFail(id);
    product = await transform.item(product, Transformer); 
    return response.send(product);
  }

  /**
   * Update product details.
   * PUT or PATCH products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: {id}, request, response, transform }) {
    let product = await Product.findOrFail(id);
    try {
      const { name, description, price } = request.all();
      await product.merge({ name, description, price });
      await product.save();
      product = await transform.item(product, Transformer); 
      return response.send(product);
    } catch(error) {
      return response.status(400).send({ message: 'Não foi possível atualizar o produto nesse momento' });
    }
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: {id}, response }) {
    const product = await Product.findOrFail(id);
    await product.delete();

    return response.status(204).send({});
  }
}

module.exports = ProductController;
