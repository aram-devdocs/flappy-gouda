/** Machine-readable error code identifying the failure category. */
export type EngineErrorCode =
  | 'CANVAS_CONTEXT_UNAVAILABLE'
  | 'CANVAS_CONTEXT_LOST'
  | 'ASSET_LOAD_FAILED'
  | 'INVALID_CONFIG';

/** Typed error thrown by the engine with a machine-readable code. */
export class EngineError extends Error {
  readonly code: EngineErrorCode;
  /**
   * @param message Human-readable description of the error.
   * @param code Machine-readable error code.
   */
  constructor(message: string, code: EngineErrorCode) {
    super(message);
    this.name = 'EngineError';
    this.code = code;
  }
}
