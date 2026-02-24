import type { EngineEventName, EngineEvents } from '@repo/types';

type Listener<K extends EngineEventName> = EngineEvents[K];

/** Type-safe event bus for engine lifecycle and state-change events. */
export class EngineEventEmitter {
  private listeners: Map<EngineEventName, Set<Listener<EngineEventName>>> = new Map();

  /** Subscribe to an engine event. */
  on<K extends EngineEventName>(event: K, callback: EngineEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as Listener<EngineEventName>);
  }

  /** Unsubscribe a previously registered callback. */
  off<K extends EngineEventName>(event: K, callback: EngineEvents[K]): void {
    this.listeners.get(event)?.delete(callback as Listener<EngineEventName>);
  }

  /** Fire an event, invoking all registered listeners with the given arguments. */
  emit<K extends EngineEventName>(event: K, ...args: Parameters<EngineEvents[K]>): void {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    for (const cb of cbs) {
      (cb as (...a: Parameters<EngineEvents[K]>) => void)(...args);
    }
  }

  /** Remove all listeners for every event. */
  clearAll(): void {
    this.listeners.clear();
  }
}
