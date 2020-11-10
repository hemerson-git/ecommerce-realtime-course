'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Order = use('App/Models/Order');
const Coupon = use('App/Models/Coupon');
const Discount = use('App/Models/Discount');
const Transformer = use('App/Transformers/Admin/OrderTransformer');
const Database = use('Database');
const Service = use('App/Services/Order/OrderService');
const WS = use('Ws');

/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, transform, pagination, auth }) {
    const client = await auth.getUser();
    const query = Order.query();
    const number = request.input('number');

    if (number) {
      query.where('id', 'LIKE', `${number}%`);
    }

    query.where('user_id', client.id);
    
    let orders = await query.orderBy('id', 'DESC').paginate(pagination.page, pagination.limit);
    orders = await transform.paginate(orders, Transformer);

    return response.send(orders);
  }

  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, auth, transform }) {
    const trx = await Database.beginTransaction();

    try {
      const items = request.input('items');
      const client = await auth.getUser();
      let order = await Order.create({ user_id: client.id }, trx);

      const service = new Service(order, trx);

      if(items.length > 0) {
        await service.syncItems(items);
      }

      await trx.commit();

      // Instancia os hooks de cálculos de subtotais
      order = await Order.find(order.id);
      order = await transform.include('items').item(order, Transformer);

      // Bradcast 

      const topic = WS.getChannel('notifications').topic('notifications');
      if(topic) {
        topic.broadcast('new:order', order);
      }
      
      return response.status(201).send(order);
    } catch (error) {
      await trx.rollback();
      return response.status(400).send({
        message: 'Não foi possível fazer seu pedido!',
      });
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params : { id }, response, transform, auth }) {
    const client = await auth.getUser();
    let order = await Order.query().where('user_id', client.id).where('id', id).firstOrFail();
    order = await transform.item(order, Transformer);
    return response.send(order);
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params: { id }, request, response, auth, transform }) {
    const client = await auth.getUser();
    let order = await Order.query().where('user_id', client.id).where('id', id).firstOrFail();

    const trx = await Database.beginTransaction();

    try {
      const { items, status } = request.all();
      order.merge({ user_id: client.id, status });
      const service = new Service(order, trx);

      await service.updateItems(items);
      await order.save(trx);
      await trx.commit();

      order = await transform.include('items,coupons,discounts').item(order, Transformer);
      return response.status(200).send(order);
    } catch (error) {
      await trx.rollback();
      return response.status(400).send({
        message: 'Não foi possível atualizar o seu pedido no momento!',
      });
    }
  }

  async applyDiscount({ params: { id }, request, response, transform, auth }) {
    const { code } = request.all();
    const client = await auth.getUser();
    const coupon = await Coupon.findByOrFail('code', code.toUpperCase());
    let order = await Order.query().where('user_id', client.id).where('id', id).firstOrFail();

    let discount = 0;
    let info = {};

    try {
      const service = new Service(order);
      const canAddDiscount = await service.canApplyDiscount(coupon);
      const orderDiscounts = await order.coupons().getCount();

      const canApplyToOrder = orderDiscounts < 1 || (orderDiscounts >= 1 && coupon.recursive);
      if(canAddDiscount && canApplyToOrder) {
        discount = await Discount.firstOrCreate({
          order_id: order.id,
          coupon_id: coupon.id,
        });

        info.message = 'Cupom aplicado com sucesso!';
        info.success = true;
      } else {
        info.message = 'Não foi possível aplicar o desconto no momento';
        info.success = false;
      }

      order = await transform.include('coupons,items,discounts').item(order, Transformer);
      return response.send({ order, info, discount });
    } catch (error) {
      return response.status(400).send({
        message: 'Erro desconhecido!',
      });
    }
  }

  async removeDiscount({ request, response, auth }) {
    const { discount_id } = request.all();
    const discount = await Discount.findOrFail(discount_id);
    await discount.delete();
    return response.status(204).send();
  }
}

module.exports = OrderController;
