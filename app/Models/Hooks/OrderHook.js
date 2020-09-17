'use strict';

const OrderHook = (exports = module.exports = {});

OrderHook.updateValue = async model => {
  model.$sideLoaded.subtotal = await model.items().getSum('subtotal');

  model.$sideLoaded.qty_items = await model.items().getSum('quantity');

  model.$sideLoaded.discount = await model.discounts().getSum('discount');

  model.total = model.$sideloaded.subtotal - model.$sideLoaded.discount;
};

OrderHook.updateCollectionValue = async models => {
  for (let model of models) {
    model = await OrderHook.updateValues(models);
  }
};
