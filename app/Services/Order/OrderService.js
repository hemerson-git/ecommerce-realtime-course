'use strict';

const Database = use('Database');

class OrderService {
  constructor (model, trx = false) {
    this.model = model;
    this.trx = trx;
  }

  async syncItems(items) {
    if(!Array.isArray(items)) {
      return false;
    }

    await this.model.items().delete(this.trx);
    await this.model.items().createMany(items, this.trx);
  }

  async updateItems(items) {
    let currentItems = await this.model
      .items()
      .whereIn('id', items.map( item => item.id))
      .fetch(this.trx);

    //deleta os items aue o user não quer mais

    await this.model
      .items()
      .whereNotIn('id', items.map(item => item.id))
      .delete();

    //Atualiza os valores e quantidades

    await Promise.all(currentItems.rows.map(async item => {
      item.fill(items.find(n => n.id === item.id));
      await item.save();
    }));
  }

  async canApplyDiscount(coupon) {

    //Verificação por data
    const now = new Date().getTime();
    // Verifica se já entro em o cupom já está dentro da validade
    // Verifica se há uma data de expiração, caso sim, se ainda não expirou
    if (now < coupon.valid_from.getTime() || 
        (typeof coupon.valid_until === 'object' && coupon.valid_until.getTime() < now)
    ) {
      return false;
    }
    
    const couponProduct = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('product_id');

    const couponClient = await Database.from('coupon_user')
      .where('coupon_id', coupon.id)
      .pluck('user_id');

    // Cerificar se o cupom está associado a produtos e clientes especícicos 

    if (Array.isArray(couponProduct) && couponProduct.length < 1 && 
      Array.isArray(couponClient) && couponClient.length < 1) 
    {
      /**
       *  Caso não esteja  associado a nda, é de uso liver
       */

      return true;
    }

    let isAssocietedToProducts = false;
    let isAssocietedToClient = false;

    if (Array.isArray(couponProduct) && couponProduct.length > 0) {
      isAssocietedToProducts = true;
    }

    if (Array.isArray(couponClient) && couponClient.length > 0) {
      isAssocietedToClient = true;
    }

    const productMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProduct)
      .pluck('product_id');

    /**
     *  *  Caso de use 1 - O cupom está associado a clientes e produtos
    */

    if(isAssocietedToClient && isAssocietedToProducts) {
      const clientMatch = couponClient.find(client => client === this.model.user_id);

      if(clientMatch && Array.isArray(productMatch) && productMatch.length > 0) {
        return true;
      }
    }
    
    /**
     * Caso de use 2 - O cupom está apenas associado a produtos
     */

    if(isAssocietedToProducts && Array.isArray(isAssocietedToProducts) && isAssocietedToProducts.length > 0) {
      return true;
    }

    /**
     * Caso de uso 3 - O cupom está associado a 1 ou mais clientes e a nenhum produto
     */

    if (isAssocietedToClient && Array.isArray(couponClient) && couponClient.length > 0) {
      const match = couponClient.find(client => client === this.model.user_id);

      if (match) {
        return true;
      }
    }

    /**
     * Caso nenhuma das verificações dê positiva
     * então o cupom estã associado a clientes ou produtos ou os dois
     * porém nenhum dos produtos deste pedido está elegível ao desconto
     * e o cliente que fez a compra também não poderá utilizar este cupom
     */

    return false;
  }
}

module.exports = OrderService;
