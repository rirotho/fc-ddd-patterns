import CustomerChangedAddressEvent from "../../customer/event/customer-address-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import EnviaConsoleLog1Handler from "../../customer/event/handler/EnviaConsoleLog1Handler";
import EnviaConsoleLog2Handler from "../../customer/event/handler/EnviaConsoleLog2Handler";
import EnviaConsoleLogHandler from "../../customer/event/handler/EnviaConsoleLogHandler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "../../../domain/@shared/event/event-dispatcher";


describe("Domain events tests - Customer Creater", () => {

  it("should notify all when a customer is created event handlers", () => {
    const eventDispatcher = new EventDispatcher();


    const eventHandlerLog1 = new EnviaConsoleLog1Handler();
    const eventHandlerLog2 = new EnviaConsoleLog2Handler();

    const spyEventHandler1 = jest.spyOn(eventHandlerLog1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandlerLog2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandlerLog1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandlerLog2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandlerLog1);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandlerLog2);

    const customerCreatedEvent = new CustomerCreatedEvent({
      name: "CustomerCreated",
    });

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
  });

});
