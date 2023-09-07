"use strict";
(() => {
  // node_modules/solid-js/dist/solid.js
  var sharedConfig = {
    context: void 0,
    registry: void 0
  };
  function setHydrateContext(context) {
    sharedConfig.context = context;
  }
  function nextHydrateContext() {
    return {
      ...sharedConfig.context,
      id: `${sharedConfig.context.id}${sharedConfig.context.count++}-`,
      count: 0
    };
  }
  var equalFn = (a, b) => a === b;
  var $PROXY = Symbol("solid-proxy");
  var $TRACK = Symbol("solid-track");
  var $DEVCOMP = Symbol("solid-dev-component");
  var signalOptions = {
    equals: equalFn
  };
  var ERROR = null;
  var runEffects = runQueue;
  var STALE = 1;
  var PENDING = 2;
  var UNOWNED = {
    owned: null,
    cleanups: null,
    context: null,
    owner: null
  };
  var Owner = null;
  var Transition = null;
  var Scheduler = null;
  var ExternalSourceFactory = null;
  var Listener = null;
  var Updates = null;
  var Effects = null;
  var ExecCount = 0;
  var [transPending, setTransPending] = /* @__PURE__ */ createSignal(false);
  function createRoot(fn, detachedOwner) {
    const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === void 0 ? owner : detachedOwner, root2 = unowned ? UNOWNED : {
      owned: null,
      cleanups: null,
      context: current ? current.context : null,
      owner: current
    }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root2)));
    Owner = root2;
    Listener = null;
    try {
      return runUpdates(updateFn, true);
    } finally {
      Listener = listener;
      Owner = owner;
    }
  }
  function createSignal(value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const s = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0
    };
    const setter = (value2) => {
      if (typeof value2 === "function") {
        if (Transition && Transition.running && Transition.sources.has(s))
          value2 = value2(s.tValue);
        else
          value2 = value2(s.value);
      }
      return writeSignal(s, value2);
    };
    return [readSignal.bind(s), setter];
  }
  function createRenderEffect(fn, value, options) {
    const c = createComputation(fn, value, false, STALE);
    if (Scheduler && Transition && Transition.running)
      Updates.push(c);
    else
      updateComputation(c);
  }
  function createEffect(fn, value, options) {
    runEffects = runUserEffects;
    const c = createComputation(fn, value, false, STALE), s = SuspenseContext && useContext(SuspenseContext);
    if (s)
      c.suspense = s;
    if (!options || !options.render)
      c.user = true;
    Effects ? Effects.push(c) : updateComputation(c);
  }
  function createMemo(fn, value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const c = createComputation(fn, value, true, 0);
    c.observers = null;
    c.observerSlots = null;
    c.comparator = options.equals || void 0;
    if (Scheduler && Transition && Transition.running) {
      c.tState = STALE;
      Updates.push(c);
    } else
      updateComputation(c);
    return readSignal.bind(c);
  }
  function untrack(fn) {
    if (Listener === null)
      return fn();
    const listener = Listener;
    Listener = null;
    try {
      return fn();
    } finally {
      Listener = listener;
    }
  }
  function onCleanup(fn) {
    if (Owner === null)
      ;
    else if (Owner.cleanups === null)
      Owner.cleanups = [fn];
    else
      Owner.cleanups.push(fn);
    return fn;
  }
  function startTransition(fn) {
    if (Transition && Transition.running) {
      fn();
      return Transition.done;
    }
    const l = Listener;
    const o = Owner;
    return Promise.resolve().then(() => {
      Listener = l;
      Owner = o;
      let t;
      if (Scheduler || SuspenseContext) {
        t = Transition || (Transition = {
          sources: /* @__PURE__ */ new Set(),
          effects: [],
          promises: /* @__PURE__ */ new Set(),
          disposed: /* @__PURE__ */ new Set(),
          queue: /* @__PURE__ */ new Set(),
          running: true
        });
        t.done || (t.done = new Promise((res) => t.resolve = res));
        t.running = true;
      }
      runUpdates(fn, false);
      Listener = Owner = null;
      return t ? t.done : void 0;
    });
  }
  function createContext(defaultValue, options) {
    const id = Symbol("context");
    return {
      id,
      Provider: createProvider(id),
      defaultValue
    };
  }
  function useContext(context) {
    return Owner && Owner.context && Owner.context[context.id] !== void 0 ? Owner.context[context.id] : context.defaultValue;
  }
  function children(fn) {
    const children2 = createMemo(fn);
    const memo = createMemo(() => resolveChildren(children2()));
    memo.toArray = () => {
      const c = memo();
      return Array.isArray(c) ? c : c != null ? [c] : [];
    };
    return memo;
  }
  var SuspenseContext;
  function readSignal() {
    const runningTransition = Transition && Transition.running;
    if (this.sources && (runningTransition ? this.tState : this.state)) {
      if ((runningTransition ? this.tState : this.state) === STALE)
        updateComputation(this);
      else {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(this), false);
        Updates = updates;
      }
    }
    if (Listener) {
      const sSlot = this.observers ? this.observers.length : 0;
      if (!Listener.sources) {
        Listener.sources = [this];
        Listener.sourceSlots = [sSlot];
      } else {
        Listener.sources.push(this);
        Listener.sourceSlots.push(sSlot);
      }
      if (!this.observers) {
        this.observers = [Listener];
        this.observerSlots = [Listener.sources.length - 1];
      } else {
        this.observers.push(Listener);
        this.observerSlots.push(Listener.sources.length - 1);
      }
    }
    if (runningTransition && Transition.sources.has(this))
      return this.tValue;
    return this.value;
  }
  function writeSignal(node, value, isComp) {
    let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
    if (!node.comparator || !node.comparator(current, value)) {
      if (Transition) {
        const TransitionRunning = Transition.running;
        if (TransitionRunning || !isComp && Transition.sources.has(node)) {
          Transition.sources.add(node);
          node.tValue = value;
        }
        if (!TransitionRunning)
          node.value = value;
      } else
        node.value = value;
      if (node.observers && node.observers.length) {
        runUpdates(() => {
          for (let i = 0; i < node.observers.length; i += 1) {
            const o = node.observers[i];
            const TransitionRunning = Transition && Transition.running;
            if (TransitionRunning && Transition.disposed.has(o))
              continue;
            if (TransitionRunning ? !o.tState : !o.state) {
              if (o.pure)
                Updates.push(o);
              else
                Effects.push(o);
              if (o.observers)
                markDownstream(o);
            }
            if (!TransitionRunning)
              o.state = STALE;
            else
              o.tState = STALE;
          }
          if (Updates.length > 1e6) {
            Updates = [];
            if (false)
              ;
            throw new Error();
          }
        }, false);
      }
    }
    return value;
  }
  function updateComputation(node) {
    if (!node.fn)
      return;
    cleanNode(node);
    const owner = Owner, listener = Listener, time = ExecCount;
    Listener = Owner = node;
    runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
    if (Transition && !Transition.running && Transition.sources.has(node)) {
      queueMicrotask(() => {
        runUpdates(() => {
          Transition && (Transition.running = true);
          Listener = Owner = node;
          runComputation(node, node.tValue, time);
          Listener = Owner = null;
        }, false);
      });
    }
    Listener = listener;
    Owner = owner;
  }
  function runComputation(node, value, time) {
    let nextValue;
    try {
      nextValue = node.fn(value);
    } catch (err) {
      if (node.pure) {
        if (Transition && Transition.running) {
          node.tState = STALE;
          node.tOwned && node.tOwned.forEach(cleanNode);
          node.tOwned = void 0;
        } else {
          node.state = STALE;
          node.owned && node.owned.forEach(cleanNode);
          node.owned = null;
        }
      }
      node.updatedAt = time + 1;
      return handleError(err);
    }
    if (!node.updatedAt || node.updatedAt <= time) {
      if (node.updatedAt != null && "observers" in node) {
        writeSignal(node, nextValue, true);
      } else if (Transition && Transition.running && node.pure) {
        Transition.sources.add(node);
        node.tValue = nextValue;
      } else
        node.value = nextValue;
      node.updatedAt = time;
    }
  }
  function createComputation(fn, init, pure, state = STALE, options) {
    const c = {
      fn,
      state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: Owner ? Owner.context : null,
      pure
    };
    if (Transition && Transition.running) {
      c.state = 0;
      c.tState = state;
    }
    if (Owner === null)
      ;
    else if (Owner !== UNOWNED) {
      if (Transition && Transition.running && Owner.pure) {
        if (!Owner.tOwned)
          Owner.tOwned = [c];
        else
          Owner.tOwned.push(c);
      } else {
        if (!Owner.owned)
          Owner.owned = [c];
        else
          Owner.owned.push(c);
      }
    }
    if (ExternalSourceFactory) {
      const [track, trigger] = createSignal(void 0, {
        equals: false
      });
      const ordinary = ExternalSourceFactory(c.fn, trigger);
      onCleanup(() => ordinary.dispose());
      const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
      const inTransition = ExternalSourceFactory(c.fn, triggerInTransition);
      c.fn = (x) => {
        track();
        return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
      };
    }
    return c;
  }
  function runTop(node) {
    const runningTransition = Transition && Transition.running;
    if ((runningTransition ? node.tState : node.state) === 0)
      return;
    if ((runningTransition ? node.tState : node.state) === PENDING)
      return lookUpstream(node);
    if (node.suspense && untrack(node.suspense.inFallback))
      return node.suspense.effects.push(node);
    const ancestors = [node];
    while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (runningTransition && Transition.disposed.has(node))
        return;
      if (runningTransition ? node.tState : node.state)
        ancestors.push(node);
    }
    for (let i = ancestors.length - 1; i >= 0; i--) {
      node = ancestors[i];
      if (runningTransition) {
        let top = node, prev = ancestors[i + 1];
        while ((top = top.owner) && top !== prev) {
          if (Transition.disposed.has(top))
            return;
        }
      }
      if ((runningTransition ? node.tState : node.state) === STALE) {
        updateComputation(node);
      } else if ((runningTransition ? node.tState : node.state) === PENDING) {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(node, ancestors[0]), false);
        Updates = updates;
      }
    }
  }
  function runUpdates(fn, init) {
    if (Updates)
      return fn();
    let wait = false;
    if (!init)
      Updates = [];
    if (Effects)
      wait = true;
    else
      Effects = [];
    ExecCount++;
    try {
      const res = fn();
      completeUpdates(wait);
      return res;
    } catch (err) {
      if (!wait)
        Effects = null;
      Updates = null;
      handleError(err);
    }
  }
  function completeUpdates(wait) {
    if (Updates) {
      if (Scheduler && Transition && Transition.running)
        scheduleQueue(Updates);
      else
        runQueue(Updates);
      Updates = null;
    }
    if (wait)
      return;
    let res;
    if (Transition) {
      if (!Transition.promises.size && !Transition.queue.size) {
        const sources = Transition.sources;
        const disposed = Transition.disposed;
        Effects.push.apply(Effects, Transition.effects);
        res = Transition.resolve;
        for (const e2 of Effects) {
          "tState" in e2 && (e2.state = e2.tState);
          delete e2.tState;
        }
        Transition = null;
        runUpdates(() => {
          for (const d of disposed)
            cleanNode(d);
          for (const v of sources) {
            v.value = v.tValue;
            if (v.owned) {
              for (let i = 0, len = v.owned.length; i < len; i++)
                cleanNode(v.owned[i]);
            }
            if (v.tOwned)
              v.owned = v.tOwned;
            delete v.tValue;
            delete v.tOwned;
            v.tState = 0;
          }
          setTransPending(false);
        }, false);
      } else if (Transition.running) {
        Transition.running = false;
        Transition.effects.push.apply(Transition.effects, Effects);
        Effects = null;
        setTransPending(true);
        return;
      }
    }
    const e = Effects;
    Effects = null;
    if (e.length)
      runUpdates(() => runEffects(e), false);
    if (res)
      res();
  }
  function runQueue(queue) {
    for (let i = 0; i < queue.length; i++)
      runTop(queue[i]);
  }
  function scheduleQueue(queue) {
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const tasks = Transition.queue;
      if (!tasks.has(item)) {
        tasks.add(item);
        Scheduler(() => {
          tasks.delete(item);
          runUpdates(() => {
            Transition.running = true;
            runTop(item);
          }, false);
          Transition && (Transition.running = false);
        });
      }
    }
  }
  function runUserEffects(queue) {
    let i, userLength = 0;
    for (i = 0; i < queue.length; i++) {
      const e = queue[i];
      if (!e.user)
        runTop(e);
      else
        queue[userLength++] = e;
    }
    if (sharedConfig.context) {
      if (sharedConfig.count) {
        sharedConfig.effects || (sharedConfig.effects = []);
        sharedConfig.effects.push(...queue.slice(0, userLength));
        return;
      } else if (sharedConfig.effects) {
        queue = [...sharedConfig.effects, ...queue];
        userLength += sharedConfig.effects.length;
        delete sharedConfig.effects;
      }
      setHydrateContext();
    }
    for (i = 0; i < userLength; i++)
      runTop(queue[i]);
  }
  function lookUpstream(node, ignore) {
    const runningTransition = Transition && Transition.running;
    if (runningTransition)
      node.tState = 0;
    else
      node.state = 0;
    for (let i = 0; i < node.sources.length; i += 1) {
      const source = node.sources[i];
      if (source.sources) {
        const state = runningTransition ? source.tState : source.state;
        if (state === STALE) {
          if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
            runTop(source);
        } else if (state === PENDING)
          lookUpstream(source, ignore);
      }
    }
  }
  function markDownstream(node) {
    const runningTransition = Transition && Transition.running;
    for (let i = 0; i < node.observers.length; i += 1) {
      const o = node.observers[i];
      if (runningTransition ? !o.tState : !o.state) {
        if (runningTransition)
          o.tState = PENDING;
        else
          o.state = PENDING;
        if (o.pure)
          Updates.push(o);
        else
          Effects.push(o);
        o.observers && markDownstream(o);
      }
    }
  }
  function cleanNode(node) {
    let i;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
        if (obs && obs.length) {
          const n = obs.pop(), s = source.observerSlots.pop();
          if (index < obs.length) {
            n.sourceSlots[s] = index;
            obs[index] = n;
            source.observerSlots[index] = s;
          }
        }
      }
    }
    if (Transition && Transition.running && node.pure) {
      if (node.tOwned) {
        for (i = node.tOwned.length - 1; i >= 0; i--)
          cleanNode(node.tOwned[i]);
        delete node.tOwned;
      }
      reset(node, true);
    } else if (node.owned) {
      for (i = node.owned.length - 1; i >= 0; i--)
        cleanNode(node.owned[i]);
      node.owned = null;
    }
    if (node.cleanups) {
      for (i = node.cleanups.length - 1; i >= 0; i--)
        node.cleanups[i]();
      node.cleanups = null;
    }
    if (Transition && Transition.running)
      node.tState = 0;
    else
      node.state = 0;
  }
  function reset(node, top) {
    if (!top) {
      node.tState = 0;
      Transition.disposed.add(node);
    }
    if (node.owned) {
      for (let i = 0; i < node.owned.length; i++)
        reset(node.owned[i]);
    }
  }
  function castError(err) {
    if (err instanceof Error)
      return err;
    return new Error(typeof err === "string" ? err : "Unknown error", {
      cause: err
    });
  }
  function runErrors(err, fns, owner) {
    try {
      for (const f of fns)
        f(err);
    } catch (e) {
      handleError(e, owner && owner.owner || null);
    }
  }
  function handleError(err, owner = Owner) {
    const fns = ERROR && owner && owner.context && owner.context[ERROR];
    const error = castError(err);
    if (!fns)
      throw error;
    if (Effects)
      Effects.push({
        fn() {
          runErrors(error, fns, owner);
        },
        state: STALE
      });
    else
      runErrors(error, fns, owner);
  }
  function resolveChildren(children2) {
    if (typeof children2 === "function" && !children2.length)
      return resolveChildren(children2());
    if (Array.isArray(children2)) {
      const results = [];
      for (let i = 0; i < children2.length; i++) {
        const result = resolveChildren(children2[i]);
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
      }
      return results;
    }
    return children2;
  }
  function createProvider(id, options) {
    return function provider(props) {
      let res;
      createRenderEffect(() => res = untrack(() => {
        Owner.context = {
          ...Owner.context,
          [id]: props.value
        };
        return children(() => props.children);
      }), void 0);
      return res;
    };
  }
  var FALLBACK = Symbol("fallback");
  function dispose(d) {
    for (let i = 0; i < d.length; i++)
      d[i]();
  }
  function mapArray(list, mapFn, options = {}) {
    let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
    onCleanup(() => dispose(disposers));
    return () => {
      let newItems = list() || [], i, j;
      newItems[$TRACK];
      return untrack(() => {
        let newLen = newItems.length, newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
        if (newLen === 0) {
          if (len !== 0) {
            dispose(disposers);
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
            indexes && (indexes = []);
          }
          if (options.fallback) {
            items = [FALLBACK];
            mapped[0] = createRoot((disposer) => {
              disposers[0] = disposer;
              return options.fallback();
            });
            len = 1;
          }
        } else if (len === 0) {
          mapped = new Array(newLen);
          for (j = 0; j < newLen; j++) {
            items[j] = newItems[j];
            mapped[j] = createRoot(mapper);
          }
          len = newLen;
        } else {
          temp = new Array(newLen);
          tempdisposers = new Array(newLen);
          indexes && (tempIndexes = new Array(newLen));
          for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++)
            ;
          for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
            temp[newEnd] = mapped[end];
            tempdisposers[newEnd] = disposers[end];
            indexes && (tempIndexes[newEnd] = indexes[end]);
          }
          newIndices = /* @__PURE__ */ new Map();
          newIndicesNext = new Array(newEnd + 1);
          for (j = newEnd; j >= start; j--) {
            item = newItems[j];
            i = newIndices.get(item);
            newIndicesNext[j] = i === void 0 ? -1 : i;
            newIndices.set(item, j);
          }
          for (i = start; i <= end; i++) {
            item = items[i];
            j = newIndices.get(item);
            if (j !== void 0 && j !== -1) {
              temp[j] = mapped[i];
              tempdisposers[j] = disposers[i];
              indexes && (tempIndexes[j] = indexes[i]);
              j = newIndicesNext[j];
              newIndices.set(item, j);
            } else
              disposers[i]();
          }
          for (j = start; j < newLen; j++) {
            if (j in temp) {
              mapped[j] = temp[j];
              disposers[j] = tempdisposers[j];
              if (indexes) {
                indexes[j] = tempIndexes[j];
                indexes[j](j);
              }
            } else
              mapped[j] = createRoot(mapper);
          }
          mapped = mapped.slice(0, len = newLen);
          items = newItems.slice(0);
        }
        return mapped;
      });
      function mapper(disposer) {
        disposers[j] = disposer;
        if (indexes) {
          const [s, set] = createSignal(j);
          indexes[j] = set;
          return mapFn(newItems[j], s);
        }
        return mapFn(newItems[j]);
      }
    };
  }
  var hydrationEnabled = false;
  function createComponent(Comp, props) {
    if (hydrationEnabled) {
      if (sharedConfig.context) {
        const c = sharedConfig.context;
        setHydrateContext(nextHydrateContext());
        const r = untrack(() => Comp(props || {}));
        setHydrateContext(c);
        return r;
      }
    }
    return untrack(() => Comp(props || {}));
  }
  var narrowedError = (name) => `Stale read from <${name}>.`;
  function For(props) {
    const fallback = "fallback" in props && {
      fallback: () => props.fallback
    };
    return createMemo(mapArray(() => props.each, props.children, fallback || void 0));
  }
  function Show(props) {
    const keyed = props.keyed;
    const condition = createMemo(() => props.when, void 0, {
      equals: (a, b) => keyed ? a === b : !a === !b
    });
    return createMemo(() => {
      const c = condition();
      if (c) {
        const child = props.children;
        const fn = typeof child === "function" && child.length > 0;
        return fn ? untrack(() => child(keyed ? c : () => {
          if (!untrack(condition))
            throw narrowedError("Show");
          return props.when;
        })) : child;
      }
      return props.fallback;
    }, void 0, void 0);
  }
  function Switch(props) {
    let keyed = false;
    const equals = (a, b) => a[0] === b[0] && (keyed ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2];
    const conditions = children(() => props.children), evalConditions = createMemo(() => {
      let conds = conditions();
      if (!Array.isArray(conds))
        conds = [conds];
      for (let i = 0; i < conds.length; i++) {
        const c = conds[i].when;
        if (c) {
          keyed = !!conds[i].keyed;
          return [i, c, conds[i]];
        }
      }
      return [-1];
    }, void 0, {
      equals
    });
    return createMemo(() => {
      const [index, when, cond] = evalConditions();
      if (index < 0)
        return props.fallback;
      const c = cond.children;
      const fn = typeof c === "function" && c.length > 0;
      return fn ? untrack(() => c(keyed ? when : () => {
        if (untrack(evalConditions)[0] !== index)
          throw narrowedError("Match");
        return cond.when;
      })) : c;
    }, void 0, void 0);
  }
  function Match(props) {
    return props;
  }
  var SuspenseListContext = createContext();

  // node_modules/solid-js/web/dist/web.js
  var booleans = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"];
  var Properties = /* @__PURE__ */ new Set(["className", "value", "readOnly", "formNoValidate", "isMap", "noModule", "playsInline", ...booleans]);
  function reconcileArrays(parentNode, a, b) {
    let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = a[aEnd - 1].nextSibling, map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
        while (bStart < bEnd)
          parentNode.insertBefore(b[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a[aStart]))
            a[aStart].remove();
          aStart++;
        }
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        const node = a[--aEnd].nextSibling;
        parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
        parentNode.insertBefore(b[--bEnd], node);
        a[aEnd] = b[bEnd];
      } else {
        if (!map) {
          map = /* @__PURE__ */ new Map();
          let i = bStart;
          while (i < bEnd)
            map.set(b[i], i++);
        }
        const index = map.get(a[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i = aStart, sequence = 1, t;
            while (++i < aEnd && i < bEnd) {
              if ((t = map.get(a[i])) == null || t !== index + sequence)
                break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a[aStart];
              while (bStart < index)
                parentNode.insertBefore(b[bStart++], node);
            } else
              parentNode.replaceChild(b[bStart++], a[aStart++]);
          } else
            aStart++;
        } else
          a[aStart++].remove();
      }
    }
  }
  var $$EVENTS = "_$DX_DELEGATE";
  function render(code, element, init, options = {}) {
    let disposer;
    createRoot((dispose2) => {
      disposer = dispose2;
      element === document ? code() : insert(element, code(), element.firstChild ? null : void 0, init);
    }, options.owner);
    return () => {
      disposer();
      element.textContent = "";
    };
  }
  function template(html, isCE, isSVG) {
    let node;
    const create = () => {
      const t = document.createElement("template");
      t.innerHTML = html;
      return isSVG ? t.content.firstChild.firstChild : t.content.firstChild;
    };
    const fn = isCE ? () => untrack(() => document.importNode(node || (node = create()), true)) : () => (node || (node = create())).cloneNode(true);
    fn.cloneNode = fn;
    return fn;
  }
  function delegateEvents(eventNames, document2 = window.document) {
    const e = document2[$$EVENTS] || (document2[$$EVENTS] = /* @__PURE__ */ new Set());
    for (let i = 0, l = eventNames.length; i < l; i++) {
      const name = eventNames[i];
      if (!e.has(name)) {
        e.add(name);
        document2.addEventListener(name, eventHandler);
      }
    }
  }
  function use(fn, element, arg) {
    return untrack(() => fn(element, arg));
  }
  function insert(parent, accessor, marker, initial) {
    if (marker !== void 0 && !initial)
      initial = [];
    if (typeof accessor !== "function")
      return insertExpression(parent, accessor, initial, marker);
    createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
  }
  function eventHandler(e) {
    const key = `$$${e.type}`;
    let node = e.composedPath && e.composedPath()[0] || e.target;
    if (e.target !== node) {
      Object.defineProperty(e, "target", {
        configurable: true,
        value: node
      });
    }
    Object.defineProperty(e, "currentTarget", {
      configurable: true,
      get() {
        return node || document;
      }
    });
    if (sharedConfig.registry && !sharedConfig.done)
      sharedConfig.done = _$HY.done = true;
    while (node) {
      const handler = node[key];
      if (handler && !node.disabled) {
        const data = node[`${key}Data`];
        data !== void 0 ? handler.call(node, data, e) : handler.call(node, e);
        if (e.cancelBubble)
          return;
      }
      node = node._$host || node.parentNode || node.host;
    }
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    if (sharedConfig.context) {
      !current && (current = [...parent.childNodes]);
      let cleaned = [];
      for (let i = 0; i < current.length; i++) {
        const node = current[i];
        if (node.nodeType === 8 && node.data.slice(0, 2) === "!$")
          node.remove();
        else
          cleaned.push(node);
      }
      current = cleaned;
    }
    while (typeof current === "function")
      current = current();
    if (value === current)
      return current;
    const t = typeof value, multi = marker !== void 0;
    parent = multi && current[0] && current[0].parentNode || parent;
    if (t === "string" || t === "number") {
      if (sharedConfig.context)
        return current;
      if (t === "number")
        value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && node.nodeType === 3) {
          node.data = value;
        } else
          node = document.createTextNode(value);
        current = cleanChildren(parent, current, marker, node);
      } else {
        if (current !== "" && typeof current === "string") {
          current = parent.firstChild.data = value;
        } else
          current = parent.textContent = value;
      }
    } else if (value == null || t === "boolean") {
      if (sharedConfig.context)
        return current;
      current = cleanChildren(parent, current, marker);
    } else if (t === "function") {
      createRenderEffect(() => {
        let v = value();
        while (typeof v === "function")
          v = v();
        current = insertExpression(parent, v, current, marker);
      });
      return () => current;
    } else if (Array.isArray(value)) {
      const array = [];
      const currentArray = current && Array.isArray(current);
      if (normalizeIncomingArray(array, value, current, unwrapArray)) {
        createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
        return () => current;
      }
      if (sharedConfig.context) {
        if (!array.length)
          return current;
        for (let i = 0; i < array.length; i++) {
          if (array[i].parentNode)
            return current = array;
        }
      }
      if (array.length === 0) {
        current = cleanChildren(parent, current, marker);
        if (multi)
          return current;
      } else if (currentArray) {
        if (current.length === 0) {
          appendNodes(parent, array, marker);
        } else
          reconcileArrays(parent, current, array);
      } else {
        current && cleanChildren(parent);
        appendNodes(parent, array);
      }
      current = array;
    } else if (value.nodeType) {
      if (sharedConfig.context && value.parentNode)
        return current = multi ? [value] : value;
      if (Array.isArray(current)) {
        if (multi)
          return current = cleanChildren(parent, current, marker, value);
        cleanChildren(parent, current, null, value);
      } else if (current == null || current === "" || !parent.firstChild) {
        parent.appendChild(value);
      } else
        parent.replaceChild(value, parent.firstChild);
      current = value;
    } else
      console.warn(`Unrecognized value. Skipped inserting`, value);
    return current;
  }
  function normalizeIncomingArray(normalized, array, current, unwrap) {
    let dynamic = false;
    for (let i = 0, len = array.length; i < len; i++) {
      let item = array[i], prev = current && current[i], t;
      if (item == null || item === true || item === false)
        ;
      else if ((t = typeof item) === "object" && item.nodeType) {
        normalized.push(item);
      } else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
      } else if (t === "function") {
        if (unwrap) {
          while (typeof item === "function")
            item = item();
          dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
        } else {
          normalized.push(item);
          dynamic = true;
        }
      } else {
        const value = String(item);
        if (prev && prev.nodeType === 3 && prev.data === value)
          normalized.push(prev);
        else
          normalized.push(document.createTextNode(value));
      }
    }
    return dynamic;
  }
  function appendNodes(parent, array, marker = null) {
    for (let i = 0, len = array.length; i < len; i++)
      parent.insertBefore(array[i], marker);
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === void 0)
      return parent.textContent = "";
    const node = replacement || document.createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i = current.length - 1; i >= 0; i--) {
        const el = current[i];
        if (node !== el) {
          const isParent = el.parentNode === parent;
          if (!inserted && !i)
            isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
          else
            isParent && el.remove();
        } else
          inserted = true;
      }
    } else
      parent.insertBefore(node, marker);
    return [node];
  }

  // node_modules/napg/dist/index.js
  var HashTable = class {
    constructor(hash, eq) {
      this.hash = hash;
      this.eq = eq;
      this.data = /* @__PURE__ */ new Map();
    }
    get(k) {
      return this.data.get(this.hash(k))?.find(([k2]) => this.eq(k, k2))?.[1];
    }
    set(k, v) {
      const hashk = this.hash(k);
      let arr = this.data.get(hashk);
      if (!arr) {
        arr = [];
        this.data.set(hashk, arr);
      }
      arr?.push([k, v]);
      return arr;
    }
    delete(k) {
      const hashk = this.hash(k);
      const arr = this.data.get(hashk);
      if (!arr)
        return false;
      const removed = arr?.filter((e) => !this.eq(k, e[0]));
      if (removed.length > 0) {
        this.data.set(hashk, removed);
      } else {
        this.data.delete(hashk);
      }
      return arr.length != removed.length;
    }
  };
  var position = "_position";
  var skipTokens = "_skipTokens";
  function lexerFromString(iter) {
    return {
      position: iter,
      next(n) {
        const [tokenString, nextRopeIter] = iter.read(n);
        return [tokenString, lexerFromString(nextRopeIter)];
      },
      prev(n) {
        const nextIter = iter.prev(n);
        return lexerFromString(nextIter);
      }
    };
  }
  function eliminateSkipTokens(parser, skipTokens2) {
    let parserToReturn = parser;
    while (true) {
      let breakAfterThis = true;
      for (const token2 of parserToReturn.skipTokens) {
        try {
          const output = parserToReturn.lex(token2);
          if (parserToReturn.isErr(output[0]))
            continue;
          skipTokens2.push(output[0]);
          parserToReturn = output[1];
          breakAfterThis = false;
          break;
        } catch {
        }
      }
      if (breakAfterThis)
        break;
    }
    return parserToReturn;
  }
  function parserFromLexer(lexer, state, parselet32, skipTokensList, options) {
    return {
      exec(isInRange) {
        return this.parse(this.parselet, this.state, isInRange)[0];
      },
      skipTokens: skipTokensList,
      err(msg) {
        throw options.makeErrorMessage(msg);
      },
      isErr: options.isErr,
      parselet: parselet32,
      options,
      position: lexer.position,
      state,
      lex(symbol) {
        let hasThrownExpectedError = false;
        try {
          const [data, newLexer] = symbol.lex({
            next: lexer.next,
            prev: lexer.prev,
            err: (msg) => {
              hasThrownExpectedError = true;
              throw options.makeErrorMessage(msg);
            },
            position: lexer.position
          });
          const newParser = parserFromLexer(
            newLexer,
            this.state,
            this.parselet,
            this.skipTokens,
            options
          );
          return [data, newParser];
        } catch (err) {
          if (hasThrownExpectedError) {
            const knownErr = err;
            return [knownErr, this];
          } else {
            return [options.makeUnhandledError(err), this];
          }
        }
      },
      clone(parselet4, state2) {
        return parserFromLexer(lexer, state2, parselet4, this.skipTokens, options);
      },
      parse(symbol, state2, isInRange) {
        let parserToReturn = this;
        const startPosition = parserToReturn.position;
        const skipTokensBefore = [];
        const skipTokensAfter = [];
        parserToReturn = eliminateSkipTokens(parserToReturn, skipTokensBefore);
        const parsedOutput = symbol.parse(
          parserToReturn.clone(symbol, state2),
          skipTokensAfter,
          isInRange
        );
        parserToReturn = parsedOutput[1].clone(this.parselet, this.state);
        const outputToReturn2 = parsedOutput[0];
        const outputToReturn = outputToReturn2;
        parserToReturn = eliminateSkipTokens(parserToReturn, skipTokensAfter);
        const endPosition = parserToReturn.position;
        const beforeSkipTokens = [
          ...skipTokensBefore,
          ...outputToReturn?.[skipTokens]?.before ?? []
        ];
        const afterSkipTokens = [
          ...skipTokensAfter,
          ...outputToReturn?.[skipTokens]?.after ?? []
        ];
        return [
          {
            ...outputToReturn,
            [position]: {
              start: this.position,
              length: endPosition.index() - startPosition.index(),
              id: globalid++
            },
            [skipTokens]: {
              before: beforeSkipTokens,
              after: afterSkipTokens
            }
          },
          parserToReturn
        ];
      }
    };
  }
  var globalid = 0;
  function uniqueId() {
    return globalid++;
  }
  var isConcatEnd = (opcode) => {
    return opcode >> 25 === 5;
  };
  var isUnionEnd = (opcode) => {
    return opcode >> 25 === 3;
  };
  function match(pattern, str2) {
    function matchAny(pattern2) {
      const opcode = pattern2.data[pattern2.index] >> 25;
      switch (opcode) {
        case 0: {
          const nextchar = str2.next();
          return String.fromCodePoint(pattern2.data[pattern2.index++]) === nextchar ? 1 : void 0;
        }
        case 1:
          pattern2.index++;
          return matchKleeneStar(pattern2);
        case 2:
          pattern2.index++;
          return matchUnion(pattern2);
        case 4:
          pattern2.index++;
          return matchConcat(pattern2);
        case 6: {
          const start = pattern2.data[pattern2.index++] & (2 << 25) - 1;
          const end = pattern2.data[pattern2.index++];
          const code = str2.next().codePointAt(0);
          const result = code >= start && code <= end ? 1 : void 0;
          return result;
        }
      }
      return void 0;
    }
    function matchConcat(pattern2) {
      let count = 0;
      while (!isConcatEnd(pattern2.data[pattern2.index])) {
        const m = matchAny(pattern2);
        if (m === void 0) {
          while (!isConcatEnd(pattern2.data[pattern2.index]))
            pattern2.index++;
          pattern2.index++;
          return void 0;
        }
        count += m;
      }
      return count;
    }
    function matchKleeneStar(pattern2) {
      const previndex = pattern2.index;
      let count = 0;
      while (true) {
        pattern2.index = previndex;
        const m = matchAny(pattern2);
        if (m === void 0) {
          break;
        } else {
          count += m;
        }
      }
      return count;
    }
    function matchUnion(pattern2) {
      let i = 0;
      while (!isUnionEnd(pattern2.data[pattern2.index])) {
        const pos2 = str2.getpos();
        const m = matchAny(pattern2);
        if (m !== void 0) {
          while (!isUnionEnd(pattern2.data[pattern2.index]))
            pattern2.index++;
          if (pattern2.index >= pattern2.data.length) {
            console.log("something is wrong", pattern2, str2);
            return void 0;
          }
          pattern2.index++;
          return m;
        }
        i++;
        str2.setpos(pos2);
        if (i > 1e3) {
          console.log("infinite loop", pattern2, str2);
          return void 0;
        }
      }
      pattern2.index++;
      return void 0;
    }
    return matchAny(pattern);
  }
  function str(string) {
    if (string.length === 1)
      return [string.codePointAt(0)];
    return [
      (2 << 24) * 4,
      ...string.split("").map((s) => {
        return s.codePointAt(0);
      }),
      (2 << 24) * 5
    ];
  }
  function concat(...args) {
    return [
      (2 << 24) * 4,
      ...args.map((a) => {
        return typeof a === "string" ? str(a) : a;
      }).flat(1),
      (2 << 24) * 5
    ];
  }
  function union(...args) {
    if (args.length === 1)
      return typeof args[0] === "string" ? str(args[0]) : args[0];
    return [
      (2 << 24) * 2,
      ...args.map((a) => {
        return typeof a === "string" ? str(a) : a;
      }).flat(1),
      (2 << 24) * 3
    ];
  }
  function kleene(opcodes) {
    return [(2 << 24) * 1, ...opcodes];
  }
  function maybe(opcodes) {
    return union(opcodes, str(""));
  }
  function atleast(count, opcodes) {
    return concat(...new Array(count).fill(opcodes).flat(1), kleene(opcodes));
  }
  function between(lo, hi, opcodes) {
    return concat(
      ...new Array(lo).fill(opcodes),
      ...new Array(hi - lo).fill(maybe(opcodes))
    );
  }
  function range(startChar, endChar) {
    return [(2 << 24) * 6 + startChar, endChar];
  }
  var RopeLeaf = class _RopeLeaf {
    constructor(data) {
      this.hashid = _RopeLeaf.id++;
      this.data = data;
      this.iters = /* @__PURE__ */ new Map();
    }
    static {
      this.id = 0;
    }
    get countToLeft() {
      return this.data.length;
    }
    purgeDeadIterators() {
      for (const [k, v] of this.iters.entries()) {
        if (v.deref() === void 0) {
          this.iters.delete(k);
        }
      }
    }
    concat(r) {
      const root2 = new RopeBranch(this, r);
      return root2;
    }
    at(idx) {
      return this.data[idx];
    }
    iter(idx) {
      const existingIter = this.iters.get(idx)?.deref();
      if (existingIter)
        return existingIter;
      const iter = new RopeIter(this, idx);
      return iter;
    }
    startIndex() {
      const parent = this.parent;
      if (!parent)
        return 0;
      const parentStartIndex = parent.startIndex();
      if (parent.left === this) {
        return parentStartIndex;
      } else {
        return parentStartIndex + parent.countToLeft;
      }
    }
    split(idx) {
      const left = new _RopeLeaf(this.data.slice(0, idx));
      left.hashid = this.hashid;
      const right = new _RopeLeaf(this.data.slice(idx));
      right.hashid = this.hashid;
      this.purgeDeadIterators();
      for (const iterRef of this.iters.values()) {
        const iter = iterRef.deref();
        if (iter.pos >= idx) {
          iter.moveRef(right, iter.pos - idx);
        } else {
          iter.moveRef(left, iter.pos);
        }
      }
      return [left, right];
    }
    shallowCopy() {
      return new _RopeLeaf(this.data);
    }
    str() {
      return this.data;
    }
    nextLeaf() {
      let rope = this;
      while (rope === rope?.parent?.right) {
        rope = rope.parent;
      }
      rope = rope.parent;
      if (rope) {
        rope = rope.right;
        while (!(rope instanceof _RopeLeaf)) {
          rope = rope.left;
        }
        return rope;
      }
    }
    prevLeaf() {
      let rope = this;
      while (rope === rope?.parent?.left) {
        rope = rope.parent;
      }
      rope = rope.parent;
      if (rope) {
        rope = rope.left;
        while (!(rope instanceof _RopeLeaf)) {
          rope = rope.right;
        }
        return rope;
      }
    }
  };
  var RopeBranch = class _RopeBranch {
    constructor(left, right) {
      this.left = left;
      if (left)
        left.parent = this;
      this.right = right;
      if (right)
        right.parent = this;
      this.countToLeft = 0;
      let nodeToSum = left;
      while (true) {
        this.countToLeft += nodeToSum.countToLeft;
        if (typeof nodeToSum.data !== "string") {
          nodeToSum = nodeToSum.right;
        } else {
          break;
        }
      }
    }
    shallowCopy() {
      return new _RopeBranch(this.left, this.right);
    }
    concat(r) {
      const root2 = new _RopeBranch(this, r);
      return root2;
    }
    at(idx) {
      if (idx < this.countToLeft) {
        return this.left.at(idx);
      } else {
        return this.right.at(idx - this.countToLeft);
      }
    }
    iter(idx) {
      if (idx < this.countToLeft) {
        return this.left.iter(idx);
      } else {
        return this.right.iter(idx - this.countToLeft);
      }
    }
    startIndex() {
      const parent = this.parent;
      if (!parent)
        return 0;
      const parentStartIndex = parent.startIndex();
      if (parent.left === this) {
        return parentStartIndex;
      } else {
        return parentStartIndex + parent.countToLeft;
      }
    }
    split(idx) {
      if (idx < this.countToLeft) {
        const [first, second] = this.left.split(idx);
        return [first, new _RopeBranch(second, this.right)];
      } else if (idx > this.countToLeft) {
        const [first, second] = this.right.split(idx - this.countToLeft);
        return [new _RopeBranch(this.left, first), second];
      } else {
        return [this.left, this.right];
      }
    }
    str() {
      return this.left.str() + this.right.str();
    }
  };
  var RopeIter = class _RopeIter {
    static {
      this.id = 0;
    }
    constructor(rope, pos2) {
      this.rope = rope;
      this.pos = pos2;
      this.id = _RopeIter.id++;
      this.rope.iters.set(this.pos, new WeakRef(this));
    }
    index() {
      return this.pos + this.rope.startIndex();
    }
    equals(iter) {
      return this.rope === iter.rope && this.pos === iter.pos;
    }
    hash() {
      return this.id;
    }
    moveRef(newRope, idx) {
      this.rope.iters.delete(this.pos);
      newRope.iters.set(idx, new WeakRef(this));
      this.rope = newRope;
      this.pos = idx;
    }
    read(n) {
      let nextIterRope = this.rope;
      let nextIterPos = this.pos;
      let readString = "";
      while (n > 0) {
        const unrestrictedRemainingCount = nextIterRope.str().length - nextIterPos;
        const remainingCount = Math.min(n, unrestrictedRemainingCount);
        readString += nextIterRope.str().slice(nextIterPos, remainingCount + nextIterPos);
        nextIterPos = remainingCount + nextIterPos;
        n -= remainingCount;
        if (n > 0) {
          nextIterPos = 0;
          const nextLeaf = nextIterRope.nextLeaf();
          if (!nextLeaf) {
            nextIterPos = nextIterRope.str().length;
            break;
          }
          nextIterRope = nextLeaf;
        }
      }
      return [readString, nextIterRope.iter(nextIterPos)];
    }
    prev(n) {
      let prevIterRope = this.rope;
      let prevIterPos = this.pos;
      while (n > 0) {
        const remaining = prevIterPos;
        if (remaining >= n) {
          prevIterPos -= n;
          n = 0;
        } else {
          n -= prevIterPos;
          const prevLeaf = prevIterRope.prevLeaf();
          if (!prevLeaf) {
            prevIterPos = 0;
            break;
          }
          prevIterRope = prevLeaf;
          prevIterPos = prevIterRope.str().length - 1;
        }
      }
      return prevIterRope.iter(prevIterPos);
    }
  };
  function root(rope) {
    while (rope.parent) {
      rope = rope.parent;
    }
    return rope;
  }
  var matchToToken = (x) => x;
  var specialSymbols = "|*?+{}()[]".split("");
  var escapableSymbols = [...specialSymbols, "%"];
  var tokens = {
    binop: matchToken(str("|"), matchToToken, "Expected a binary operator."),
    unop: matchToken(
      union("*", "?", "+"),
      matchToToken,
      "Expected a unary operator."
    ),
    openCurly: matchToken(str("{"), matchToToken, "Expected '{'"),
    closeCurly: matchToken(str("}"), matchToToken, "Expected '}'"),
    openParen: matchToken(str("("), matchToToken, "Expected '('"),
    closeParen: matchToken(str(")"), matchToToken, "Expected ')'"),
    openSquare: matchToken(str("["), matchToToken, "Expected '['"),
    closeSquare: matchToken(str("]"), matchToToken, "Expected ']'"),
    dash: matchToken(str("-"), matchToToken, "Expected '-'"),
    str: token((lexer) => {
      let str2 = "";
      while (true) {
        const char = lexer.next(1);
        if (char.length === 0) {
          return str2;
        } else if (specialSymbols.includes(char) && str2[str2.length - 1] !== "%") {
          lexer.prev(1);
          return str2;
        }
        str2 += char;
      }
    }),
    char: token((lexer) => {
      const char = lexer.next(1);
      if (char === "") {
        lexer.err("Unexpected end of input.");
      }
      if (char === "%") {
        const char2 = lexer.next(1);
        return char2;
      }
      return char;
    }),
    comma: matchToken(str(","), matchToToken, "Expected ','"),
    maybeNumber: matchToken(
      kleene(union(...new Array(10).fill(0).map((e, i) => i.toString()))),
      matchToToken,
      "Expected a number."
    )
  };
  function unescapePatternString(str2) {
    let out = "";
    for (let i = 0; i < str2.length; i++) {
      const char = str2[i];
      if (char === "%") {
        i++;
        if (escapableSymbols.includes(str2[i]))
          out += str2[i];
      } else {
        out += char;
      }
    }
    return out;
  }
  var bindingPowers = {
    "|": 10,
    "(": 20,
    "[": 20,
    "*": 30,
    "?": 30,
    "+": 30,
    "{": 30
  };
  var parselet = makeParseletBuilder();
  function parseCharacterSet(p) {
    const node = {
      type: "VariadicOp",
      operator: "|",
      operands: []
    };
    while (!p.isNext(tokens.closeSquare) && node.operands[node.operands.length - 1]?.type !== "Error") {
      node.operands.push(p.parse(characterSetItemParselet, 0));
    }
    p.lex(tokens.closeSquare);
    return node;
  }
  var leftAssoc = {
    "|": true,
    "(": true,
    "[": true,
    "*": true,
    "?": true,
    "+": true,
    "{": true
  };
  var consequentExpressionParselet = parselet(
    (p) => {
      const first = p.lexFirstMatch(
        [
          tokens.binop,
          tokens.unop,
          tokens.openCurly,
          tokens.openParen,
          tokens.str
        ],
        "Expected a binary or a unary operator."
      );
      const nextBindingPower = (bindingPowers[first] ?? 20) - (leftAssoc[first] ? 0 : 1);
      if (nextBindingPower <= p.state.bindingPower || first.length === 0)
        p.err("");
      let parenthesizedExpr;
      switch (first) {
        case "+":
        case "*":
        case "?":
          return {
            type: "UnOp",
            operator: first,
            operand: p.state.left
          };
        case "|":
          if (p.state.left.type === "VariadicOp" && p.state.left.operator === "|") {
            return {
              type: "VariadicOp",
              operator: "|",
              operands: [
                ...p.state.left.operands,
                p.parse(expressionParselet, nextBindingPower)
              ]
            };
          } else {
            return {
              type: "VariadicOp",
              operator: "|",
              operands: [
                p.state.left,
                p.parse(expressionParselet, nextBindingPower)
              ]
            };
          }
        case "{": {
          const loStr = p.lex(tokens.maybeNumber);
          p.lex(tokens.comma);
          const hiStr = p.lex(tokens.maybeNumber);
          p.lex(tokens.closeCurly);
          return {
            lo: loStr ? Number(loStr) : void 0,
            hi: hiStr ? Number(hiStr) : void 0,
            type: "Repeat",
            operand: p.state.left
          };
        }
        case "[": {
          return parseCharacterSet(p);
        }
        case "(":
          parenthesizedExpr = p.parse(expressionParselet, 0);
          p.lex(tokens.closeParen);
        default: {
          let expr = parenthesizedExpr ?? p.positionify({
            type: "Str",
            str: unescapePatternString(first)
          });
          if (p.state.left.type === "VariadicOp" && p.state.left.operator === "concat") {
            return {
              type: "VariadicOp",
              operator: "concat",
              operands: [...p.state.left.operands, expr]
            };
          } else {
            return {
              type: "VariadicOp",
              operator: "concat",
              operands: [p.state.left, expr]
            };
          }
        }
      }
      throw p.err(`Unreachable! First token was '${first}'`);
    },
    (state) => {
      return state.left[position].id * 1e4 + state.bindingPower;
    },
    (a, b) => {
      return a.left[position].id === b.left[position].id && a.bindingPower === b.bindingPower;
    }
  );
  var ipsHash = (e) => e;
  var ipsEq = (e) => e === e;
  var characterSetItemParselet = parselet(
    (p) => {
      const rangeStart = unescapePatternString(p.lex(tokens.char));
      if (p.isNext(tokens.dash)) {
        p.lex(tokens.dash);
        const rangeEnd = unescapePatternString(p.lex(tokens.char));
        return {
          type: "Range",
          startChar: rangeStart.codePointAt(0),
          endChar: rangeEnd.codePointAt(0)
        };
      }
      return {
        type: "Str",
        str: rangeStart
      };
    },
    ipsHash,
    ipsEq
  );
  var initExpressionParselet = parselet(
    (p) => {
      const first = p.lexFirstMatch(
        [tokens.openParen, tokens.openSquare, tokens.str],
        "Expected '(', '[', or a string literal"
      );
      if (first === "[") {
        return parseCharacterSet(p);
      } else if (first === "(") {
        const result = p.parse(expressionParselet, 0);
        p.lex(tokens.closeParen);
        return result;
      } else {
        return {
          type: "Str",
          str: unescapePatternString(first)
        };
      }
    },
    ipsHash,
    ipsEq
  );
  var expressionParselet = parselet(
    (p) => {
      let left = p.parse(initExpressionParselet, p.state);
      while (true) {
        const snapshot = p.getParserSnapshot();
        const nextParseNode = p.parse(consequentExpressionParselet, {
          bindingPower: p.state,
          left
        });
        if (nextParseNode.type === "Error") {
          p.setParserSnapshot(snapshot);
          break;
        }
        left = nextParseNode;
      }
      return left;
    },
    ipsHash,
    ipsEq
  );
  function parsePattern(str2) {
    const lexer = lexerFromString(new RopeLeaf(str2).iter(0));
    const parser = parserFromLexer(
      lexer,
      0,
      expressionParselet,
      [],
      {
        makeErrorMessage(msg) {
          return {
            type: "Error",
            reason: msg
          };
        },
        makeLexerError(pos2) {
          return {
            type: "Error",
            reason: `Lexer error at ${pos2}`
          };
        },
        makeUnhandledError(err) {
          return {
            type: "Error",
            reason: err ? err.toString() : "undefined"
          };
        },
        isErr(node) {
          return node && node.type === "Error";
        }
      }
    );
    return parser.exec(() => false);
  }
  function compilePatternTree(tree) {
    switch (tree.type) {
      case "Range":
        return range(tree.startChar, tree.endChar);
      case "Error":
        throw new Error(
          `Error compiling pattern at position ${tree[position].start.index()}: ${tree.reason}`
        );
      case "Repeat": {
        const inner = compilePatternTree(tree.operand);
        if (tree.hi !== void 0) {
          return between(tree.lo ?? 0, tree.hi, inner);
        } else {
          return atleast(tree.lo ?? 0, inner);
        }
      }
      case "Str":
        return str(tree.str);
      case "UnOp": {
        const inner = compilePatternTree(tree.operand);
        switch (tree.operator) {
          case "*":
            return kleene(inner);
          case "+":
            return atleast(1, inner);
          case "?":
            return maybe(inner);
        }
        break;
      }
      case "VariadicOp": {
        const operands = tree.operands.map((o) => compilePatternTree(o));
        switch (tree.operator) {
          case "|":
            return union(...operands);
          case "concat":
            return concat(...operands);
        }
      }
    }
  }
  function compilePattern(str2) {
    try {
      return compilePatternTree(parsePattern(str2));
    } catch (err) {
      throw new Error(
        `Error compiling pattern '${str2}': ${err.message}`
      );
    }
  }
  function token(fn) {
    return {
      lex(lexer) {
        let nextLexer = lexer;
        const output = fn({
          next(n) {
            const [str2, lexer2] = nextLexer.next(n);
            nextLexer = lexer2;
            return str2;
          },
          prev(n) {
            const l = nextLexer.prev(n);
            nextLexer = l;
          },
          getpos() {
            return nextLexer.position.index();
          },
          setpos(pos2) {
            const lexer2 = root(nextLexer.position.rope).iter(pos2);
            nextLexer = lexerFromString(lexer2);
          },
          err(msg) {
            throw lexer.err(msg);
          }
        });
        return [output, nextLexer];
      }
    };
  }
  function makeParseletBuilder() {
    return (...args) => parselet2(...args);
  }
  function parselet2(fn, hash, eq) {
    const cache = new HashTable((key) => hash(key), eq);
    return {
      parse(parser, skipTokenTypes, isInRange) {
        const posmap = cache.get(parser.state);
        const entry = posmap?.get(parser.position);
        if (entry) {
          if (isInRange(parser.position, entry[1].position)) {
            nestedMapDelete(
              cache,
              parser.state,
              (m) => m.delete(parser.position)
            );
          } else {
            return entry;
          }
        }
        let ret;
        let newParser = parser;
        let encounteredErrNormally = false;
        try {
          const output = fn({
            parse(symbol, newState) {
              const [output2, parser2] = newParser.parse(
                symbol,
                newState,
                isInRange
              );
              newParser = parser2;
              return output2;
            },
            lex(symbol) {
              newParser = eliminateSkipTokens(newParser, skipTokenTypes);
              const [output2, parser2] = newParser.lex(symbol);
              newParser = parser2;
              if (newParser.options.isErr(output2)) {
                encounteredErrNormally = true;
                throw output2;
              }
              return output2;
            },
            err: (msg) => {
              encounteredErrNormally = true;
              return parser.err(msg);
            },
            isErr: parser.isErr,
            state: parser.state,
            isNext(symbol) {
              const [output2] = newParser.lex(symbol);
              return !parser.isErr(output2);
            },
            getParserSnapshot() {
              return newParser;
            },
            setParserSnapshot(snapshot) {
              newParser = snapshot;
            },
            lexFirstMatch(tokens2, fallbackErrorMessage) {
              for (const t of tokens2) {
                const [output2, parser2] = newParser.lex(t);
                if (!this.isErr(output2)) {
                  newParser = parser2;
                  return output2;
                }
              }
              encounteredErrNormally = true;
              throw newParser.options.makeErrorMessage(fallbackErrorMessage);
            },
            lexMatch(noMatchBranch, ...branches) {
              for (const [token2, fn2] of branches) {
                const [output2, parser2] = newParser.lex(token2);
                if (!this.isErr(output2)) {
                  newParser = parser2;
                  return fn2(output2);
                }
              }
              return noMatchBranch();
            },
            positionify(node) {
              return {
                ...node,
                [position]: {
                  start: parser.position,
                  length: newParser.position.index() - parser.position.index(),
                  id: uniqueId()
                },
                [skipTokens]: {
                  before: [],
                  after: []
                }
              };
            }
          });
          ret = [output, newParser];
        } catch (err) {
          if (encounteredErrNormally) {
            const errAsNode = err;
            ret = [errAsNode, newParser];
          } else {
            const errAsNode = newParser.options.makeUnhandledError(err);
            ret = [errAsNode, newParser];
          }
        }
        multiMapSet(
          cache,
          parser.state,
          /* @__PURE__ */ new Map(),
          (m) => m.set(parser.position, ret)
        );
        return ret;
      }
    };
  }
  function multiMapSet(map, key, fallback, callback) {
    let v = map.get(key);
    if (v === void 0) {
      v = fallback;
      map.set(key, v);
    }
    callback(v);
  }
  function nestedMapDelete(map, key, callback) {
    const innerMap = map.get(key);
    if (innerMap) {
      callback(innerMap);
    }
    if (innerMap && innerMap?.size === 0) {
      return map.delete(key);
    } else {
      return false;
    }
  }
  function matchToken(pattern, onMatch, err) {
    return token((iter) => {
      const iterStart = iter.getpos();
      const matches = match(
        {
          data: pattern,
          index: 0
        },
        {
          next: () => {
            const char = iter.next(1);
            return char;
          },
          getpos: iter.getpos,
          setpos: iter.setpos
        }
      );
      if (matches !== void 0) {
        iter.setpos(iterStart);
        return onMatch(iter.next(matches));
      } else {
        throw iter.err(err);
      }
    });
  }

  // src/parser.tsx
  var patternToken = (pat) => matchToken(compilePattern(pat), (str2) => str2, "Unrecognized character.");
  var binaryOp = patternToken("%+|%*|/|-|>=|<=|>|<|=|==|!=|beats|fails|and|or|&&|%|%||!|x|X|d|D");
  var damageType = patternToken("([a-zA-Z])+");
  var openParen = patternToken("%(");
  var closeParen = patternToken("%)");
  var whitespace = patternToken("[\r\n 	]");
  var variableName = patternToken("([a-zA-Z])([a-zA-Z0-9]*)");
  var questionMark = patternToken("%?");
  var colon = patternToken(":");
  var comma = patternToken(",");
  var integer = patternToken("[0-9]+");
  function canonicalizeVarName(varName) {
    return varName[0] === "$" ? varName.slice(1) : varName;
  }
  var BinOps = /* @__PURE__ */ function(BinOps2) {
    BinOps2["Add"] = "Add";
    BinOps2["Sub"] = "Sub";
    BinOps2["Mul"] = "Mul";
    BinOps2["Div"] = "Div";
    BinOps2["GreaterThan"] = "GreaterThan";
    BinOps2["LessThan"] = "LessThan";
    BinOps2["Equal"] = "Equal";
    BinOps2["NotEqual"] = "NotEqual";
    BinOps2["GreaterEqual"] = "GreaterEqual";
    BinOps2["LessEqual"] = "LessEqual";
    BinOps2["And"] = "And";
    BinOps2["Or"] = "Or";
    BinOps2["Repeat"] = "Repeat";
    BinOps2["DiceRoll"] = "DiceRoll";
    return BinOps2;
  }({});
  var bindingPowers2 = {
    [BinOps.DiceRoll]: 50,
    [BinOps.Add]: 30,
    [BinOps.Sub]: 30,
    [BinOps.Mul]: 40,
    [BinOps.Div]: 40,
    [BinOps.GreaterThan]: 20,
    [BinOps.LessThan]: 20,
    [BinOps.Equal]: 20,
    [BinOps.NotEqual]: 20,
    [BinOps.GreaterEqual]: 20,
    [BinOps.LessEqual]: 20,
    [BinOps.And]: 10,
    [BinOps.Or]: 10,
    [BinOps.Repeat]: 0
  };
  var BaseBindingPower = -10;
  var DamageTypeBindingPower = 0;
  var hashIPS = (state) => {
    return state.bindingPower;
  };
  var eqIPS = (a, b) => {
    return a.bindingPower === b.bindingPower;
  };
  var parselet3 = makeParseletBuilder();
  var symbolToBinaryOp = {
    "+": BinOps.Add,
    "-": BinOps.Sub,
    "*": BinOps.Mul,
    "/": BinOps.Div,
    "&&": BinOps.And,
    and: BinOps.And,
    "||": BinOps.Or,
    or: BinOps.Or,
    ">": BinOps.GreaterThan,
    "<": BinOps.LessThan,
    fails: BinOps.LessThan,
    "==": BinOps.Equal,
    "!=": BinOps.NotEqual,
    ">=": BinOps.GreaterEqual,
    beats: BinOps.GreaterEqual,
    "<=": BinOps.LessEqual,
    x: BinOps.Repeat,
    X: BinOps.Repeat,
    d: BinOps.DiceRoll,
    D: BinOps.DiceRoll
  };
  var consequentExpressionParselet2 = parselet3((p) => {
    return p.lexMatch(() => p.err("Expected a binary operator or a damage type."), [binaryOp, (first) => {
      const op = symbolToBinaryOp?.[first];
      const nextBindingPower = bindingPowers2?.[op];
      if (nextBindingPower === void 0) {
        console.log(`Unrecognized operator '${first}'. The end user should not see this error.`);
        p.err("");
      }
      if (nextBindingPower <= p.state.bindingPower)
        p.err("");
      return {
        type: "BinaryOp",
        op,
        left: p.state.left,
        right: p.parse(expressionParselet2, {
          bindingPower: nextBindingPower
        })
      };
    }], [damageType, (first) => {
      if (DamageTypeBindingPower <= p.state.bindingPower)
        p.err("");
      return {
        type: "DamageType",
        damageType: first,
        operand: p.state.left
      };
    }]);
  }, (state) => {
    return state.bindingPower * 1e8 + state.left[position].id * 1e5;
  }, (a, b) => {
    return a.bindingPower === b.bindingPower && a.left === b.left;
  });
  var initExpressionParselet2 = parselet3((p) => {
    return p.lexMatch(() => p.err("Expected '(', a number, or a variable name."), [openParen, () => {
      const result = p.parse(expressionParselet2, {
        bindingPower: -100
      });
      p.lex(closeParen);
      return result;
    }], [integer, (num) => {
      return {
        type: "Number",
        number: Number(num)
      };
    }], [variableName, (varName) => p.lexMatch(() => {
      return {
        type: "FunctionCall",
        functionName: canonicalizeVarName(varName),
        arguments: []
      };
    }, [openParen, () => {
      const getNext = () => p.lexMatch(() => p.err("Expected ',' to separate function arguments or ')' to end the function."), [comma, () => ","], [closeParen, () => ")"]);
      const args = [];
      do {
        args.push(p.parse(expressionParselet2, {
          bindingPower: BaseBindingPower
        }));
      } while (getNext() !== ")");
      return {
        type: "FunctionCall",
        functionName: canonicalizeVarName(varName),
        arguments: args
      };
    }])]);
  }, hashIPS, eqIPS);
  var expressionParselet2 = parselet3((p) => {
    let left = p.parse(initExpressionParselet2, p.state);
    while (true) {
      const snapshot = p.getParserSnapshot();
      const nextParseNode = p.parse(consequentExpressionParselet2, {
        bindingPower: p.state.bindingPower,
        left
      });
      if (nextParseNode.type === "Error") {
        p.setParserSnapshot(snapshot);
        break;
      }
      left = nextParseNode;
    }
    return left;
  }, hashIPS, eqIPS);
  function makeDiceRollerParser(src) {
    const lexer = lexerFromString(src);
    return parserFromLexer(lexer, {
      bindingPower: BaseBindingPower
    }, expressionParselet2, [whitespace], {
      // Converts an error message to a full error node
      makeErrorMessage(msg) {
        return {
          type: "Error",
          reason: msg
        };
      },
      // Converts a lexer error to a full error node
      makeLexerError(pos) {
        return {
          type: "Error",
          reason: `Lexer error at position ${pos}`
        };
      },
      // Converts an arbitrary error with an unknown type (since you can throw anything)
      // into an error node.
      makeUnhandledError(err) {
        return {
          type: "Error",
          reason: `Unhandled internal error: ${JSON.stringify(err)} `
        };
      },
      // Detects if a node is an error node.
      isErr(err) {
        return err.type === "Error";
      }
    });
  }
  function parseDiceRoller(src) {
    const parser = makeDiceRollerParser(new RopeLeaf(src).iter(0));
    const parserOutput = parser.exec(() => true);
    return parserOutput;
  }

  // src/multilayer-map.ts
  function makeMultilayerMap() {
    const underlyingData = /* @__PURE__ */ new Map();
    const map = {
      // @ts-ignore
      get(k) {
        if (k.length === 1)
          return underlyingData.get(k[0]);
        return underlyingData.get(k[0])?.get(k.slice(1));
      },
      set(k, v) {
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
      delete(k) {
        if (k.length === 1) {
          return underlyingData.delete(k[0]);
        } else {
          let entry = underlyingData.get(k[0]);
          if (!entry)
            return;
          const deleted = entry.delete(k.slice(1));
          if (entry.size === 0) {
            underlyingData.delete(k[0]);
          }
          return deleted;
        }
      },
      get size() {
        return underlyingData.size;
      }
    };
    return map;
  }

  // src/clone-ast.ts
  function cloneAST(ast2) {
    switch (ast2.type) {
      case "Number":
      case "Error":
        return {
          ...ast2
        };
      case "BinaryOp":
        return {
          ...ast2,
          left: cloneAST(ast2.left),
          right: cloneAST(ast2.right)
        };
      case "FunctionCall":
        return {
          ...ast2,
          arguments: ast2.arguments.map(cloneAST)
        };
      case "DamageType":
        return {
          ...ast2,
          operand: cloneAST(ast2.operand)
        };
      case "TernaryNode":
        return {
          ...ast2,
          condition: cloneAST(ast2.condition),
          ifTrue: cloneAST(ast2.ifTrue),
          ifFalse: ast2.ifFalse ? cloneAST(ast2.ifFalse) : void 0
        };
    }
  }

  // src/evaluator.tsx
  var drData = {
    number: (data) => ({
      type: "Number",
      data
    }),
    boolean: (data) => ({
      type: "Boolean",
      data
    })
  };
  var success = (v) => ({
    type: "Success",
    data: v
  });
  var failure = (errs) => ({
    type: "Failure",
    data: errs
  });
  var errInfo = (reason, node) => ({
    reason,
    node
  });
  function filterFailsAndSuccesses(results) {
    return [results.filter((r) => r.type === "Failure").map((d) => d.data).flat(1), results.filter((r) => r.type === "Success").map((s) => s.data)];
  }
  function applyBinOpToNumbers(a, b, fn, damageType2) {
    const allDamageTypes = /* @__PURE__ */ new Set([...a.data.keys(), ...b.data.keys()]);
    const newNumberData = /* @__PURE__ */ new Map();
    for (const dt of allDamageTypes) {
      const entryA = a.data.get(dt);
      const entryB = b.data.get(dt);
      newNumberData.set(damageType2(dt), fn(entryA ?? 0, entryB ?? 0));
    }
    return drData.number(newNumberData);
  }
  function foil(a, b, fn, damageType2) {
    const newNumberData = /* @__PURE__ */ new Map();
    for (const [damageTypeA, damageA] of a.data) {
      for (const [damageTypeB, damageB] of b.data) {
        newNumberData.set(damageType2(damageTypeA, damageTypeB), fn(damageA, damageB));
      }
    }
    return drData.number(newNumberData);
  }
  function hasNoDamageType(n) {
    return n.data.size === 0 || n.data.size === 1 && n.data.has("");
  }
  function total(n) {
    return [...n.data.values()].reduce((prev, curr) => prev + curr, 0);
  }
  function equal(a, b) {
    if (a.type !== b.type)
      return false;
    if (a.type === "Boolean" && a.data !== b.data)
      return false;
    if (a.type === "Number" && b.type === "Number") {
      const allDamageTypes = new Set(...a.data.keys(), ...b.data.keys());
      for (const type of allDamageTypes) {
        const valueA = a.data.get(type) ?? 0;
        const valueB = a.data.get(type) ?? 0;
        if (valueA !== valueB)
          return false;
      }
    }
    return true;
  }
  function evaluateBinaryOperation(node, context) {
    const leftMaybeErr = evaluateAST(node.left, context);
    const rightMaybeErr = evaluateAST(node.right, context);
    const [errors, [left, right]] = filterFailsAndSuccesses([leftMaybeErr, rightMaybeErr]);
    if (errors.length > 0)
      return failure(errors);
    switch (node.op) {
      case BinOps.And:
      case BinOps.Or:
        if (left.type !== "Boolean" || right.type !== "Boolean") {
          return failure([errInfo(`The '${node.op}' operator may only occur between two numbers`, node)]);
        }
        switch (node.op) {
          case BinOps.And:
            return success(drData.boolean(left.data && right.data));
          case BinOps.Or:
            return success(drData.boolean(left.data || right.data));
        }
      case BinOps.Equal:
        return success(drData.boolean(equal(left, right)));
      case BinOps.NotEqual:
        return success(drData.boolean(!equal(left, right)));
      case BinOps.Add:
      case BinOps.Sub:
      case BinOps.Mul:
      case BinOps.Div:
      case BinOps.GreaterThan:
      case BinOps.LessThan:
      case BinOps.GreaterEqual:
      case BinOps.LessEqual:
      case BinOps.DiceRoll:
      case BinOps.Repeat:
        if (left.type !== "Number" || right.type !== "Number") {
          return failure([errInfo(`The '${node.op}' operator may only occur between two numbers`, node)]);
        }
        switch (node.op) {
          case BinOps.Add:
          case BinOps.Sub:
            return success(applyBinOpToNumbers(left, right, (a, b) => node.op === BinOps.Add ? a + b : a - b, (a) => a));
          case BinOps.Mul:
            if (!hasNoDamageType(left) && !hasNoDamageType(right)) {
              context.warnings.set(node, `Multiplying two operands with damage types. You may get an unexpected answer.`);
            }
            return success(foil(left, right, (a, b) => node.op === BinOps.Mul ? a * b : a / b, (a, b) => `${a} ${b}`.trim()));
          case BinOps.Div:
            if (!hasNoDamageType(right)) {
              context.warnings.set(node, `Dividing by an operand with damage types. You may get an unexpected answer.`);
            }
            const newNumberData = new Map(left.data);
            const rightTotal = total(right);
            for (const [k, v] of newNumberData)
              newNumberData.set(k, Math.floor(v / rightTotal));
            return success(drData.number(newNumberData));
          case BinOps.GreaterThan:
          case BinOps.LessThan:
          case BinOps.GreaterEqual:
          case BinOps.LessEqual: {
            const leftTotal = total(left);
            const rightTotal2 = total(right);
            return success(drData.boolean({
              [BinOps.GreaterThan]: (a, b) => a > b,
              [BinOps.LessThan]: (a, b) => a < b,
              [BinOps.GreaterEqual]: (a, b) => a >= b,
              [BinOps.LessEqual]: (a, b) => a <= b
            }[node.op](leftTotal, rightTotal2)));
          }
          case BinOps.DiceRoll: {
            if (!hasNoDamageType(left) || !hasNoDamageType(right)) {
              context.warnings.set(node, `Performing a dice roll with a damage type for its dice count and/or dice size. You may get an unexpected answer.`);
            }
            let diceRollTotal = 0;
            const dieSize = total(right);
            console.log(node, dieSize);
            const results = [];
            for (let i = 0; i < total(left); i++) {
              const result = Math.floor(Math.random() * dieSize) + 1;
              results.push(result);
              diceRollTotal += result;
            }
            context.diceRollResults.set(node, results);
            return success(drData.number(/* @__PURE__ */ new Map([["", diceRollTotal]])));
          }
          case BinOps.Repeat: {
            if (!hasNoDamageType(right)) {
              context.warnings.set(node, `Repeating a calculation a number of times with a damage type. You may get an unexpected answer.`);
            }
            const totalRight = total(right);
            const recalculatedCopies = [];
            const clones = [];
            for (let i = 0; i < totalRight; i++) {
              const clone = cloneAST(node.left);
              recalculatedCopies.push(evaluateAST(clone, context));
              clones.push(clone);
            }
            context.repeatClones.set(node, clones);
            const [errors2, successes] = filterFailsAndSuccesses(recalculatedCopies);
            if (errors2.length > 0)
              return failure(errors2);
            const numbers = successes.filter((suc) => suc.type === "Number");
            if (successes.length !== numbers.length) {
              return failure([errInfo("Expected all operands in a repetition operation to be numbers.", node)]);
            }
            return success(numbers.reduce((prev, curr) => applyBinOpToNumbers(prev, curr, (a, b) => a + b, (a) => a), drData.number(/* @__PURE__ */ new Map())));
          }
        }
    }
  }
  function applyDamageType(num, damageType2) {
    const newNum = new Map(num.data);
    const typelessDamage = newNum.get("") ?? 0;
    newNum.set(damageType2, typelessDamage);
    newNum.delete("");
    return drData.number(newNum);
  }
  function evaluateASTNoCache(node, context) {
    switch (node.type) {
      case "BinaryOp":
        return evaluateBinaryOperation(node, context);
      case "DamageType":
        const operand = evaluateAST(node.operand, context);
        if (operand.type === "Failure")
          return operand;
        if (operand.data.type === "Boolean")
          return failure([errInfo("Cannot apply damage types to boolean (true/false) values.", node)]);
        return success(applyDamageType(operand.data, node.damageType));
      case "Error":
        return failure([errInfo(node.reason, node)]);
      case "FunctionCall":
        const fn = context.functions.get(node.functionName);
        if (!fn)
          return failure([errInfo(`'${node.functionName}' does not exist`, node)]);
        const ret = fn(node, context);
        context.functionComponents.set(node, ret.component);
        return ret.result;
      case "Number":
        return success(drData.number(/* @__PURE__ */ new Map([["", node.number]])));
      case "TernaryNode":
        const condition = evaluateAST(node.condition, context);
        const ifTrue = evaluateAST(node.ifTrue, context);
        const ifFalse = node.ifFalse ? evaluateAST(node.ifFalse, context) : success(drData.number(/* @__PURE__ */ new Map()));
        if (condition.type === "Failure")
          return condition;
        if (condition) {
          return ifTrue;
        } else {
          return ifFalse;
        }
    }
  }
  var cachedEvaluations = makeMultilayerMap();
  function evaluateAST(node, context) {
    const cachedValue = context.cache.get(node);
    if (cachedValue)
      return cachedValue;
    const evaluatedValue = evaluateASTNoCache(node, context);
    context.cache.set(node, evaluatedValue);
    return evaluatedValue;
  }

  // src/viewer/DiceRollsDisplay.tsx
  var _tmpl$ = /* @__PURE__ */ template(`<div class="dice-roll">`);
  var _tmpl$2 = /* @__PURE__ */ template(`<div class="vertical">`);
  var _tmpl$3 = /* @__PURE__ */ template(`<div class="vertical dice-rolls"><div class="dice-quantity horizontal">d</div><div class="dice">`);
  var _tmpl$4 = /* @__PURE__ */ template(`<div class="vertical-divider">`);
  var SizeToBGImage = {
    4: "d4_1.blender.png",
    6: "d6_1.blender.png",
    8: "d8_1.blender.png",
    10: "d10_1.blender.png",
    12: "d12_1.blender.png",
    20: "d20_1.blender.png"
  };
  function SingleDiceRoll(props) {
    const bgImage = () => SizeToBGImage[props.size()] ?? "unknown_size.png";
    return createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return props.summarizationLevel() === 0;
          },
          get children() {
            const _el$ = _tmpl$();
            insert(_el$, (() => {
              const _c$ = createMemo(() => !!props.evaluate());
              return () => _c$() ? props.value() : `d${props.size()}`;
            })());
            createRenderEffect((_p$) => {
              const _v$ = `url(${bgImage()})`, _v$2 = props.evaluate() ? "" : "75%";
              _v$ !== _p$._v$ && ((_p$._v$ = _v$) != null ? _el$.style.setProperty("background-image", _v$) : _el$.style.removeProperty("background-image"));
              _v$2 !== _p$._v$2 && ((_p$._v$2 = _v$2) != null ? _el$.style.setProperty("font-size", _v$2) : _el$.style.removeProperty("font-size"));
              return _p$;
            }, {
              _v$: void 0,
              _v$2: void 0
            });
            return _el$;
          }
        }), createComponent(Match, {
          get when() {
            return props.summarizationLevel() > 0;
          },
          get children() {
            const _el$2 = _tmpl$2();
            insert(_el$2, (() => {
              const _c$2 = createMemo(() => !!props.evaluate());
              return () => _c$2() ? props.value() : `d${props.size()}`;
            })());
            return _el$2;
          }
        })];
      }
    });
  }
  function DiceRollsDisplay(props) {
    const op = () => props.node().op;
    const left = () => props.node().left;
    const right = () => props.node().right;
    const diceSize = () => total(evaluateAST(props.node().right, props.context()).data);
    const diceResults = () => props.context().diceRollResults.get(props.node()) ?? [];
    return (() => {
      const _el$3 = _tmpl$3(), _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$4.nextSibling;
      insert(_el$4, createComponent(CalculationDisplay, {
        get context() {
          return props.context;
        },
        node: left,
        get state() {
          return props.state;
        }
      }), _el$5);
      insert(_el$4, createComponent(CalculationDisplay, {
        get context() {
          return props.context;
        },
        node: right,
        get state() {
          return props.state;
        }
      }), null);
      use((el) => {
        createEffect(() => {
          el.style.gridTemplateColumns = `repeat(${Math.min(diceResults().length, 6)}, 1fr)`;
        });
      }, _el$6);
      insert(_el$6, createComponent(For, {
        get each() {
          return diceResults();
        },
        children: (result, i) => [createComponent(Show, {
          get when() {
            return createMemo(() => props.state().summarizationLevel > 0)() && i() !== 0;
          },
          get children() {
            return _tmpl$4();
          }
        }), createComponent(SingleDiceRoll, {
          size: () => diceSize(),
          value: () => result,
          evaluate: () => props.state().evaluate,
          summarizationLevel: () => props.state().summarizationLevel
        })]
      }));
      return _el$3;
    })();
  }

  // src/viewer/ValueViewer.tsx
  var _tmpl$5 = /* @__PURE__ */ template(`<span>&nbsp;`);
  var _tmpl$22 = /* @__PURE__ */ template(`<span>(<!> total)`);
  var _tmpl$32 = /* @__PURE__ */ template(`<div class="dice-roller-value-error error">`);
  function ValueViewer(props) {
    return createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return props.value().type === "Boolean";
          },
          get children() {
            return props.value().data.toString();
          }
        }), createComponent(Match, {
          get when() {
            return props.value().type === "Number";
          },
          get children() {
            return [createComponent(For, {
              get each() {
                return [...props.value().data.entries()];
              },
              children: ([damageType2, damage], i) => {
                return (() => {
                  const _el$ = _tmpl$5(), _el$2 = _el$.firstChild;
                  insert(_el$, () => i() > 0 ? "\xA0+\xA0" : "", _el$2);
                  insert(_el$, damage, _el$2);
                  insert(_el$, damageType2, null);
                  return _el$;
                })();
              }
            }), createComponent(Show, {
              get when() {
                return props.value().data.size === 0;
              },
              children: "0"
            }), createMemo(() => createMemo(() => !!(props.noTotal || props.value().data.size <= 1))() ? "" : ["\xA0", (() => {
              const _el$3 = _tmpl$22(), _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling, _el$5 = _el$6.nextSibling;
              insert(_el$3, () => total(props.value()), _el$6);
              return _el$3;
            })()])];
          }
        })];
      }
    });
  }
  function ResultViewer(props) {
    const type = () => props.value().type;
    return createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return type() === "Success";
          },
          get children() {
            return createComponent(ValueViewer, {
              value: () => props.value().data
            });
          }
        }), createComponent(Match, {
          get when() {
            return type() === "Failure";
          },
          get children() {
            const _el$7 = _tmpl$32();
            insert(_el$7, () => props.value().data.map((e) => e.reason).join("\n"));
            return _el$7;
          }
        })];
      }
    });
  }

  // src/viewer/RepeatViewer.tsx
  var _tmpl$6 = /* @__PURE__ */ template(`<div class="horizontal"><div class="vertical-divider"></div><span class="bigtext">x`);
  var _tmpl$23 = /* @__PURE__ */ template(`<div class="divider">`);
  var _tmpl$33 = /* @__PURE__ */ template(`<div class="binary-op-display vertical repeat-container"><table class="repeat-table"><thead><tr><th>Roll</th><th>Total`);
  var _tmpl$42 = /* @__PURE__ */ template(`<tr><td class="horizontal"></td><td>`);
  var RepeatSummarizationThreshold = 10;
  function RepeatViewer(props) {
    const count = () => evaluateAST(props.node().right, props.context());
    const repeatClones = () => props.context().repeatClones.get(props.node()) ?? [];
    return (() => {
      const _el$ = _tmpl$33(), _el$7 = _el$.firstChild, _el$8 = _el$7.firstChild;
      insert(_el$, createComponent(Show, {
        get when() {
          return repeatClones().length > RepeatSummarizationThreshold;
        },
        get children() {
          return [(() => {
            const _el$2 = _tmpl$6(), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild;
            insert(_el$2, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: () => props.node().left,
              state: () => ({
                ...props.state(),
                evaluate: false
              })
            }), _el$3);
            insert(_el$4, createComponent(ResultViewer, {
              value: () => count()
            }), null);
            return _el$2;
          })(), _tmpl$23()];
        }
      }), _el$7);
      insert(_el$7, createComponent(For, {
        get each() {
          return repeatClones();
        },
        children: (result) => (() => {
          const _el$9 = _tmpl$42(), _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling;
          insert(_el$10, createComponent(CalculationDisplay, {
            get context() {
              return props.context;
            },
            node: () => result,
            state: () => ({
              ...props.state(),
              summarizationLevel: props.state().summarizationLevel + (repeatClones().length > RepeatSummarizationThreshold ? 1 : 0)
            })
          }));
          insert(_el$11, createComponent(ResultViewer, {
            value: () => evaluateAST(result, props.context())
          }));
          return _el$9;
        })()
      }), null);
      return _el$;
    })();
  }

  // src/viewer/viewer.tsx
  var _tmpl$7 = /* @__PURE__ */ template(`<div class="root-dice-roller-display horizontal">&nbsp;=&nbsp;`);
  var _tmpl$24 = /* @__PURE__ */ template(`<p>TODO`);
  var _tmpl$34 = /* @__PURE__ */ template(`<div class="error">Unrecognized function/variable '<!>'`);
  var _tmpl$43 = /* @__PURE__ */ template(`<div class="horizontal binary-op-display">&nbsp;<!>&nbsp;`);
  var _tmpl$52 = /* @__PURE__ */ template(`<div class="vertical binary-op-display"><div class="vinculum">`);
  var _tmpl$62 = /* @__PURE__ */ template(`<div>`);
  var _tmpl$72 = /* @__PURE__ */ template(`<div class="horizontal damage-type">&nbsp;`);
  function RootCalculationDisplay(props) {
    const value = () => evaluateAST(props.node(), props.context());
    return (() => {
      const _el$ = _tmpl$7(), _el$2 = _el$.firstChild;
      use((el) => {
        setTimeout(() => {
          el.style.backgroundColor = "var(--background)";
        }, 10);
      }, _el$);
      _el$.style.setProperty("background-color", "var(--highlight-background)");
      insert(_el$, createComponent(CalculationDisplay, props), _el$2);
      insert(_el$, createComponent(ResultViewer, {
        value
      }), null);
      return _el$;
    })();
  }
  function CalculationDisplay(props) {
    const type = () => props.node().type;
    return createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return type() === "BinaryOp";
          },
          get children() {
            return createComponent(BinaryOpDisplay, props);
          }
        }), createComponent(Match, {
          get when() {
            return type() === "Number";
          },
          get children() {
            return createComponent(NumberDisplay, props);
          }
        }), createComponent(Match, {
          get when() {
            return type() === "DamageType";
          },
          get children() {
            return createComponent(DamageTypeDisplay, props);
          }
        }), createComponent(Match, {
          get when() {
            return type() === "FunctionCall";
          },
          get children() {
            return props.context().functionComponents.get(props.node())?.(props) ?? (() => {
              const _el$4 = _tmpl$34(), _el$5 = _el$4.firstChild, _el$7 = _el$5.nextSibling, _el$6 = _el$7.nextSibling;
              insert(_el$4, () => props.node().functionName, _el$7);
              return _el$4;
            })();
          }
        }), createComponent(Match, {
          get when() {
            return type() === "TernaryNode";
          },
          get children() {
            return _tmpl$24();
          }
        })];
      }
    });
  }
  function BinaryOpDisplay(props) {
    const op = () => props.node().op;
    const left = () => props.node().left;
    const right = () => props.node().right;
    return createComponent(Switch, {
      get children() {
        return [createComponent(Match, {
          get when() {
            return op() === BinOps.Add || op() === BinOps.Sub || op() === BinOps.Mul || op() === BinOps.GreaterThan || op() === BinOps.LessEqual;
          },
          get children() {
            const _el$8 = _tmpl$43(), _el$9 = _el$8.firstChild, _el$11 = _el$9.nextSibling, _el$10 = _el$11.nextSibling;
            insert(_el$8, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: left,
              get state() {
                return props.state;
              }
            }), _el$9);
            insert(_el$8, () => ({
              [BinOps.Add]: "+",
              [BinOps.Sub]: "-",
              [BinOps.Mul]: "\xD7",
              [BinOps.GreaterThan]: ">",
              [BinOps.LessEqual]: "\u2264"
            })[op()], _el$11);
            insert(_el$8, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: right,
              get state() {
                return props.state;
              }
            }), null);
            return _el$8;
          }
        }), createComponent(Match, {
          get when() {
            return op() === BinOps.DiceRoll;
          },
          get children() {
            return createComponent(DiceRollsDisplay, props);
          }
        }), createComponent(Match, {
          get when() {
            return op() === BinOps.Repeat;
          },
          get children() {
            return createComponent(RepeatViewer, props);
          }
        }), createComponent(Match, {
          get when() {
            return op() === BinOps.Div;
          },
          get children() {
            const _el$12 = _tmpl$52(), _el$13 = _el$12.firstChild;
            insert(_el$12, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: left,
              get state() {
                return props.state;
              }
            }), _el$13);
            insert(_el$12, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: right,
              get state() {
                return props.state;
              }
            }), null);
            return _el$12;
          }
        })];
      }
    });
  }
  function NumberDisplay(props) {
    return (() => {
      const _el$14 = _tmpl$62();
      insert(_el$14, () => props.node().number);
      return _el$14;
    })();
  }
  function DamageTypeDisplay(props) {
    return (() => {
      const _el$15 = _tmpl$72(), _el$16 = _el$15.firstChild;
      insert(_el$15, createComponent(CalculationDisplay, {
        get context() {
          return props.context;
        },
        node: () => props.node().operand,
        get state() {
          return props.state;
        }
      }), _el$16);
      insert(_el$15, () => props.node().damageType, null);
      return _el$15;
    })();
  }

  // src/functions/attack.tsx
  var _tmpl$8 = /* @__PURE__ */ template(`<div class="error">Attack roll calculation caused an error:`);
  var _tmpl$25 = /* @__PURE__ */ template(`<div class="error">AC calculation caused an error:`);
  var _tmpl$35 = /* @__PURE__ */ template(`<div class="vertical-divider">`);
  var _tmpl$44 = /* @__PURE__ */ template(`<div class="horizontal"><div class="horizontal">&nbsp;</div><div class="horizontal">&nbsp;vs&nbsp;<!>&nbsp;AC</div><div class="vertical-divider">`);
  var attack = (call, evaluationCtx2) => {
    const [attackRoll, ac, damage] = call.arguments;
    console.log("call", call.arguments);
    const d20roll = Math.floor(Math.random() * 20) + 1;
    const attackRollResult = evaluateAST(attackRoll, evaluationCtx2);
    if (attackRollResult.type === "Failure" || attackRollResult.data.type === "Boolean") {
      return {
        result: attackRollResult,
        component: (props) => (() => {
          const _el$ = _tmpl$8(), _el$2 = _el$.firstChild;
          insert(_el$, createComponent(CalculationDisplay, {
            get state() {
              return props.state;
            },
            node: () => attackRoll,
            get context() {
              return props.context;
            }
          }), null);
          return _el$;
        })()
      };
    }
    const acResult = evaluateAST(ac, evaluationCtx2);
    if (acResult.type === "Failure" || acResult.data.type === "Boolean") {
      return {
        result: acResult,
        component: (props) => (() => {
          const _el$3 = _tmpl$25(), _el$4 = _el$3.firstChild;
          insert(_el$3, createComponent(CalculationDisplay, {
            get state() {
              return props.state;
            },
            node: () => ac,
            get context() {
              return props.context;
            }
          }), null);
          return _el$3;
        })()
      };
    }
    const attackRollAmount = total(attackRollResult.data);
    const evaluatedDamage = evaluateAST(damage, evaluationCtx2);
    const didHit = attackRollAmount >= total(acResult.data);
    const damageDealt = didHit ? evaluatedDamage : success(drData.number(/* @__PURE__ */ new Map()));
    return {
      result: damageDealt,
      component: (props) => {
        console.log("props", props.node());
        return (() => {
          const _el$5 = _tmpl$44(), _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$6.nextSibling, _el$9 = _el$8.firstChild, _el$11 = _el$9.nextSibling, _el$10 = _el$11.nextSibling, _el$13 = _el$8.nextSibling;
          insert(_el$6, createComponent(CalculationDisplay, {
            get state() {
              return props.state;
            },
            get context() {
              return props.context;
            },
            node: () => attackRoll
          }), _el$7);
          insert(_el$6, createComponent(Show, {
            get when() {
              return props.state().evaluate;
            },
            get children() {
              return ["=\xA0", attackRollAmount];
            }
          }), null);
          insert(_el$8, createComponent(CalculationDisplay, {
            get state() {
              return props.state;
            },
            get context() {
              return props.context;
            },
            node: () => ac
          }), _el$11);
          insert(_el$5, createComponent(Show, {
            get when() {
              return props.state().evaluate;
            },
            get children() {
              return [_tmpl$35(), didHit ? "Hit!" : "Miss"];
            }
          }), _el$13);
          insert(_el$5, createComponent(Show, {
            get when() {
              return didHit || !props.state().evaluate;
            },
            get children() {
              return createComponent(CalculationDisplay, {
                get state() {
                  return props.state;
                },
                get context() {
                  return props.context;
                },
                node: () => damage
              });
            }
          }), null);
          insert(_el$5, createComponent(Show, {
            get when() {
              return !didHit && props.state().evaluate;
            },
            children: "0 damage"
          }), null);
          return _el$5;
        })();
      }
    };
  };

  // src/functions/advantage.tsx
  var _tmpl$9 = /* @__PURE__ */ template(`<div class="error">Error while trying to roll with advantage.`);
  var _tmpl$26 = /* @__PURE__ */ template(`<div><div class="horizontal"><div class="vertical-divider"></div>&nbsp;`);
  var _tmpl$36 = /* @__PURE__ */ template(`<div>Advantage`);
  var advantage = (call, evaluationCtx2) => {
    const [operand] = call.arguments;
    const try1Node = operand;
    const try1 = evaluateAST(operand, evaluationCtx2);
    const try2Node = cloneAST(operand);
    const try2 = evaluateAST(try2Node, evaluationCtx2);
    if (try1.type === "Failure" || try1.data.type !== "Number") {
      return {
        result: try1,
        component: (props) => (() => {
          const _el$ = _tmpl$9(), _el$2 = _el$.firstChild;
          insert(_el$, createComponent(CalculationDisplay, {
            get state() {
              return props.state;
            },
            node: () => try1Node,
            get context() {
              return props.context;
            }
          }), null);
          return _el$;
        })()
      };
    }
    if (try2.type === "Failure" || try2.data.type !== "Number") {
      return {
        result: try2,
        component: (props) => (() => {
          const _el$3 = _tmpl$9(), _el$4 = _el$3.firstChild;
          insert(_el$3, createComponent(CalculationDisplay, {
            get state() {
              return props.state;
            },
            node: () => try2Node,
            get context() {
              return props.context;
            }
          }), null);
          return _el$3;
        })()
      };
    }
    return {
      result: total(try1.data) > total(try2.data) ? try1 : try2,
      component: (props) => {
        return createComponent(Switch, {
          get children() {
            return [createComponent(Match, {
              get when() {
                return props.state().summarizationLevel === 0;
              },
              get children() {
                const _el$5 = _tmpl$26(), _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling;
                insert(_el$6, createComponent(CalculationDisplay, {
                  get state() {
                    return props.state;
                  },
                  node: () => try1Node,
                  get context() {
                    return props.context;
                  }
                }), _el$7);
                insert(_el$6, createComponent(CalculationDisplay, {
                  get state() {
                    return props.state;
                  },
                  node: () => try2Node,
                  get context() {
                    return props.context;
                  }
                }), _el$8);
                return _el$5;
              }
            }), createComponent(Match, {
              get when() {
                return props.state().summarizationLevel >= 1;
              },
              get children() {
                return _tmpl$36();
              }
            })];
          }
        });
      }
    };
  };

  // src/repl/repl.tsx
  var _tmpl$10 = /* @__PURE__ */ template(`<div class="repl"><div class="horizontal repl-evaluations-container"><div class="repl-evaluations"></div><div class="info"><h1>Dice Roller</h1><h2>Features:</h2><ul><li>Roll 2d6 and add 3: <br><code>2d6 + 3</code></li><li>Roll 2d6 and subtract 3: <br><code>2d6 - 3</code></li><li>Roll 1d4 + 5 8 times and add them together: <br><code>1d4 + 5 x8</code></li><li>Roll 1d4 and multiply it by 5: <br><code>1d4 * 5</code></li><li>Roll 1d8 and divide it by 2 (rounded down): <br><code>1d8 / 2</code></li><li>Roll 1d100: <br><code>1d100</code></li><li>Damage types: <br><code>1d12 slashing + 2d6 fire</code></li><li>Attack with a +5 modifier against an enemy with 13 AC, dealing 1d8+5 slashing damage: <br><code>attack(1d20+5, 13, 1d8+5 slashing)</code></li><li>Roll a d20 with advantage: <br><code>adv(1d20)</code></li></ul></div></div><textarea class="repl-input">`);
  function DiceRollerREPL() {
    const [evaluations, setEvaluations] = createSignal([]);
    const [code, setCode] = createSignal("3d6 + 5");
    const handleSubmit = () => {
      const ast2 = parseDiceRoller(code());
      const ctx = {
        functions: /* @__PURE__ */ new Map([["adv", advantage], ["attack", attack]]),
        functionComponents: /* @__PURE__ */ new Map(),
        warnings: /* @__PURE__ */ new Map(),
        cache: /* @__PURE__ */ new Map(),
        diceRollResults: /* @__PURE__ */ new Map(),
        repeatClones: /* @__PURE__ */ new Map()
      };
      evaluateAST(ast2, ctx);
      setEvaluations([...evaluations(), {
        ast: ast2,
        ctx
      }]);
    };
    return (() => {
      const _el$ = _tmpl$10(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling;
      use((el) => {
        createEffect(() => {
          evaluations();
          console.log("got here");
          el.scrollTo({
            top: 2147483647,
            behavior: "smooth"
          });
        });
      }, _el$3);
      insert(_el$3, createComponent(For, {
        get each() {
          return evaluations();
        },
        children: ({
          ctx,
          ast: ast2
        }) => createComponent(RootCalculationDisplay, {
          context: () => ctx,
          node: () => ast2,
          state: () => ({
            summarizationLevel: 0,
            evaluate: true
          })
        })
      }));
      _el$4.$$input = (evt) => {
        setCode(evt.currentTarget.value);
      };
      _el$4.$$keydown = (evt) => {
        if (evt.key === "Enter" && !evt.shiftKey) {
          handleSubmit();
          evt.preventDefault();
        }
      };
      createRenderEffect(() => _el$4.value = code());
      return _el$;
    })();
  }
  delegateEvents(["keydown", "input"]);

  // src/index.tsx
  console.log(parseDiceRoller("3d6 slashing"));
  console.log(parseDiceRoller("adv(1d20 + 7)"));
  var ast = parseDiceRoller(`(attack(adv(1d20+4), 15, 1d6+2 piercing) x16)
   + (attack(adv(1d20+4), 15, 1d4+2 slashing) x16)`);
  console.log(ast);
  var evaluationCtx = {
    functions: /* @__PURE__ */ new Map([["adv", advantage], ["attack", attack]]),
    functionComponents: /* @__PURE__ */ new Map(),
    warnings: /* @__PURE__ */ new Map(),
    cache: /* @__PURE__ */ new Map(),
    diceRollResults: /* @__PURE__ */ new Map(),
    repeatClones: /* @__PURE__ */ new Map()
  };
  evaluateAST(ast, evaluationCtx);
  console.log("ctx", evaluationCtx);
  render(() => (
    // <div>
    //   <div class="root-dice-roller-display">
    //     <RootCalculationDisplay
    //       node={() => ast}
    //       context={() => evaluationCtx}
    //       state={() => ({ evaluate: true, summarizationLevel: 0 })}
    //     ></RootCalculationDisplay>
    //   </div>
    // </div>
    createComponent(DiceRollerREPL, {})
  ), document.getElementById("main"));
})();
