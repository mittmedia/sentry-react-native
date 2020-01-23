import { Integration } from "@sentry/types";
/** Tries to symbolicate the JS stack trace on the device. */
export declare class DebugSymbolicator implements Integration {
    /**
     * @inheritDoc
     */
    name: string;
    /**
     * @inheritDoc
     */
    static id: string;
    /**
     * @inheritDoc
     */
    setupOnce(): void;
    /**
     * Symbolicates the stack on the device talking to local dev server.
     * Mutates the passed event.
     */
    private _symbolicate;
    /**
     * Converts ReactNativeFrames to frames in the Sentry format
     * @param frames ReactNativeFrame[]
     */
    private _convertReactNativeFramesToSentryFrames;
    /**
     * Replaces the frames in the exception of a error.
     * @param event Event
     * @param frames StackFrame[]
     */
    private _replaceFramesInEvent;
}
//# sourceMappingURL=debugsymbolicator.d.ts.map