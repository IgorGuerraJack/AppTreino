"use client";

import { EMPTY_STATE, loadState, saveState, type PersistedState } from "./storage";

export interface StoreValue {
  /** false enquanto o disco ainda não foi lido (servidor e primeiro paint). */
  hydrated: boolean;
  data: PersistedState;
}

const SERVER_VALUE: StoreValue = { hydrated: false, data: EMPTY_STATE };

let value: StoreValue = SERVER_VALUE;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  // Outra aba registrou uma série: recarrega do disco em vez de divergir.
  if (event.key === null || event.key.startsWith("apptreino:")) {
    value = { hydrated: true, data: loadState() };
    emit();
  }
}

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (!value.hydrated) {
    value = { hydrated: true, data: loadState() };
  }
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getSnapshot(): StoreValue {
  return value;
}

export function getServerSnapshot(): StoreValue {
  return SERVER_VALUE;
}

export function mutate(fn: (previous: PersistedState) => PersistedState): void {
  const next = fn(value.data);
  if (next === value.data) return;
  value = { hydrated: true, data: next };
  saveState(next);
  emit();
}
