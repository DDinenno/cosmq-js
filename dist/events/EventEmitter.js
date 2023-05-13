class EventEmitter {

    events = {}

    constructor(events) {
        events.forEach(event => {
            this.events[event] = []
        })
    }

    getEventListeners(name) {
        if (!this.events[name])
            throw new Error(`Event ${name} doesn't exist`)

        return this.events[name]
    }

    on(name, callback) {
        const listeners = this.getEventListeners(name)
        this.events[name] = listeners.concat(callback)

        // return unsubscribe fn
        return () => this.mute(name, callback)
    }


    onOnce(name, callback) {
        const mute = this.on(name, (...params) => {
            mute();
            callback(...params)
        })
    }

    mute(name, callback) {
        const listeners = this.getEventListeners(name)
        this.events[name] = listeners.filter(l => l !== callback)
    }

    muteAll() {
        Object.keys(this.events).forEach((key) => {
            this.events[key] = []
        })
    }

    dispatch(name, payload) {
        const listeners = [...this.getEventListeners(name)]

        listeners.forEach(listener => {
            listener(payload)
        })
    }


}

export default EventEmitter