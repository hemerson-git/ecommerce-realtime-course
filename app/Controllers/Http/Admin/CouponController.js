'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Coupon = use('App/Models/Coupon'); 
const Database = use('Database');
const Service = use('App/Services/Coupon/CouponService');
const Transformer = use('App/Transformers/Admin/CouponTransformer');

/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Response} ctx.response
   * @param {Object} ctx.pagination
   */
  async index ({ request, response, pagination, transform }) {
    const code = request.input('code');
    const query = Coupon.query();

    if (code) {
      query.where('code', 'LIKE', `%${code}%`);
    }

    let coupons = await query.paginate(pagination.page, pagination.limit || 10);
    coupons = await transform.paginate(coupons, Transformer);
    return response.send(coupons);
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, transform }) {
    const trx = await Database.beginTransaction();
    
    /**
     *  1 - products - pode ser utilizado apenas e produtos específicos
     *  2 - clients - pode ser utilizado apenas por clientes específicos
     *  3 - clients and products - pode ser utilizado somente em produtos e clientes específicos
     *  4 - pode ser utilizado em qualquer produto e por qualquer cliente
     */

    let can_be_used = {
      client: false,
      product: false,
    };

    try {
      const couponData = request.only([
        'code',
        'discout',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive',
      ]);

      const { users, products } = request.only(['users', 'products']);
      let coupon = await Coupon.create(couponData, trx);

      // starts service layer
      const service = new Service(coupon, trx);

      // insere os relacionamentos no DB
      if(users && users.length > 0) {
        await service.syncUsers(users);
        can_be_used.client = true;
      }

      if(products && products.length > 0) {
        await service.syncProducts(products);
        can_be_used.product = true;
      }
      
      if(can_be_used.product && can_be_used.client) {
        coupon.can_use_for = 'product_client';
      } else if(can_be_used.product && !can_be_used.client) {
        coupon.can_use_for = 'product';
      } else if(!can_be_used.product && can_be_used.client) {
        coupon.can_use_for = 'client';
      } else {
        coupon.can_use_for = 'all';
      }
      
      await coupon.save(trx);
      await trx.commit();
      coupon = await transform.include('users,products').item(coupon, Transformer);
    } catch (error) {
      await trx.rollback();
      return response.status(400).send({
        message: 'Não foi possível criar o cupom no momento!',
      });
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params: { id }, response, transform }) {
    let coupon = await Coupon.findOrFail(id);
    coupon = await transform.include('products,users,orders').item(coupon, Transformer);
    return response.send(coupon);
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response, transform }) {
    const trx = await Database.beginTransaction();
    let coupon = await Coupon.findOrFail(id);
    
    let can_be_used = {
      client: false,
      product: false,
    };

    try {
      const couponData = request.only([
        'code',
        'discout',
        'valid_from',
        'valide_until',
        'quantity',
        'type',
        'recursive',
      ]);

      await coupon.merge(couponData);
      
      const { users, products } = request.only([ 'users', 'products' ]);

      const service = new Service(Coupon, trx);
      
      if(users && users.length > 0) {
        await service.syncUsers(users);
        can_be_used.client = true;
      }
      
      if(products && products.length > 0) {
        await service.syncProducts(products);
        can_be_used.product = true;
      }
      
      if(can_be_used.product && can_be_used.client) {
        coupon.can_use_for = 'product_client';
      } else if(can_be_used.product && !can_be_used.client) {
        coupon.can_use_for = 'product';
      } else if(!can_be_used.product && can_be_used.client) {
        coupon.can_use_for = 'client';
      } else {
        coupon.can_use_for = 'all';
      }
      
      await coupon.save(trx);
      await trx.commit();

      coupon = await transform.item(coupon, Transformer);
      
      return response.status(200).send(coupon);
    } catch (error) {
      await trx.rollback();
      return response.status(400).send({
        message: 'Não foi possível atualizar esse cupon no momento!',
      });
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params: { id }, response }) {
    const trx = await Database.beginTransaction();
    const coupon = await Coupon.findOrFail(id);

    try {
      await coupon.products().detach([], trx);
      await coupon.orders().detach([], trx);
      await coupon.users().detach([], trx);

      await coupon.delete(trx);

      await trx.commit();
      return response.status(204).send();
    } catch (error) {
      await trx.rollback();

      return response.status(400).send({
        message: 'Não foi possível deletar esse cupom neste momento',
      });
    }
  }
}

module.exports = CouponController;
