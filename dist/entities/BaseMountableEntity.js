import EventEmitter from "../events/EventEmitter";

const BASE_EVENTS = ["mount", "unmount"];

class BaseMountableEntity {
    static currentId = 0;

    id = null;

    constructor(events) {
        this.id = BaseMountableEntity.getId();

        this.events = new EventEmitter([...BASE_EVENTS, ...(events || [])]);


        this.events.onOnce("mount", () => {
            this.events.onOnce("unmount", () => {
                this.events.muteAll();
            });
        });
    }

    static getId() {
        BaseMountableEntity.currentId++;
        return BaseMountableEntity.currentId;
    }

    mount() {
        throw new Error("Not implemented");
    }

    unmount() {
        throw new Error("Not implemented");
    }
}

export default BaseMountableEntity;
