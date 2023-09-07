export type MapInterface<K, V> = {
  get(k: K): V | undefined;
  set(k: K, v: V): void;
  delete(k: K): boolean;
  readonly size: number;
};

export type MultilayerMap<Key extends any[], Value> = {} & MapInterface<
  Key,
  Value
>;

export function makeMultilayerMap<
  Key extends [any, ...any[]],
  Value
>(): MultilayerMap<Key, Value> {
  const underlyingData = new Map();

  const map: MultilayerMap<Key, Value> = {
    // @ts-ignore
    get(k) {
      if (k.length === 1) return underlyingData.get(k[0]);
      return underlyingData.get(k[0])?.get(k.slice(1));
    },

    set(k: Key, v: Value) {
      if (k.length === 1) {
        underlyingData.set(k[0], v);
      } else {
        let entry = underlyingData.get(k[0]);
        if (!entry) {
          entry = makeMultilayerMap();
          underlyingData.set(k[0], entry);
        }
        entry.set(k.slice(1), v);
      }
    },

    delete(k: Key) {
      if (k.length === 1) {
        return underlyingData.delete(k[0]);
      } else {
        let entry = underlyingData.get(k[0]);
        if (!entry) return;
        const deleted = entry.delete(k.slice(1));
        if (entry.size === 0) {
          underlyingData.delete(k[0]);
        }
        return deleted;
      }
    },

    get size() {
      return underlyingData.size;
    },
  };
  return map;
}

type X<K, V> = Map<K, V> extends MapInterface<K, V> ? 1 : 0;
