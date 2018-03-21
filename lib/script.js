/**
 * A shipment has been received by an importer
 * @param {org.pizza_delivery.order} transact - the order transaction
 * @transaction
 */

function transact(orders)
{
  console.log("First transaction");
  var initial_cust=orders.cust.account_balance;
  var total=0;
  var i=0;
  while(orders.cart_items.food_items[i]!=null)
  {
    total=total+(orders.cart_items.food_items[i].cost*orders.cart_items.food_items[i].quantity);
    i++;
  }
  if(initial_cust-(total)<0)
  {
    throw new Error('The customer does not have enough balance');
  }
  else{
  orders.rest.account_balance=orders.rest.account_balance+total;
  orders.cust.account_balance=initial_cust-total;
  }
  
  var SH="org.pizza_delivery";
  var factory = getFactory();
   
    var receipt1 = factory.newResource(SH, 'receipt', orders.order_id);
 	receipt1.cust=factory.newRelationship(SH,'customer',orders.cust.cust_id);
  receipt1.cart_items=factory.newRelationship(SH,'cart',orders.cart_items.order_id);
  receipt1.rest=factory.newRelationship(SH,'restaurant',orders.rest.owner);
  receipt1.total=total;
  
  return getParticipantRegistry('org.pizza_delivery.customer')
        .then(function (customer) {
            
            return customer.update(orders.cust);
        })
 		 .then(function () {
            return getParticipantRegistry('org.pizza_delivery.restaurant');
        })
      .then(function(restaurant){
      return restaurant.update(orders.rest);
    })
  		.then(function () {
      return getAssetRegistry('org.pizza_delivery.receipt');
    })
  		.then(function (receiptRegistry){
      return receiptRegistry.addAll([receipt1]);
    });    
}

/**
 * A transaction of adding to cart
 * @param {org.pizza_delivery.addtocart} addingtocart - the addtocart transaction
 * @transaction
 */

function addingtocart(carts)
{
  quantity=carts.quantity;
  var SH="org.pizza_delivery";
  var factory = getFactory();
  carts.food_item.quantity=carts.quantity;  
  
  return getAssetRegistry('org.pizza_delivery.cart')
  .then(function (cartAssetRegistry) {
    return cartAssetRegistry.get(carts.order_id);
  })
  .then(function (cart2) {
   cart2.food_items.push(carts.food_item);
    return getAssetRegistry('org.pizza_delivery.cart')
  		.then(function (cartRegistry){
      return cartRegistry.update(cart2);
    }); 
    
  })
  .catch(function (error) {
    
    var cart1 = factory.newResource(SH, 'cart', carts.order_id);
      if (cart1.food_items) {
    cart1.food_items.push(carts.food_item);
    } else {
      cart1.food_items=[carts.food_item];
    }
      return getAssetRegistry('org.pizza_delivery.cart')
  		.then(function (cartRegistry){
      return cartRegistry.addAll([cart1]);
    });
    
  });
  
    /*
      return getAssetRegistry('org.pizza_delivery.cart')
  		.then(function (cartRegistry){
      return cartRegistry.addAll([cart1]);
    });
    */

  
  
}
