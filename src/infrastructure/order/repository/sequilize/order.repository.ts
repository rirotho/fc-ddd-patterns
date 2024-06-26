import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "./../../../../domain/checkout/repository/order-repository.interface";

function orderItemToDatabase(orderItem: OrderItem) {
	return {
		id: orderItem.id,
		productId: orderItem.productId,
		name: orderItem.name,
		unitPrice: orderItem.price,
		quantity: orderItem.quantity,
	};
}

export default class OrderRepository implements OrderRepositoryInterface {
	async create(entity: Order): Promise<void> {
		await OrderModel.create(
			{
				id: entity.id,
				customer_id: entity.customerId,
				total: entity.total(),
				items: entity.items.map((item) => ({
					id: item.id,
					name: item.name,
					price: item.price,
					product_id: item.productId,
					quantity: item.quantity,
				})),
			},
			{
				include: [{ model: OrderItemModel }],
			}
		);
	}

	async update(entity: Order): Promise<void> {
		const sequelize = OrderModel.sequelize;
		await sequelize.transaction(async (t) => {
		  await OrderItemModel.destroy({
			where: { order_id: entity.id },
			transaction: t,
		  });
		  await OrderItemModel.destroy({ where: { order_id: entity.id } });
		  const items = entity.items.map((item) => ({
			id: item.id,
			name: item.name,
			price: item.price,
			product_id: item.productId,
			quantity: item.quantity,
			order_id: entity.id,
		  }));
		  await OrderItemModel.bulkCreate(items, { transaction: t });
		  await OrderModel.update(
			  { total: entity.total() },
			  { where: { id: entity.id }, transaction: t }
			);
		});
	}

	async find(id: string): Promise<Order> {
		const orderItemModels = await OrderItemModel.findAll();        

        const items: OrderItem[] = [];
        
        orderItemModels.map((item) => 
            items.push(new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity))
        );

        const orderModel = await OrderModel.findOne({ where: { id }});

        return new Order(orderModel.id, orderModel.customer_id, items);
	}

	async findAll(): Promise<Order[]> {
		const orderModels = await OrderModel.findAll();
		const orderItemModels = await OrderItemModel.findAll();        

		const orders: Order[] = [];

		orderModels.map((order) => {
			const items: OrderItem[] = [];
        
			orderItemModels.map((item) => {
				if (item.order_id === order.id) {
					items.push(new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity));
				}
			});

			orders.push(new Order(order.id, order.customer_id, items));
		});

		return orders;
	}
}