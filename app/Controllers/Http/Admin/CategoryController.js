'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Category = use('App/Models/Category');
const Transformer = use('App/Transformers/Admin/CategoryTransformer'); 

/**
 * Resourceful controller for interacting with categories
 */
class CategoryController {
  /**
   * Show a list of all categories.
   * GET categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {TransformerWith} ctx.transform
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination, transform }) {
    const title = request.input('title');
    const query = Category.query();
    
    if (title) {
      query.where('title', 'LIKE', `%${title}%`);
    }
    
    let categories = await query.paginate(pagination.page, pagination.limit || 10);
    categories = await transform.paginate(categories, Transformer);

    return response.send(categories);
  }

  /**
   * Create/save a new category.
   * POST categories
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    try {
      const { title, description, image_id } = request.all();
      let category = await Category.create({ title, description, image_id });
      category = await transform.item(category, Transformer);
      
      return response.status(201).send(category);
    } catch( error ) {
      return response.status(400).send({ message: 'Erro ao processar a sua Solicitação!' });
    }
  }

  /**
   * Display a single category.
   * GET categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, response, transform }) {
    let category = await Category.findOrFail(id);
    category = await transform.item(category, Transformer); 
    return response.send(category);
  }

  /**
   * Update category details.
   * PUT or PATCH categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: {id}, request, response, transform }) {
    let category = await Category.findOrFail(id);
    const {title, description, image_id} = request.all();
    await category.merge({ title, description, image_id });
    await category.save();
    category = await transform.item(category, Transformer);
    return response.send(category);
  }

  /**
   * Delete a category with id.
   * DELETE categories/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params : {id}, response }) {
    const category = await Category.findOrFail(id);
    await category.delete();
    return response.status(204).send({});
  }
}

module.exports = CategoryController;
