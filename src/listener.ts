import nats, { Message } from 'node-nats-streaming'
import { randomBytes } from 'crypto'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222',
})

stan.on('connect', () => {
    console.log('Listener connected to NATS')

    // upon close, we want to notify nats instantly and not after 30 seconds which is nats' default behavior
    stan.on('close', () => {
        console.log('NATS connection closed!')
        process.exit()
    })

    /* specify that:
    1. we have manual ack mode, ie. unless we send an acknowledgement that event has been processed, nats will consider this as undone. By default, nats considers ass events processed if manualackmode is off.
    2. setDeliverAllAvailable ensures when this service is started first up, it will receive all events that have ever been created.
    3. setDurableName: ensures that if the service is stopped for just a few seconds, dont fetch all events ever created, instead send only what it has missed.
    4. Setting a queue group is MUST for this operation
    *So we can say that point 2,3,4 are coupled together and are MOST IMPORTANT fundamentals in NATS-streaming
    */
    const options = stan
        .subscriptionOptions()
        .setManualAckMode(true)
        .setDeliverAllAvailable()
        .setDurableName('accounting-service')


    //specify a queue group as well if we have multiple copies of this same listener. We can avoid duplicate copies of events by this.
    const subscription = stan.subscribe(
        'ticket:created',
        'orders-service-queue-group',
        options
    )

    subscription.on('message', (msg: Message) => {
        const data = msg.getData()

        if (typeof data === 'string') {
            console.log(`Received event #${msg.getSequence()}, with data: ${data}`)
        }

        // send acknowledgement that event is received and processed successfully
        msg.ack()
    })
})

// if we try to close listener using ctrl C or rs (restart), below code emits an close event which will tell NATS that listener is down and wont respond. By default NATS waits for 30 seconds
process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())
