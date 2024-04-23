import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order management tests", () => {
  let dbConnection: Sequelize;

  beforeEach(async () => {
      dbConnection = new Sequelize({
          dialect: 'sqlite',
          storage: ':memory:',
          logging: false,
          sync: { force: true }
      });

      dbConnection.addModels([CustomerModel, OrderModel, OrderItemModel, ProductModel]);
      await dbConnection.sync();
  });

  afterEach(async () => {
      await dbConnection.close();
  });

  it("should create a new order", async () => {
      const customerRepo = new CustomerRepository();
      const customer = new Customer('123', 'Customer 1');
      const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
      customer.changeAddress(address);
      await customerRepo.create(customer);

      const productRepo = new ProductRepository();
      const product = new Product('123', 'Product 1', 10);
      await productRepo.create(product);

      const orderItem = new OrderItem('1', product.name, product.price,product.id, 2);
      const order = new Order('123', customer.id, [orderItem]);

      const orderRepo = new OrderRepository();
      await orderRepo.create(order);

      const orderModel = await OrderModel.findOne({
          where: { id: order.id },
          include: ["items"]
      });

      expect(orderModel.toJSON()).toStrictEqual({
          id: order.id,
          customer_id: customer.id,
          total: order.total(),
          items: [
              {
                  id: orderItem.id,
                  name: orderItem.name,
                  price: orderItem.price,
                  quantity: orderItem.quantity,
                  order_id: order.id,
                  product_id: product.id
              }
          ]
      });
  });

  it("should update a order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer('123', 'Customer 1');
    const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
    customer.changeAddress(address);
    await customerRepository.create(customer);
    
    const productRepository = new ProductRepository();
    const product = new Product('124', 'Product 1', 10);
    await productRepository.create(product);

    const orderItem = new OrderItem('1', product.name, product.price, product.id, 2);
    const order = new Order('123', customer.id, [orderItem]);

    const orderRepo = new OrderRepository();
    await orderRepo.create(order);

    const orderModel = await OrderModel.findOne({
        where: { id: order.id },
        include: ["items"]
    });

    expect(orderModel.toJSON()).toStrictEqual({
        id: order.id,
        customer_id: customer.id,
        total: order.total(),
        items: [
            {
                id: orderItem.id,
                name: orderItem.name,
                price: orderItem.price,
                quantity: orderItem.quantity,
                order_id: order.id,
                product_id: product.id
            }
        ]
    });

    const product2 = new Product('456', '3545', 20);
    await productRepository.create(product2);

    const orderItem2 = new OrderItem('2', product2.name, product2.price, product2.id, 3);
    order.items.push(orderItem2)

    await orderRepo.update(order)

    const newQueryOrder = await OrderModel.findOne({
        where: { id: order.id },
        include: ["items"]
    });

    expect(newQueryOrder.toJSON()).toStrictEqual({
        id: order.id,
        customer_id: customer.id,
        total: order.total(),
        items: order.items.map((orderItem) => ({
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: order.id,
          product_id: orderItem.productId,
        })),
      })
    })

  it("should find an order", async () => {
      const customerRepo = new CustomerRepository();
      const customer = new Customer('123', 'Customer 1');
      const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
      customer.changeAddress(address);
      await customerRepo.create(customer);

      const productRepo = new ProductRepository();
      const product = new Product('123', 'Product 1', 10);
      await productRepo.create(product);

      const orderItem = new OrderItem('1', product.name, product.price, product.id, 2);
      const order = new Order('123', customer.id, [orderItem]);

      const orderRepo = new OrderRepository();
      await orderRepo.create(order);

      const orderModel = await OrderModel.findOne({ where: { id: order.id }});
      const foundOrder = await orderRepo.find("123");

      expect(orderModel.toJSON()).toStrictEqual({
          id: foundOrder.id,
          customer_id: foundOrder.customerId,
          total: foundOrder.total()
      });
  });

  it("should find all orders", async () => {
      const customerRepo = new CustomerRepository();
      const customer = new Customer('123', 'Customer 1');
      const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1');
      customer.changeAddress(address);
      await customerRepo.create(customer);

      const productRepo = new ProductRepository();
      const product = new Product('123', 'Product 1', 10);
      await productRepo.create(product);
      const product2 = new Product('456', 'Product 2', 20);
      await productRepo.create(product2);

      const orderItem = new OrderItem('1',  product.name, product.price,product.id, 2);
      const orderItem2 = new OrderItem('2',  product2.name, product2.price,product2.id, 3);

      const orderRepo = new OrderRepository();
      const order = new Order('123', customer.id, [orderItem]);
      await orderRepo.create(order);
      const order2 = new Order('456', customer.id, [orderItem2]);
      await orderRepo.create(order2);

      const orderModels = await orderRepo.findAll();
      const orders = [order, order2];

      expect(orderModels).toHaveLength(2);
      expect(orderModels).toEqual(orders);
  });
});

