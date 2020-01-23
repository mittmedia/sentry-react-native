import { PromiseBuffer } from "@sentry/utils";
import { NativeModules } from "react-native";
const { RNSentry } = NativeModules;
/** Native Transport class implementation */
export class NativeTransport {
    constructor() {
        /** A simple buffer holding all requests. */
        this._buffer = new PromiseBuffer(30);
    }
    /**
     * @inheritDoc
     */
    sendEvent(event) {
        // tslint:disable-next-line: no-unsafe-any
        return this._buffer.add(RNSentry.sendEvent(event));
    }
    /**
     * @inheritDoc
     */
    close(timeout) {
        return this._buffer.drain(timeout);
    }
}
//# sourceMappingURL=native.js.map