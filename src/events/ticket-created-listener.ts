import { Message } from 'node-nats-streaming'

import { Listener } from './listener'
import { Subjects } from './subjects'
import { TicketCreatedEvent } from './ticket-created-event'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    // readonly subject = Subjects.TicketCreated //also works

    subject: Subjects.TicketCreated = Subjects.TicketCreated 
    //we are able to type annonate this because of the generic class or a generic ticketCreatedEvent

    queueGroupName = 'payments:service'

    onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        console.log('Event data: ', data)
        msg.ack()
    }
}