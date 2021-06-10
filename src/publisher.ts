import nats from 'node-nats-streaming'

console.clear()

//registers a nats client to a nats service running inside some cluster. Args: cluster-id, client-id, url
const stan = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222',
})

stan.on('connect', () => {
    console.log('Publisher connected to NATS')

    //works with JSON, so stringify it
    const data = JSON.stringify({
        id: '123',
        title: 'concert',
        price: 20,
    })

    //publishing an event so that any listener which has subscription to this CHANNEL / TOPIC ('ticket:created'), can get that event. If we have multiple copies of same listener (for horizontal scaling), they should act as a queue group, so that we dont have copies of events. ie. inside a queue group, only one listsner will get this event. If one listener doesnt respond for 30seconds, the same event will be sent to other listeners inside queue group. 

    stan.publish('ticket:created', data, () => {
        console.log('Event published')
    })
})
