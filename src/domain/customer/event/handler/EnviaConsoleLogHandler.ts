import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangedAddressEvent from "../customer-address-changed.event";

export default class EnviaConsoleLogHandler
  implements EventHandlerInterface<CustomerChangedAddressEvent>
{
  handle(customerEvent: CustomerChangedAddressEvent): void {
    console.log(`Endereço do cliente: ${customerEvent.eventData.id}, ${customerEvent.eventData.name} alterado para: ${customerEvent.eventData.newAddress.street}, ${customerEvent.eventData.newAddress.number} - ${customerEvent.eventData.newAddress.city}`); 
  }
}
