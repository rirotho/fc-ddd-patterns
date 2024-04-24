import CustomerChangedAddressEvent from "../../customer/event/customer-address-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import EnviaConsoleLog1Handler from "../../customer/event/handler/EnviaConsoleLog1Handler";
import EnviaConsoleLog2Handler from "../../customer/event/handler/EnviaConsoleLog2Handler";
import EnviaConsoleLogHandler from "../../customer/event/handler/EnviaConsoleLogHandler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "../../../domain/@shared/event/event-dispatcher";

describe("Domain events tests - Customer Changed Address", () => {

  it("should notify all when a customer change their address event handlers", () => {
    const eventDispatcher = new EventDispatcher();

    const eventHandler = new EnviaConsoleLogHandler();

    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerChangedAddressEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerChangedAddressEvent"][0]
    ).toMatchObject(eventHandler);

    const customerChangedAddressEvent = new CustomerChangedAddressEvent({
      id: "123",
      name: "John Joe",
      newAddress: new Address('Street B',100,'30000123','RJ'),
    });

    eventDispatcher.notify(customerChangedAddressEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});
