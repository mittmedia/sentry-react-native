import * as tslib_1 from "tslib";
import { addGlobalEventProcessor, getCurrentHub } from "@sentry/core";
import { logger } from "@sentry/utils";
const INTERNAL_CALLSITES_REGEX = new RegExp([
    "/Libraries/Renderer/oss/ReactNativeRenderer-dev\\.js$",
    "/Libraries/BatchedBridge/MessageQueue\\.js$"
].join("|"));
/** Tries to symbolicate the JS stack trace on the device. */
export class DebugSymbolicator {
    constructor() {
        /**
         * @inheritDoc
         */
        this.name = DebugSymbolicator.id;
    }
    /**
     * @inheritDoc
     */
    setupOnce() {
        // tslint:disable-next-line: cyclomatic-complexity
        addGlobalEventProcessor((event, hint) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const self = getCurrentHub().getIntegration(DebugSymbolicator);
            // tslint:disable: strict-comparisons
            if (!self || hint === undefined || hint.originalException === undefined) {
                return event;
            }
            const reactError = hint.originalException;
            // tslint:disable: no-unsafe-any
            const parseErrorStack = require("react-native/Libraries/Core/Devtools/parseErrorStack");
            const stack = parseErrorStack(reactError);
            // Ideally this should go into contexts but android sdk doesn't support it
            event.extra = Object.assign({}, event.extra, { componentStack: reactError.componentStack, jsEngine: reactError.jsEngine });
            if (__DEV__) {
                yield self._symbolicate(event, stack);
            }
            if (reactError.jsEngine === "hermes") {
                const convertedFrames = this._convertReactNativeFramesToSentryFrames(stack);
                this._replaceFramesInEvent(event, convertedFrames);
            }
            event.platform = "node"; // Setting platform node makes sure we do not show source maps errors
            // tslint:enable: no-unsafe-any
            // tslint:enable: strict-comparisons
            return event;
        }));
    }
    /**
     * Symbolicates the stack on the device talking to local dev server.
     * Mutates the passed event.
     */
    _symbolicate(event, stack) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // tslint:disable: no-unsafe-any
            // tslint:disable: strict-comparisons
            try {
                const symbolicateStackTrace = require("react-native/Libraries/Core/Devtools/symbolicateStackTrace");
                const prettyStack = yield symbolicateStackTrace(stack);
                if (prettyStack) {
                    const stackWithoutInternalCallsites = prettyStack.filter((frame) => frame.file && frame.file.match(INTERNAL_CALLSITES_REGEX) === null);
                    const symbolicatedFrames = this._convertReactNativeFramesToSentryFrames(stackWithoutInternalCallsites);
                    this._replaceFramesInEvent(event, symbolicatedFrames);
                }
                else {
                    logger.error("The stack is null");
                }
            }
            catch (error) {
                logger.warn(`Unable to symbolicate stack trace: ${error.message}`);
            }
            // tslint:enable: no-unsafe-any
            // tslint:enable: strict-comparisons
        });
    }
    /**
     * Converts ReactNativeFrames to frames in the Sentry format
     * @param frames ReactNativeFrame[]
     */
    _convertReactNativeFramesToSentryFrames(frames) {
        // Below you will find lines marked with :HACK to prevent showing errors in the sentry ui
        // But since this is a debug only feature: This is Fine (TM)
        return frames.map((frame) => {
            const inApp = (frame.file && !frame.file.includes("node_modules")) ||
                (!!frame.column && !!frame.lineNumber);
            return {
                colno: frame.column,
                filename: frame.file,
                function: frame.methodName,
                in_app: inApp,
                lineno: inApp ? frame.lineNumber : undefined,
                platform: inApp ? "javascript" : "node" // :HACK
            };
        });
    }
    /**
     * Replaces the frames in the exception of a error.
     * @param event Event
     * @param frames StackFrame[]
     */
    _replaceFramesInEvent(event, frames) {
        if (event.exception &&
            event.exception.values &&
            event.exception.values[0] &&
            event.exception.values[0].stacktrace) {
            event.exception.values[0].stacktrace.frames = frames.reverse();
        }
    }
}
/**
 * @inheritDoc
 */
DebugSymbolicator.id = "DebugSymbolicator";
//# sourceMappingURL=debugsymbolicator.js.map