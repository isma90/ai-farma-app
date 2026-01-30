/**
 * State Management Utilities
 * Simple state management without Redux complexity
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Generic state reducer pattern
 */
export type StateAction<T> = {
  type: string;
  payload?: any;
};

export type Reducer<T> = (state: T, action: StateAction<T>) => T;

/**
 * useReducer-like hook with action creators
 */
export function useAsyncState<T>(
  initialState: T,
  reducer: Reducer<T>
) {
  const [state, setState] = useState<T>(initialState);
  const stateRef = useRef<T>(initialState);

  const dispatch = useCallback(
    (action: StateAction<T>) => {
      setState((prevState) => {
        const newState = reducer(prevState, action);
        stateRef.current = newState;
        return newState;
      });
    },
    [reducer]
  );

  const getState = useCallback(() => stateRef.current, []);

  return [state, dispatch, getState] as const;
}

/**
 * Simple state machine helper
 */
export class StateMachine<S, A> {
  private state: S;
  private handlers: Map<S, Map<A, (state: S) => S>>;

  constructor(initialState: S) {
    this.state = initialState;
    this.handlers = new Map();
  }

  on(state: S, action: A, handler: (state: S) => S) {
    if (!this.handlers.has(state)) {
      this.handlers.set(state, new Map());
    }
    this.handlers.get(state)!.set(action, handler);
  }

  transition(action: A): boolean {
    const stateHandlers = this.handlers.get(this.state);
    if (!stateHandlers) return false;

    const handler = stateHandlers.get(action);
    if (!handler) return false;

    this.state = handler(this.state);
    return true;
  }

  getState(): S {
    return this.state;
  }

  setState(newState: S) {
    this.state = newState;
  }
}

/**
 * Async state holder
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const initialAsyncState: AsyncState<any> = {
  data: null,
  loading: false,
  error: null,
};

/**
 * Async state reducer
 */
export function asyncStateReducer<T>(
  state: AsyncState<T>,
  action: StateAction<AsyncState<T>>
): AsyncState<T> {
  switch (action.type) {
    case 'LOADING':
      return { data: state.data, loading: true, error: null };
    case 'SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'ERROR':
      return { data: state.data, loading: false, error: action.payload };
    case 'RESET':
      return initialAsyncState;
    default:
      return state;
  }
}
