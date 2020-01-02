export class Delegate<EVENT> {
    private delegates: {[key: string]: (EVENT) => void} = {};

    listen(id: string, delegate: (EVENT) => void) {
        this.delegates[id] = delegate
    }

    unlisten(id: string) {
        delete this.delegates[id]
    }

    clear() {
        this.delegates = {};
    }

    trigger(event: EVENT) {
        for(let id in this.delegates) {
            let delegate = this.delegates[id];
            if(delegate) {
                delegate(event);
            }
        }
    }
}
