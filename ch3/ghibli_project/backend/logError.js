// logError.js
/**
// https://github.com/TypeStrong/ts-node/issues/2026 해결책
//
node:internal/process/esm_loader:40
      internalBinding('errors').triggerUncaughtException(
                                ^
[Object: null prototype] {
  [Symbol(nodejs.util.inspect.custom)]: [Function: [nodejs.util.inspect.custom]]
}
*/
import { setUncaughtExceptionCaptureCallback } from 'node:process';

setUncaughtExceptionCaptureCallback(console.log);
