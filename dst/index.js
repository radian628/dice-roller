"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/is-mobile/index.js
  var require_is_mobile = __commonJS({
    "node_modules/is-mobile/index.js"(exports, module) {
      "use strict";
      module.exports = isMobile2;
      module.exports.isMobile = isMobile2;
      module.exports.default = isMobile2;
      var mobileRE = /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
      var notMobileRE = /CrOS/;
      var tabletRE = /android|ipad|playbook|silk/i;
      function isMobile2(opts) {
        if (!opts)
          opts = {};
        let ua = opts.ua;
        if (!ua && typeof navigator !== "undefined")
          ua = navigator.userAgent;
        if (ua && ua.headers && typeof ua.headers["user-agent"] === "string") {
          ua = ua.headers["user-agent"];
        }
        if (typeof ua !== "string")
          return false;
        let result = mobileRE.test(ua) && !notMobileRE.test(ua) || !!opts.tablet && tabletRE.test(ua);
        if (!result && opts.tablet && opts.featureDetect && navigator && navigator.maxTouchPoints > 1 && ua.indexOf("Macintosh") !== -1 && ua.indexOf("Safari") !== -1) {
          result = true;
        }
        return result;
      }
    }
  });

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
      let t2;
      if (Scheduler || SuspenseContext) {
        t2 = Transition || (Transition = {
          sources: /* @__PURE__ */ new Set(),
          effects: [],
          promises: /* @__PURE__ */ new Set(),
          disposed: /* @__PURE__ */ new Set(),
          queue: /* @__PURE__ */ new Set(),
          running: true
        });
        t2.done || (t2.done = new Promise((res) => t2.resolve = res));
        t2.running = true;
      }
      runUpdates(fn, false);
      Listener = Owner = null;
      return t2 ? t2.done : void 0;
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
        let top2 = node, prev = ancestors[i + 1];
        while ((top2 = top2.owner) && top2 !== prev) {
          if (Transition.disposed.has(top2))
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
  function reset(node, top2) {
    if (!top2) {
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
  var narrowedError = (name2) => `Stale read from <${name2}>.`;
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
            let i = aStart, sequence = 1, t2;
            while (++i < aEnd && i < bEnd) {
              if ((t2 = map.get(a[i])) == null || t2 !== index + sequence)
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
      const t2 = document.createElement("template");
      t2.innerHTML = html;
      return isSVG ? t2.content.firstChild.firstChild : t2.content.firstChild;
    };
    const fn = isCE ? () => untrack(() => document.importNode(node || (node = create()), true)) : () => (node || (node = create())).cloneNode(true);
    fn.cloneNode = fn;
    return fn;
  }
  function delegateEvents(eventNames, document2 = window.document) {
    const e = document2[$$EVENTS] || (document2[$$EVENTS] = /* @__PURE__ */ new Set());
    for (let i = 0, l = eventNames.length; i < l; i++) {
      const name2 = eventNames[i];
      if (!e.has(name2)) {
        e.add(name2);
        document2.addEventListener(name2, eventHandler);
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
    const t2 = typeof value, multi = marker !== void 0;
    parent = multi && current[0] && current[0].parentNode || parent;
    if (t2 === "string" || t2 === "number") {
      if (sharedConfig.context)
        return current;
      if (t2 === "number")
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
    } else if (value == null || t2 === "boolean") {
      if (sharedConfig.context)
        return current;
      current = cleanChildren(parent, current, marker);
    } else if (t2 === "function") {
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
      let item = array[i], prev = current && current[i], t2;
      if (item == null || item === true || item === false)
        ;
      else if ((t2 = typeof item) === "object" && item.nodeType) {
        normalized.push(item);
      } else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
      } else if (t2 === "function") {
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
          const isParent2 = el.parentNode === parent;
          if (!inserted && !i)
            isParent2 ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
          else
            isParent2 && el.remove();
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
  function str(string2) {
    if (string2.length === 1)
      return [string2.codePointAt(0)];
    return [
      (2 << 24) * 4,
      ...string2.split("").map((s) => {
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
        const rangeEnd2 = unescapePatternString(p.lex(tokens.char));
        return {
          type: "Range",
          startChar: rangeStart.codePointAt(0),
          endChar: rangeEnd2.codePointAt(0)
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
              for (const t2 of tokens2) {
                const [output2, parser2] = newParser.lex(t2);
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
    [BinOps.Repeat]: -20
  };
  var BaseBindingPower = -30;
  var DamageTypeBindingPower = 0;
  var TernaryBindingPower = -10;
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
    }], [questionMark, (first) => {
      if (TernaryBindingPower <= p.state.bindingPower)
        p.err("");
      const ifTrue = p.parse(expressionParselet2, {
        bindingPower: TernaryBindingPower
      });
      let ifFalse;
      if (p.isNext(colon)) {
        p.lex(colon);
        ifFalse = p.parse(expressionParselet2, {
          bindingPower: TernaryBindingPower
        });
      }
      return {
        type: "TernaryNode",
        condition: p.state.left,
        ifTrue,
        ifFalse
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
        bindingPower: BaseBindingPower
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
  function mapOverASTChildren(node, callback) {
    switch (node.type) {
      case "BinaryOp":
        callback(node.left);
        callback(node.right);
        break;
      case "DamageType":
        callback(node.operand);
        break;
      case "Error":
        break;
      case "FunctionCall":
        for (const arg of node.arguments) {
          callback(arg);
        }
      case "Number":
        break;
      case "TernaryNode":
        callback(node.condition);
        callback(node.ifTrue);
        if (node.ifFalse)
          callback(node.ifFalse);
        break;
    }
  }
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
        if (condition.data.data) {
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
  var _tmpl$6 = /* @__PURE__ */ template(`<div class="horizontal repeat-description"><div class="vertical-divider"></div><span class="bigtext">x`);
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

  // src/viewer/TernaryViewer.tsx
  var _tmpl$7 = /* @__PURE__ */ template(`<div class="vertical-divider">`);
  var _tmpl$24 = /* @__PURE__ */ template(`<div class="vertical">No`);
  var _tmpl$34 = /* @__PURE__ */ template(`<div class="horizontal">Is&nbsp;<div class="vertical-divider"></div><div class="vertical">Yes`);
  function TernaryViewer(props) {
    const condition = () => evaluateAST(props.node().condition, props.context()).data.data;
    console.log(props.node().condition);
    return (() => {
      const _el$ = _tmpl$34(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild;
      insert(_el$, createComponent(CalculationDisplay, {
        node: () => props.node().condition,
        get context() {
          return props.context;
        },
        get state() {
          return props.state;
        }
      }), _el$3);
      insert(_el$4, createComponent(CalculationDisplay, {
        node: () => props.node().ifTrue,
        get context() {
          return props.context;
        },
        get state() {
          return props.state;
        }
      }), null);
      insert(_el$, createComponent(Show, {
        get when() {
          return props.node().ifFalse;
        },
        get children() {
          return [_tmpl$7(), (() => {
            const _el$7 = _tmpl$24(), _el$8 = _el$7.firstChild;
            insert(_el$7, createComponent(CalculationDisplay, {
              node: () => props.node().ifFalse,
              get context() {
                return props.context;
              },
              get state() {
                return props.state;
              }
            }), null);
            createRenderEffect(() => (condition() ? 0.5 : 1) != null ? _el$7.style.setProperty("opacity", condition() ? 0.5 : 1) : _el$7.style.removeProperty("opacity"));
            return _el$7;
          })()];
        }
      }), null);
      createRenderEffect(() => (condition() ? 1 : 0.5) != null ? _el$4.style.setProperty("opacity", condition() ? 1 : 0.5) : _el$4.style.removeProperty("opacity"));
      return _el$;
    })();
  }

  // src/viewer/viewer.tsx
  var _tmpl$8 = /* @__PURE__ */ template(`<div class="root-dice-roller-display horizontal">&nbsp;=&nbsp;`);
  var _tmpl$25 = /* @__PURE__ */ template(`<div class="error">Unrecognized function/variable '<!>'`);
  var _tmpl$35 = /* @__PURE__ */ template(`<div class="horizontal binary-op-display">&nbsp;<!>&nbsp;`);
  var _tmpl$43 = /* @__PURE__ */ template(`<div class="vertical binary-op-display"><div class="vinculum">`);
  var _tmpl$52 = /* @__PURE__ */ template(`<div>`);
  var _tmpl$62 = /* @__PURE__ */ template(`<div class="horizontal damage-type">&nbsp;`);
  function RootCalculationDisplay(props) {
    const value = () => evaluateAST(props.node(), props.context());
    return (() => {
      const _el$ = _tmpl$8(), _el$2 = _el$.firstChild;
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
              const _el$3 = _tmpl$25(), _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling, _el$5 = _el$6.nextSibling;
              insert(_el$3, () => props.node().functionName, _el$6);
              return _el$3;
            })();
          }
        }), createComponent(Match, {
          get when() {
            return type() === "TernaryNode";
          },
          get children() {
            return createComponent(TernaryViewer, props);
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
            return op() === BinOps.Add || op() === BinOps.Sub || op() === BinOps.Mul || op() === BinOps.GreaterThan || op() === BinOps.LessThan || op() === BinOps.GreaterEqual || op() === BinOps.LessEqual || op() === BinOps.And || op() === BinOps.Or;
          },
          get children() {
            const _el$7 = _tmpl$35(), _el$8 = _el$7.firstChild, _el$10 = _el$8.nextSibling, _el$9 = _el$10.nextSibling;
            insert(_el$7, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: left,
              get state() {
                return props.state;
              }
            }), _el$8);
            insert(_el$7, () => ({
              [BinOps.Add]: "+",
              [BinOps.Sub]: "-",
              [BinOps.Mul]: "\xD7",
              [BinOps.GreaterThan]: ">",
              [BinOps.LessThan]: "<",
              [BinOps.GreaterEqual]: "\u2265",
              [BinOps.LessEqual]: "\u2264",
              [BinOps.And]: "and",
              [BinOps.Or]: "or"
            })[op()], _el$10);
            insert(_el$7, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: right,
              get state() {
                return props.state;
              }
            }), null);
            return _el$7;
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
            const _el$11 = _tmpl$43(), _el$12 = _el$11.firstChild;
            insert(_el$11, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: left,
              get state() {
                return props.state;
              }
            }), _el$12);
            insert(_el$11, createComponent(CalculationDisplay, {
              get context() {
                return props.context;
              },
              node: right,
              get state() {
                return props.state;
              }
            }), null);
            return _el$11;
          }
        })];
      }
    });
  }
  function NumberDisplay(props) {
    return (() => {
      const _el$13 = _tmpl$52();
      insert(_el$13, () => props.node().number);
      return _el$13;
    })();
  }
  function DamageTypeDisplay(props) {
    return (() => {
      const _el$14 = _tmpl$62(), _el$15 = _el$14.firstChild;
      insert(_el$14, createComponent(CalculationDisplay, {
        get context() {
          return props.context;
        },
        node: () => props.node().operand,
        get state() {
          return props.state;
        }
      }), _el$15);
      insert(_el$14, () => props.node().damageType, null);
      return _el$14;
    })();
  }

  // src/functions/attack.tsx
  var _tmpl$9 = /* @__PURE__ */ template(`<div class="error">Attack roll calculation caused an error:`);
  var _tmpl$26 = /* @__PURE__ */ template(`<div class="error">AC calculation caused an error:`);
  var _tmpl$36 = /* @__PURE__ */ template(`<div class="vertical-divider">`);
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
          const _el$ = _tmpl$9(), _el$2 = _el$.firstChild;
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
          const _el$3 = _tmpl$26(), _el$4 = _el$3.firstChild;
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
              return [_tmpl$36(), didHit ? "Hit!" : "Miss"];
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
  var _tmpl$10 = /* @__PURE__ */ template(`<div class="error">Error while trying to roll with advantage.`);
  var _tmpl$27 = /* @__PURE__ */ template(`<div><div class="horizontal"><div class="vertical-divider"></div>&nbsp;`);
  var _tmpl$37 = /* @__PURE__ */ template(`<div>Advantage`);
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
          const _el$ = _tmpl$10(), _el$2 = _el$.firstChild;
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
          const _el$3 = _tmpl$10(), _el$4 = _el$3.firstChild;
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
                const _el$5 = _tmpl$27(), _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling;
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
                return _tmpl$37();
              }
            })];
          }
        });
      }
    };
  };

  // node_modules/@codemirror/state/dist/index.js
  var Text = class _Text {
    /**
    Get the line description around the given position.
    */
    lineAt(pos) {
      if (pos < 0 || pos > this.length)
        throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
      return this.lineInner(pos, false, 1, 0);
    }
    /**
    Get the description for the given (1-based) line number.
    */
    line(n) {
      if (n < 1 || n > this.lines)
        throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
      return this.lineInner(n, true, 1, 0);
    }
    /**
    Replace a range of the text with the given content.
    */
    replace(from, to, text) {
      let parts = [];
      this.decompose(
        0,
        from,
        parts,
        2
        /* Open.To */
      );
      if (text.length)
        text.decompose(
          0,
          text.length,
          parts,
          1 | 2
          /* Open.To */
        );
      this.decompose(
        to,
        this.length,
        parts,
        1
        /* Open.From */
      );
      return TextNode.from(parts, this.length - (to - from) + text.length);
    }
    /**
    Append another document to this one.
    */
    append(other) {
      return this.replace(this.length, this.length, other);
    }
    /**
    Retrieve the text between the given points.
    */
    slice(from, to = this.length) {
      let parts = [];
      this.decompose(from, to, parts, 0);
      return TextNode.from(parts, to - from);
    }
    /**
    Test whether this text is equal to another instance.
    */
    eq(other) {
      if (other == this)
        return true;
      if (other.length != this.length || other.lines != this.lines)
        return false;
      let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
      let a = new RawTextCursor(this), b = new RawTextCursor(other);
      for (let skip = start, pos = start; ; ) {
        a.next(skip);
        b.next(skip);
        skip = 0;
        if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
          return false;
        pos += a.value.length;
        if (a.done || pos >= end)
          return true;
      }
    }
    /**
    Iterate over the text. When `dir` is `-1`, iteration happens
    from end to start. This will return lines and the breaks between
    them as separate strings.
    */
    iter(dir = 1) {
      return new RawTextCursor(this, dir);
    }
    /**
    Iterate over a range of the text. When `from` > `to`, the
    iterator will run in reverse.
    */
    iterRange(from, to = this.length) {
      return new PartialTextCursor(this, from, to);
    }
    /**
    Return a cursor that iterates over the given range of lines,
    _without_ returning the line breaks between, and yielding empty
    strings for empty lines.
    
    When `from` and `to` are given, they should be 1-based line numbers.
    */
    iterLines(from, to) {
      let inner;
      if (from == null) {
        inner = this.iter();
      } else {
        if (to == null)
          to = this.lines + 1;
        let start = this.line(from).from;
        inner = this.iterRange(start, Math.max(start, to == this.lines + 1 ? this.length : to <= 1 ? 0 : this.line(to - 1).to));
      }
      return new LineCursor(inner);
    }
    /**
    Return the document as a string, using newline characters to
    separate lines.
    */
    toString() {
      return this.sliceString(0);
    }
    /**
    Convert the document to an array of lines (which can be
    deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
    */
    toJSON() {
      let lines = [];
      this.flatten(lines);
      return lines;
    }
    /**
    @internal
    */
    constructor() {
    }
    /**
    Create a `Text` instance for the given array of lines.
    */
    static of(text) {
      if (text.length == 0)
        throw new RangeError("A document must have at least one line");
      if (text.length == 1 && !text[0])
        return _Text.empty;
      return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
    }
  };
  var TextLeaf = class _TextLeaf extends Text {
    constructor(text, length = textLength(text)) {
      super();
      this.text = text;
      this.length = length;
    }
    get lines() {
      return this.text.length;
    }
    get children() {
      return null;
    }
    lineInner(target, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let string2 = this.text[i], end = offset + string2.length;
        if ((isLine ? line : end) >= target)
          return new Line(offset, end, line, string2);
        offset = end + 1;
        line++;
      }
    }
    decompose(from, to, target, open) {
      let text = from <= 0 && to >= this.length ? this : new _TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
      if (open & 1) {
        let prev = target.pop();
        let joined = appendText(text.text, prev.text.slice(), 0, text.length);
        if (joined.length <= 32) {
          target.push(new _TextLeaf(joined, prev.length + text.length));
        } else {
          let mid = joined.length >> 1;
          target.push(new _TextLeaf(joined.slice(0, mid)), new _TextLeaf(joined.slice(mid)));
        }
      } else {
        target.push(text);
      }
    }
    replace(from, to, text) {
      if (!(text instanceof _TextLeaf))
        return super.replace(from, to, text);
      let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
      let newLen = this.length + text.length - (to - from);
      if (lines.length <= 32)
        return new _TextLeaf(lines, newLen);
      return TextNode.from(_TextLeaf.split(lines, []), newLen);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      let result = "";
      for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
        let line = this.text[i], end = pos + line.length;
        if (pos > from && i)
          result += lineSep;
        if (from < end && to > pos)
          result += line.slice(Math.max(0, from - pos), to - pos);
        pos = end + 1;
      }
      return result;
    }
    flatten(target) {
      for (let line of this.text)
        target.push(line);
    }
    scanIdentical() {
      return 0;
    }
    static split(text, target) {
      let part = [], len = -1;
      for (let line of text) {
        part.push(line);
        len += line.length + 1;
        if (part.length == 32) {
          target.push(new _TextLeaf(part, len));
          part = [];
          len = -1;
        }
      }
      if (len > -1)
        target.push(new _TextLeaf(part, len));
      return target;
    }
  };
  var TextNode = class _TextNode extends Text {
    constructor(children2, length) {
      super();
      this.children = children2;
      this.length = length;
      this.lines = 0;
      for (let child of children2)
        this.lines += child.lines;
    }
    lineInner(target, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
        if ((isLine ? endLine : end) >= target)
          return child.lineInner(target, isLine, line, offset);
        offset = end + 1;
        line = endLine + 1;
      }
    }
    decompose(from, to, target, open) {
      for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from <= end && to >= pos) {
          let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
          if (pos >= from && end <= to && !childOpen)
            target.push(child);
          else
            child.decompose(from - pos, to - pos, target, childOpen);
        }
        pos = end + 1;
      }
    }
    replace(from, to, text) {
      if (text.lines < this.lines)
        for (let i = 0, pos = 0; i < this.children.length; i++) {
          let child = this.children[i], end = pos + child.length;
          if (from >= pos && to <= end) {
            let updated = child.replace(from - pos, to - pos, text);
            let totalLines = this.lines - child.lines + updated.lines;
            if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
              let copy = this.children.slice();
              copy[i] = updated;
              return new _TextNode(copy, this.length - (to - from) + text.length);
            }
            return super.replace(pos, end, updated);
          }
          pos = end + 1;
        }
      return super.replace(from, to, text);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      let result = "";
      for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
        let child = this.children[i], end = pos + child.length;
        if (pos > from && i)
          result += lineSep;
        if (from < end && to > pos)
          result += child.sliceString(from - pos, to - pos, lineSep);
        pos = end + 1;
      }
      return result;
    }
    flatten(target) {
      for (let child of this.children)
        child.flatten(target);
    }
    scanIdentical(other, dir) {
      if (!(other instanceof _TextNode))
        return 0;
      let length = 0;
      let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length] : [this.children.length - 1, other.children.length - 1, -1, -1];
      for (; ; iA += dir, iB += dir) {
        if (iA == eA || iB == eB)
          return length;
        let chA = this.children[iA], chB = other.children[iB];
        if (chA != chB)
          return length + chA.scanIdentical(chB, dir);
        length += chA.length + 1;
      }
    }
    static from(children2, length = children2.reduce((l, ch) => l + ch.length + 1, -1)) {
      let lines = 0;
      for (let ch of children2)
        lines += ch.lines;
      if (lines < 32) {
        let flat = [];
        for (let ch of children2)
          ch.flatten(flat);
        return new TextLeaf(flat, length);
      }
      let chunk = Math.max(
        32,
        lines >> 5
        /* Tree.BranchShift */
      ), maxChunk = chunk << 1, minChunk = chunk >> 1;
      let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
      function add2(child) {
        let last;
        if (child.lines > maxChunk && child instanceof _TextNode) {
          for (let node of child.children)
            add2(node);
        } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
          flush();
          chunked.push(child);
        } else if (child instanceof TextLeaf && currentLines && (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last.lines <= 32) {
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
        } else {
          if (currentLines + child.lines > chunk)
            flush();
          currentLines += child.lines;
          currentLen += child.length + 1;
          currentChunk.push(child);
        }
      }
      function flush() {
        if (currentLines == 0)
          return;
        chunked.push(currentChunk.length == 1 ? currentChunk[0] : _TextNode.from(currentChunk, currentLen));
        currentLen = -1;
        currentLines = currentChunk.length = 0;
      }
      for (let child of children2)
        add2(child);
      flush();
      return chunked.length == 1 ? chunked[0] : new _TextNode(chunked, length);
    }
  };
  Text.empty = /* @__PURE__ */ new TextLeaf([""], 0);
  function textLength(text) {
    let length = -1;
    for (let line of text)
      length += line.length + 1;
    return length;
  }
  function appendText(text, target, from = 0, to = 1e9) {
    for (let pos = 0, i = 0, first = true; i < text.length && pos <= to; i++) {
      let line = text[i], end = pos + line.length;
      if (end >= from) {
        if (end > to)
          line = line.slice(0, to - pos);
        if (pos < from)
          line = line.slice(from - pos);
        if (first) {
          target[target.length - 1] += line;
          first = false;
        } else
          target.push(line);
      }
      pos = end + 1;
    }
    return target;
  }
  function sliceText(text, from, to) {
    return appendText(text, [""], from, to);
  }
  var RawTextCursor = class {
    constructor(text, dir = 1) {
      this.dir = dir;
      this.done = false;
      this.lineBreak = false;
      this.value = "";
      this.nodes = [text];
      this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
    }
    nextInner(skip, dir) {
      this.done = this.lineBreak = false;
      for (; ; ) {
        let last = this.nodes.length - 1;
        let top2 = this.nodes[last], offsetValue = this.offsets[last], offset = offsetValue >> 1;
        let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
        if (offset == (dir > 0 ? size : 0)) {
          if (last == 0) {
            this.done = true;
            this.value = "";
            return this;
          }
          if (dir > 0)
            this.offsets[last - 1]++;
          this.nodes.pop();
          this.offsets.pop();
        } else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
          this.offsets[last] += dir;
          if (skip == 0) {
            this.lineBreak = true;
            this.value = "\n";
            return this;
          }
          skip--;
        } else if (top2 instanceof TextLeaf) {
          let next = top2.text[offset + (dir < 0 ? -1 : 0)];
          this.offsets[last] += dir;
          if (next.length > Math.max(0, skip)) {
            this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
            return this;
          }
          skip -= next.length;
        } else {
          let next = top2.children[offset + (dir < 0 ? -1 : 0)];
          if (skip > next.length) {
            skip -= next.length;
            this.offsets[last] += dir;
          } else {
            if (dir < 0)
              this.offsets[last]--;
            this.nodes.push(next);
            this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
          }
        }
      }
    }
    next(skip = 0) {
      if (skip < 0) {
        this.nextInner(-skip, -this.dir);
        skip = this.value.length;
      }
      return this.nextInner(skip, this.dir);
    }
  };
  var PartialTextCursor = class {
    constructor(text, start, end) {
      this.value = "";
      this.done = false;
      this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
      this.pos = start > end ? text.length : 0;
      this.from = Math.min(start, end);
      this.to = Math.max(start, end);
    }
    nextInner(skip, dir) {
      if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
        this.value = "";
        this.done = true;
        return this;
      }
      skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
      let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
      if (skip > limit)
        skip = limit;
      limit -= skip;
      let { value } = this.cursor.next(skip);
      this.pos += (value.length + skip) * dir;
      this.value = value.length <= limit ? value : dir < 0 ? value.slice(value.length - limit) : value.slice(0, limit);
      this.done = !this.value;
      return this;
    }
    next(skip = 0) {
      if (skip < 0)
        skip = Math.max(skip, this.from - this.pos);
      else if (skip > 0)
        skip = Math.min(skip, this.to - this.pos);
      return this.nextInner(skip, this.cursor.dir);
    }
    get lineBreak() {
      return this.cursor.lineBreak && this.value != "";
    }
  };
  var LineCursor = class {
    constructor(inner) {
      this.inner = inner;
      this.afterBreak = true;
      this.value = "";
      this.done = false;
    }
    next(skip = 0) {
      let { done, lineBreak, value } = this.inner.next(skip);
      if (done) {
        this.done = true;
        this.value = "";
      } else if (lineBreak) {
        if (this.afterBreak) {
          this.value = "";
        } else {
          this.afterBreak = true;
          this.next();
        }
      } else {
        this.value = value;
        this.afterBreak = false;
      }
      return this;
    }
    get lineBreak() {
      return false;
    }
  };
  if (typeof Symbol != "undefined") {
    Text.prototype[Symbol.iterator] = function() {
      return this.iter();
    };
    RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] = LineCursor.prototype[Symbol.iterator] = function() {
      return this;
    };
  }
  var Line = class {
    /**
    @internal
    */
    constructor(from, to, number2, text) {
      this.from = from;
      this.to = to;
      this.number = number2;
      this.text = text;
    }
    /**
    The length of the line (not including any line break after it).
    */
    get length() {
      return this.to - this.from;
    }
  };
  var extend = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
  for (let i = 1; i < extend.length; i++)
    extend[i] += extend[i - 1];
  function isExtendingChar(code) {
    for (let i = 1; i < extend.length; i += 2)
      if (extend[i] > code)
        return extend[i - 1] <= code;
    return false;
  }
  function isRegionalIndicator(code) {
    return code >= 127462 && code <= 127487;
  }
  var ZWJ = 8205;
  function findClusterBreak(str2, pos, forward = true, includeExtending = true) {
    return (forward ? nextClusterBreak : prevClusterBreak)(str2, pos, includeExtending);
  }
  function nextClusterBreak(str2, pos, includeExtending) {
    if (pos == str2.length)
      return pos;
    if (pos && surrogateLow(str2.charCodeAt(pos)) && surrogateHigh(str2.charCodeAt(pos - 1)))
      pos--;
    let prev = codePointAt(str2, pos);
    pos += codePointSize(prev);
    while (pos < str2.length) {
      let next = codePointAt(str2, pos);
      if (prev == ZWJ || next == ZWJ || includeExtending && isExtendingChar(next)) {
        pos += codePointSize(next);
        prev = next;
      } else if (isRegionalIndicator(next)) {
        let countBefore = 0, i = pos - 2;
        while (i >= 0 && isRegionalIndicator(codePointAt(str2, i))) {
          countBefore++;
          i -= 2;
        }
        if (countBefore % 2 == 0)
          break;
        else
          pos += 2;
      } else {
        break;
      }
    }
    return pos;
  }
  function prevClusterBreak(str2, pos, includeExtending) {
    while (pos > 0) {
      let found = nextClusterBreak(str2, pos - 2, includeExtending);
      if (found < pos)
        return found;
      pos--;
    }
    return 0;
  }
  function surrogateLow(ch) {
    return ch >= 56320 && ch < 57344;
  }
  function surrogateHigh(ch) {
    return ch >= 55296 && ch < 56320;
  }
  function codePointAt(str2, pos) {
    let code0 = str2.charCodeAt(pos);
    if (!surrogateHigh(code0) || pos + 1 == str2.length)
      return code0;
    let code1 = str2.charCodeAt(pos + 1);
    if (!surrogateLow(code1))
      return code0;
    return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
  }
  function codePointSize(code) {
    return code < 65536 ? 1 : 2;
  }
  var DefaultSplit = /\r\n?|\n/;
  var MapMode = /* @__PURE__ */ function(MapMode2) {
    MapMode2[MapMode2["Simple"] = 0] = "Simple";
    MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
    MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
    MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
    return MapMode2;
  }(MapMode || (MapMode = {}));
  var ChangeDesc = class _ChangeDesc {
    // Sections are encoded as pairs of integers. The first is the
    // length in the current document, and the second is -1 for
    // unaffected sections, and the length of the replacement content
    // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
    // 0), and a replacement two positive numbers.
    /**
    @internal
    */
    constructor(sections) {
      this.sections = sections;
    }
    /**
    The length of the document before the change.
    */
    get length() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2)
        result += this.sections[i];
      return result;
    }
    /**
    The length of the document after the change.
    */
    get newLength() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2) {
        let ins = this.sections[i + 1];
        result += ins < 0 ? this.sections[i] : ins;
      }
      return result;
    }
    /**
    False when there are actual changes in this set.
    */
    get empty() {
      return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
    }
    /**
    Iterate over the unchanged parts left by these changes. `posA`
    provides the position of the range in the old document, `posB`
    the new position in the changed document.
    */
    iterGaps(f) {
      for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0) {
          f(posA, posB, len);
          posB += len;
        } else {
          posB += ins;
        }
        posA += len;
      }
    }
    /**
    Iterate over the ranges changed by these changes. (See
    [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
    variant that also provides you with the inserted text.)
    `fromA`/`toA` provides the extent of the change in the starting
    document, `fromB`/`toB` the extent of the replacement in the
    changed document.
    
    When `individual` is true, adjacent changes (which are kept
    separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
    reported separately.
    */
    iterChangedRanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    /**
    Get a description of the inverted form of these changes.
    */
    get invertedDesc() {
      let sections = [];
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0)
          sections.push(len, ins);
        else
          sections.push(ins, len);
      }
      return new _ChangeDesc(sections);
    }
    /**
    Compute the combined effect of applying another set of changes
    after this one. The length of the document after this set should
    match the length before `other`.
    */
    composeDesc(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other);
    }
    /**
    Map this description, which should start with the same document
    as `other`, over another set of changes, so that it can be
    applied after it. When `before` is true, map as if the changes
    in `other` happened before the ones in `this`.
    */
    mapDesc(other, before = false) {
      return other.empty ? this : mapSet(this, other, before);
    }
    mapPos(pos, assoc = -1, mode = MapMode.Simple) {
      let posA = 0, posB = 0;
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
        if (ins < 0) {
          if (endA > pos)
            return posB + (pos - posA);
          posB += len;
        } else {
          if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
            return null;
          if (endA > pos || endA == pos && assoc < 0 && !len)
            return pos == posA || assoc < 0 ? posB : posB + ins;
          posB += ins;
        }
        posA = endA;
      }
      if (pos > posA)
        throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
      return posB;
    }
    /**
    Check whether these changes touch a given range. When one of the
    changes entirely covers the range, the string `"cover"` is
    returned.
    */
    touchesRange(from, to = from) {
      for (let i = 0, pos = 0; i < this.sections.length && pos <= to; ) {
        let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
        if (ins >= 0 && pos <= to && end >= from)
          return pos < from && end > to ? "cover" : true;
        pos = end;
      }
      return false;
    }
    /**
    @internal
    */
    toString() {
      let result = "";
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
      }
      return result;
    }
    /**
    Serialize this change desc to a JSON-representable value.
    */
    toJSON() {
      return this.sections;
    }
    /**
    Create a change desc from its JSON representation (as produced
    by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
    */
    static fromJSON(json) {
      if (!Array.isArray(json) || json.length % 2 || json.some((a) => typeof a != "number"))
        throw new RangeError("Invalid JSON representation of ChangeDesc");
      return new _ChangeDesc(json);
    }
    /**
    @internal
    */
    static create(sections) {
      return new _ChangeDesc(sections);
    }
  };
  var ChangeSet = class _ChangeSet extends ChangeDesc {
    constructor(sections, inserted) {
      super(sections);
      this.inserted = inserted;
    }
    /**
    Apply the changes to a document, returning the modified
    document.
    */
    apply(doc2) {
      if (this.length != doc2.length)
        throw new RangeError("Applying change set to a document with the wrong length");
      iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
      return doc2;
    }
    mapDesc(other, before = false) {
      return mapSet(this, other, before, true);
    }
    /**
    Given the document as it existed _before_ the changes, return a
    change set that represents the inverse of this set, which could
    be used to go from the document created by the changes back to
    the document as it existed before the changes.
    */
    invert(doc2) {
      let sections = this.sections.slice(), inserted = [];
      for (let i = 0, pos = 0; i < sections.length; i += 2) {
        let len = sections[i], ins = sections[i + 1];
        if (ins >= 0) {
          sections[i] = ins;
          sections[i + 1] = len;
          let index = i >> 1;
          while (inserted.length < index)
            inserted.push(Text.empty);
          inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
        }
        pos += len;
      }
      return new _ChangeSet(sections, inserted);
    }
    /**
    Combine two subsequent change sets into a single set. `other`
    must start in the document produced by `this`. If `this` goes
    `docA` → `docB` and `other` represents `docB` → `docC`, the
    returned value will represent the change `docA` → `docC`.
    */
    compose(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other, true);
    }
    /**
    Given another change set starting in the same document, maps this
    change set over the other, producing a new change set that can be
    applied to the document produced by applying `other`. When
    `before` is `true`, order changes as if `this` comes before
    `other`, otherwise (the default) treat `other` as coming first.
    
    Given two changes `A` and `B`, `A.compose(B.map(A))` and
    `B.compose(A.map(B, true))` will produce the same document. This
    provides a basic form of [operational
    transformation](https://en.wikipedia.org/wiki/Operational_transformation),
    and can be used for collaborative editing.
    */
    map(other, before = false) {
      return other.empty ? this : mapSet(this, other, before, true);
    }
    /**
    Iterate over the changed ranges in the document, calling `f` for
    each, with the range in the original document (`fromA`-`toA`)
    and the range that replaces it in the new document
    (`fromB`-`toB`).
    
    When `individual` is true, adjacent changes are reported
    separately.
    */
    iterChanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    /**
    Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
    set.
    */
    get desc() {
      return ChangeDesc.create(this.sections);
    }
    /**
    @internal
    */
    filter(ranges) {
      let resultSections = [], resultInserted = [], filteredSections = [];
      let iter = new SectionIter(this);
      done:
        for (let i = 0, pos = 0; ; ) {
          let next = i == ranges.length ? 1e9 : ranges[i++];
          while (pos < next || pos == next && iter.len == 0) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, next - pos);
            addSection(filteredSections, len, -1);
            let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
            addSection(resultSections, len, ins);
            if (ins > 0)
              addInsert(resultInserted, resultSections, iter.text);
            iter.forward(len);
            pos += len;
          }
          let end = ranges[i++];
          while (pos < end) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, end - pos);
            addSection(resultSections, len, -1);
            addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
            iter.forward(len);
            pos += len;
          }
        }
      return {
        changes: new _ChangeSet(resultSections, resultInserted),
        filtered: ChangeDesc.create(filteredSections)
      };
    }
    /**
    Serialize this change set to a JSON-representable value.
    */
    toJSON() {
      let parts = [];
      for (let i = 0; i < this.sections.length; i += 2) {
        let len = this.sections[i], ins = this.sections[i + 1];
        if (ins < 0)
          parts.push(len);
        else if (ins == 0)
          parts.push([len]);
        else
          parts.push([len].concat(this.inserted[i >> 1].toJSON()));
      }
      return parts;
    }
    /**
    Create a change set for the given changes, for a document of the
    given length, using `lineSep` as line separator.
    */
    static of(changes, length, lineSep) {
      let sections = [], inserted = [], pos = 0;
      let total2 = null;
      function flush(force = false) {
        if (!force && !sections.length)
          return;
        if (pos < length)
          addSection(sections, length - pos, -1);
        let set = new _ChangeSet(sections, inserted);
        total2 = total2 ? total2.compose(set.map(total2)) : set;
        sections = [];
        inserted = [];
        pos = 0;
      }
      function process(spec) {
        if (Array.isArray(spec)) {
          for (let sub of spec)
            process(sub);
        } else if (spec instanceof _ChangeSet) {
          if (spec.length != length)
            throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
          flush();
          total2 = total2 ? total2.compose(spec.map(total2)) : spec;
        } else {
          let { from, to = from, insert: insert3 } = spec;
          if (from > to || from < 0 || to > length)
            throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
          let insText = !insert3 ? Text.empty : typeof insert3 == "string" ? Text.of(insert3.split(lineSep || DefaultSplit)) : insert3;
          let insLen = insText.length;
          if (from == to && insLen == 0)
            return;
          if (from < pos)
            flush();
          if (from > pos)
            addSection(sections, from - pos, -1);
          addSection(sections, to - from, insLen);
          addInsert(inserted, sections, insText);
          pos = to;
        }
      }
      process(changes);
      flush(!total2);
      return total2;
    }
    /**
    Create an empty changeset of the given length.
    */
    static empty(length) {
      return new _ChangeSet(length ? [length, -1] : [], []);
    }
    /**
    Create a changeset from its JSON representation (as produced by
    [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
    */
    static fromJSON(json) {
      if (!Array.isArray(json))
        throw new RangeError("Invalid JSON representation of ChangeSet");
      let sections = [], inserted = [];
      for (let i = 0; i < json.length; i++) {
        let part = json[i];
        if (typeof part == "number") {
          sections.push(part, -1);
        } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i2) => i2 && typeof e != "string")) {
          throw new RangeError("Invalid JSON representation of ChangeSet");
        } else if (part.length == 1) {
          sections.push(part[0], 0);
        } else {
          while (inserted.length < i)
            inserted.push(Text.empty);
          inserted[i] = Text.of(part.slice(1));
          sections.push(part[0], inserted[i].length);
        }
      }
      return new _ChangeSet(sections, inserted);
    }
    /**
    @internal
    */
    static createSet(sections, inserted) {
      return new _ChangeSet(sections, inserted);
    }
  };
  function addSection(sections, len, ins, forceJoin = false) {
    if (len == 0 && ins <= 0)
      return;
    let last = sections.length - 2;
    if (last >= 0 && ins <= 0 && ins == sections[last + 1])
      sections[last] += len;
    else if (len == 0 && sections[last] == 0)
      sections[last + 1] += ins;
    else if (forceJoin) {
      sections[last] += len;
      sections[last + 1] += ins;
    } else
      sections.push(len, ins);
  }
  function addInsert(values, sections, value) {
    if (value.length == 0)
      return;
    let index = sections.length - 2 >> 1;
    if (index < values.length) {
      values[values.length - 1] = values[values.length - 1].append(value);
    } else {
      while (values.length < index)
        values.push(Text.empty);
      values.push(value);
    }
  }
  function iterChanges(desc, f, individual) {
    let inserted = desc.inserted;
    for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
      let len = desc.sections[i++], ins = desc.sections[i++];
      if (ins < 0) {
        posA += len;
        posB += len;
      } else {
        let endA = posA, endB = posB, text = Text.empty;
        for (; ; ) {
          endA += len;
          endB += ins;
          if (ins && inserted)
            text = text.append(inserted[i - 2 >> 1]);
          if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
            break;
          len = desc.sections[i++];
          ins = desc.sections[i++];
        }
        f(posA, endA, posB, endB, text);
        posA = endA;
        posB = endB;
      }
    }
  }
  function mapSet(setA, setB, before, mkSet = false) {
    let sections = [], insert3 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let inserted = -1; ; ) {
      if (a.ins == -1 && b.ins == -1) {
        let len = Math.min(a.len, b.len);
        addSection(sections, len, -1);
        a.forward(len);
        b.forward(len);
      } else if (b.ins >= 0 && (a.ins < 0 || inserted == a.i || a.off == 0 && (b.len < a.len || b.len == a.len && !before))) {
        let len = b.len;
        addSection(sections, b.ins, -1);
        while (len) {
          let piece = Math.min(a.len, len);
          if (a.ins >= 0 && inserted < a.i && a.len <= piece) {
            addSection(sections, 0, a.ins);
            if (insert3)
              addInsert(insert3, sections, a.text);
            inserted = a.i;
          }
          a.forward(piece);
          len -= piece;
        }
        b.next();
      } else if (a.ins >= 0) {
        let len = 0, left = a.len;
        while (left) {
          if (b.ins == -1) {
            let piece = Math.min(left, b.len);
            len += piece;
            left -= piece;
            b.forward(piece);
          } else if (b.ins == 0 && b.len < left) {
            left -= b.len;
            b.next();
          } else {
            break;
          }
        }
        addSection(sections, len, inserted < a.i ? a.ins : 0);
        if (insert3 && inserted < a.i)
          addInsert(insert3, sections, a.text);
        inserted = a.i;
        a.forward(a.len - left);
      } else if (a.done && b.done) {
        return insert3 ? ChangeSet.createSet(sections, insert3) : ChangeDesc.create(sections);
      } else {
        throw new Error("Mismatched change set lengths");
      }
    }
  }
  function composeSets(setA, setB, mkSet = false) {
    let sections = [];
    let insert3 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let open = false; ; ) {
      if (a.done && b.done) {
        return insert3 ? ChangeSet.createSet(sections, insert3) : ChangeDesc.create(sections);
      } else if (a.ins == 0) {
        addSection(sections, a.len, 0, open);
        a.next();
      } else if (b.len == 0 && !b.done) {
        addSection(sections, 0, b.ins, open);
        if (insert3)
          addInsert(insert3, sections, b.text);
        b.next();
      } else if (a.done || b.done) {
        throw new Error("Mismatched change set lengths");
      } else {
        let len = Math.min(a.len2, b.len), sectionLen = sections.length;
        if (a.ins == -1) {
          let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
          addSection(sections, len, insB, open);
          if (insert3 && insB)
            addInsert(insert3, sections, b.text);
        } else if (b.ins == -1) {
          addSection(sections, a.off ? 0 : a.len, len, open);
          if (insert3)
            addInsert(insert3, sections, a.textBit(len));
        } else {
          addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
          if (insert3 && !b.off)
            addInsert(insert3, sections, b.text);
        }
        open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
        a.forward2(len);
        b.forward(len);
      }
    }
  }
  var SectionIter = class {
    constructor(set) {
      this.set = set;
      this.i = 0;
      this.next();
    }
    next() {
      let { sections } = this.set;
      if (this.i < sections.length) {
        this.len = sections[this.i++];
        this.ins = sections[this.i++];
      } else {
        this.len = 0;
        this.ins = -2;
      }
      this.off = 0;
    }
    get done() {
      return this.ins == -2;
    }
    get len2() {
      return this.ins < 0 ? this.len : this.ins;
    }
    get text() {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length ? Text.empty : inserted[index];
    }
    textBit(len) {
      let { inserted } = this.set, index = this.i - 2 >> 1;
      return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
    }
    forward(len) {
      if (len == this.len)
        this.next();
      else {
        this.len -= len;
        this.off += len;
      }
    }
    forward2(len) {
      if (this.ins == -1)
        this.forward(len);
      else if (len == this.ins)
        this.next();
      else {
        this.ins -= len;
        this.off += len;
      }
    }
  };
  var SelectionRange = class _SelectionRange {
    constructor(from, to, flags) {
      this.from = from;
      this.to = to;
      this.flags = flags;
    }
    /**
    The anchor of the range—the side that doesn't move when you
    extend it.
    */
    get anchor() {
      return this.flags & 16 ? this.to : this.from;
    }
    /**
    The head of the range, which is moved when the range is
    [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
    */
    get head() {
      return this.flags & 16 ? this.from : this.to;
    }
    /**
    True when `anchor` and `head` are at the same position.
    */
    get empty() {
      return this.from == this.to;
    }
    /**
    If this is a cursor that is explicitly associated with the
    character on one of its sides, this returns the side. -1 means
    the character before its position, 1 the character after, and 0
    means no association.
    */
    get assoc() {
      return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
    }
    /**
    The bidirectional text level associated with this cursor, if
    any.
    */
    get bidiLevel() {
      let level = this.flags & 3;
      return level == 3 ? null : level;
    }
    /**
    The goal column (stored vertical offset) associated with a
    cursor. This is used to preserve the vertical position when
    [moving](https://codemirror.net/6/docs/ref/#view.EditorView.moveVertically) across
    lines of different length.
    */
    get goalColumn() {
      let value = this.flags >> 5;
      return value == 33554431 ? void 0 : value;
    }
    /**
    Map this range through a change, producing a valid range in the
    updated document.
    */
    map(change, assoc = -1) {
      let from, to;
      if (this.empty) {
        from = to = change.mapPos(this.from, assoc);
      } else {
        from = change.mapPos(this.from, 1);
        to = change.mapPos(this.to, -1);
      }
      return from == this.from && to == this.to ? this : new _SelectionRange(from, to, this.flags);
    }
    /**
    Extend this range to cover at least `from` to `to`.
    */
    extend(from, to = from) {
      if (from <= this.anchor && to >= this.anchor)
        return EditorSelection.range(from, to);
      let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
      return EditorSelection.range(this.anchor, head);
    }
    /**
    Compare this range to another range.
    */
    eq(other) {
      return this.anchor == other.anchor && this.head == other.head;
    }
    /**
    Return a JSON-serializable object representing the range.
    */
    toJSON() {
      return { anchor: this.anchor, head: this.head };
    }
    /**
    Convert a JSON representation of a range to a `SelectionRange`
    instance.
    */
    static fromJSON(json) {
      if (!json || typeof json.anchor != "number" || typeof json.head != "number")
        throw new RangeError("Invalid JSON representation for SelectionRange");
      return EditorSelection.range(json.anchor, json.head);
    }
    /**
    @internal
    */
    static create(from, to, flags) {
      return new _SelectionRange(from, to, flags);
    }
  };
  var EditorSelection = class _EditorSelection {
    constructor(ranges, mainIndex) {
      this.ranges = ranges;
      this.mainIndex = mainIndex;
    }
    /**
    Map a selection through a change. Used to adjust the selection
    position for changes.
    */
    map(change, assoc = -1) {
      if (change.empty)
        return this;
      return _EditorSelection.create(this.ranges.map((r) => r.map(change, assoc)), this.mainIndex);
    }
    /**
    Compare this selection to another selection.
    */
    eq(other) {
      if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
        return false;
      for (let i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].eq(other.ranges[i]))
          return false;
      return true;
    }
    /**
    Get the primary selection range. Usually, you should make sure
    your code applies to _all_ ranges, by using methods like
    [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
    */
    get main() {
      return this.ranges[this.mainIndex];
    }
    /**
    Make sure the selection only has one range. Returns a selection
    holding only the main range from this selection.
    */
    asSingle() {
      return this.ranges.length == 1 ? this : new _EditorSelection([this.main], 0);
    }
    /**
    Extend this selection with an extra range.
    */
    addRange(range2, main = true) {
      return _EditorSelection.create([range2].concat(this.ranges), main ? 0 : this.mainIndex + 1);
    }
    /**
    Replace a given range with another range, and then normalize the
    selection to merge and sort ranges if necessary.
    */
    replaceRange(range2, which = this.mainIndex) {
      let ranges = this.ranges.slice();
      ranges[which] = range2;
      return _EditorSelection.create(ranges, this.mainIndex);
    }
    /**
    Convert this selection to an object that can be serialized to
    JSON.
    */
    toJSON() {
      return { ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex };
    }
    /**
    Create a selection from a JSON representation.
    */
    static fromJSON(json) {
      if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
        throw new RangeError("Invalid JSON representation for EditorSelection");
      return new _EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
    }
    /**
    Create a selection holding a single range.
    */
    static single(anchor, head = anchor) {
      return new _EditorSelection([_EditorSelection.range(anchor, head)], 0);
    }
    /**
    Sort and merge the given set of ranges, creating a valid
    selection.
    */
    static create(ranges, mainIndex = 0) {
      if (ranges.length == 0)
        throw new RangeError("A selection needs at least one range");
      for (let pos = 0, i = 0; i < ranges.length; i++) {
        let range2 = ranges[i];
        if (range2.empty ? range2.from <= pos : range2.from < pos)
          return _EditorSelection.normalized(ranges.slice(), mainIndex);
        pos = range2.to;
      }
      return new _EditorSelection(ranges, mainIndex);
    }
    /**
    Create a cursor selection range at the given position. You can
    safely ignore the optional arguments in most situations.
    */
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
      return SelectionRange.create(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 : 8) | (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) | (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5);
    }
    /**
    Create a selection range.
    */
    static range(anchor, head, goalColumn, bidiLevel) {
      let flags = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5 | (bidiLevel == null ? 3 : Math.min(2, bidiLevel));
      return head < anchor ? SelectionRange.create(head, anchor, 16 | 8 | flags) : SelectionRange.create(anchor, head, (head > anchor ? 4 : 0) | flags);
    }
    /**
    @internal
    */
    static normalized(ranges, mainIndex = 0) {
      let main = ranges[mainIndex];
      ranges.sort((a, b) => a.from - b.from);
      mainIndex = ranges.indexOf(main);
      for (let i = 1; i < ranges.length; i++) {
        let range2 = ranges[i], prev = ranges[i - 1];
        if (range2.empty ? range2.from <= prev.to : range2.from < prev.to) {
          let from = prev.from, to = Math.max(range2.to, prev.to);
          if (i <= mainIndex)
            mainIndex--;
          ranges.splice(--i, 2, range2.anchor > range2.head ? _EditorSelection.range(to, from) : _EditorSelection.range(from, to));
        }
      }
      return new _EditorSelection(ranges, mainIndex);
    }
  };
  function checkSelection(selection, docLength) {
    for (let range2 of selection.ranges)
      if (range2.to > docLength)
        throw new RangeError("Selection points outside of document");
  }
  var nextID = 0;
  var Facet = class _Facet {
    constructor(combine, compareInput, compare2, isStatic, enables) {
      this.combine = combine;
      this.compareInput = compareInput;
      this.compare = compare2;
      this.isStatic = isStatic;
      this.id = nextID++;
      this.default = combine([]);
      this.extensions = typeof enables == "function" ? enables(this) : enables;
    }
    /**
    Define a new facet.
    */
    static define(config = {}) {
      return new _Facet(config.combine || ((a) => a), config.compareInput || ((a, b) => a === b), config.compare || (!config.combine ? sameArray : (a, b) => a === b), !!config.static, config.enables);
    }
    /**
    Returns an extension that adds the given value to this facet.
    */
    of(value) {
      return new FacetProvider([], this, 0, value);
    }
    /**
    Create an extension that computes a value for the facet from a
    state. You must take care to declare the parts of the state that
    this value depends on, since your function is only called again
    for a new state when one of those parts changed.
    
    In cases where your value depends only on a single field, you'll
    want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
    */
    compute(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 1, get);
    }
    /**
    Create an extension that computes zero or more values for this
    facet from a state.
    */
    computeN(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 2, get);
    }
    from(field, get) {
      if (!get)
        get = (x) => x;
      return this.compute([field], (state) => get(state.field(field)));
    }
  };
  function sameArray(a, b) {
    return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
  }
  var FacetProvider = class {
    constructor(dependencies, facet, type, value) {
      this.dependencies = dependencies;
      this.facet = facet;
      this.type = type;
      this.value = value;
      this.id = nextID++;
    }
    dynamicSlot(addresses) {
      var _a2;
      let getter = this.value;
      let compare2 = this.facet.compareInput;
      let id = this.id, idx = addresses[id] >> 1, multi = this.type == 2;
      let depDoc = false, depSel = false, depAddrs = [];
      for (let dep of this.dependencies) {
        if (dep == "doc")
          depDoc = true;
        else if (dep == "selection")
          depSel = true;
        else if ((((_a2 = addresses[dep.id]) !== null && _a2 !== void 0 ? _a2 : 1) & 1) == 0)
          depAddrs.push(addresses[dep.id]);
      }
      return {
        create(state) {
          state.values[idx] = getter(state);
          return 1;
        },
        update(state, tr) {
          if (depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || ensureAll(state, depAddrs)) {
            let newVal = getter(state);
            if (multi ? !compareArray(newVal, state.values[idx], compare2) : !compare2(newVal, state.values[idx])) {
              state.values[idx] = newVal;
              return 1;
            }
          }
          return 0;
        },
        reconfigure: (state, oldState) => {
          let newVal, oldAddr = oldState.config.address[id];
          if (oldAddr != null) {
            let oldVal = getAddr(oldState, oldAddr);
            if (this.dependencies.every((dep) => {
              return dep instanceof Facet ? oldState.facet(dep) === state.facet(dep) : dep instanceof StateField ? oldState.field(dep, false) == state.field(dep, false) : true;
            }) || (multi ? compareArray(newVal = getter(state), oldVal, compare2) : compare2(newVal = getter(state), oldVal))) {
              state.values[idx] = oldVal;
              return 0;
            }
          } else {
            newVal = getter(state);
          }
          state.values[idx] = newVal;
          return 1;
        }
      };
    }
  };
  function compareArray(a, b, compare2) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (!compare2(a[i], b[i]))
        return false;
    return true;
  }
  function ensureAll(state, addrs) {
    let changed = false;
    for (let addr of addrs)
      if (ensureAddr(state, addr) & 1)
        changed = true;
    return changed;
  }
  function dynamicFacetSlot(addresses, facet, providers) {
    let providerAddrs = providers.map((p) => addresses[p.id]);
    let providerTypes = providers.map((p) => p.type);
    let dynamic = providerAddrs.filter((p) => !(p & 1));
    let idx = addresses[facet.id] >> 1;
    function get(state) {
      let values = [];
      for (let i = 0; i < providerAddrs.length; i++) {
        let value = getAddr(state, providerAddrs[i]);
        if (providerTypes[i] == 2)
          for (let val of value)
            values.push(val);
        else
          values.push(value);
      }
      return facet.combine(values);
    }
    return {
      create(state) {
        for (let addr of providerAddrs)
          ensureAddr(state, addr);
        state.values[idx] = get(state);
        return 1;
      },
      update(state, tr) {
        if (!ensureAll(state, dynamic))
          return 0;
        let value = get(state);
        if (facet.compare(value, state.values[idx]))
          return 0;
        state.values[idx] = value;
        return 1;
      },
      reconfigure(state, oldState) {
        let depChanged = ensureAll(state, providerAddrs);
        let oldProviders = oldState.config.facets[facet.id], oldValue = oldState.facet(facet);
        if (oldProviders && !depChanged && sameArray(providers, oldProviders)) {
          state.values[idx] = oldValue;
          return 0;
        }
        let value = get(state);
        if (facet.compare(value, oldValue)) {
          state.values[idx] = oldValue;
          return 0;
        }
        state.values[idx] = value;
        return 1;
      }
    };
  }
  var initField = /* @__PURE__ */ Facet.define({ static: true });
  var StateField = class _StateField {
    constructor(id, createF, updateF, compareF, spec) {
      this.id = id;
      this.createF = createF;
      this.updateF = updateF;
      this.compareF = compareF;
      this.spec = spec;
      this.provides = void 0;
    }
    /**
    Define a state field.
    */
    static define(config) {
      let field = new _StateField(nextID++, config.create, config.update, config.compare || ((a, b) => a === b), config);
      if (config.provide)
        field.provides = config.provide(field);
      return field;
    }
    create(state) {
      let init = state.facet(initField).find((i) => i.field == this);
      return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
    }
    /**
    @internal
    */
    slot(addresses) {
      let idx = addresses[this.id] >> 1;
      return {
        create: (state) => {
          state.values[idx] = this.create(state);
          return 1;
        },
        update: (state, tr) => {
          let oldVal = state.values[idx];
          let value = this.updateF(oldVal, tr);
          if (this.compareF(oldVal, value))
            return 0;
          state.values[idx] = value;
          return 1;
        },
        reconfigure: (state, oldState) => {
          if (oldState.config.address[this.id] != null) {
            state.values[idx] = oldState.field(this);
            return 0;
          }
          state.values[idx] = this.create(state);
          return 1;
        }
      };
    }
    /**
    Returns an extension that enables this field and overrides the
    way it is initialized. Can be useful when you need to provide a
    non-default starting value for the field.
    */
    init(create) {
      return [this, initField.of({ field: this, create })];
    }
    /**
    State field instances can be used as
    [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
    given state.
    */
    get extension() {
      return this;
    }
  };
  var Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
  function prec(value) {
    return (ext) => new PrecExtension(ext, value);
  }
  var Prec = {
    /**
    The highest precedence level, for extensions that should end up
    near the start of the precedence ordering.
    */
    highest: /* @__PURE__ */ prec(Prec_.highest),
    /**
    A higher-than-default precedence, for extensions that should
    come before those with default precedence.
    */
    high: /* @__PURE__ */ prec(Prec_.high),
    /**
    The default precedence, which is also used for extensions
    without an explicit precedence.
    */
    default: /* @__PURE__ */ prec(Prec_.default),
    /**
    A lower-than-default precedence.
    */
    low: /* @__PURE__ */ prec(Prec_.low),
    /**
    The lowest precedence level. Meant for things that should end up
    near the end of the extension order.
    */
    lowest: /* @__PURE__ */ prec(Prec_.lowest)
  };
  var PrecExtension = class {
    constructor(inner, prec2) {
      this.inner = inner;
      this.prec = prec2;
    }
  };
  var Compartment = class _Compartment {
    /**
    Create an instance of this compartment to add to your [state
    configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
    */
    of(ext) {
      return new CompartmentInstance(this, ext);
    }
    /**
    Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
    reconfigures this compartment.
    */
    reconfigure(content2) {
      return _Compartment.reconfigure.of({ compartment: this, extension: content2 });
    }
    /**
    Get the current content of the compartment in the state, or
    `undefined` if it isn't present.
    */
    get(state) {
      return state.config.compartments.get(this);
    }
  };
  var CompartmentInstance = class {
    constructor(compartment, inner) {
      this.compartment = compartment;
      this.inner = inner;
    }
  };
  var Configuration = class _Configuration {
    constructor(base2, compartments, dynamicSlots, address, staticValues, facets) {
      this.base = base2;
      this.compartments = compartments;
      this.dynamicSlots = dynamicSlots;
      this.address = address;
      this.staticValues = staticValues;
      this.facets = facets;
      this.statusTemplate = [];
      while (this.statusTemplate.length < dynamicSlots.length)
        this.statusTemplate.push(
          0
          /* SlotStatus.Unresolved */
        );
    }
    staticFacet(facet) {
      let addr = this.address[facet.id];
      return addr == null ? facet.default : this.staticValues[addr >> 1];
    }
    static resolve(base2, compartments, oldState) {
      let fields = [];
      let facets = /* @__PURE__ */ Object.create(null);
      let newCompartments = /* @__PURE__ */ new Map();
      for (let ext of flatten(base2, compartments, newCompartments)) {
        if (ext instanceof StateField)
          fields.push(ext);
        else
          (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
      }
      let address = /* @__PURE__ */ Object.create(null);
      let staticValues = [];
      let dynamicSlots = [];
      for (let field of fields) {
        address[field.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => field.slot(a));
      }
      let oldFacets = oldState === null || oldState === void 0 ? void 0 : oldState.config.facets;
      for (let id in facets) {
        let providers = facets[id], facet = providers[0].facet;
        let oldProviders = oldFacets && oldFacets[id] || [];
        if (providers.every(
          (p) => p.type == 0
          /* Provider.Static */
        )) {
          address[facet.id] = staticValues.length << 1 | 1;
          if (sameArray(oldProviders, providers)) {
            staticValues.push(oldState.facet(facet));
          } else {
            let value = facet.combine(providers.map((p) => p.value));
            staticValues.push(oldState && facet.compare(value, oldState.facet(facet)) ? oldState.facet(facet) : value);
          }
        } else {
          for (let p of providers) {
            if (p.type == 0) {
              address[p.id] = staticValues.length << 1 | 1;
              staticValues.push(p.value);
            } else {
              address[p.id] = dynamicSlots.length << 1;
              dynamicSlots.push((a) => p.dynamicSlot(a));
            }
          }
          address[facet.id] = dynamicSlots.length << 1;
          dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
        }
      }
      let dynamic = dynamicSlots.map((f) => f(address));
      return new _Configuration(base2, newCompartments, dynamic, address, staticValues, facets);
    }
  };
  function flatten(extension, compartments, newCompartments) {
    let result = [[], [], [], [], []];
    let seen = /* @__PURE__ */ new Map();
    function inner(ext, prec2) {
      let known = seen.get(ext);
      if (known != null) {
        if (known <= prec2)
          return;
        let found = result[known].indexOf(ext);
        if (found > -1)
          result[known].splice(found, 1);
        if (ext instanceof CompartmentInstance)
          newCompartments.delete(ext.compartment);
      }
      seen.set(ext, prec2);
      if (Array.isArray(ext)) {
        for (let e of ext)
          inner(e, prec2);
      } else if (ext instanceof CompartmentInstance) {
        if (newCompartments.has(ext.compartment))
          throw new RangeError(`Duplicate use of compartment in extensions`);
        let content2 = compartments.get(ext.compartment) || ext.inner;
        newCompartments.set(ext.compartment, content2);
        inner(content2, prec2);
      } else if (ext instanceof PrecExtension) {
        inner(ext.inner, ext.prec);
      } else if (ext instanceof StateField) {
        result[prec2].push(ext);
        if (ext.provides)
          inner(ext.provides, prec2);
      } else if (ext instanceof FacetProvider) {
        result[prec2].push(ext);
        if (ext.facet.extensions)
          inner(ext.facet.extensions, Prec_.default);
      } else {
        let content2 = ext.extension;
        if (!content2)
          throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
        inner(content2, prec2);
      }
    }
    inner(extension, Prec_.default);
    return result.reduce((a, b) => a.concat(b));
  }
  function ensureAddr(state, addr) {
    if (addr & 1)
      return 2;
    let idx = addr >> 1;
    let status = state.status[idx];
    if (status == 4)
      throw new Error("Cyclic dependency between fields and/or facets");
    if (status & 2)
      return status;
    state.status[idx] = 4;
    let changed = state.computeSlot(state, state.config.dynamicSlots[idx]);
    return state.status[idx] = 2 | changed;
  }
  function getAddr(state, addr) {
    return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
  }
  var languageData = /* @__PURE__ */ Facet.define();
  var allowMultipleSelections = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((v) => v),
    static: true
  });
  var lineSeparator = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : void 0,
    static: true
  });
  var changeFilter = /* @__PURE__ */ Facet.define();
  var transactionFilter = /* @__PURE__ */ Facet.define();
  var transactionExtender = /* @__PURE__ */ Facet.define();
  var readOnly = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : false
  });
  var Annotation = class {
    /**
    @internal
    */
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
    /**
    Define a new type of annotation.
    */
    static define() {
      return new AnnotationType();
    }
  };
  var AnnotationType = class {
    /**
    Create an instance of this annotation.
    */
    of(value) {
      return new Annotation(this, value);
    }
  };
  var StateEffectType = class {
    /**
    @internal
    */
    constructor(map) {
      this.map = map;
    }
    /**
    Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
    type.
    */
    of(value) {
      return new StateEffect(this, value);
    }
  };
  var StateEffect = class _StateEffect {
    /**
    @internal
    */
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
    /**
    Map this effect through a position mapping. Will return
    `undefined` when that ends up deleting the effect.
    */
    map(mapping) {
      let mapped = this.type.map(this.value, mapping);
      return mapped === void 0 ? void 0 : mapped == this.value ? this : new _StateEffect(this.type, mapped);
    }
    /**
    Tells you whether this effect object is of a given
    [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
    */
    is(type) {
      return this.type == type;
    }
    /**
    Define a new effect type. The type parameter indicates the type
    of values that his effect holds. It should be a type that
    doesn't include `undefined`, since that is used in
    [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
    removed.
    */
    static define(spec = {}) {
      return new StateEffectType(spec.map || ((v) => v));
    }
    /**
    Map an array of effects through a change set.
    */
    static mapEffects(effects, mapping) {
      if (!effects.length)
        return effects;
      let result = [];
      for (let effect of effects) {
        let mapped = effect.map(mapping);
        if (mapped)
          result.push(mapped);
      }
      return result;
    }
  };
  StateEffect.reconfigure = /* @__PURE__ */ StateEffect.define();
  StateEffect.appendConfig = /* @__PURE__ */ StateEffect.define();
  var Transaction = class _Transaction {
    constructor(startState, changes, selection, effects, annotations, scrollIntoView2) {
      this.startState = startState;
      this.changes = changes;
      this.selection = selection;
      this.effects = effects;
      this.annotations = annotations;
      this.scrollIntoView = scrollIntoView2;
      this._doc = null;
      this._state = null;
      if (selection)
        checkSelection(selection, changes.newLength);
      if (!annotations.some((a) => a.type == _Transaction.time))
        this.annotations = annotations.concat(_Transaction.time.of(Date.now()));
    }
    /**
    @internal
    */
    static create(startState, changes, selection, effects, annotations, scrollIntoView2) {
      return new _Transaction(startState, changes, selection, effects, annotations, scrollIntoView2);
    }
    /**
    The new document produced by the transaction. Contrary to
    [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
    force the entire new state to be computed right away, so it is
    recommended that [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
    when they need to look at the new document.
    */
    get newDoc() {
      return this._doc || (this._doc = this.changes.apply(this.startState.doc));
    }
    /**
    The new selection produced by the transaction. If
    [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
    this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
    current selection through the changes made by the transaction.
    */
    get newSelection() {
      return this.selection || this.startState.selection.map(this.changes);
    }
    /**
    The new state created by the transaction. Computed on demand
    (but retained for subsequent access), so it is recommended not to
    access it in [transaction
    filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
    */
    get state() {
      if (!this._state)
        this.startState.applyTransaction(this);
      return this._state;
    }
    /**
    Get the value of the given annotation type, if any.
    */
    annotation(type) {
      for (let ann of this.annotations)
        if (ann.type == type)
          return ann.value;
      return void 0;
    }
    /**
    Indicates whether the transaction changed the document.
    */
    get docChanged() {
      return !this.changes.empty;
    }
    /**
    Indicates whether this transaction reconfigures the state
    (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
    with a top-level configuration
    [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
    */
    get reconfigured() {
      return this.startState.config != this.state.config;
    }
    /**
    Returns true if the transaction has a [user
    event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
    or more specific than `event`. For example, if the transaction
    has `"select.pointer"` as user event, `"select"` and
    `"select.pointer"` will match it.
    */
    isUserEvent(event) {
      let e = this.annotation(_Transaction.userEvent);
      return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
    }
  };
  Transaction.time = /* @__PURE__ */ Annotation.define();
  Transaction.userEvent = /* @__PURE__ */ Annotation.define();
  Transaction.addToHistory = /* @__PURE__ */ Annotation.define();
  Transaction.remote = /* @__PURE__ */ Annotation.define();
  function joinRanges(a, b) {
    let result = [];
    for (let iA = 0, iB = 0; ; ) {
      let from, to;
      if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
        from = a[iA++];
        to = a[iA++];
      } else if (iB < b.length) {
        from = b[iB++];
        to = b[iB++];
      } else
        return result;
      if (!result.length || result[result.length - 1] < from)
        result.push(from, to);
      else if (result[result.length - 1] < to)
        result[result.length - 1] = to;
    }
  }
  function mergeTransaction(a, b, sequential) {
    var _a2;
    let mapForA, mapForB, changes;
    if (sequential) {
      mapForA = b.changes;
      mapForB = ChangeSet.empty(b.changes.length);
      changes = a.changes.compose(b.changes);
    } else {
      mapForA = b.changes.map(a.changes);
      mapForB = a.changes.mapDesc(b.changes, true);
      changes = a.changes.compose(mapForA);
    }
    return {
      changes,
      selection: b.selection ? b.selection.map(mapForB) : (_a2 = a.selection) === null || _a2 === void 0 ? void 0 : _a2.map(mapForA),
      effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
      annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
      scrollIntoView: a.scrollIntoView || b.scrollIntoView
    };
  }
  function resolveTransactionInner(state, spec, docSize) {
    let sel = spec.selection, annotations = asArray(spec.annotations);
    if (spec.userEvent)
      annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
    return {
      changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
      selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
      effects: asArray(spec.effects),
      annotations,
      scrollIntoView: !!spec.scrollIntoView
    };
  }
  function resolveTransaction(state, specs, filter) {
    let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
    if (specs.length && specs[0].filter === false)
      filter = false;
    for (let i = 1; i < specs.length; i++) {
      if (specs[i].filter === false)
        filter = false;
      let seq = !!specs[i].sequential;
      s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
    }
    let tr = Transaction.create(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
    return extendTransaction(filter ? filterTransaction(tr) : tr);
  }
  function filterTransaction(tr) {
    let state = tr.startState;
    let result = true;
    for (let filter of state.facet(changeFilter)) {
      let value = filter(tr);
      if (value === false) {
        result = false;
        break;
      }
      if (Array.isArray(value))
        result = result === true ? value : joinRanges(result, value);
    }
    if (result !== true) {
      let changes, back;
      if (result === false) {
        back = tr.changes.invertedDesc;
        changes = ChangeSet.empty(state.doc.length);
      } else {
        let filtered = tr.changes.filter(result);
        changes = filtered.changes;
        back = filtered.filtered.mapDesc(filtered.changes).invertedDesc;
      }
      tr = Transaction.create(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
    }
    let filters = state.facet(transactionFilter);
    for (let i = filters.length - 1; i >= 0; i--) {
      let filtered = filters[i](tr);
      if (filtered instanceof Transaction)
        tr = filtered;
      else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
        tr = filtered[0];
      else
        tr = resolveTransaction(state, asArray(filtered), false);
    }
    return tr;
  }
  function extendTransaction(tr) {
    let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
    for (let i = extenders.length - 1; i >= 0; i--) {
      let extension = extenders[i](tr);
      if (extension && Object.keys(extension).length)
        spec = mergeTransaction(spec, resolveTransactionInner(state, extension, tr.changes.newLength), true);
    }
    return spec == tr ? tr : Transaction.create(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
  }
  var none = [];
  function asArray(value) {
    return value == null ? none : Array.isArray(value) ? value : [value];
  }
  var CharCategory = /* @__PURE__ */ function(CharCategory2) {
    CharCategory2[CharCategory2["Word"] = 0] = "Word";
    CharCategory2[CharCategory2["Space"] = 1] = "Space";
    CharCategory2[CharCategory2["Other"] = 2] = "Other";
    return CharCategory2;
  }(CharCategory || (CharCategory = {}));
  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var wordChar;
  try {
    wordChar = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
  } catch (_) {
  }
  function hasWordChar(str2) {
    if (wordChar)
      return wordChar.test(str2);
    for (let i = 0; i < str2.length; i++) {
      let ch = str2[i];
      if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
        return true;
    }
    return false;
  }
  function makeCategorizer(wordChars) {
    return (char) => {
      if (!/\S/.test(char))
        return CharCategory.Space;
      if (hasWordChar(char))
        return CharCategory.Word;
      for (let i = 0; i < wordChars.length; i++)
        if (char.indexOf(wordChars[i]) > -1)
          return CharCategory.Word;
      return CharCategory.Other;
    };
  }
  var EditorState = class _EditorState {
    constructor(config, doc2, selection, values, computeSlot, tr) {
      this.config = config;
      this.doc = doc2;
      this.selection = selection;
      this.values = values;
      this.status = config.statusTemplate.slice();
      this.computeSlot = computeSlot;
      if (tr)
        tr._state = this;
      for (let i = 0; i < this.config.dynamicSlots.length; i++)
        ensureAddr(this, i << 1);
      this.computeSlot = null;
    }
    field(field, require2 = true) {
      let addr = this.config.address[field.id];
      if (addr == null) {
        if (require2)
          throw new RangeError("Field is not present in this state");
        return void 0;
      }
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    /**
    Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
    state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
    can be passed. Unless
    [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
    [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
    are assumed to start in the _current_ document (not the document
    produced by previous specs), and its
    [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
    [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
    to the document created by its _own_ changes. The resulting
    transaction contains the combined effect of all the different
    specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
    specs take precedence over earlier ones.
    */
    update(...specs) {
      return resolveTransaction(this, specs, true);
    }
    /**
    @internal
    */
    applyTransaction(tr) {
      let conf = this.config, { base: base2, compartments } = conf;
      for (let effect of tr.effects) {
        if (effect.is(Compartment.reconfigure)) {
          if (conf) {
            compartments = /* @__PURE__ */ new Map();
            conf.compartments.forEach((val, key) => compartments.set(key, val));
            conf = null;
          }
          compartments.set(effect.value.compartment, effect.value.extension);
        } else if (effect.is(StateEffect.reconfigure)) {
          conf = null;
          base2 = effect.value;
        } else if (effect.is(StateEffect.appendConfig)) {
          conf = null;
          base2 = asArray(base2).concat(effect.value);
        }
      }
      let startValues;
      if (!conf) {
        conf = Configuration.resolve(base2, compartments, this);
        let intermediateState = new _EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
        startValues = intermediateState.values;
      } else {
        startValues = tr.startState.values.slice();
      }
      new _EditorState(conf, tr.newDoc, tr.newSelection, startValues, (state, slot) => slot.update(state, tr), tr);
    }
    /**
    Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
    replaces every selection range with the given content.
    */
    replaceSelection(text) {
      if (typeof text == "string")
        text = this.toText(text);
      return this.changeByRange((range2) => ({
        changes: { from: range2.from, to: range2.to, insert: text },
        range: EditorSelection.cursor(range2.from + text.length)
      }));
    }
    /**
    Create a set of changes and a new selection by running the given
    function for each range in the active selection. The function
    can return an optional set of changes (in the coordinate space
    of the start document), plus an updated range (in the coordinate
    space of the document produced by the call's own changes). This
    method will merge all the changes and ranges into a single
    changeset and selection, and return it as a [transaction
    spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
    [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
    */
    changeByRange(f) {
      let sel = this.selection;
      let result1 = f(sel.ranges[0]);
      let changes = this.changes(result1.changes), ranges = [result1.range];
      let effects = asArray(result1.effects);
      for (let i = 1; i < sel.ranges.length; i++) {
        let result = f(sel.ranges[i]);
        let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
        for (let j = 0; j < i; j++)
          ranges[j] = ranges[j].map(newMapped);
        let mapBy = changes.mapDesc(newChanges, true);
        ranges.push(result.range.map(mapBy));
        changes = changes.compose(newMapped);
        effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
      }
      return {
        changes,
        selection: EditorSelection.create(ranges, sel.mainIndex),
        effects
      };
    }
    /**
    Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
    description, taking the state's document length and line
    separator into account.
    */
    changes(spec = []) {
      if (spec instanceof ChangeSet)
        return spec;
      return ChangeSet.of(spec, this.doc.length, this.facet(_EditorState.lineSeparator));
    }
    /**
    Using the state's [line
    separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
    [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
    */
    toText(string2) {
      return Text.of(string2.split(this.facet(_EditorState.lineSeparator) || DefaultSplit));
    }
    /**
    Return the given range of the document as a string.
    */
    sliceDoc(from = 0, to = this.doc.length) {
      return this.doc.sliceString(from, to, this.lineBreak);
    }
    /**
    Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
    */
    facet(facet) {
      let addr = this.config.address[facet.id];
      if (addr == null)
        return facet.default;
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    /**
    Convert this state to a JSON-serializable object. When custom
    fields should be serialized, you can pass them in as an object
    mapping property names (in the resulting object, which should
    not use `doc` or `selection`) to fields.
    */
    toJSON(fields) {
      let result = {
        doc: this.sliceDoc(),
        selection: this.selection.toJSON()
      };
      if (fields)
        for (let prop in fields) {
          let value = fields[prop];
          if (value instanceof StateField && this.config.address[value.id] != null)
            result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
        }
      return result;
    }
    /**
    Deserialize a state from its JSON representation. When custom
    fields should be deserialized, pass the same object you passed
    to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
    third argument.
    */
    static fromJSON(json, config = {}, fields) {
      if (!json || typeof json.doc != "string")
        throw new RangeError("Invalid JSON representation for EditorState");
      let fieldInit = [];
      if (fields)
        for (let prop in fields) {
          if (Object.prototype.hasOwnProperty.call(json, prop)) {
            let field = fields[prop], value = json[prop];
            fieldInit.push(field.init((state) => field.spec.fromJSON(value, state)));
          }
        }
      return _EditorState.create({
        doc: json.doc,
        selection: EditorSelection.fromJSON(json.selection),
        extensions: config.extensions ? fieldInit.concat([config.extensions]) : fieldInit
      });
    }
    /**
    Create a new state. You'll usually only need this when
    initializing an editor—updated states are created by applying
    transactions.
    */
    static create(config = {}) {
      let configuration = Configuration.resolve(config.extensions || [], /* @__PURE__ */ new Map());
      let doc2 = config.doc instanceof Text ? config.doc : Text.of((config.doc || "").split(configuration.staticFacet(_EditorState.lineSeparator) || DefaultSplit));
      let selection = !config.selection ? EditorSelection.single(0) : config.selection instanceof EditorSelection ? config.selection : EditorSelection.single(config.selection.anchor, config.selection.head);
      checkSelection(selection, doc2.length);
      if (!configuration.staticFacet(allowMultipleSelections))
        selection = selection.asSingle();
      return new _EditorState(configuration, doc2, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
    }
    /**
    The size (in columns) of a tab in the document, determined by
    the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
    */
    get tabSize() {
      return this.facet(_EditorState.tabSize);
    }
    /**
    Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
    string for this state.
    */
    get lineBreak() {
      return this.facet(_EditorState.lineSeparator) || "\n";
    }
    /**
    Returns true when the editor is
    [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
    */
    get readOnly() {
      return this.facet(readOnly);
    }
    /**
    Look up a translation for the given phrase (via the
    [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
    original string if no translation is found.
    
    If additional arguments are passed, they will be inserted in
    place of markers like `$1` (for the first value) and `$2`, etc.
    A single `$` is equivalent to `$1`, and `$$` will produce a
    literal dollar sign.
    */
    phrase(phrase, ...insert3) {
      for (let map of this.facet(_EditorState.phrases))
        if (Object.prototype.hasOwnProperty.call(map, phrase)) {
          phrase = map[phrase];
          break;
        }
      if (insert3.length)
        phrase = phrase.replace(/\$(\$|\d*)/g, (m, i) => {
          if (i == "$")
            return "$";
          let n = +(i || 1);
          return !n || n > insert3.length ? m : insert3[n - 1];
        });
      return phrase;
    }
    /**
    Find the values for a given language data field, provided by the
    the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
    
    Examples of language data fields are...
    
    - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
      comment syntax.
    - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
      for providing language-specific completion sources.
    - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
      characters that should be considered part of words in this
      language.
    - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
      bracket closing behavior.
    */
    languageDataAt(name2, pos, side = -1) {
      let values = [];
      for (let provider of this.facet(languageData)) {
        for (let result of provider(this, pos, side)) {
          if (Object.prototype.hasOwnProperty.call(result, name2))
            values.push(result[name2]);
        }
      }
      return values;
    }
    /**
    Return a function that can categorize strings (expected to
    represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
    into one of:
    
     - Word (contains an alphanumeric character or a character
       explicitly listed in the local language's `"wordChars"`
       language data, which should be a string)
     - Space (contains only whitespace)
     - Other (anything else)
    */
    charCategorizer(at) {
      return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
    /**
    Find the word at the given position, meaning the range
    containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
    around it. If no word characters are adjacent to the position,
    this returns null.
    */
    wordAt(pos) {
      let { text, from, length } = this.doc.lineAt(pos);
      let cat = this.charCategorizer(pos);
      let start = pos - from, end = pos - from;
      while (start > 0) {
        let prev = findClusterBreak(text, start, false);
        if (cat(text.slice(prev, start)) != CharCategory.Word)
          break;
        start = prev;
      }
      while (end < length) {
        let next = findClusterBreak(text, end);
        if (cat(text.slice(end, next)) != CharCategory.Word)
          break;
        end = next;
      }
      return start == end ? null : EditorSelection.range(start + from, end + from);
    }
  };
  EditorState.allowMultipleSelections = allowMultipleSelections;
  EditorState.tabSize = /* @__PURE__ */ Facet.define({
    combine: (values) => values.length ? values[0] : 4
  });
  EditorState.lineSeparator = lineSeparator;
  EditorState.readOnly = readOnly;
  EditorState.phrases = /* @__PURE__ */ Facet.define({
    compare(a, b) {
      let kA = Object.keys(a), kB = Object.keys(b);
      return kA.length == kB.length && kA.every((k) => a[k] == b[k]);
    }
  });
  EditorState.languageData = languageData;
  EditorState.changeFilter = changeFilter;
  EditorState.transactionFilter = transactionFilter;
  EditorState.transactionExtender = transactionExtender;
  Compartment.reconfigure = /* @__PURE__ */ StateEffect.define();
  function combineConfig(configs, defaults, combine = {}) {
    let result = {};
    for (let config of configs)
      for (let key of Object.keys(config)) {
        let value = config[key], current = result[key];
        if (current === void 0)
          result[key] = value;
        else if (current === value || value === void 0)
          ;
        else if (Object.hasOwnProperty.call(combine, key))
          result[key] = combine[key](current, value);
        else
          throw new Error("Config merge conflict for field " + key);
      }
    for (let key in defaults)
      if (result[key] === void 0)
        result[key] = defaults[key];
    return result;
  }
  var RangeValue = class {
    /**
    Compare this value with another value. Used when comparing
    rangesets. The default implementation compares by identity.
    Unless you are only creating a fixed number of unique instances
    of your value type, it is a good idea to implement this
    properly.
    */
    eq(other) {
      return this == other;
    }
    /**
    Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
    */
    range(from, to = from) {
      return Range.create(from, to, this);
    }
  };
  RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
  RangeValue.prototype.point = false;
  RangeValue.prototype.mapMode = MapMode.TrackDel;
  var Range = class _Range {
    constructor(from, to, value) {
      this.from = from;
      this.to = to;
      this.value = value;
    }
    /**
    @internal
    */
    static create(from, to, value) {
      return new _Range(from, to, value);
    }
  };
  function cmpRange(a, b) {
    return a.from - b.from || a.value.startSide - b.value.startSide;
  }
  var Chunk = class _Chunk {
    constructor(from, to, value, maxPoint) {
      this.from = from;
      this.to = to;
      this.value = value;
      this.maxPoint = maxPoint;
    }
    get length() {
      return this.to[this.to.length - 1];
    }
    // Find the index of the given position and side. Use the ranges'
    // `from` pos when `end == false`, `to` when `end == true`.
    findIndex(pos, side, end, startAt = 0) {
      let arr = end ? this.to : this.from;
      for (let lo = startAt, hi = arr.length; ; ) {
        if (lo == hi)
          return lo;
        let mid = lo + hi >> 1;
        let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
        if (mid == lo)
          return diff >= 0 ? lo : hi;
        if (diff >= 0)
          hi = mid;
        else
          lo = mid + 1;
      }
    }
    between(offset, from, to, f) {
      for (let i = this.findIndex(from, -1e9, true), e = this.findIndex(to, 1e9, false, i); i < e; i++)
        if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
          return false;
    }
    map(offset, changes) {
      let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
      for (let i = 0; i < this.value.length; i++) {
        let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
        if (curFrom == curTo) {
          let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
          if (mapped == null)
            continue;
          newFrom = newTo = mapped;
          if (val.startSide != val.endSide) {
            newTo = changes.mapPos(curFrom, val.endSide);
            if (newTo < newFrom)
              continue;
          }
        } else {
          newFrom = changes.mapPos(curFrom, val.startSide);
          newTo = changes.mapPos(curTo, val.endSide);
          if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
            continue;
        }
        if ((newTo - newFrom || val.endSide - val.startSide) < 0)
          continue;
        if (newPos < 0)
          newPos = newFrom;
        if (val.point)
          maxPoint = Math.max(maxPoint, newTo - newFrom);
        value.push(val);
        from.push(newFrom - newPos);
        to.push(newTo - newPos);
      }
      return { mapped: value.length ? new _Chunk(from, to, value, maxPoint) : null, pos: newPos };
    }
  };
  var RangeSet = class _RangeSet {
    constructor(chunkPos, chunk, nextLayer, maxPoint) {
      this.chunkPos = chunkPos;
      this.chunk = chunk;
      this.nextLayer = nextLayer;
      this.maxPoint = maxPoint;
    }
    /**
    @internal
    */
    static create(chunkPos, chunk, nextLayer, maxPoint) {
      return new _RangeSet(chunkPos, chunk, nextLayer, maxPoint);
    }
    /**
    @internal
    */
    get length() {
      let last = this.chunk.length - 1;
      return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
    }
    /**
    The number of ranges in the set.
    */
    get size() {
      if (this.isEmpty)
        return 0;
      let size = this.nextLayer.size;
      for (let chunk of this.chunk)
        size += chunk.value.length;
      return size;
    }
    /**
    @internal
    */
    chunkEnd(index) {
      return this.chunkPos[index] + this.chunk[index].length;
    }
    /**
    Update the range set, optionally adding new ranges or filtering
    out existing ones.
    
    (Note: The type parameter is just there as a kludge to work
    around TypeScript variance issues that prevented `RangeSet<X>`
    from being a subtype of `RangeSet<Y>` when `X` is a subtype of
    `Y`.)
    */
    update(updateSpec) {
      let { add: add2 = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
      let filter = updateSpec.filter;
      if (add2.length == 0 && !filter)
        return this;
      if (sort)
        add2 = add2.slice().sort(cmpRange);
      if (this.isEmpty)
        return add2.length ? _RangeSet.of(add2) : this;
      let cur = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
      let builder = new RangeSetBuilder();
      while (cur.value || i < add2.length) {
        if (i < add2.length && (cur.from - add2[i].from || cur.startSide - add2[i].value.startSide) >= 0) {
          let range2 = add2[i++];
          if (!builder.addInner(range2.from, range2.to, range2.value))
            spill.push(range2);
        } else if (cur.rangeIndex == 1 && cur.chunkIndex < this.chunk.length && (i == add2.length || this.chunkEnd(cur.chunkIndex) < add2[i].from) && (!filter || filterFrom > this.chunkEnd(cur.chunkIndex) || filterTo < this.chunkPos[cur.chunkIndex]) && builder.addChunk(this.chunkPos[cur.chunkIndex], this.chunk[cur.chunkIndex])) {
          cur.nextChunk();
        } else {
          if (!filter || filterFrom > cur.to || filterTo < cur.from || filter(cur.from, cur.to, cur.value)) {
            if (!builder.addInner(cur.from, cur.to, cur.value))
              spill.push(Range.create(cur.from, cur.to, cur.value));
          }
          cur.next();
        }
      }
      return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? _RangeSet.empty : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
    }
    /**
    Map this range set through a set of changes, return the new set.
    */
    map(changes) {
      if (changes.empty || this.isEmpty)
        return this;
      let chunks = [], chunkPos = [], maxPoint = -1;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        let touch = changes.touchesRange(start, start + chunk.length);
        if (touch === false) {
          maxPoint = Math.max(maxPoint, chunk.maxPoint);
          chunks.push(chunk);
          chunkPos.push(changes.mapPos(start));
        } else if (touch === true) {
          let { mapped, pos } = chunk.map(start, changes);
          if (mapped) {
            maxPoint = Math.max(maxPoint, mapped.maxPoint);
            chunks.push(mapped);
            chunkPos.push(pos);
          }
        }
      }
      let next = this.nextLayer.map(changes);
      return chunks.length == 0 ? next : new _RangeSet(chunkPos, chunks, next || _RangeSet.empty, maxPoint);
    }
    /**
    Iterate over the ranges that touch the region `from` to `to`,
    calling `f` for each. There is no guarantee that the ranges will
    be reported in any specific order. When the callback returns
    `false`, iteration stops.
    */
    between(from, to, f) {
      if (this.isEmpty)
        return;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
          return;
      }
      this.nextLayer.between(from, to, f);
    }
    /**
    Iterate over the ranges in this set, in order, including all
    ranges that end at or after `from`.
    */
    iter(from = 0) {
      return HeapCursor.from([this]).goto(from);
    }
    /**
    @internal
    */
    get isEmpty() {
      return this.nextLayer == this;
    }
    /**
    Iterate over the ranges in a collection of sets, in order,
    starting from `from`.
    */
    static iter(sets, from = 0) {
      return HeapCursor.from(sets).goto(from);
    }
    /**
    Iterate over two groups of sets, calling methods on `comparator`
    to notify it of possible differences.
    */
    static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
      let a = oldSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
      let b = newSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
      let sharedChunks = findSharedChunks(a, b, textDiff);
      let sideA = new SpanCursor(a, sharedChunks, minPointSize);
      let sideB = new SpanCursor(b, sharedChunks, minPointSize);
      textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
      if (textDiff.empty && textDiff.length == 0)
        compare(sideA, 0, sideB, 0, 0, comparator);
    }
    /**
    Compare the contents of two groups of range sets, returning true
    if they are equivalent in the given range.
    */
    static eq(oldSets, newSets, from = 0, to) {
      if (to == null)
        to = 1e9 - 1;
      let a = oldSets.filter((set) => !set.isEmpty && newSets.indexOf(set) < 0);
      let b = newSets.filter((set) => !set.isEmpty && oldSets.indexOf(set) < 0);
      if (a.length != b.length)
        return false;
      if (!a.length)
        return true;
      let sharedChunks = findSharedChunks(a, b);
      let sideA = new SpanCursor(a, sharedChunks, 0).goto(from), sideB = new SpanCursor(b, sharedChunks, 0).goto(from);
      for (; ; ) {
        if (sideA.to != sideB.to || !sameValues(sideA.active, sideB.active) || sideA.point && (!sideB.point || !sideA.point.eq(sideB.point)))
          return false;
        if (sideA.to > to)
          return true;
        sideA.next();
        sideB.next();
      }
    }
    /**
    Iterate over a group of range sets at the same time, notifying
    the iterator about the ranges covering every given piece of
    content. Returns the open count (see
    [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
    of the iteration.
    */
    static spans(sets, from, to, iterator, minPointSize = -1) {
      let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
      let openRanges = cursor.openStart;
      for (; ; ) {
        let curTo = Math.min(cursor.to, to);
        if (cursor.point) {
          let active = cursor.activeForPoint(cursor.to);
          let openCount = cursor.pointFrom < from ? active.length + 1 : Math.min(active.length, openRanges);
          iterator.point(pos, curTo, cursor.point, active, openCount, cursor.pointRank);
          openRanges = Math.min(cursor.openEnd(curTo), active.length);
        } else if (curTo > pos) {
          iterator.span(pos, curTo, cursor.active, openRanges);
          openRanges = cursor.openEnd(curTo);
        }
        if (cursor.to > to)
          return openRanges + (cursor.point && cursor.to > to ? 1 : 0);
        pos = cursor.to;
        cursor.next();
      }
    }
    /**
    Create a range set for the given range or array of ranges. By
    default, this expects the ranges to be _sorted_ (by start
    position and, if two start at the same position,
    `value.startSide`). You can pass `true` as second argument to
    cause the method to sort them.
    */
    static of(ranges, sort = false) {
      let build = new RangeSetBuilder();
      for (let range2 of ranges instanceof Range ? [ranges] : sort ? lazySort(ranges) : ranges)
        build.add(range2.from, range2.to, range2.value);
      return build.finish();
    }
  };
  RangeSet.empty = /* @__PURE__ */ new RangeSet([], [], null, -1);
  function lazySort(ranges) {
    if (ranges.length > 1)
      for (let prev = ranges[0], i = 1; i < ranges.length; i++) {
        let cur = ranges[i];
        if (cmpRange(prev, cur) > 0)
          return ranges.slice().sort(cmpRange);
        prev = cur;
      }
    return ranges;
  }
  RangeSet.empty.nextLayer = RangeSet.empty;
  var RangeSetBuilder = class _RangeSetBuilder {
    finishChunk(newArrays) {
      this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
      this.chunkPos.push(this.chunkStart);
      this.chunkStart = -1;
      this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
      this.maxPoint = -1;
      if (newArrays) {
        this.from = [];
        this.to = [];
        this.value = [];
      }
    }
    /**
    Create an empty builder.
    */
    constructor() {
      this.chunks = [];
      this.chunkPos = [];
      this.chunkStart = -1;
      this.last = null;
      this.lastFrom = -1e9;
      this.lastTo = -1e9;
      this.from = [];
      this.to = [];
      this.value = [];
      this.maxPoint = -1;
      this.setMaxPoint = -1;
      this.nextLayer = null;
    }
    /**
    Add a range. Ranges should be added in sorted (by `from` and
    `value.startSide`) order.
    */
    add(from, to, value) {
      if (!this.addInner(from, to, value))
        (this.nextLayer || (this.nextLayer = new _RangeSetBuilder())).add(from, to, value);
    }
    /**
    @internal
    */
    addInner(from, to, value) {
      let diff = from - this.lastTo || value.startSide - this.last.endSide;
      if (diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
        throw new Error("Ranges must be added sorted by `from` position and `startSide`");
      if (diff < 0)
        return false;
      if (this.from.length == 250)
        this.finishChunk(true);
      if (this.chunkStart < 0)
        this.chunkStart = from;
      this.from.push(from - this.chunkStart);
      this.to.push(to - this.chunkStart);
      this.last = value;
      this.lastFrom = from;
      this.lastTo = to;
      this.value.push(value);
      if (value.point)
        this.maxPoint = Math.max(this.maxPoint, to - from);
      return true;
    }
    /**
    @internal
    */
    addChunk(from, chunk) {
      if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
        return false;
      if (this.from.length)
        this.finishChunk(true);
      this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
      this.chunks.push(chunk);
      this.chunkPos.push(from);
      let last = chunk.value.length - 1;
      this.last = chunk.value[last];
      this.lastFrom = chunk.from[last] + from;
      this.lastTo = chunk.to[last] + from;
      return true;
    }
    /**
    Finish the range set. Returns the new set. The builder can't be
    used anymore after this has been called.
    */
    finish() {
      return this.finishInner(RangeSet.empty);
    }
    /**
    @internal
    */
    finishInner(next) {
      if (this.from.length)
        this.finishChunk(false);
      if (this.chunks.length == 0)
        return next;
      let result = RangeSet.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
      this.from = null;
      return result;
    }
  };
  function findSharedChunks(a, b, textDiff) {
    let inA = /* @__PURE__ */ new Map();
    for (let set of a)
      for (let i = 0; i < set.chunk.length; i++)
        if (set.chunk[i].maxPoint <= 0)
          inA.set(set.chunk[i], set.chunkPos[i]);
    let shared = /* @__PURE__ */ new Set();
    for (let set of b)
      for (let i = 0; i < set.chunk.length; i++) {
        let known = inA.get(set.chunk[i]);
        if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set.chunkPos[i] && !(textDiff === null || textDiff === void 0 ? void 0 : textDiff.touchesRange(known, known + set.chunk[i].length)))
          shared.add(set.chunk[i]);
      }
    return shared;
  }
  var LayerCursor = class {
    constructor(layer, skip, minPoint, rank = 0) {
      this.layer = layer;
      this.skip = skip;
      this.minPoint = minPoint;
      this.rank = rank;
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    get endSide() {
      return this.value ? this.value.endSide : 0;
    }
    goto(pos, side = -1e9) {
      this.chunkIndex = this.rangeIndex = 0;
      this.gotoInner(pos, side, false);
      return this;
    }
    gotoInner(pos, side, forward) {
      while (this.chunkIndex < this.layer.chunk.length) {
        let next = this.layer.chunk[this.chunkIndex];
        if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
          break;
        this.chunkIndex++;
        forward = false;
      }
      if (this.chunkIndex < this.layer.chunk.length) {
        let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
        if (!forward || this.rangeIndex < rangeIndex)
          this.setRangeIndex(rangeIndex);
      }
      this.next();
    }
    forward(pos, side) {
      if ((this.to - pos || this.endSide - side) < 0)
        this.gotoInner(pos, side, true);
    }
    next() {
      for (; ; ) {
        if (this.chunkIndex == this.layer.chunk.length) {
          this.from = this.to = 1e9;
          this.value = null;
          break;
        } else {
          let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
          let from = chunkPos + chunk.from[this.rangeIndex];
          this.from = from;
          this.to = chunkPos + chunk.to[this.rangeIndex];
          this.value = chunk.value[this.rangeIndex];
          this.setRangeIndex(this.rangeIndex + 1);
          if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
            break;
        }
      }
    }
    setRangeIndex(index) {
      if (index == this.layer.chunk[this.chunkIndex].value.length) {
        this.chunkIndex++;
        if (this.skip) {
          while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
            this.chunkIndex++;
        }
        this.rangeIndex = 0;
      } else {
        this.rangeIndex = index;
      }
    }
    nextChunk() {
      this.chunkIndex++;
      this.rangeIndex = 0;
      this.next();
    }
    compare(other) {
      return this.from - other.from || this.startSide - other.startSide || this.rank - other.rank || this.to - other.to || this.endSide - other.endSide;
    }
  };
  var HeapCursor = class _HeapCursor {
    constructor(heap) {
      this.heap = heap;
    }
    static from(sets, skip = null, minPoint = -1) {
      let heap = [];
      for (let i = 0; i < sets.length; i++) {
        for (let cur = sets[i]; !cur.isEmpty; cur = cur.nextLayer) {
          if (cur.maxPoint >= minPoint)
            heap.push(new LayerCursor(cur, skip, minPoint, i));
        }
      }
      return heap.length == 1 ? heap[0] : new _HeapCursor(heap);
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    goto(pos, side = -1e9) {
      for (let cur of this.heap)
        cur.goto(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      this.next();
      return this;
    }
    forward(pos, side) {
      for (let cur of this.heap)
        cur.forward(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      if ((this.to - pos || this.value.endSide - side) < 0)
        this.next();
    }
    next() {
      if (this.heap.length == 0) {
        this.from = this.to = 1e9;
        this.value = null;
        this.rank = -1;
      } else {
        let top2 = this.heap[0];
        this.from = top2.from;
        this.to = top2.to;
        this.value = top2.value;
        this.rank = top2.rank;
        if (top2.value)
          top2.next();
        heapBubble(this.heap, 0);
      }
    }
  };
  function heapBubble(heap, index) {
    for (let cur = heap[index]; ; ) {
      let childIndex = (index << 1) + 1;
      if (childIndex >= heap.length)
        break;
      let child = heap[childIndex];
      if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
        child = heap[childIndex + 1];
        childIndex++;
      }
      if (cur.compare(child) < 0)
        break;
      heap[childIndex] = cur;
      heap[index] = child;
      index = childIndex;
    }
  }
  var SpanCursor = class {
    constructor(sets, skip, minPoint) {
      this.minPoint = minPoint;
      this.active = [];
      this.activeTo = [];
      this.activeRank = [];
      this.minActive = -1;
      this.point = null;
      this.pointFrom = 0;
      this.pointRank = 0;
      this.to = -1e9;
      this.endSide = 0;
      this.openStart = -1;
      this.cursor = HeapCursor.from(sets, skip, minPoint);
    }
    goto(pos, side = -1e9) {
      this.cursor.goto(pos, side);
      this.active.length = this.activeTo.length = this.activeRank.length = 0;
      this.minActive = -1;
      this.to = pos;
      this.endSide = side;
      this.openStart = -1;
      this.next();
      return this;
    }
    forward(pos, side) {
      while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
        this.removeActive(this.minActive);
      this.cursor.forward(pos, side);
    }
    removeActive(index) {
      remove(this.active, index);
      remove(this.activeTo, index);
      remove(this.activeRank, index);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    addActive(trackOpen) {
      let i = 0, { value, to, rank } = this.cursor;
      while (i < this.activeRank.length && this.activeRank[i] <= rank)
        i++;
      insert2(this.active, i, value);
      insert2(this.activeTo, i, to);
      insert2(this.activeRank, i, rank);
      if (trackOpen)
        insert2(trackOpen, i, this.cursor.from);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    // After calling this, if `this.point` != null, the next range is a
    // point. Otherwise, it's a regular range, covered by `this.active`.
    next() {
      let from = this.to, wasPoint = this.point;
      this.point = null;
      let trackOpen = this.openStart < 0 ? [] : null;
      for (; ; ) {
        let a = this.minActive;
        if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
          if (this.activeTo[a] > from) {
            this.to = this.activeTo[a];
            this.endSide = this.active[a].endSide;
            break;
          }
          this.removeActive(a);
          if (trackOpen)
            remove(trackOpen, a);
        } else if (!this.cursor.value) {
          this.to = this.endSide = 1e9;
          break;
        } else if (this.cursor.from > from) {
          this.to = this.cursor.from;
          this.endSide = this.cursor.startSide;
          break;
        } else {
          let nextVal = this.cursor.value;
          if (!nextVal.point) {
            this.addActive(trackOpen);
            this.cursor.next();
          } else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to) {
            this.cursor.next();
          } else {
            this.point = nextVal;
            this.pointFrom = this.cursor.from;
            this.pointRank = this.cursor.rank;
            this.to = this.cursor.to;
            this.endSide = nextVal.endSide;
            this.cursor.next();
            this.forward(this.to, this.endSide);
            break;
          }
        }
      }
      if (trackOpen) {
        this.openStart = 0;
        for (let i = trackOpen.length - 1; i >= 0 && trackOpen[i] < from; i--)
          this.openStart++;
      }
    }
    activeForPoint(to) {
      if (!this.active.length)
        return this.active;
      let active = [];
      for (let i = this.active.length - 1; i >= 0; i--) {
        if (this.activeRank[i] < this.pointRank)
          break;
        if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide >= this.point.endSide)
          active.push(this.active[i]);
      }
      return active.reverse();
    }
    openEnd(to) {
      let open = 0;
      for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > to; i--)
        open++;
      return open;
    }
  };
  function compare(a, startA, b, startB, length, comparator) {
    a.goto(startA);
    b.goto(startB);
    let endB = startB + length;
    let pos = startB, dPos = startB - startA;
    for (; ; ) {
      let diff = a.to + dPos - b.to || a.endSide - b.endSide;
      let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
      if (a.point || b.point) {
        if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point)) && sameValues(a.activeForPoint(a.to), b.activeForPoint(b.to))))
          comparator.comparePoint(pos, clipEnd, a.point, b.point);
      } else {
        if (clipEnd > pos && !sameValues(a.active, b.active))
          comparator.compareRange(pos, clipEnd, a.active, b.active);
      }
      if (end > endB)
        break;
      pos = end;
      if (diff <= 0)
        a.next();
      if (diff >= 0)
        b.next();
    }
  }
  function sameValues(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (a[i] != b[i] && !a[i].eq(b[i]))
        return false;
    return true;
  }
  function remove(array, index) {
    for (let i = index, e = array.length - 1; i < e; i++)
      array[i] = array[i + 1];
    array.pop();
  }
  function insert2(array, index, value) {
    for (let i = array.length - 1; i >= index; i--)
      array[i + 1] = array[i];
    array[index] = value;
  }
  function findMinIndex(value, array) {
    let found = -1, foundPos = 1e9;
    for (let i = 0; i < array.length; i++)
      if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
        found = i;
        foundPos = array[i];
      }
    return found;
  }
  function countColumn(string2, tabSize, to = string2.length) {
    let n = 0;
    for (let i = 0; i < to; ) {
      if (string2.charCodeAt(i) == 9) {
        n += tabSize - n % tabSize;
        i++;
      } else {
        n++;
        i = findClusterBreak(string2, i);
      }
    }
    return n;
  }
  function findColumn(string2, col, tabSize, strict) {
    for (let i = 0, n = 0; ; ) {
      if (n >= col)
        return i;
      if (i == string2.length)
        break;
      n += string2.charCodeAt(i) == 9 ? tabSize - n % tabSize : 1;
      i = findClusterBreak(string2, i);
    }
    return strict === true ? -1 : string2.length;
  }

  // node_modules/style-mod/src/style-mod.js
  var C = "\u037C";
  var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
  var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
  var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
  var StyleModule = class {
    // :: (Object<Style>, ?{finish: ?(string) → string})
    // Create a style module from the given spec.
    //
    // When `finish` is given, it is called on regular (non-`@`)
    // selectors (after `&` expansion) to compute the final selector.
    constructor(spec, options) {
      this.rules = [];
      let { finish } = options || {};
      function splitSelector(selector) {
        return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
      }
      function render2(selectors, spec2, target, isKeyframes) {
        let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
        if (isAt && spec2 == null)
          return target.push(selectors[0] + ";");
        for (let prop in spec2) {
          let value = spec2[prop];
          if (/&/.test(prop)) {
            render2(
              prop.split(/,\s*/).map((part) => selectors.map((sel) => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)),
              value,
              target
            );
          } else if (value && typeof value == "object") {
            if (!isAt)
              throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
            render2(splitSelector(prop), value, local, keyframes);
          } else if (value != null) {
            local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value + ";");
          }
        }
        if (local.length || keyframes) {
          target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
        }
      }
      for (let prop in spec)
        render2(splitSelector(prop), spec[prop], this.rules);
    }
    // :: () → string
    // Returns a string containing the module's CSS rules.
    getRules() {
      return this.rules.join("\n");
    }
    // :: () → string
    // Generate a new unique CSS class name.
    static newName() {
      let id = top[COUNT] || 1;
      top[COUNT] = id + 1;
      return C + id.toString(36);
    }
    // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
    //
    // Mount the given set of modules in the given DOM root, which ensures
    // that the CSS rules defined by the module are available in that
    // context.
    //
    // Rules are only added to the document once per root.
    //
    // Rule order will follow the order of the modules, so that rules from
    // modules later in the array take precedence of those from earlier
    // modules. If you call this function multiple times for the same root
    // in a way that changes the order of already mounted modules, the old
    // order will be changed.
    //
    // If a Content Security Policy nonce is provided, it is added to
    // the `<style>` tag generated by the library.
    static mount(root2, modules, options) {
      let set = root2[SET], nonce = options && options.nonce;
      if (!set)
        set = new StyleSet(root2, nonce);
      else if (nonce)
        set.setNonce(nonce);
      set.mount(Array.isArray(modules) ? modules : [modules]);
    }
  };
  var adoptedSet = /* @__PURE__ */ new Map();
  var StyleSet = class {
    constructor(root2, nonce) {
      let doc2 = root2.ownerDocument || root2, win = doc2.defaultView;
      if (!root2.head && root2.adoptedStyleSheets && win.CSSStyleSheet) {
        let adopted = adoptedSet.get(doc2);
        if (adopted) {
          root2.adoptedStyleSheets = [adopted.sheet, ...root2.adoptedStyleSheets];
          return root2[SET] = adopted;
        }
        this.sheet = new win.CSSStyleSheet();
        root2.adoptedStyleSheets = [this.sheet, ...root2.adoptedStyleSheets];
        adoptedSet.set(doc2, this);
      } else {
        this.styleTag = doc2.createElement("style");
        if (nonce)
          this.styleTag.setAttribute("nonce", nonce);
        let target = root2.head || root2;
        target.insertBefore(this.styleTag, target.firstChild);
      }
      this.modules = [];
      root2[SET] = this;
    }
    mount(modules) {
      let sheet = this.sheet;
      let pos = 0, j = 0;
      for (let i = 0; i < modules.length; i++) {
        let mod = modules[i], index = this.modules.indexOf(mod);
        if (index < j && index > -1) {
          this.modules.splice(index, 1);
          j--;
          index = -1;
        }
        if (index == -1) {
          this.modules.splice(j++, 0, mod);
          if (sheet)
            for (let k = 0; k < mod.rules.length; k++)
              sheet.insertRule(mod.rules[k], pos++);
        } else {
          while (j < index)
            pos += this.modules[j++].rules.length;
          pos += mod.rules.length;
          j++;
        }
      }
      if (!sheet) {
        let text = "";
        for (let i = 0; i < this.modules.length; i++)
          text += this.modules[i].getRules() + "\n";
        this.styleTag.textContent = text;
      }
    }
    setNonce(nonce) {
      if (this.styleTag && this.styleTag.getAttribute("nonce") != nonce)
        this.styleTag.setAttribute("nonce", nonce);
    }
  };

  // node_modules/w3c-keyname/index.js
  var base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'"
  };
  var shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: '"'
  };
  var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  for (i = 0; i < 10; i++)
    base[48 + i] = base[96 + i] = String(i);
  var i;
  for (i = 1; i <= 24; i++)
    base[i + 111] = "F" + i;
  var i;
  for (i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
  }
  var i;
  for (code in base)
    if (!shift.hasOwnProperty(code))
      shift[code] = base[code];
  var code;
  function keyName(event) {
    var ignoreKey = mac && event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey || ie && event.shiftKey && event.key && event.key.length == 1 || event.key == "Unidentified";
    var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    if (name2 == "Esc")
      name2 = "Escape";
    if (name2 == "Del")
      name2 = "Delete";
    if (name2 == "Left")
      name2 = "ArrowLeft";
    if (name2 == "Up")
      name2 = "ArrowUp";
    if (name2 == "Right")
      name2 = "ArrowRight";
    if (name2 == "Down")
      name2 = "ArrowDown";
    return name2;
  }

  // node_modules/@codemirror/view/dist/index.js
  function getSelection(root2) {
    let target;
    if (root2.nodeType == 11) {
      target = root2.getSelection ? root2 : root2.ownerDocument;
    } else {
      target = root2;
    }
    return target.getSelection();
  }
  function contains(dom, node) {
    return node ? dom == node || dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
  }
  function deepActiveElement(doc2) {
    let elt = doc2.activeElement;
    while (elt && elt.shadowRoot)
      elt = elt.shadowRoot.activeElement;
    return elt;
  }
  function hasSelection(dom, selection) {
    if (!selection.anchorNode)
      return false;
    try {
      return contains(dom, selection.anchorNode);
    } catch (_) {
      return false;
    }
  }
  function clientRectsFor(dom) {
    if (dom.nodeType == 3)
      return textRange(dom, 0, dom.nodeValue.length).getClientRects();
    else if (dom.nodeType == 1)
      return dom.getClientRects();
    else
      return [];
  }
  function isEquivalentPosition(node, off, targetNode, targetOff) {
    return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
  }
  function domIndex(node) {
    for (var index = 0; ; index++) {
      node = node.previousSibling;
      if (!node)
        return index;
    }
  }
  function scanFor(node, off, targetNode, targetOff, dir) {
    for (; ; ) {
      if (node == targetNode && off == targetOff)
        return true;
      if (off == (dir < 0 ? 0 : maxOffset(node))) {
        if (node.nodeName == "DIV")
          return false;
        let parent = node.parentNode;
        if (!parent || parent.nodeType != 1)
          return false;
        off = domIndex(node) + (dir < 0 ? 0 : 1);
        node = parent;
      } else if (node.nodeType == 1) {
        node = node.childNodes[off + (dir < 0 ? -1 : 0)];
        if (node.nodeType == 1 && node.contentEditable == "false")
          return false;
        off = dir < 0 ? maxOffset(node) : 0;
      } else {
        return false;
      }
    }
  }
  function maxOffset(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
  }
  function flattenRect(rect, left) {
    let x = left ? rect.left : rect.right;
    return { left: x, right: x, top: rect.top, bottom: rect.bottom };
  }
  function windowRect(win) {
    return {
      left: 0,
      right: win.innerWidth,
      top: 0,
      bottom: win.innerHeight
    };
  }
  function scrollRectIntoView(dom, rect, side, x, y, xMargin, yMargin, ltr) {
    let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
    for (let cur = dom, stop = false; cur && !stop; ) {
      if (cur.nodeType == 1) {
        let bounding, top2 = cur == doc2.body;
        let scaleX = 1, scaleY = 1;
        if (top2) {
          bounding = windowRect(win);
        } else {
          if (/^(fixed|sticky)$/.test(getComputedStyle(cur).position))
            stop = true;
          if (cur.scrollHeight <= cur.clientHeight && cur.scrollWidth <= cur.clientWidth) {
            cur = cur.assignedSlot || cur.parentNode;
            continue;
          }
          let rect2 = cur.getBoundingClientRect();
          scaleX = rect2.width / cur.offsetWidth;
          scaleY = rect2.height / cur.offsetHeight;
          bounding = {
            left: rect2.left,
            right: rect2.left + cur.clientWidth * scaleX,
            top: rect2.top,
            bottom: rect2.top + cur.clientHeight * scaleY
          };
        }
        let moveX = 0, moveY = 0;
        if (y == "nearest") {
          if (rect.top < bounding.top) {
            moveY = -(bounding.top - rect.top + yMargin);
            if (side > 0 && rect.bottom > bounding.bottom + moveY)
              moveY = rect.bottom - bounding.bottom + moveY + yMargin;
          } else if (rect.bottom > bounding.bottom) {
            moveY = rect.bottom - bounding.bottom + yMargin;
            if (side < 0 && rect.top - moveY < bounding.top)
              moveY = -(bounding.top + moveY - rect.top + yMargin);
          }
        } else {
          let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
          let targetTop = y == "center" && rectHeight <= boundingHeight ? rect.top + rectHeight / 2 - boundingHeight / 2 : y == "start" || y == "center" && side < 0 ? rect.top - yMargin : rect.bottom - boundingHeight + yMargin;
          moveY = targetTop - bounding.top;
        }
        if (x == "nearest") {
          if (rect.left < bounding.left) {
            moveX = -(bounding.left - rect.left + xMargin);
            if (side > 0 && rect.right > bounding.right + moveX)
              moveX = rect.right - bounding.right + moveX + xMargin;
          } else if (rect.right > bounding.right) {
            moveX = rect.right - bounding.right + xMargin;
            if (side < 0 && rect.left < bounding.left + moveX)
              moveX = -(bounding.left + moveX - rect.left + xMargin);
          }
        } else {
          let targetLeft = x == "center" ? rect.left + (rect.right - rect.left) / 2 - (bounding.right - bounding.left) / 2 : x == "start" == ltr ? rect.left - xMargin : rect.right - (bounding.right - bounding.left) + xMargin;
          moveX = targetLeft - bounding.left;
        }
        if (moveX || moveY) {
          if (top2) {
            win.scrollBy(moveX, moveY);
          } else {
            let movedX = 0, movedY = 0;
            if (moveY) {
              let start = cur.scrollTop;
              cur.scrollTop += moveY / scaleY;
              movedY = (cur.scrollTop - start) * scaleY;
            }
            if (moveX) {
              let start = cur.scrollLeft;
              cur.scrollLeft += moveX / scaleX;
              movedX = (cur.scrollLeft - start) * scaleX;
            }
            rect = {
              left: rect.left - movedX,
              top: rect.top - movedY,
              right: rect.right - movedX,
              bottom: rect.bottom - movedY
            };
            if (movedX && Math.abs(movedX - moveX) < 1)
              x = "nearest";
            if (movedY && Math.abs(movedY - moveY) < 1)
              y = "nearest";
          }
        }
        if (top2)
          break;
        cur = cur.assignedSlot || cur.parentNode;
      } else if (cur.nodeType == 11) {
        cur = cur.host;
      } else {
        break;
      }
    }
  }
  function scrollableParent(dom) {
    let doc2 = dom.ownerDocument;
    for (let cur = dom.parentNode; cur; ) {
      if (cur == doc2.body) {
        break;
      } else if (cur.nodeType == 1) {
        if (cur.scrollHeight > cur.clientHeight || cur.scrollWidth > cur.clientWidth)
          return cur;
        cur = cur.assignedSlot || cur.parentNode;
      } else if (cur.nodeType == 11) {
        cur = cur.host;
      } else {
        break;
      }
    }
    return null;
  }
  var DOMSelectionState = class {
    constructor() {
      this.anchorNode = null;
      this.anchorOffset = 0;
      this.focusNode = null;
      this.focusOffset = 0;
    }
    eq(domSel) {
      return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
    }
    setRange(range2) {
      let { anchorNode, focusNode } = range2;
      this.set(anchorNode, Math.min(range2.anchorOffset, anchorNode ? maxOffset(anchorNode) : 0), focusNode, Math.min(range2.focusOffset, focusNode ? maxOffset(focusNode) : 0));
    }
    set(anchorNode, anchorOffset, focusNode, focusOffset) {
      this.anchorNode = anchorNode;
      this.anchorOffset = anchorOffset;
      this.focusNode = focusNode;
      this.focusOffset = focusOffset;
    }
  };
  var preventScrollSupported = null;
  function focusPreventScroll(dom) {
    if (dom.setActive)
      return dom.setActive();
    if (preventScrollSupported)
      return dom.focus(preventScrollSupported);
    let stack = [];
    for (let cur = dom; cur; cur = cur.parentNode) {
      stack.push(cur, cur.scrollTop, cur.scrollLeft);
      if (cur == cur.ownerDocument)
        break;
    }
    dom.focus(preventScrollSupported == null ? {
      get preventScroll() {
        preventScrollSupported = { preventScroll: true };
        return true;
      }
    } : void 0);
    if (!preventScrollSupported) {
      preventScrollSupported = false;
      for (let i = 0; i < stack.length; ) {
        let elt = stack[i++], top2 = stack[i++], left = stack[i++];
        if (elt.scrollTop != top2)
          elt.scrollTop = top2;
        if (elt.scrollLeft != left)
          elt.scrollLeft = left;
      }
    }
  }
  var scratchRange;
  function textRange(node, from, to = from) {
    let range2 = scratchRange || (scratchRange = document.createRange());
    range2.setEnd(node, to);
    range2.setStart(node, from);
    return range2;
  }
  function dispatchKey(elt, name2, code) {
    let options = { key: name2, code: name2, keyCode: code, which: code, cancelable: true };
    let down = new KeyboardEvent("keydown", options);
    down.synthetic = true;
    elt.dispatchEvent(down);
    let up = new KeyboardEvent("keyup", options);
    up.synthetic = true;
    elt.dispatchEvent(up);
    return down.defaultPrevented || up.defaultPrevented;
  }
  function getRoot(node) {
    while (node) {
      if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
        return node;
      node = node.assignedSlot || node.parentNode;
    }
    return null;
  }
  function clearAttributes(node) {
    while (node.attributes.length)
      node.removeAttributeNode(node.attributes[0]);
  }
  function atElementStart(doc2, selection) {
    let node = selection.focusNode, offset = selection.focusOffset;
    if (!node || selection.anchorNode != node || selection.anchorOffset != offset)
      return false;
    offset = Math.min(offset, maxOffset(node));
    for (; ; ) {
      if (offset) {
        if (node.nodeType != 1)
          return false;
        let prev = node.childNodes[offset - 1];
        if (prev.contentEditable == "false")
          offset--;
        else {
          node = prev;
          offset = maxOffset(node);
        }
      } else if (node == doc2) {
        return true;
      } else {
        offset = domIndex(node);
        node = node.parentNode;
      }
    }
  }
  function isScrolledToBottom(elt) {
    return elt.scrollTop > Math.max(1, elt.scrollHeight - elt.clientHeight - 4);
  }
  var DOMPos = class _DOMPos {
    constructor(node, offset, precise = true) {
      this.node = node;
      this.offset = offset;
      this.precise = precise;
    }
    static before(dom, precise) {
      return new _DOMPos(dom.parentNode, domIndex(dom), precise);
    }
    static after(dom, precise) {
      return new _DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
    }
  };
  var noChildren = [];
  var ContentView = class _ContentView {
    constructor() {
      this.parent = null;
      this.dom = null;
      this.flags = 2;
    }
    get overrideDOMText() {
      return null;
    }
    get posAtStart() {
      return this.parent ? this.parent.posBefore(this) : 0;
    }
    get posAtEnd() {
      return this.posAtStart + this.length;
    }
    posBefore(view) {
      let pos = this.posAtStart;
      for (let child of this.children) {
        if (child == view)
          return pos;
        pos += child.length + child.breakAfter;
      }
      throw new RangeError("Invalid child in posBefore");
    }
    posAfter(view) {
      return this.posBefore(view) + view.length;
    }
    sync(view, track) {
      if (this.flags & 2) {
        let parent = this.dom;
        let prev = null, next;
        for (let child of this.children) {
          if (child.flags & 7) {
            if (!child.dom && (next = prev ? prev.nextSibling : parent.firstChild)) {
              let contentView = _ContentView.get(next);
              if (!contentView || !contentView.parent && contentView.canReuseDOM(child))
                child.reuseDOM(next);
            }
            child.sync(view, track);
            child.flags &= ~7;
          }
          next = prev ? prev.nextSibling : parent.firstChild;
          if (track && !track.written && track.node == parent && next != child.dom)
            track.written = true;
          if (child.dom.parentNode == parent) {
            while (next && next != child.dom)
              next = rm$1(next);
          } else {
            parent.insertBefore(child.dom, next);
          }
          prev = child.dom;
        }
        next = prev ? prev.nextSibling : parent.firstChild;
        if (next && track && track.node == parent)
          track.written = true;
        while (next)
          next = rm$1(next);
      } else if (this.flags & 1) {
        for (let child of this.children)
          if (child.flags & 7) {
            child.sync(view, track);
            child.flags &= ~7;
          }
      }
    }
    reuseDOM(_dom) {
    }
    localPosFromDOM(node, offset) {
      let after;
      if (node == this.dom) {
        after = this.dom.childNodes[offset];
      } else {
        let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
        for (; ; ) {
          let parent = node.parentNode;
          if (parent == this.dom)
            break;
          if (bias == 0 && parent.firstChild != parent.lastChild) {
            if (node == parent.firstChild)
              bias = -1;
            else
              bias = 1;
          }
          node = parent;
        }
        if (bias < 0)
          after = node;
        else
          after = node.nextSibling;
      }
      if (after == this.dom.firstChild)
        return 0;
      while (after && !_ContentView.get(after))
        after = after.nextSibling;
      if (!after)
        return this.length;
      for (let i = 0, pos = 0; ; i++) {
        let child = this.children[i];
        if (child.dom == after)
          return pos;
        pos += child.length + child.breakAfter;
      }
    }
    domBoundsAround(from, to, offset = 0) {
      let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
      for (let i = 0, pos = offset, prevEnd = offset; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (pos < from && end > to)
          return child.domBoundsAround(from, to, pos);
        if (end >= from && fromI == -1) {
          fromI = i;
          fromStart = pos;
        }
        if (pos > to && child.dom.parentNode == this.dom) {
          toI = i;
          toEnd = prevEnd;
          break;
        }
        prevEnd = end;
        pos = end + child.breakAfter;
      }
      return {
        from: fromStart,
        to: toEnd < 0 ? offset + this.length : toEnd,
        startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild,
        endDOM: toI < this.children.length && toI >= 0 ? this.children[toI].dom : null
      };
    }
    markDirty(andParent = false) {
      this.flags |= 2;
      this.markParentsDirty(andParent);
    }
    markParentsDirty(childList) {
      for (let parent = this.parent; parent; parent = parent.parent) {
        if (childList)
          parent.flags |= 2;
        if (parent.flags & 1)
          return;
        parent.flags |= 1;
        childList = false;
      }
    }
    setParent(parent) {
      if (this.parent != parent) {
        this.parent = parent;
        if (this.flags & 7)
          this.markParentsDirty(true);
      }
    }
    setDOM(dom) {
      if (this.dom)
        this.dom.cmView = null;
      this.dom = dom;
      dom.cmView = this;
    }
    get rootView() {
      for (let v = this; ; ) {
        let parent = v.parent;
        if (!parent)
          return v;
        v = parent;
      }
    }
    replaceChildren(from, to, children2 = noChildren) {
      this.markDirty();
      for (let i = from; i < to; i++) {
        let child = this.children[i];
        if (child.parent == this)
          child.destroy();
      }
      this.children.splice(from, to - from, ...children2);
      for (let i = 0; i < children2.length; i++)
        children2[i].setParent(this);
    }
    ignoreMutation(_rec) {
      return false;
    }
    ignoreEvent(_event) {
      return false;
    }
    childCursor(pos = this.length) {
      return new ChildCursor(this.children, pos, this.children.length);
    }
    childPos(pos, bias = 1) {
      return this.childCursor().findPos(pos, bias);
    }
    toString() {
      let name2 = this.constructor.name.replace("View", "");
      return name2 + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (name2 == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
    }
    static get(node) {
      return node.cmView;
    }
    get isEditable() {
      return true;
    }
    get isWidget() {
      return false;
    }
    get isHidden() {
      return false;
    }
    merge(from, to, source, hasStart, openStart, openEnd) {
      return false;
    }
    become(other) {
      return false;
    }
    canReuseDOM(other) {
      return other.constructor == this.constructor && !((this.flags | other.flags) & 8);
    }
    // When this is a zero-length view with a side, this should return a
    // number <= 0 to indicate it is before its position, or a
    // number > 0 when after its position.
    getSide() {
      return 0;
    }
    destroy() {
      this.parent = null;
    }
  };
  ContentView.prototype.breakAfter = 0;
  function rm$1(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
  }
  var ChildCursor = class {
    constructor(children2, pos, i) {
      this.children = children2;
      this.pos = pos;
      this.i = i;
      this.off = 0;
    }
    findPos(pos, bias = 1) {
      for (; ; ) {
        if (pos > this.pos || pos == this.pos && (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
          this.off = pos - this.pos;
          return this;
        }
        let next = this.children[--this.i];
        this.pos -= next.length + next.breakAfter;
      }
    }
  };
  function replaceRange(parent, fromI, fromOff, toI, toOff, insert3, breakAtStart, openStart, openEnd) {
    let { children: children2 } = parent;
    let before = children2.length ? children2[fromI] : null;
    let last = insert3.length ? insert3[insert3.length - 1] : null;
    let breakAtEnd = last ? last.breakAfter : breakAtStart;
    if (fromI == toI && before && !breakAtStart && !breakAtEnd && insert3.length < 2 && before.merge(fromOff, toOff, insert3.length ? last : null, fromOff == 0, openStart, openEnd))
      return;
    if (toI < children2.length) {
      let after = children2[toI];
      if (after && toOff < after.length) {
        if (fromI == toI) {
          after = after.split(toOff);
          toOff = 0;
        }
        if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
          insert3[insert3.length - 1] = after;
        } else {
          if (toOff)
            after.merge(0, toOff, null, false, 0, openEnd);
          insert3.push(after);
        }
      } else if (after === null || after === void 0 ? void 0 : after.breakAfter) {
        if (last)
          last.breakAfter = 1;
        else
          breakAtStart = 1;
      }
      toI++;
    }
    if (before) {
      before.breakAfter = breakAtStart;
      if (fromOff > 0) {
        if (!breakAtStart && insert3.length && before.merge(fromOff, before.length, insert3[0], false, openStart, 0)) {
          before.breakAfter = insert3.shift().breakAfter;
        } else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
          before.merge(fromOff, before.length, null, false, openStart, 0);
        }
        fromI++;
      }
    }
    while (fromI < toI && insert3.length) {
      if (children2[toI - 1].become(insert3[insert3.length - 1])) {
        toI--;
        insert3.pop();
        openEnd = insert3.length ? 0 : openStart;
      } else if (children2[fromI].become(insert3[0])) {
        fromI++;
        insert3.shift();
        openStart = insert3.length ? 0 : openEnd;
      } else {
        break;
      }
    }
    if (!insert3.length && fromI && toI < children2.length && !children2[fromI - 1].breakAfter && children2[toI].merge(0, 0, children2[fromI - 1], false, openStart, openEnd))
      fromI--;
    if (fromI < toI || insert3.length)
      parent.replaceChildren(fromI, toI, insert3);
  }
  function mergeChildrenInto(parent, from, to, insert3, openStart, openEnd) {
    let cur = parent.childCursor();
    let { i: toI, off: toOff } = cur.findPos(to, 1);
    let { i: fromI, off: fromOff } = cur.findPos(from, -1);
    let dLen = from - to;
    for (let view of insert3)
      dLen += view.length;
    parent.length += dLen;
    replaceRange(parent, fromI, fromOff, toI, toOff, insert3, 0, openStart, openEnd);
  }
  var LineBreakPlaceholder = "\uFFFF";
  var DOMReader = class {
    constructor(points, state) {
      this.points = points;
      this.text = "";
      this.lineSeparator = state.facet(EditorState.lineSeparator);
    }
    append(text) {
      this.text += text;
    }
    lineBreak() {
      this.text += LineBreakPlaceholder;
    }
    readRange(start, end) {
      if (!start)
        return this;
      let parent = start.parentNode;
      for (let cur = start; ; ) {
        this.findPointBefore(parent, cur);
        let oldLen = this.text.length;
        this.readNode(cur);
        let next = cur.nextSibling;
        if (next == end)
          break;
        let view = ContentView.get(cur), nextView = ContentView.get(next);
        if (view && nextView ? view.breakAfter : (view ? view.breakAfter : isBlockElement(cur)) || isBlockElement(next) && (cur.nodeName != "BR" || cur.cmIgnore) && this.text.length > oldLen)
          this.lineBreak();
        cur = next;
      }
      this.findPointBefore(parent, end);
      return this;
    }
    readTextNode(node) {
      let text = node.nodeValue;
      for (let point of this.points)
        if (point.node == node)
          point.pos = this.text.length + Math.min(point.offset, text.length);
      for (let off = 0, re = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
        let nextBreak = -1, breakSize = 1, m;
        if (this.lineSeparator) {
          nextBreak = text.indexOf(this.lineSeparator, off);
          breakSize = this.lineSeparator.length;
        } else if (m = re.exec(text)) {
          nextBreak = m.index;
          breakSize = m[0].length;
        }
        this.append(text.slice(off, nextBreak < 0 ? text.length : nextBreak));
        if (nextBreak < 0)
          break;
        this.lineBreak();
        if (breakSize > 1) {
          for (let point of this.points)
            if (point.node == node && point.pos > this.text.length)
              point.pos -= breakSize - 1;
        }
        off = nextBreak + breakSize;
      }
    }
    readNode(node) {
      if (node.cmIgnore)
        return;
      let view = ContentView.get(node);
      let fromView = view && view.overrideDOMText;
      if (fromView != null) {
        this.findPointInside(node, fromView.length);
        for (let i = fromView.iter(); !i.next().done; ) {
          if (i.lineBreak)
            this.lineBreak();
          else
            this.append(i.value);
        }
      } else if (node.nodeType == 3) {
        this.readTextNode(node);
      } else if (node.nodeName == "BR") {
        if (node.nextSibling)
          this.lineBreak();
      } else if (node.nodeType == 1) {
        this.readRange(node.firstChild, null);
      }
    }
    findPointBefore(node, next) {
      for (let point of this.points)
        if (point.node == node && node.childNodes[point.offset] == next)
          point.pos = this.text.length;
    }
    findPointInside(node, maxLen) {
      for (let point of this.points)
        if (node.nodeType == 3 ? point.node == node : node.contains(point.node))
          point.pos = this.text.length + Math.min(maxLen, point.offset);
    }
  };
  function isBlockElement(node) {
    return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
  }
  var DOMPoint = class {
    constructor(node, offset) {
      this.node = node;
      this.offset = offset;
      this.pos = -1;
    }
  };
  var nav = typeof navigator != "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
  var doc = typeof document != "undefined" ? document : { documentElement: { style: {} } };
  var ie_edge = /* @__PURE__ */ /Edge\/(\d+)/.exec(nav.userAgent);
  var ie_upto10 = /* @__PURE__ */ /MSIE \d/.test(nav.userAgent);
  var ie_11up = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
  var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
  var gecko = !ie2 && /* @__PURE__ */ /gecko\/(\d+)/i.test(nav.userAgent);
  var chrome = !ie2 && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nav.userAgent);
  var webkit = "webkitFontSmoothing" in doc.documentElement.style;
  var safari = !ie2 && /* @__PURE__ */ /Apple Computer/.test(nav.vendor);
  var ios = safari && (/* @__PURE__ */ /Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
  var browser = {
    mac: ios || /* @__PURE__ */ /Mac/.test(nav.platform),
    windows: /* @__PURE__ */ /Win/.test(nav.platform),
    linux: /* @__PURE__ */ /Linux|X11/.test(nav.platform),
    ie: ie2,
    ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
    gecko,
    gecko_version: gecko ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    chrome: !!chrome,
    chrome_version: chrome ? +chrome[1] : 0,
    ios,
    android: /* @__PURE__ */ /Android\b/.test(nav.userAgent),
    webkit,
    safari,
    webkit_version: webkit ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
    tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
  };
  var MaxJoinLen = 256;
  var TextView = class _TextView extends ContentView {
    constructor(text) {
      super();
      this.text = text;
    }
    get length() {
      return this.text.length;
    }
    createDOM(textDOM) {
      this.setDOM(textDOM || document.createTextNode(this.text));
    }
    sync(view, track) {
      if (!this.dom)
        this.createDOM();
      if (this.dom.nodeValue != this.text) {
        if (track && track.node == this.dom)
          track.written = true;
        this.dom.nodeValue = this.text;
      }
    }
    reuseDOM(dom) {
      if (dom.nodeType == 3)
        this.createDOM(dom);
    }
    merge(from, to, source) {
      if (this.flags & 8 || source && (!(source instanceof _TextView) || this.length - (to - from) + source.length > MaxJoinLen || source.flags & 8))
        return false;
      this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to);
      this.markDirty();
      return true;
    }
    split(from) {
      let result = new _TextView(this.text.slice(from));
      this.text = this.text.slice(0, from);
      this.markDirty();
      result.flags |= this.flags & 8;
      return result;
    }
    localPosFromDOM(node, offset) {
      return node == this.dom ? offset : offset ? this.text.length : 0;
    }
    domAtPos(pos) {
      return new DOMPos(this.dom, pos);
    }
    domBoundsAround(_from, _to, offset) {
      return { from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
    }
    coordsAt(pos, side) {
      return textCoords(this.dom, pos, side);
    }
  };
  var MarkView = class _MarkView extends ContentView {
    constructor(mark, children2 = [], length = 0) {
      super();
      this.mark = mark;
      this.children = children2;
      this.length = length;
      for (let ch of children2)
        ch.setParent(this);
    }
    setAttrs(dom) {
      clearAttributes(dom);
      if (this.mark.class)
        dom.className = this.mark.class;
      if (this.mark.attrs)
        for (let name2 in this.mark.attrs)
          dom.setAttribute(name2, this.mark.attrs[name2]);
      return dom;
    }
    canReuseDOM(other) {
      return super.canReuseDOM(other) && !((this.flags | other.flags) & 8);
    }
    reuseDOM(node) {
      if (node.nodeName == this.mark.tagName.toUpperCase()) {
        this.setDOM(node);
        this.flags |= 4 | 2;
      }
    }
    sync(view, track) {
      if (!this.dom)
        this.setDOM(this.setAttrs(document.createElement(this.mark.tagName)));
      else if (this.flags & 4)
        this.setAttrs(this.dom);
      super.sync(view, track);
    }
    merge(from, to, source, _hasStart, openStart, openEnd) {
      if (source && (!(source instanceof _MarkView && source.mark.eq(this.mark)) || from && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      mergeChildrenInto(this, from, to, source ? source.children : [], openStart - 1, openEnd - 1);
      this.markDirty();
      return true;
    }
    split(from) {
      let result = [], off = 0, detachFrom = -1, i = 0;
      for (let elt of this.children) {
        let end = off + elt.length;
        if (end > from)
          result.push(off < from ? elt.split(from - off) : elt);
        if (detachFrom < 0 && off >= from)
          detachFrom = i;
        off = end;
        i++;
      }
      let length = this.length - from;
      this.length = from;
      if (detachFrom > -1) {
        this.children.length = detachFrom;
        this.markDirty();
      }
      return new _MarkView(this.mark, result, length);
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this, pos);
    }
    coordsAt(pos, side) {
      return coordsInChildren(this, pos, side);
    }
  };
  function textCoords(text, pos, side) {
    let length = text.nodeValue.length;
    if (pos > length)
      pos = length;
    let from = pos, to = pos, flatten2 = 0;
    if (pos == 0 && side < 0 || pos == length && side >= 0) {
      if (!(browser.chrome || browser.gecko)) {
        if (pos) {
          from--;
          flatten2 = 1;
        } else if (to < length) {
          to++;
          flatten2 = -1;
        }
      }
    } else {
      if (side < 0)
        from--;
      else if (to < length)
        to++;
    }
    let rects = textRange(text, from, to).getClientRects();
    if (!rects.length)
      return null;
    let rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
    if (browser.safari && !flatten2 && rect.width == 0)
      rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
    return flatten2 ? flattenRect(rect, flatten2 < 0) : rect || null;
  }
  var WidgetView = class _WidgetView extends ContentView {
    static create(widget, length, side) {
      return new _WidgetView(widget, length, side);
    }
    constructor(widget, length, side) {
      super();
      this.widget = widget;
      this.length = length;
      this.side = side;
      this.prevWidget = null;
    }
    split(from) {
      let result = _WidgetView.create(this.widget, this.length - from, this.side);
      this.length -= from;
      return result;
    }
    sync(view) {
      if (!this.dom || !this.widget.updateDOM(this.dom, view)) {
        if (this.dom && this.prevWidget)
          this.prevWidget.destroy(this.dom);
        this.prevWidget = null;
        this.setDOM(this.widget.toDOM(view));
        this.dom.contentEditable = "false";
      }
    }
    getSide() {
      return this.side;
    }
    merge(from, to, source, hasStart, openStart, openEnd) {
      if (source && (!(source instanceof _WidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      this.length = from + (source ? source.length : 0) + (this.length - to);
      return true;
    }
    become(other) {
      if (other instanceof _WidgetView && other.side == this.side && this.widget.constructor == other.widget.constructor) {
        if (!this.widget.compare(other.widget))
          this.markDirty(true);
        if (this.dom && !this.prevWidget)
          this.prevWidget = this.widget;
        this.widget = other.widget;
        this.length = other.length;
        return true;
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
    get overrideDOMText() {
      if (this.length == 0)
        return Text.empty;
      let top2 = this;
      while (top2.parent)
        top2 = top2.parent;
      let { view } = top2, text = view && view.state.doc, start = this.posAtStart;
      return text ? text.slice(start, start + this.length) : Text.empty;
    }
    domAtPos(pos) {
      return (this.length ? pos == 0 : this.side > 0) ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    domBoundsAround() {
      return null;
    }
    coordsAt(pos, side) {
      let custom = this.widget.coordsAt(this.dom, pos, side);
      if (custom)
        return custom;
      let rects = this.dom.getClientRects(), rect = null;
      if (!rects.length)
        return null;
      let fromBack = this.side ? this.side < 0 : pos > 0;
      for (let i = fromBack ? rects.length - 1 : 0; ; i += fromBack ? -1 : 1) {
        rect = rects[i];
        if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
          break;
      }
      return flattenRect(rect, !fromBack);
    }
    get isEditable() {
      return false;
    }
    get isWidget() {
      return true;
    }
    get isHidden() {
      return this.widget.isHidden;
    }
    destroy() {
      super.destroy();
      if (this.dom)
        this.widget.destroy(this.dom);
    }
  };
  var WidgetBufferView = class _WidgetBufferView extends ContentView {
    constructor(side) {
      super();
      this.side = side;
    }
    get length() {
      return 0;
    }
    merge() {
      return false;
    }
    become(other) {
      return other instanceof _WidgetBufferView && other.side == this.side;
    }
    split() {
      return new _WidgetBufferView(this.side);
    }
    sync() {
      if (!this.dom) {
        let dom = document.createElement("img");
        dom.className = "cm-widgetBuffer";
        dom.setAttribute("aria-hidden", "true");
        this.setDOM(dom);
      }
    }
    getSide() {
      return this.side;
    }
    domAtPos(pos) {
      return this.side > 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom);
    }
    localPosFromDOM() {
      return 0;
    }
    domBoundsAround() {
      return null;
    }
    coordsAt(pos) {
      return this.dom.getBoundingClientRect();
    }
    get overrideDOMText() {
      return Text.empty;
    }
    get isHidden() {
      return true;
    }
  };
  TextView.prototype.children = WidgetView.prototype.children = WidgetBufferView.prototype.children = noChildren;
  function inlineDOMAtPos(parent, pos) {
    let dom = parent.dom, { children: children2 } = parent, i = 0;
    for (let off = 0; i < children2.length; i++) {
      let child = children2[i], end = off + child.length;
      if (end == off && child.getSide() <= 0)
        continue;
      if (pos > off && pos < end && child.dom.parentNode == dom)
        return child.domAtPos(pos - off);
      if (pos <= off)
        break;
      off = end;
    }
    for (let j = i; j > 0; j--) {
      let prev = children2[j - 1];
      if (prev.dom.parentNode == dom)
        return prev.domAtPos(prev.length);
    }
    for (let j = i; j < children2.length; j++) {
      let next = children2[j];
      if (next.dom.parentNode == dom)
        return next.domAtPos(0);
    }
    return new DOMPos(dom, 0);
  }
  function joinInlineInto(parent, view, open) {
    let last, { children: children2 } = parent;
    if (open > 0 && view instanceof MarkView && children2.length && (last = children2[children2.length - 1]) instanceof MarkView && last.mark.eq(view.mark)) {
      joinInlineInto(last, view.children[0], open - 1);
    } else {
      children2.push(view);
      view.setParent(parent);
    }
    parent.length += view.length;
  }
  function coordsInChildren(view, pos, side) {
    let before = null, beforePos = -1, after = null, afterPos = -1;
    function scan(view2, pos2) {
      for (let i = 0, off = 0; i < view2.children.length && off <= pos2; i++) {
        let child = view2.children[i], end = off + child.length;
        if (end >= pos2) {
          if (child.children.length) {
            scan(child, pos2 - off);
          } else if ((!after || after.isHidden && side > 0) && (end > pos2 || off == end && child.getSide() > 0)) {
            after = child;
            afterPos = pos2 - off;
          } else if (off < pos2 || off == end && child.getSide() < 0 && !child.isHidden) {
            before = child;
            beforePos = pos2 - off;
          }
        }
        off = end;
      }
    }
    scan(view, pos);
    let target = (side < 0 ? before : after) || before || after;
    if (target)
      return target.coordsAt(Math.max(0, target == before ? beforePos : afterPos), side);
    return fallbackRect(view);
  }
  function fallbackRect(view) {
    let last = view.dom.lastChild;
    if (!last)
      return view.dom.getBoundingClientRect();
    let rects = clientRectsFor(last);
    return rects[rects.length - 1] || null;
  }
  function combineAttrs(source, target) {
    for (let name2 in source) {
      if (name2 == "class" && target.class)
        target.class += " " + source.class;
      else if (name2 == "style" && target.style)
        target.style += ";" + source.style;
      else
        target[name2] = source[name2];
    }
    return target;
  }
  var noAttrs = /* @__PURE__ */ Object.create(null);
  function attrsEq(a, b, ignore) {
    if (a == b)
      return true;
    if (!a)
      a = noAttrs;
    if (!b)
      b = noAttrs;
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length - (ignore && keysA.indexOf(ignore) > -1 ? 1 : 0) != keysB.length - (ignore && keysB.indexOf(ignore) > -1 ? 1 : 0))
      return false;
    for (let key of keysA) {
      if (key != ignore && (keysB.indexOf(key) == -1 || a[key] !== b[key]))
        return false;
    }
    return true;
  }
  function updateAttrs(dom, prev, attrs) {
    let changed = false;
    if (prev) {
      for (let name2 in prev)
        if (!(attrs && name2 in attrs)) {
          changed = true;
          if (name2 == "style")
            dom.style.cssText = "";
          else
            dom.removeAttribute(name2);
        }
    }
    if (attrs) {
      for (let name2 in attrs)
        if (!(prev && prev[name2] == attrs[name2])) {
          changed = true;
          if (name2 == "style")
            dom.style.cssText = attrs[name2];
          else
            dom.setAttribute(name2, attrs[name2]);
        }
    }
    return changed;
  }
  function getAttrs(dom) {
    let attrs = /* @__PURE__ */ Object.create(null);
    for (let i = 0; i < dom.attributes.length; i++) {
      let attr = dom.attributes[i];
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }
  var WidgetType = class {
    /**
    Compare this instance to another instance of the same type.
    (TypeScript can't express this, but only instances of the same
    specific class will be passed to this method.) This is used to
    avoid redrawing widgets when they are replaced by a new
    decoration of the same type. The default implementation just
    returns `false`, which will cause new instances of the widget to
    always be redrawn.
    */
    eq(widget) {
      return false;
    }
    /**
    Update a DOM element created by a widget of the same type (but
    different, non-`eq` content) to reflect this widget. May return
    true to indicate that it could update, false to indicate it
    couldn't (in which case the widget will be redrawn). The default
    implementation just returns false.
    */
    updateDOM(dom, view) {
      return false;
    }
    /**
    @internal
    */
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    /**
    The estimated height this widget will have, to be used when
    estimating the height of content that hasn't been drawn. May
    return -1 to indicate you don't know. The default implementation
    returns -1.
    */
    get estimatedHeight() {
      return -1;
    }
    /**
    For inline widgets that are displayed inline (as opposed to
    `inline-block`) and introduce line breaks (through `<br>` tags
    or textual newlines), this must indicate the amount of line
    breaks they introduce. Defaults to 0.
    */
    get lineBreaks() {
      return 0;
    }
    /**
    Can be used to configure which kinds of events inside the widget
    should be ignored by the editor. The default is to ignore all
    events.
    */
    ignoreEvent(event) {
      return true;
    }
    /**
    Override the way screen coordinates for positions at/in the
    widget are found. `pos` will be the offset into the widget, and
    `side` the side of the position that is being queried—less than
    zero for before, greater than zero for after, and zero for
    directly at that position.
    */
    coordsAt(dom, pos, side) {
      return null;
    }
    /**
    @internal
    */
    get isHidden() {
      return false;
    }
    /**
    This is called when the an instance of the widget is removed
    from the editor view.
    */
    destroy(dom) {
    }
  };
  var BlockType = /* @__PURE__ */ function(BlockType2) {
    BlockType2[BlockType2["Text"] = 0] = "Text";
    BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
    BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
    BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
    return BlockType2;
  }(BlockType || (BlockType = {}));
  var Decoration = class extends RangeValue {
    constructor(startSide, endSide, widget, spec) {
      super();
      this.startSide = startSide;
      this.endSide = endSide;
      this.widget = widget;
      this.spec = spec;
    }
    /**
    @internal
    */
    get heightRelevant() {
      return false;
    }
    /**
    Create a mark decoration, which influences the styling of the
    content in its range. Nested mark decorations will cause nested
    DOM elements to be created. Nesting order is determined by
    precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
    the higher-precedence decorations creating the inner DOM nodes.
    Such elements are split on line boundaries and on the boundaries
    of lower-precedence decorations.
    */
    static mark(spec) {
      return new MarkDecoration(spec);
    }
    /**
    Create a widget decoration, which displays a DOM element at the
    given position.
    */
    static widget(spec) {
      let side = Math.max(-1e4, Math.min(1e4, spec.side || 0)), block = !!spec.block;
      side += block && !spec.inlineOrder ? side > 0 ? 3e8 : -4e8 : side > 0 ? 1e8 : -1e8;
      return new PointDecoration(spec, side, side, block, spec.widget || null, false);
    }
    /**
    Create a replace decoration which replaces the given range with
    a widget, or simply hides it.
    */
    static replace(spec) {
      let block = !!spec.block, startSide, endSide;
      if (spec.isBlockGap) {
        startSide = -5e8;
        endSide = 4e8;
      } else {
        let { start, end } = getInclusive(spec, block);
        startSide = (start ? block ? -3e8 : -1 : 5e8) - 1;
        endSide = (end ? block ? 2e8 : 1 : -6e8) + 1;
      }
      return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    /**
    Create a line decoration, which can add DOM attributes to the
    line starting at the given position.
    */
    static line(spec) {
      return new LineDecoration(spec);
    }
    /**
    Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
    decorated range or ranges. If the ranges aren't already sorted,
    pass `true` for `sort` to make the library sort them for you.
    */
    static set(of, sort = false) {
      return RangeSet.of(of, sort);
    }
    /**
    @internal
    */
    hasHeight() {
      return this.widget ? this.widget.estimatedHeight > -1 : false;
    }
  };
  Decoration.none = RangeSet.empty;
  var MarkDecoration = class _MarkDecoration extends Decoration {
    constructor(spec) {
      let { start, end } = getInclusive(spec);
      super(start ? -1 : 5e8, end ? 1 : -6e8, null, spec);
      this.tagName = spec.tagName || "span";
      this.class = spec.class || "";
      this.attrs = spec.attributes || null;
    }
    eq(other) {
      var _a2, _b;
      return this == other || other instanceof _MarkDecoration && this.tagName == other.tagName && (this.class || ((_a2 = this.attrs) === null || _a2 === void 0 ? void 0 : _a2.class)) == (other.class || ((_b = other.attrs) === null || _b === void 0 ? void 0 : _b.class)) && attrsEq(this.attrs, other.attrs, "class");
    }
    range(from, to = from) {
      if (from >= to)
        throw new RangeError("Mark decorations may not be empty");
      return super.range(from, to);
    }
  };
  MarkDecoration.prototype.point = false;
  var LineDecoration = class _LineDecoration extends Decoration {
    constructor(spec) {
      super(-2e8, -2e8, null, spec);
    }
    eq(other) {
      return other instanceof _LineDecoration && this.spec.class == other.spec.class && attrsEq(this.spec.attributes, other.spec.attributes);
    }
    range(from, to = from) {
      if (to != from)
        throw new RangeError("Line decoration ranges must be zero-length");
      return super.range(from, to);
    }
  };
  LineDecoration.prototype.mapMode = MapMode.TrackBefore;
  LineDecoration.prototype.point = true;
  var PointDecoration = class _PointDecoration extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
      super(startSide, endSide, widget, spec);
      this.block = block;
      this.isReplace = isReplace;
      this.mapMode = !block ? MapMode.TrackDel : startSide <= 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
    }
    // Only relevant when this.block == true
    get type() {
      return this.startSide < this.endSide ? BlockType.WidgetRange : this.startSide <= 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
    }
    get heightRelevant() {
      return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
    }
    eq(other) {
      return other instanceof _PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
    }
    range(from, to = from) {
      if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide <= 0))
        throw new RangeError("Invalid range for replacement decoration");
      if (!this.isReplace && to != from)
        throw new RangeError("Widget decorations can only have zero-length ranges");
      return super.range(from, to);
    }
  };
  PointDecoration.prototype.point = true;
  function getInclusive(spec, block = false) {
    let { inclusiveStart: start, inclusiveEnd: end } = spec;
    if (start == null)
      start = spec.inclusive;
    if (end == null)
      end = spec.inclusive;
    return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
  }
  function widgetsEq(a, b) {
    return a == b || !!(a && b && a.compare(b));
  }
  function addRange(from, to, ranges, margin = 0) {
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last] + margin >= from)
      ranges[last] = Math.max(ranges[last], to);
    else
      ranges.push(from, to);
  }
  var LineView = class _LineView extends ContentView {
    constructor() {
      super(...arguments);
      this.children = [];
      this.length = 0;
      this.prevAttrs = void 0;
      this.attrs = null;
      this.breakAfter = 0;
    }
    // Consumes source
    merge(from, to, source, hasStart, openStart, openEnd) {
      if (source) {
        if (!(source instanceof _LineView))
          return false;
        if (!this.dom)
          source.transferDOM(this);
      }
      if (hasStart)
        this.setDeco(source ? source.attrs : null);
      mergeChildrenInto(this, from, to, source ? source.children : [], openStart, openEnd);
      return true;
    }
    split(at) {
      let end = new _LineView();
      end.breakAfter = this.breakAfter;
      if (this.length == 0)
        return end;
      let { i, off } = this.childPos(at);
      if (off) {
        end.append(this.children[i].split(off), 0);
        this.children[i].merge(off, this.children[i].length, null, false, 0, 0);
        i++;
      }
      for (let j = i; j < this.children.length; j++)
        end.append(this.children[j], 0);
      while (i > 0 && this.children[i - 1].length == 0)
        this.children[--i].destroy();
      this.children.length = i;
      this.markDirty();
      this.length = at;
      return end;
    }
    transferDOM(other) {
      if (!this.dom)
        return;
      this.markDirty();
      other.setDOM(this.dom);
      other.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs;
      this.prevAttrs = void 0;
      this.dom = null;
    }
    setDeco(attrs) {
      if (!attrsEq(this.attrs, attrs)) {
        if (this.dom) {
          this.prevAttrs = this.attrs;
          this.markDirty();
        }
        this.attrs = attrs;
      }
    }
    append(child, openStart) {
      joinInlineInto(this, child, openStart);
    }
    // Only called when building a line view in ContentBuilder
    addLineDeco(deco) {
      let attrs = deco.spec.attributes, cls = deco.spec.class;
      if (attrs)
        this.attrs = combineAttrs(attrs, this.attrs || {});
      if (cls)
        this.attrs = combineAttrs({ class: cls }, this.attrs || {});
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this, pos);
    }
    reuseDOM(node) {
      if (node.nodeName == "DIV") {
        this.setDOM(node);
        this.flags |= 4 | 2;
      }
    }
    sync(view, track) {
      var _a2;
      if (!this.dom) {
        this.setDOM(document.createElement("div"));
        this.dom.className = "cm-line";
        this.prevAttrs = this.attrs ? null : void 0;
      } else if (this.flags & 4) {
        clearAttributes(this.dom);
        this.dom.className = "cm-line";
        this.prevAttrs = this.attrs ? null : void 0;
      }
      if (this.prevAttrs !== void 0) {
        updateAttrs(this.dom, this.prevAttrs, this.attrs);
        this.dom.classList.add("cm-line");
        this.prevAttrs = void 0;
      }
      super.sync(view, track);
      let last = this.dom.lastChild;
      while (last && ContentView.get(last) instanceof MarkView)
        last = last.lastChild;
      if (!last || !this.length || last.nodeName != "BR" && ((_a2 = ContentView.get(last)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) == false && (!browser.ios || !this.children.some((ch) => ch instanceof TextView))) {
        let hack = document.createElement("BR");
        hack.cmIgnore = true;
        this.dom.appendChild(hack);
      }
    }
    measureTextSize() {
      if (this.children.length == 0 || this.length > 20)
        return null;
      let totalWidth = 0, textHeight;
      for (let child of this.children) {
        if (!(child instanceof TextView) || /[^ -~]/.test(child.text))
          return null;
        let rects = clientRectsFor(child.dom);
        if (rects.length != 1)
          return null;
        totalWidth += rects[0].width;
        textHeight = rects[0].height;
      }
      return !totalWidth ? null : {
        lineHeight: this.dom.getBoundingClientRect().height,
        charWidth: totalWidth / this.length,
        textHeight
      };
    }
    coordsAt(pos, side) {
      let rect = coordsInChildren(this, pos, side);
      if (!this.children.length && rect && this.parent) {
        let { heightOracle } = this.parent.view.viewState, height = rect.bottom - rect.top;
        if (Math.abs(height - heightOracle.lineHeight) < 2 && heightOracle.textHeight < height) {
          let dist2 = (height - heightOracle.textHeight) / 2;
          return { top: rect.top + dist2, bottom: rect.bottom - dist2, left: rect.left, right: rect.left };
        }
      }
      return rect;
    }
    become(_other) {
      return false;
    }
    get type() {
      return BlockType.Text;
    }
    static find(docView, pos) {
      for (let i = 0, off = 0; i < docView.children.length; i++) {
        let block = docView.children[i], end = off + block.length;
        if (end >= pos) {
          if (block instanceof _LineView)
            return block;
          if (end > pos)
            break;
        }
        off = end + block.breakAfter;
      }
      return null;
    }
  };
  var BlockWidgetView = class _BlockWidgetView extends ContentView {
    constructor(widget, length, type) {
      super();
      this.widget = widget;
      this.length = length;
      this.type = type;
      this.breakAfter = 0;
      this.prevWidget = null;
    }
    merge(from, to, source, _takeDeco, openStart, openEnd) {
      if (source && (!(source instanceof _BlockWidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      this.length = from + (source ? source.length : 0) + (this.length - to);
      return true;
    }
    domAtPos(pos) {
      return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    split(at) {
      let len = this.length - at;
      this.length = at;
      let end = new _BlockWidgetView(this.widget, len, this.type);
      end.breakAfter = this.breakAfter;
      return end;
    }
    get children() {
      return noChildren;
    }
    sync(view) {
      if (!this.dom || !this.widget.updateDOM(this.dom, view)) {
        if (this.dom && this.prevWidget)
          this.prevWidget.destroy(this.dom);
        this.prevWidget = null;
        this.setDOM(this.widget.toDOM(view));
        this.dom.contentEditable = "false";
      }
    }
    get overrideDOMText() {
      return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
    }
    domBoundsAround() {
      return null;
    }
    become(other) {
      if (other instanceof _BlockWidgetView && other.widget.constructor == this.widget.constructor) {
        if (!other.widget.compare(this.widget))
          this.markDirty(true);
        if (this.dom && !this.prevWidget)
          this.prevWidget = this.widget;
        this.widget = other.widget;
        this.length = other.length;
        this.type = other.type;
        this.breakAfter = other.breakAfter;
        return true;
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
    get isEditable() {
      return false;
    }
    get isWidget() {
      return true;
    }
    coordsAt(pos, side) {
      return this.widget.coordsAt(this.dom, pos, side);
    }
    destroy() {
      super.destroy();
      if (this.dom)
        this.widget.destroy(this.dom);
    }
  };
  var ContentBuilder = class _ContentBuilder {
    constructor(doc2, pos, end, disallowBlockEffectsFor) {
      this.doc = doc2;
      this.pos = pos;
      this.end = end;
      this.disallowBlockEffectsFor = disallowBlockEffectsFor;
      this.content = [];
      this.curLine = null;
      this.breakAtStart = 0;
      this.pendingBuffer = 0;
      this.bufferMarks = [];
      this.atCursorPos = true;
      this.openStart = -1;
      this.openEnd = -1;
      this.text = "";
      this.textOff = 0;
      this.cursor = doc2.iter();
      this.skip = pos;
    }
    posCovered() {
      if (this.content.length == 0)
        return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
      let last = this.content[this.content.length - 1];
      return !last.breakAfter && !(last instanceof BlockWidgetView && last.type == BlockType.WidgetBefore);
    }
    getLine() {
      if (!this.curLine) {
        this.content.push(this.curLine = new LineView());
        this.atCursorPos = true;
      }
      return this.curLine;
    }
    flushBuffer(active = this.bufferMarks) {
      if (this.pendingBuffer) {
        this.curLine.append(wrapMarks(new WidgetBufferView(-1), active), active.length);
        this.pendingBuffer = 0;
      }
    }
    addBlockWidget(view) {
      this.flushBuffer();
      this.curLine = null;
      this.content.push(view);
    }
    finish(openEnd) {
      if (this.pendingBuffer && openEnd <= this.bufferMarks.length)
        this.flushBuffer();
      else
        this.pendingBuffer = 0;
      if (!this.posCovered())
        this.getLine();
    }
    buildText(length, active, openStart) {
      while (length > 0) {
        if (this.textOff == this.text.length) {
          let { value, lineBreak, done } = this.cursor.next(this.skip);
          this.skip = 0;
          if (done)
            throw new Error("Ran out of text content when drawing inline views");
          if (lineBreak) {
            if (!this.posCovered())
              this.getLine();
            if (this.content.length)
              this.content[this.content.length - 1].breakAfter = 1;
            else
              this.breakAtStart = 1;
            this.flushBuffer();
            this.curLine = null;
            this.atCursorPos = true;
            length--;
            continue;
          } else {
            this.text = value;
            this.textOff = 0;
          }
        }
        let take = Math.min(
          this.text.length - this.textOff,
          length,
          512
          /* T.Chunk */
        );
        this.flushBuffer(active.slice(active.length - openStart));
        this.getLine().append(wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
        this.atCursorPos = true;
        this.textOff += take;
        length -= take;
        openStart = 0;
      }
    }
    span(from, to, active, openStart) {
      this.buildText(to - from, active, openStart);
      this.pos = to;
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    point(from, to, deco, active, openStart, index) {
      if (this.disallowBlockEffectsFor[index] && deco instanceof PointDecoration) {
        if (deco.block)
          throw new RangeError("Block decorations may not be specified via plugins");
        if (to > this.doc.lineAt(this.pos).to)
          throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
      }
      let len = to - from;
      if (deco instanceof PointDecoration) {
        if (deco.block) {
          let { type } = deco;
          if (type == BlockType.WidgetAfter && !this.posCovered())
            this.getLine();
          this.addBlockWidget(new BlockWidgetView(deco.widget || new NullWidget("div"), len, type));
        } else {
          let view = WidgetView.create(deco.widget || new NullWidget("span"), len, len ? 0 : deco.startSide);
          let cursorBefore = this.atCursorPos && !view.isEditable && openStart <= active.length && (from < to || deco.startSide > 0);
          let cursorAfter = !view.isEditable && (from < to || openStart > active.length || deco.startSide <= 0);
          let line = this.getLine();
          if (this.pendingBuffer == 2 && !cursorBefore && !view.isEditable)
            this.pendingBuffer = 0;
          this.flushBuffer(active);
          if (cursorBefore) {
            line.append(wrapMarks(new WidgetBufferView(1), active), openStart);
            openStart = active.length + Math.max(0, openStart - active.length);
          }
          line.append(wrapMarks(view, active), openStart);
          this.atCursorPos = cursorAfter;
          this.pendingBuffer = !cursorAfter ? 0 : from < to || openStart > active.length ? 1 : 2;
          if (this.pendingBuffer)
            this.bufferMarks = active.slice();
        }
      } else if (this.doc.lineAt(this.pos).from == this.pos) {
        this.getLine().addLineDeco(deco);
      }
      if (len) {
        if (this.textOff + len <= this.text.length) {
          this.textOff += len;
        } else {
          this.skip += len - (this.text.length - this.textOff);
          this.text = "";
          this.textOff = 0;
        }
        this.pos = to;
      }
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    static build(text, from, to, decorations2, dynamicDecorationMap) {
      let builder = new _ContentBuilder(text, from, to, dynamicDecorationMap);
      builder.openEnd = RangeSet.spans(decorations2, from, to, builder);
      if (builder.openStart < 0)
        builder.openStart = builder.openEnd;
      builder.finish(builder.openEnd);
      return builder;
    }
  };
  function wrapMarks(view, active) {
    for (let mark of active)
      view = new MarkView(mark, [view], view.length);
    return view;
  }
  var NullWidget = class extends WidgetType {
    constructor(tag) {
      super();
      this.tag = tag;
    }
    eq(other) {
      return other.tag == this.tag;
    }
    toDOM() {
      return document.createElement(this.tag);
    }
    updateDOM(elt) {
      return elt.nodeName.toLowerCase() == this.tag;
    }
    get isHidden() {
      return true;
    }
  };
  var clickAddsSelectionRange = /* @__PURE__ */ Facet.define();
  var dragMovesSelection$1 = /* @__PURE__ */ Facet.define();
  var mouseSelectionStyle = /* @__PURE__ */ Facet.define();
  var exceptionSink = /* @__PURE__ */ Facet.define();
  var updateListener = /* @__PURE__ */ Facet.define();
  var inputHandler = /* @__PURE__ */ Facet.define();
  var focusChangeEffect = /* @__PURE__ */ Facet.define();
  var perLineTextDirection = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((x) => x)
  });
  var nativeSelectionHidden = /* @__PURE__ */ Facet.define({
    combine: (values) => values.some((x) => x)
  });
  var ScrollTarget = class _ScrollTarget {
    constructor(range2, y = "nearest", x = "nearest", yMargin = 5, xMargin = 5) {
      this.range = range2;
      this.y = y;
      this.x = x;
      this.yMargin = yMargin;
      this.xMargin = xMargin;
    }
    map(changes) {
      return changes.empty ? this : new _ScrollTarget(this.range.map(changes), this.y, this.x, this.yMargin, this.xMargin);
    }
  };
  var scrollIntoView = /* @__PURE__ */ StateEffect.define({ map: (t2, ch) => t2.map(ch) });
  function logException(state, exception, context) {
    let handler = state.facet(exceptionSink);
    if (handler.length)
      handler[0](exception);
    else if (window.onerror)
      window.onerror(String(exception), context, void 0, void 0, exception);
    else if (context)
      console.error(context + ":", exception);
    else
      console.error(exception);
  }
  var editable = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : true });
  var nextPluginID = 0;
  var viewPlugin = /* @__PURE__ */ Facet.define();
  var ViewPlugin = class _ViewPlugin {
    constructor(id, create, domEventHandlers, buildExtensions) {
      this.id = id;
      this.create = create;
      this.domEventHandlers = domEventHandlers;
      this.extension = buildExtensions(this);
    }
    /**
    Define a plugin from a constructor function that creates the
    plugin's value, given an editor view.
    */
    static define(create, spec) {
      const { eventHandlers, provide, decorations: deco } = spec || {};
      return new _ViewPlugin(nextPluginID++, create, eventHandlers, (plugin) => {
        let ext = [viewPlugin.of(plugin)];
        if (deco)
          ext.push(decorations.of((view) => {
            let pluginInst = view.plugin(plugin);
            return pluginInst ? deco(pluginInst) : Decoration.none;
          }));
        if (provide)
          ext.push(provide(plugin));
        return ext;
      });
    }
    /**
    Create a plugin for a class whose constructor takes a single
    editor view as argument.
    */
    static fromClass(cls, spec) {
      return _ViewPlugin.define((view) => new cls(view), spec);
    }
  };
  var PluginInstance = class {
    constructor(spec) {
      this.spec = spec;
      this.mustUpdate = null;
      this.value = null;
    }
    update(view) {
      if (!this.value) {
        if (this.spec) {
          try {
            this.value = this.spec.create(view);
          } catch (e) {
            logException(view.state, e, "CodeMirror plugin crashed");
            this.deactivate();
          }
        }
      } else if (this.mustUpdate) {
        let update = this.mustUpdate;
        this.mustUpdate = null;
        if (this.value.update) {
          try {
            this.value.update(update);
          } catch (e) {
            logException(update.state, e, "CodeMirror plugin crashed");
            if (this.value.destroy)
              try {
                this.value.destroy();
              } catch (_) {
              }
            this.deactivate();
          }
        }
      }
      return this;
    }
    destroy(view) {
      var _a2;
      if ((_a2 = this.value) === null || _a2 === void 0 ? void 0 : _a2.destroy) {
        try {
          this.value.destroy();
        } catch (e) {
          logException(view.state, e, "CodeMirror plugin crashed");
        }
      }
    }
    deactivate() {
      this.spec = this.value = null;
    }
  };
  var editorAttributes = /* @__PURE__ */ Facet.define();
  var contentAttributes = /* @__PURE__ */ Facet.define();
  var decorations = /* @__PURE__ */ Facet.define();
  var atomicRanges = /* @__PURE__ */ Facet.define();
  var bidiIsolatedRanges = /* @__PURE__ */ Facet.define();
  function getIsolatedRanges(view, from, to) {
    let isolates = view.state.facet(bidiIsolatedRanges);
    if (!isolates.length)
      return isolates;
    let sets = isolates.map((i) => i instanceof Function ? i(view) : i);
    let result = [];
    RangeSet.spans(sets, from, to, {
      point() {
      },
      span(from2, to2, active, open) {
        let level = result;
        for (let i = active.length - 1; i >= 0; i--, open--) {
          let iso = active[i].spec.bidiIsolate, update;
          if (iso == null)
            continue;
          if (open > 0 && level.length && (update = level[level.length - 1]).to == from2 && update.direction == iso) {
            update.to = to2;
            level = update.inner;
          } else {
            let add2 = { from: from2, to: to2, direction: iso, inner: [] };
            level.push(add2);
            level = add2.inner;
          }
        }
      }
    });
    return result;
  }
  var scrollMargins = /* @__PURE__ */ Facet.define();
  function getScrollMargins(view) {
    let left = 0, right = 0, top2 = 0, bottom = 0;
    for (let source of view.state.facet(scrollMargins)) {
      let m = source(view);
      if (m) {
        if (m.left != null)
          left = Math.max(left, m.left);
        if (m.right != null)
          right = Math.max(right, m.right);
        if (m.top != null)
          top2 = Math.max(top2, m.top);
        if (m.bottom != null)
          bottom = Math.max(bottom, m.bottom);
      }
    }
    return { left, right, top: top2, bottom };
  }
  var styleModule = /* @__PURE__ */ Facet.define();
  var ChangedRange = class _ChangedRange {
    constructor(fromA, toA, fromB, toB) {
      this.fromA = fromA;
      this.toA = toA;
      this.fromB = fromB;
      this.toB = toB;
    }
    join(other) {
      return new _ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    }
    addToSet(set) {
      let i = set.length, me = this;
      for (; i > 0; i--) {
        let range2 = set[i - 1];
        if (range2.fromA > me.toA)
          continue;
        if (range2.toA < me.fromA)
          break;
        me = me.join(range2);
        set.splice(i - 1, 1);
      }
      set.splice(i, 0, me);
      return set;
    }
    static extendWithRanges(diff, ranges) {
      if (ranges.length == 0)
        return diff;
      let result = [];
      for (let dI = 0, rI = 0, posA = 0, posB = 0; ; dI++) {
        let next = dI == diff.length ? null : diff[dI], off = posA - posB;
        let end = next ? next.fromB : 1e9;
        while (rI < ranges.length && ranges[rI] < end) {
          let from = ranges[rI], to = ranges[rI + 1];
          let fromB = Math.max(posB, from), toB = Math.min(end, to);
          if (fromB <= toB)
            new _ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
          if (to > end)
            break;
          else
            rI += 2;
        }
        if (!next)
          return result;
        new _ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
        posA = next.toA;
        posB = next.toB;
      }
    }
  };
  var ViewUpdate = class _ViewUpdate {
    constructor(view, state, transactions) {
      this.view = view;
      this.state = state;
      this.transactions = transactions;
      this.flags = 0;
      this.startState = view.state;
      this.changes = ChangeSet.empty(this.startState.doc.length);
      for (let tr of transactions)
        this.changes = this.changes.compose(tr.changes);
      let changedRanges = [];
      this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
      this.changedRanges = changedRanges;
    }
    /**
    @internal
    */
    static create(view, state, transactions) {
      return new _ViewUpdate(view, state, transactions);
    }
    /**
    Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
    [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
    update.
    */
    get viewportChanged() {
      return (this.flags & 4) > 0;
    }
    /**
    Indicates whether the height of a block element in the editor
    changed in this update.
    */
    get heightChanged() {
      return (this.flags & 2) > 0;
    }
    /**
    Returns true when the document was modified or the size of the
    editor, or elements within the editor, changed.
    */
    get geometryChanged() {
      return this.docChanged || (this.flags & (8 | 2)) > 0;
    }
    /**
    True when this update indicates a focus change.
    */
    get focusChanged() {
      return (this.flags & 1) > 0;
    }
    /**
    Whether the document changed in this update.
    */
    get docChanged() {
      return !this.changes.empty;
    }
    /**
    Whether the selection was explicitly set in this update.
    */
    get selectionSet() {
      return this.transactions.some((tr) => tr.selection);
    }
    /**
    @internal
    */
    get empty() {
      return this.flags == 0 && this.transactions.length == 0;
    }
  };
  var Direction = /* @__PURE__ */ function(Direction2) {
    Direction2[Direction2["LTR"] = 0] = "LTR";
    Direction2[Direction2["RTL"] = 1] = "RTL";
    return Direction2;
  }(Direction || (Direction = {}));
  var LTR = Direction.LTR;
  var RTL = Direction.RTL;
  function dec(str2) {
    let result = [];
    for (let i = 0; i < str2.length; i++)
      result.push(1 << +str2[i]);
    return result;
  }
  var LowTypes = /* @__PURE__ */ dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
  var ArabicTypes = /* @__PURE__ */ dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
  var Brackets = /* @__PURE__ */ Object.create(null);
  var BracketStack = [];
  for (let p of ["()", "[]", "{}"]) {
    let l = /* @__PURE__ */ p.charCodeAt(0), r = /* @__PURE__ */ p.charCodeAt(1);
    Brackets[l] = r;
    Brackets[r] = -l;
  }
  function charType(ch) {
    return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8203 ? 256 : 64336 <= ch && ch <= 65023 ? 4 : ch == 8204 ? 256 : 1;
  }
  var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
  var BidiSpan = class {
    /**
    The direction of this span.
    */
    get dir() {
      return this.level % 2 ? RTL : LTR;
    }
    /**
    @internal
    */
    constructor(from, to, level) {
      this.from = from;
      this.to = to;
      this.level = level;
    }
    /**
    @internal
    */
    side(end, dir) {
      return this.dir == dir == end ? this.to : this.from;
    }
    /**
    @internal
    */
    static find(order, index, level, assoc) {
      let maybe2 = -1;
      for (let i = 0; i < order.length; i++) {
        let span = order[i];
        if (span.from <= index && span.to >= index) {
          if (span.level == level)
            return i;
          if (maybe2 < 0 || (assoc != 0 ? assoc < 0 ? span.from < index : span.to > index : order[maybe2].level > span.level))
            maybe2 = i;
        }
      }
      if (maybe2 < 0)
        throw new RangeError("Index out of range");
      return maybe2;
    }
  };
  function isolatesEq(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      let iA = a[i], iB = b[i];
      if (iA.from != iB.from || iA.to != iB.to || iA.direction != iB.direction || !isolatesEq(iA.inner, iB.inner))
        return false;
    }
    return true;
  }
  var types = [];
  function computeCharTypes(line, rFrom, rTo, isolates, outerType) {
    for (let iI = 0; iI <= isolates.length; iI++) {
      let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
      let prevType = iI ? 256 : outerType;
      for (let i = from, prev = prevType, prevStrong = prevType; i < to; i++) {
        let type = charType(line.charCodeAt(i));
        if (type == 512)
          type = prev;
        else if (type == 8 && prevStrong == 4)
          type = 16;
        types[i] = type == 4 ? 2 : type;
        if (type & 7)
          prevStrong = type;
        prev = type;
      }
      for (let i = from, prev = prevType, prevStrong = prevType; i < to; i++) {
        let type = types[i];
        if (type == 128) {
          if (i < to - 1 && prev == types[i + 1] && prev & 24)
            type = types[i] = prev;
          else
            types[i] = 256;
        } else if (type == 64) {
          let end = i + 1;
          while (end < to && types[end] == 64)
            end++;
          let replace = i && prev == 8 || end < rTo && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
          for (let j = i; j < end; j++)
            types[j] = replace;
          i = end - 1;
        } else if (type == 8 && prevStrong == 1) {
          types[i] = 1;
        }
        prev = type;
        if (type & 7)
          prevStrong = type;
      }
    }
  }
  function processBracketPairs(line, rFrom, rTo, isolates, outerType) {
    let oppositeType = outerType == 1 ? 2 : 1;
    for (let iI = 0, sI = 0, context = 0; iI <= isolates.length; iI++) {
      let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
      for (let i = from, ch, br, type; i < to; i++) {
        if (br = Brackets[ch = line.charCodeAt(i)]) {
          if (br < 0) {
            for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
              if (BracketStack[sJ + 1] == -br) {
                let flags = BracketStack[sJ + 2];
                let type2 = flags & 2 ? outerType : !(flags & 4) ? 0 : flags & 1 ? oppositeType : outerType;
                if (type2)
                  types[i] = types[BracketStack[sJ]] = type2;
                sI = sJ;
                break;
              }
            }
          } else if (BracketStack.length == 189) {
            break;
          } else {
            BracketStack[sI++] = i;
            BracketStack[sI++] = ch;
            BracketStack[sI++] = context;
          }
        } else if ((type = types[i]) == 2 || type == 1) {
          let embed = type == outerType;
          context = embed ? 0 : 1;
          for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
            let cur = BracketStack[sJ + 2];
            if (cur & 2)
              break;
            if (embed) {
              BracketStack[sJ + 2] |= 2;
            } else {
              if (cur & 4)
                break;
              BracketStack[sJ + 2] |= 4;
            }
          }
        }
      }
    }
  }
  function processNeutrals(rFrom, rTo, isolates, outerType) {
    for (let iI = 0, prev = outerType; iI <= isolates.length; iI++) {
      let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
      for (let i = from; i < to; ) {
        let type = types[i];
        if (type == 256) {
          let end = i + 1;
          for (; ; ) {
            if (end == to) {
              if (iI == isolates.length)
                break;
              end = isolates[iI++].to;
              to = iI < isolates.length ? isolates[iI].from : rTo;
            } else if (types[end] == 256) {
              end++;
            } else {
              break;
            }
          }
          let beforeL = prev == 1;
          let afterL = (end < rTo ? types[end] : outerType) == 1;
          let replace = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
          for (let j = end, jI = iI, fromJ = jI ? isolates[jI - 1].to : rFrom; j > i; ) {
            if (j == fromJ) {
              j = isolates[--jI].from;
              fromJ = jI ? isolates[jI - 1].to : rFrom;
            }
            types[--j] = replace;
          }
          i = end;
        } else {
          prev = type;
          i++;
        }
      }
    }
  }
  function emitSpans(line, from, to, level, baseLevel, isolates, order) {
    let ourType = level % 2 ? 2 : 1;
    if (level % 2 == baseLevel % 2) {
      for (let iCh = from, iI = 0; iCh < to; ) {
        let sameDir = true, isNum = false;
        if (iI == isolates.length || iCh < isolates[iI].from) {
          let next = types[iCh];
          if (next != ourType) {
            sameDir = false;
            isNum = next == 16;
          }
        }
        let recurse = !sameDir && ourType == 1 ? [] : null;
        let localLevel = sameDir ? level : level + 1;
        let iScan = iCh;
        run:
          for (; ; ) {
            if (iI < isolates.length && iScan == isolates[iI].from) {
              if (isNum)
                break run;
              let iso = isolates[iI];
              if (!sameDir)
                for (let upto = iso.to, jI = iI + 1; ; ) {
                  if (upto == to)
                    break run;
                  if (jI < isolates.length && isolates[jI].from == upto)
                    upto = isolates[jI++].to;
                  else if (types[upto] == ourType)
                    break run;
                  else
                    break;
                }
              iI++;
              if (recurse) {
                recurse.push(iso);
              } else {
                if (iso.from > iCh)
                  order.push(new BidiSpan(iCh, iso.from, localLevel));
                let dirSwap = iso.direction == LTR != !(localLevel % 2);
                computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
                iCh = iso.to;
              }
              iScan = iso.to;
            } else if (iScan == to || (sameDir ? types[iScan] != ourType : types[iScan] == ourType)) {
              break;
            } else {
              iScan++;
            }
          }
        if (recurse)
          emitSpans(line, iCh, iScan, level + 1, baseLevel, recurse, order);
        else if (iCh < iScan)
          order.push(new BidiSpan(iCh, iScan, localLevel));
        iCh = iScan;
      }
    } else {
      for (let iCh = to, iI = isolates.length; iCh > from; ) {
        let sameDir = true, isNum = false;
        if (!iI || iCh > isolates[iI - 1].to) {
          let next = types[iCh - 1];
          if (next != ourType) {
            sameDir = false;
            isNum = next == 16;
          }
        }
        let recurse = !sameDir && ourType == 1 ? [] : null;
        let localLevel = sameDir ? level : level + 1;
        let iScan = iCh;
        run:
          for (; ; ) {
            if (iI && iScan == isolates[iI - 1].to) {
              if (isNum)
                break run;
              let iso = isolates[--iI];
              if (!sameDir)
                for (let upto = iso.from, jI = iI; ; ) {
                  if (upto == from)
                    break run;
                  if (jI && isolates[jI - 1].to == upto)
                    upto = isolates[--jI].from;
                  else if (types[upto - 1] == ourType)
                    break run;
                  else
                    break;
                }
              if (recurse) {
                recurse.push(iso);
              } else {
                if (iso.to < iCh)
                  order.push(new BidiSpan(iso.to, iCh, localLevel));
                let dirSwap = iso.direction == LTR != !(localLevel % 2);
                computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
                iCh = iso.from;
              }
              iScan = iso.from;
            } else if (iScan == from || (sameDir ? types[iScan - 1] != ourType : types[iScan - 1] == ourType)) {
              break;
            } else {
              iScan--;
            }
          }
        if (recurse)
          emitSpans(line, iScan, iCh, level + 1, baseLevel, recurse, order);
        else if (iScan < iCh)
          order.push(new BidiSpan(iScan, iCh, localLevel));
        iCh = iScan;
      }
    }
  }
  function computeSectionOrder(line, level, baseLevel, isolates, from, to, order) {
    let outerType = level % 2 ? 2 : 1;
    computeCharTypes(line, from, to, isolates, outerType);
    processBracketPairs(line, from, to, isolates, outerType);
    processNeutrals(from, to, isolates, outerType);
    emitSpans(line, from, to, level, baseLevel, isolates, order);
  }
  function computeOrder(line, direction, isolates) {
    if (!line)
      return [new BidiSpan(0, 0, direction == RTL ? 1 : 0)];
    if (direction == LTR && !isolates.length && !BidiRE.test(line))
      return trivialOrder(line.length);
    if (isolates.length)
      while (line.length > types.length)
        types[types.length] = 256;
    let order = [], level = direction == LTR ? 0 : 1;
    computeSectionOrder(line, level, level, isolates, 0, line.length, order);
    return order;
  }
  function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
  }
  var movedOver = "";
  function moveVisually(line, order, dir, start, forward) {
    var _a2;
    let startIndex = start.head - line.from, spanI = -1;
    if (startIndex == 0) {
      if (!forward || !line.length)
        return null;
      if (order[0].level != dir) {
        startIndex = order[0].side(false, dir);
        spanI = 0;
      }
    } else if (startIndex == line.length) {
      if (forward)
        return null;
      let last = order[order.length - 1];
      if (last.level != dir) {
        startIndex = last.side(true, dir);
        spanI = order.length - 1;
      }
    }
    if (spanI < 0)
      spanI = BidiSpan.find(order, startIndex, (_a2 = start.bidiLevel) !== null && _a2 !== void 0 ? _a2 : -1, start.assoc);
    let span = order[spanI];
    if (startIndex == span.side(forward, dir)) {
      span = order[spanI += forward ? 1 : -1];
      startIndex = span.side(!forward, dir);
    }
    let indexForward = forward == (span.dir == dir);
    let nextIndex = findClusterBreak(line.text, startIndex, indexForward);
    movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    if (nextIndex != span.side(forward, dir))
      return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (!nextSpan && span.level != dir)
      return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
    if (nextSpan && nextSpan.level < span.level)
      return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, forward ? 1 : -1, nextSpan.level);
    return EditorSelection.cursor(nextIndex + line.from, forward ? -1 : 1, span.level);
  }
  var DocView = class extends ContentView {
    get length() {
      return this.view.state.doc.length;
    }
    constructor(view) {
      super();
      this.view = view;
      this.decorations = [];
      this.dynamicDecorationMap = [];
      this.hasComposition = null;
      this.markedForComposition = /* @__PURE__ */ new Set();
      this.minWidth = 0;
      this.minWidthFrom = 0;
      this.minWidthTo = 0;
      this.impreciseAnchor = null;
      this.impreciseHead = null;
      this.forceSelection = false;
      this.lastUpdate = Date.now();
      this.setDOM(view.contentDOM);
      this.children = [new LineView()];
      this.children[0].setParent(this);
      this.updateDeco();
      this.updateInner([new ChangedRange(0, 0, 0, view.state.doc.length)], 0, null);
    }
    // Update the document view to a given state.
    update(update) {
      let changedRanges = update.changedRanges;
      if (this.minWidth > 0 && changedRanges.length) {
        if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
          this.minWidth = this.minWidthFrom = this.minWidthTo = 0;
        } else {
          this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
          this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
        }
      }
      let composition = this.view.inputState.composing < 0 ? null : findCompositionRange(this.view, update.changes);
      if (this.hasComposition) {
        this.markedForComposition.clear();
        let { from, to } = this.hasComposition;
        changedRanges = new ChangedRange(from, to, update.changes.mapPos(from, -1), update.changes.mapPos(to, 1)).addToSet(changedRanges.slice());
      }
      this.hasComposition = composition ? { from: composition.range.fromB, to: composition.range.toB } : null;
      if ((browser.ie || browser.chrome) && !composition && update && update.state.doc.lines != update.startState.doc.lines)
        this.forceSelection = true;
      let prevDeco = this.decorations, deco = this.updateDeco();
      let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
      changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
      if (!(this.flags & 7) && changedRanges.length == 0) {
        return false;
      } else {
        this.updateInner(changedRanges, update.startState.doc.length, composition);
        if (update.transactions.length)
          this.lastUpdate = Date.now();
        return true;
      }
    }
    // Used by update and the constructor do perform the actual DOM
    // update
    updateInner(changes, oldLength, composition) {
      this.view.viewState.mustMeasureContent = true;
      this.updateChildren(changes, oldLength, composition);
      let { observer } = this.view;
      observer.ignore(() => {
        this.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px";
        this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
        let track = browser.chrome || browser.ios ? { node: observer.selectionRange.focusNode, written: false } : void 0;
        this.sync(this.view, track);
        this.flags &= ~7;
        if (track && (track.written || observer.selectionRange.focusNode != track.node))
          this.forceSelection = true;
        this.dom.style.height = "";
      });
      this.markedForComposition.forEach(
        (cView) => cView.flags &= ~8
        /* ViewFlag.Composition */
      );
      let gaps = [];
      if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length) {
        for (let child of this.children)
          if (child instanceof BlockWidgetView && child.widget instanceof BlockGapWidget)
            gaps.push(child.dom);
      }
      observer.updateGaps(gaps);
    }
    updateChildren(changes, oldLength, composition) {
      let ranges = composition ? composition.range.addToSet(changes.slice()) : changes;
      let cursor = this.childCursor(oldLength);
      for (let i = ranges.length - 1; ; i--) {
        let next = i >= 0 ? ranges[i] : null;
        if (!next)
          break;
        let { fromA, toA, fromB, toB } = next, content2, breakAtStart, openStart, openEnd;
        if (composition && composition.range.fromB < toB && composition.range.toB > fromB) {
          let before = ContentBuilder.build(this.view.state.doc, fromB, composition.range.fromB, this.decorations, this.dynamicDecorationMap);
          let after = ContentBuilder.build(this.view.state.doc, composition.range.toB, toB, this.decorations, this.dynamicDecorationMap);
          breakAtStart = before.breakAtStart;
          openStart = before.openStart;
          openEnd = after.openEnd;
          let compLine = this.compositionView(composition);
          if (after.breakAtStart) {
            compLine.breakAfter = 1;
          } else if (after.content.length && compLine.merge(compLine.length, compLine.length, after.content[0], false, after.openStart, 0)) {
            compLine.breakAfter = after.content[0].breakAfter;
            after.content.shift();
          }
          if (before.content.length && compLine.merge(0, 0, before.content[before.content.length - 1], true, 0, before.openEnd)) {
            before.content.pop();
          }
          content2 = before.content.concat(compLine).concat(after.content);
        } else {
          ({ content: content2, breakAtStart, openStart, openEnd } = ContentBuilder.build(this.view.state.doc, fromB, toB, this.decorations, this.dynamicDecorationMap));
        }
        let { i: toI, off: toOff } = cursor.findPos(toA, 1);
        let { i: fromI, off: fromOff } = cursor.findPos(fromA, -1);
        replaceRange(this, fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd);
      }
      if (composition)
        this.fixCompositionDOM(composition);
    }
    compositionView(composition) {
      let cur = new TextView(composition.text.nodeValue);
      cur.flags |= 8;
      for (let { deco } of composition.marks)
        cur = new MarkView(deco, [cur], cur.length);
      let line = new LineView();
      line.append(cur, 0);
      return line;
    }
    fixCompositionDOM(composition) {
      let fix = (dom, cView2) => {
        cView2.flags |= 8 | (cView2.children.some(
          (c) => c.flags & 7
          /* ViewFlag.Dirty */
        ) ? 1 : 0);
        this.markedForComposition.add(cView2);
        let prev = ContentView.get(dom);
        if (prev != cView2) {
          if (prev)
            prev.dom = null;
          cView2.setDOM(dom);
        }
      };
      let pos = this.childPos(composition.range.fromB, 1);
      let cView = this.children[pos.i];
      fix(composition.line, cView);
      for (let i = composition.marks.length - 1; i >= -1; i--) {
        pos = cView.childPos(pos.off, 1);
        cView = cView.children[pos.i];
        fix(i >= 0 ? composition.marks[i].node : composition.text, cView);
      }
    }
    // Sync the DOM selection to this.state.selection
    updateSelection(mustRead = false, fromPointer = false) {
      if (mustRead || !this.view.observer.selectionRange.focusNode)
        this.view.observer.readSelectionRange();
      let activeElt = this.view.root.activeElement, focused = activeElt == this.dom;
      let selectionNotFocus = !focused && hasSelection(this.dom, this.view.observer.selectionRange) && !(activeElt && this.dom.contains(activeElt));
      if (!(focused || fromPointer || selectionNotFocus))
        return;
      let force = this.forceSelection;
      this.forceSelection = false;
      let main = this.view.state.selection.main;
      let anchor = this.domAtPos(main.anchor);
      let head = main.empty ? anchor : this.domAtPos(main.head);
      if (browser.gecko && main.empty && !this.hasComposition && betweenUneditable(anchor)) {
        let dummy = document.createTextNode("");
        this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
        anchor = head = new DOMPos(dummy, 0);
        force = true;
      }
      let domSel = this.view.observer.selectionRange;
      if (force || !domSel.focusNode || !isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) {
        this.view.observer.ignore(() => {
          if (browser.android && browser.chrome && this.dom.contains(domSel.focusNode) && inUneditable(domSel.focusNode, this.dom)) {
            this.dom.blur();
            this.dom.focus({ preventScroll: true });
          }
          let rawSel = getSelection(this.view.root);
          if (!rawSel)
            ;
          else if (main.empty) {
            if (browser.gecko) {
              let nextTo = nextToUneditable(anchor.node, anchor.offset);
              if (nextTo && nextTo != (1 | 2)) {
                let text = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 ? 1 : -1);
                if (text)
                  anchor = new DOMPos(text, nextTo == 1 ? 0 : text.nodeValue.length);
              }
            }
            rawSel.collapse(anchor.node, anchor.offset);
            if (main.bidiLevel != null && domSel.caretBidiLevel != null)
              domSel.caretBidiLevel = main.bidiLevel;
          } else if (rawSel.extend) {
            rawSel.collapse(anchor.node, anchor.offset);
            try {
              rawSel.extend(head.node, head.offset);
            } catch (_) {
            }
          } else {
            let range2 = document.createRange();
            if (main.anchor > main.head)
              [anchor, head] = [head, anchor];
            range2.setEnd(head.node, head.offset);
            range2.setStart(anchor.node, anchor.offset);
            rawSel.removeAllRanges();
            rawSel.addRange(range2);
          }
          if (selectionNotFocus && this.view.root.activeElement == this.dom) {
            this.dom.blur();
            if (activeElt)
              activeElt.focus();
          }
        });
        this.view.observer.setSelectionRange(anchor, head);
      }
      this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
      this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
    }
    enforceCursorAssoc() {
      if (this.hasComposition)
        return;
      let { view } = this, cursor = view.state.selection.main;
      let sel = getSelection(view.root);
      let { anchorNode, anchorOffset } = view.observer.selectionRange;
      if (!sel || !cursor.empty || !cursor.assoc || !sel.modify)
        return;
      let line = LineView.find(this, cursor.head);
      if (!line)
        return;
      let lineStart = line.posAtStart;
      if (cursor.head == lineStart || cursor.head == lineStart + line.length)
        return;
      let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
      if (!before || !after || before.bottom > after.top)
        return;
      let dom = this.domAtPos(cursor.head + cursor.assoc);
      sel.collapse(dom.node, dom.offset);
      sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
      view.observer.readSelectionRange();
      let newRange = view.observer.selectionRange;
      if (view.docView.posFromDOM(newRange.anchorNode, newRange.anchorOffset) != cursor.from)
        sel.collapse(anchorNode, anchorOffset);
    }
    nearest(dom) {
      for (let cur = dom; cur; ) {
        let domView = ContentView.get(cur);
        if (domView && domView.rootView == this)
          return domView;
        cur = cur.parentNode;
      }
      return null;
    }
    posFromDOM(node, offset) {
      let view = this.nearest(node);
      if (!view)
        throw new RangeError("Trying to find position for a DOM position outside of the document");
      return view.localPosFromDOM(node, offset) + view.posAtStart;
    }
    domAtPos(pos) {
      let { i, off } = this.childCursor().findPos(pos, -1);
      for (; i < this.children.length - 1; ) {
        let child = this.children[i];
        if (off < child.length || child instanceof LineView)
          break;
        i++;
        off = 0;
      }
      return this.children[i].domAtPos(off);
    }
    coordsAt(pos, side) {
      for (let off = this.length, i = this.children.length - 1; ; i--) {
        let child = this.children[i], start = off - child.breakAfter - child.length;
        if (pos > start || pos == start && child.type != BlockType.WidgetBefore && child.type != BlockType.WidgetAfter && (!i || side == 2 || this.children[i - 1].breakAfter || this.children[i - 1].type == BlockType.WidgetBefore && side > -2))
          return child.coordsAt(pos - start, side);
        off = start;
      }
    }
    coordsForChar(pos) {
      let { i, off } = this.childPos(pos, 1), child = this.children[i];
      if (!(child instanceof LineView))
        return null;
      while (child.children.length) {
        let { i: i2, off: childOff } = child.childPos(off, 1);
        for (; ; i2++) {
          if (i2 == child.children.length)
            return null;
          if ((child = child.children[i2]).length)
            break;
        }
        off = childOff;
      }
      if (!(child instanceof TextView))
        return null;
      let end = findClusterBreak(child.text, off);
      if (end == off)
        return null;
      let rects = textRange(child.dom, off, end).getClientRects();
      return !rects.length || rects[0].top >= rects[0].bottom ? null : rects[0];
    }
    measureVisibleLineHeights(viewport) {
      let result = [], { from, to } = viewport;
      let contentWidth = this.view.contentDOM.clientWidth;
      let isWider = contentWidth > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
      let widest = -1, ltr = this.view.textDirection == Direction.LTR;
      for (let pos = 0, i = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (end > to)
          break;
        if (pos >= from) {
          let childRect = child.dom.getBoundingClientRect();
          result.push(childRect.height);
          if (isWider) {
            let last = child.dom.lastChild;
            let rects = last ? clientRectsFor(last) : [];
            if (rects.length) {
              let rect = rects[rects.length - 1];
              let width = ltr ? rect.right - childRect.left : childRect.right - rect.left;
              if (width > widest) {
                widest = width;
                this.minWidth = contentWidth;
                this.minWidthFrom = pos;
                this.minWidthTo = end;
              }
            }
          }
        }
        pos = end + child.breakAfter;
      }
      return result;
    }
    textDirectionAt(pos) {
      let { i } = this.childPos(pos, 1);
      return getComputedStyle(this.children[i].dom).direction == "rtl" ? Direction.RTL : Direction.LTR;
    }
    measureTextSize() {
      for (let child of this.children) {
        if (child instanceof LineView) {
          let measure = child.measureTextSize();
          if (measure)
            return measure;
        }
      }
      let dummy = document.createElement("div"), lineHeight, charWidth, textHeight;
      dummy.className = "cm-line";
      dummy.style.width = "99999px";
      dummy.style.position = "absolute";
      dummy.textContent = "abc def ghi jkl mno pqr stu";
      this.view.observer.ignore(() => {
        this.dom.appendChild(dummy);
        let rect = clientRectsFor(dummy.firstChild)[0];
        lineHeight = dummy.getBoundingClientRect().height;
        charWidth = rect ? rect.width / 27 : 7;
        textHeight = rect ? rect.height : lineHeight;
        dummy.remove();
      });
      return { lineHeight, charWidth, textHeight };
    }
    childCursor(pos = this.length) {
      let i = this.children.length;
      if (i)
        pos -= this.children[--i].length;
      return new ChildCursor(this.children, pos, i);
    }
    computeBlockGapDeco() {
      let deco = [], vs = this.view.viewState;
      for (let pos = 0, i = 0; ; i++) {
        let next = i == vs.viewports.length ? null : vs.viewports[i];
        let end = next ? next.from - 1 : this.length;
        if (end > pos) {
          let height = (vs.lineBlockAt(end).bottom - vs.lineBlockAt(pos).top) / this.view.scaleY;
          deco.push(Decoration.replace({
            widget: new BlockGapWidget(height),
            block: true,
            inclusive: true,
            isBlockGap: true
          }).range(pos, end));
        }
        if (!next)
          break;
        pos = next.to + 1;
      }
      return Decoration.set(deco);
    }
    updateDeco() {
      let allDeco = this.view.state.facet(decorations).map((d, i) => {
        let dynamic = this.dynamicDecorationMap[i] = typeof d == "function";
        return dynamic ? d(this.view) : d;
      });
      for (let i = allDeco.length; i < allDeco.length + 3; i++)
        this.dynamicDecorationMap[i] = false;
      return this.decorations = [
        ...allDeco,
        this.computeBlockGapDeco(),
        this.view.viewState.lineGapDeco
      ];
    }
    scrollIntoView(target) {
      let { range: range2 } = target;
      let rect = this.coordsAt(range2.head, range2.empty ? range2.assoc : range2.head > range2.anchor ? -1 : 1), other;
      if (!rect)
        return;
      if (!range2.empty && (other = this.coordsAt(range2.anchor, range2.anchor > range2.head ? -1 : 1)))
        rect = {
          left: Math.min(rect.left, other.left),
          top: Math.min(rect.top, other.top),
          right: Math.max(rect.right, other.right),
          bottom: Math.max(rect.bottom, other.bottom)
        };
      let margins = getScrollMargins(this.view);
      let targetRect = {
        left: rect.left - margins.left,
        top: rect.top - margins.top,
        right: rect.right + margins.right,
        bottom: rect.bottom + margins.bottom
      };
      scrollRectIntoView(this.view.scrollDOM, targetRect, range2.head < range2.anchor ? -1 : 1, target.x, target.y, target.xMargin, target.yMargin, this.view.textDirection == Direction.LTR);
    }
  };
  function betweenUneditable(pos) {
    return pos.node.nodeType == 1 && pos.node.firstChild && (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") && (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
  }
  var BlockGapWidget = class extends WidgetType {
    constructor(height) {
      super();
      this.height = height;
    }
    toDOM() {
      let elt = document.createElement("div");
      this.updateDOM(elt);
      return elt;
    }
    eq(other) {
      return other.height == this.height;
    }
    updateDOM(elt) {
      elt.style.height = this.height + "px";
      return true;
    }
    get estimatedHeight() {
      return this.height;
    }
  };
  function findCompositionNode(view, dLen) {
    let sel = view.observer.selectionRange;
    let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
    if (!textNode)
      return null;
    let cView = ContentView.get(textNode);
    let from, to;
    if (cView instanceof TextView) {
      from = cView.posAtStart;
      to = from + cView.length;
    } else {
      let oldLen = Math.max(0, textNode.nodeValue.length - dLen);
      up:
        for (let offset = 0, node = textNode; ; ) {
          for (let sibling = node.previousSibling, cView2; sibling; sibling = sibling.previousSibling) {
            if (cView2 = ContentView.get(sibling)) {
              to = cView2.posAtEnd + offset;
              from = Math.max(0, to - oldLen);
              break up;
            }
            let reader = new DOMReader([], view.state);
            reader.readNode(sibling);
            if (reader.text.indexOf(LineBreakPlaceholder) > -1)
              return null;
            offset += reader.text.length;
          }
          node = node.parentNode;
          if (!node)
            return null;
          let parentView = ContentView.get(node);
          if (parentView) {
            from = parentView.posAtStart + offset;
            to = from + oldLen;
            break;
          }
        }
    }
    return { from, to, node: textNode };
  }
  function findCompositionRange(view, changes) {
    let found = findCompositionNode(view, changes.newLength - changes.length);
    if (!found)
      return null;
    let { from: fromA, to: toA, node: textNode } = found;
    let fromB = changes.mapPos(fromA, -1), toB = changes.mapPos(toA, 1);
    let text = textNode.nodeValue;
    if (/[\n\r]/.test(text))
      return null;
    if (toB - fromB != text.length) {
      let fromB2 = changes.mapPos(fromA, 1), toB2 = changes.mapPos(toA, -1);
      if (toB2 - fromB2 == text.length)
        fromB = fromB2, toB = toB2;
      else if (view.state.doc.sliceString(toB - text.length, toB) == text)
        fromB = toB - text.length;
      else if (view.state.doc.sliceString(fromB, fromB + text.length) == text)
        toB = fromB + text.length;
      else
        return null;
    }
    let { main } = view.state.selection;
    if (view.state.doc.sliceString(fromB, toB) != text || fromB > main.head || toB < main.head)
      return null;
    let marks = [];
    let range2 = new ChangedRange(fromA, toA, fromB, toB);
    for (let parent = textNode.parentNode; ; parent = parent.parentNode) {
      let parentView = ContentView.get(parent);
      if (parentView instanceof MarkView)
        marks.push({ node: parent, deco: parentView.mark });
      else if (parentView instanceof LineView || parent.nodeName == "DIV" && parent.parentNode == view.contentDOM)
        return { range: range2, text: textNode, marks, line: parent };
      else if (parent != view.contentDOM)
        marks.push({ node: parent, deco: new MarkDecoration({
          inclusive: true,
          attributes: getAttrs(parent),
          tagName: parent.tagName.toLowerCase()
        }) });
      else
        return null;
    }
  }
  function nearbyTextNode(startNode, startOffset, side) {
    if (side <= 0)
      for (let node = startNode, offset = startOffset; ; ) {
        if (node.nodeType == 3)
          return node;
        if (node.nodeType == 1 && offset > 0) {
          node = node.childNodes[offset - 1];
          offset = maxOffset(node);
        } else {
          break;
        }
      }
    if (side >= 0)
      for (let node = startNode, offset = startOffset; ; ) {
        if (node.nodeType == 3)
          return node;
        if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
          node = node.childNodes[offset];
          offset = 0;
        } else {
          break;
        }
      }
    return null;
  }
  function nextToUneditable(node, offset) {
    if (node.nodeType != 1)
      return 0;
    return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
  }
  var DecorationComparator$1 = class DecorationComparator {
    constructor() {
      this.changes = [];
    }
    compareRange(from, to) {
      addRange(from, to, this.changes);
    }
    comparePoint(from, to) {
      addRange(from, to, this.changes);
    }
  };
  function findChangedDeco(a, b, diff) {
    let comp = new DecorationComparator$1();
    RangeSet.compare(a, b, diff, comp);
    return comp.changes;
  }
  function inUneditable(node, inside2) {
    for (let cur = node; cur && cur != inside2; cur = cur.assignedSlot || cur.parentNode) {
      if (cur.nodeType == 1 && cur.contentEditable == "false") {
        return true;
      }
    }
    return false;
  }
  function groupAt(state, pos, bias = 1) {
    let categorize = state.charCategorizer(pos);
    let line = state.doc.lineAt(pos), linePos = pos - line.from;
    if (line.length == 0)
      return EditorSelection.cursor(pos);
    if (linePos == 0)
      bias = 1;
    else if (linePos == line.length)
      bias = -1;
    let from = linePos, to = linePos;
    if (bias < 0)
      from = findClusterBreak(line.text, linePos, false);
    else
      to = findClusterBreak(line.text, linePos);
    let cat = categorize(line.text.slice(from, to));
    while (from > 0) {
      let prev = findClusterBreak(line.text, from, false);
      if (categorize(line.text.slice(prev, from)) != cat)
        break;
      from = prev;
    }
    while (to < line.length) {
      let next = findClusterBreak(line.text, to);
      if (categorize(line.text.slice(to, next)) != cat)
        break;
      to = next;
    }
    return EditorSelection.range(from + line.from, to + line.from);
  }
  function getdx(x, rect) {
    return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
  }
  function getdy(y, rect) {
    return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
  }
  function yOverlap(a, b) {
    return a.top < b.bottom - 1 && a.bottom > b.top + 1;
  }
  function upTop(rect, top2) {
    return top2 < rect.top ? { top: top2, left: rect.left, right: rect.right, bottom: rect.bottom } : rect;
  }
  function upBot(rect, bottom) {
    return bottom > rect.bottom ? { top: rect.top, left: rect.left, right: rect.right, bottom } : rect;
  }
  function domPosAtCoords(parent, x, y) {
    let closest, closestRect, closestX, closestY, closestOverlap = false;
    let above, below, aboveRect, belowRect;
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      let rects = clientRectsFor(child);
      for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        if (closestRect && yOverlap(closestRect, rect))
          rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
        let dx = getdx(x, rect), dy = getdy(y, rect);
        if (dx == 0 && dy == 0)
          return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
        if (!closest || closestY > dy || closestY == dy && closestX > dx) {
          closest = child;
          closestRect = rect;
          closestX = dx;
          closestY = dy;
          let side = dy ? y < rect.top ? -1 : 1 : dx ? x < rect.left ? -1 : 1 : 0;
          closestOverlap = !side || (side > 0 ? i < rects.length - 1 : i > 0);
        }
        if (dx == 0) {
          if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
            above = child;
            aboveRect = rect;
          } else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
            below = child;
            belowRect = rect;
          }
        } else if (aboveRect && yOverlap(aboveRect, rect)) {
          aboveRect = upBot(aboveRect, rect.bottom);
        } else if (belowRect && yOverlap(belowRect, rect)) {
          belowRect = upTop(belowRect, rect.top);
        }
      }
    }
    if (aboveRect && aboveRect.bottom >= y) {
      closest = above;
      closestRect = aboveRect;
    } else if (belowRect && belowRect.top <= y) {
      closest = below;
      closestRect = belowRect;
    }
    if (!closest)
      return { node: parent, offset: 0 };
    let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
    if (closest.nodeType == 3)
      return domPosInText(closest, clipX, y);
    if (closestOverlap && closest.contentEditable != "false")
      return domPosAtCoords(closest, clipX, y);
    let offset = Array.prototype.indexOf.call(parent.childNodes, closest) + (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
    return { node: parent, offset };
  }
  function domPosInText(node, x, y) {
    let len = node.nodeValue.length;
    let closestOffset = -1, closestDY = 1e9, generalSide = 0;
    for (let i = 0; i < len; i++) {
      let rects = textRange(node, i, i + 1).getClientRects();
      for (let j = 0; j < rects.length; j++) {
        let rect = rects[j];
        if (rect.top == rect.bottom)
          continue;
        if (!generalSide)
          generalSide = x - rect.left;
        let dy = (rect.top > y ? rect.top - y : y - rect.bottom) - 1;
        if (rect.left - 1 <= x && rect.right + 1 >= x && dy < closestDY) {
          let right = x >= (rect.left + rect.right) / 2, after = right;
          if (browser.chrome || browser.gecko) {
            let rectBefore = textRange(node, i).getBoundingClientRect();
            if (rectBefore.left == rect.right)
              after = !right;
          }
          if (dy <= 0)
            return { node, offset: i + (after ? 1 : 0) };
          closestOffset = i + (after ? 1 : 0);
          closestDY = dy;
        }
      }
    }
    return { node, offset: closestOffset > -1 ? closestOffset : generalSide > 0 ? node.nodeValue.length : 0 };
  }
  function posAtCoords(view, coords, precise, bias = -1) {
    var _a2, _b;
    let content2 = view.contentDOM.getBoundingClientRect(), docTop = content2.top + view.viewState.paddingTop;
    let block, { docHeight } = view.viewState;
    let { x, y } = coords, yOffset = y - docTop;
    if (yOffset < 0)
      return 0;
    if (yOffset > docHeight)
      return view.state.doc.length;
    for (let halfLine = view.viewState.heightOracle.textHeight / 2, bounced = false; ; ) {
      block = view.elementAtHeight(yOffset);
      if (block.type == BlockType.Text)
        break;
      for (; ; ) {
        yOffset = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
        if (yOffset >= 0 && yOffset <= docHeight)
          break;
        if (bounced)
          return precise ? null : 0;
        bounced = true;
        bias = -bias;
      }
    }
    y = docTop + yOffset;
    let lineStart = block.from;
    if (lineStart < view.viewport.from)
      return view.viewport.from == 0 ? 0 : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
    if (lineStart > view.viewport.to)
      return view.viewport.to == view.state.doc.length ? view.state.doc.length : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
    let doc2 = view.dom.ownerDocument;
    let root2 = view.root.elementFromPoint ? view.root : doc2;
    let element = root2.elementFromPoint(x, y);
    if (element && !view.contentDOM.contains(element))
      element = null;
    if (!element) {
      x = Math.max(content2.left + 1, Math.min(content2.right - 1, x));
      element = root2.elementFromPoint(x, y);
      if (element && !view.contentDOM.contains(element))
        element = null;
    }
    let node, offset = -1;
    if (element && ((_a2 = view.docView.nearest(element)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) != false) {
      if (doc2.caretPositionFromPoint) {
        let pos = doc2.caretPositionFromPoint(x, y);
        if (pos)
          ({ offsetNode: node, offset } = pos);
      } else if (doc2.caretRangeFromPoint) {
        let range2 = doc2.caretRangeFromPoint(x, y);
        if (range2) {
          ({ startContainer: node, startOffset: offset } = range2);
          if (!view.contentDOM.contains(node) || browser.safari && isSuspiciousSafariCaretResult(node, offset, x) || browser.chrome && isSuspiciousChromeCaretResult(node, offset, x))
            node = void 0;
        }
      }
    }
    if (!node || !view.docView.dom.contains(node)) {
      let line = LineView.find(view.docView, lineStart);
      if (!line)
        return yOffset > block.top + block.height / 2 ? block.to : block.from;
      ({ node, offset } = domPosAtCoords(line.dom, x, y));
    }
    let nearest = view.docView.nearest(node);
    if (!nearest)
      return null;
    if (nearest.isWidget && ((_b = nearest.dom) === null || _b === void 0 ? void 0 : _b.nodeType) == 1) {
      let rect = nearest.dom.getBoundingClientRect();
      return coords.y < rect.top || coords.y <= rect.bottom && coords.x <= (rect.left + rect.right) / 2 ? nearest.posAtStart : nearest.posAtEnd;
    } else {
      return nearest.localPosFromDOM(node, offset) + nearest.posAtStart;
    }
  }
  function posAtCoordsImprecise(view, contentRect, block, x, y) {
    let into = Math.round((x - contentRect.left) * view.defaultCharacterWidth);
    if (view.lineWrapping && block.height > view.defaultLineHeight * 1.5) {
      let textHeight = view.viewState.heightOracle.textHeight;
      let line = Math.floor((y - block.top - (view.defaultLineHeight - textHeight) * 0.5) / textHeight);
      into += line * view.viewState.heightOracle.lineLength;
    }
    let content2 = view.state.sliceDoc(block.from, block.to);
    return block.from + findColumn(content2, into, view.state.tabSize);
  }
  function isSuspiciousSafariCaretResult(node, offset, x) {
    let len;
    if (node.nodeType != 3 || offset != (len = node.nodeValue.length))
      return false;
    for (let next = node.nextSibling; next; next = next.nextSibling)
      if (next.nodeType != 1 || next.nodeName != "BR")
        return false;
    return textRange(node, len - 1, len).getBoundingClientRect().left > x;
  }
  function isSuspiciousChromeCaretResult(node, offset, x) {
    if (offset != 0)
      return false;
    for (let cur = node; ; ) {
      let parent = cur.parentNode;
      if (!parent || parent.nodeType != 1 || parent.firstChild != cur)
        return false;
      if (parent.classList.contains("cm-line"))
        break;
      cur = parent;
    }
    let rect = node.nodeType == 1 ? node.getBoundingClientRect() : textRange(node, 0, Math.max(node.nodeValue.length, 1)).getBoundingClientRect();
    return x - rect.left > 5;
  }
  function blockAt(view, pos) {
    let line = view.lineBlockAt(pos);
    if (Array.isArray(line.type))
      for (let l of line.type) {
        if (l.to > pos || l.to == pos && (l.to == line.to || l.type == BlockType.Text))
          return l;
      }
    return line;
  }
  function moveToLineBoundary(view, start, forward, includeWrap) {
    let line = blockAt(view, start.head);
    let coords = !includeWrap || line.type != BlockType.Text || !(view.lineWrapping || line.widgetLineBreaks) ? null : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
    if (coords) {
      let editorRect = view.dom.getBoundingClientRect();
      let direction = view.textDirectionAt(line.from);
      let pos = view.posAtCoords({
        x: forward == (direction == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
        y: (coords.top + coords.bottom) / 2
      });
      if (pos != null)
        return EditorSelection.cursor(pos, forward ? -1 : 1);
    }
    return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1);
  }
  function moveByChar(view, start, forward, by) {
    let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
    let direction = view.textDirectionAt(line.from);
    for (let cur = start, check = null; ; ) {
      let next = moveVisually(line, spans, direction, cur, forward), char = movedOver;
      if (!next) {
        if (line.number == (forward ? view.state.doc.lines : 1))
          return cur;
        char = "\n";
        line = view.state.doc.line(line.number + (forward ? 1 : -1));
        spans = view.bidiSpans(line);
        next = EditorSelection.cursor(forward ? line.from : line.to);
      }
      if (!check) {
        if (!by)
          return next;
        check = by(char);
      } else if (!check(char)) {
        return cur;
      }
      cur = next;
    }
  }
  function byGroup(view, pos, start) {
    let categorize = view.state.charCategorizer(pos);
    let cat = categorize(start);
    return (next) => {
      let nextCat = categorize(next);
      if (cat == CharCategory.Space)
        cat = nextCat;
      return cat == nextCat;
    };
  }
  function moveVertically(view, start, forward, distance) {
    let startPos = start.head, dir = forward ? 1 : -1;
    if (startPos == (forward ? view.state.doc.length : 0))
      return EditorSelection.cursor(startPos, start.assoc);
    let goal = start.goalColumn, startY;
    let rect = view.contentDOM.getBoundingClientRect();
    let startCoords = view.coordsAtPos(startPos), docTop = view.documentTop;
    if (startCoords) {
      if (goal == null)
        goal = startCoords.left - rect.left;
      startY = dir < 0 ? startCoords.top : startCoords.bottom;
    } else {
      let line = view.viewState.lineBlockAt(startPos);
      if (goal == null)
        goal = Math.min(rect.right - rect.left, view.defaultCharacterWidth * (startPos - line.from));
      startY = (dir < 0 ? line.top : line.bottom) + docTop;
    }
    let resolvedGoal = rect.left + goal;
    let dist2 = distance !== null && distance !== void 0 ? distance : view.viewState.heightOracle.textHeight >> 1;
    for (let extra = 0; ; extra += 10) {
      let curY = startY + (dist2 + extra) * dir;
      let pos = posAtCoords(view, { x: resolvedGoal, y: curY }, false, dir);
      if (curY < rect.top || curY > rect.bottom || (dir < 0 ? pos < startPos : pos > startPos))
        return EditorSelection.cursor(pos, start.assoc, void 0, goal);
    }
  }
  function skipAtomicRanges(atoms, pos, bias) {
    for (; ; ) {
      let moved = 0;
      for (let set of atoms) {
        set.between(pos - 1, pos + 1, (from, to, value) => {
          if (pos > from && pos < to) {
            let side = moved || bias || (pos - from < to - pos ? -1 : 1);
            pos = side < 0 ? from : to;
            moved = side;
          }
        });
      }
      if (!moved)
        return pos;
    }
  }
  function skipAtoms(view, oldPos, pos) {
    let newPos = skipAtomicRanges(view.state.facet(atomicRanges).map((f) => f(view)), pos.from, oldPos.head > pos.from ? -1 : 1);
    return newPos == pos.from ? pos : EditorSelection.cursor(newPos, newPos < pos.from ? 1 : -1);
  }
  var InputState = class {
    setSelectionOrigin(origin) {
      this.lastSelectionOrigin = origin;
      this.lastSelectionTime = Date.now();
    }
    constructor(view) {
      this.lastKeyCode = 0;
      this.lastKeyTime = 0;
      this.lastTouchTime = 0;
      this.lastFocusTime = 0;
      this.lastScrollTop = 0;
      this.lastScrollLeft = 0;
      this.chromeScrollHack = -1;
      this.pendingIOSKey = void 0;
      this.lastSelectionOrigin = null;
      this.lastSelectionTime = 0;
      this.lastEscPress = 0;
      this.lastContextMenu = 0;
      this.scrollHandlers = [];
      this.registeredEvents = [];
      this.customHandlers = [];
      this.composing = -1;
      this.compositionFirstChange = null;
      this.compositionEndedAt = 0;
      this.compositionPendingKey = false;
      this.compositionPendingChange = false;
      this.mouseSelection = null;
      let handleEvent = (handler, event) => {
        if (this.ignoreDuringComposition(event))
          return;
        if (event.type == "keydown" && this.keydown(view, event))
          return;
        if (this.mustFlushObserver(event))
          view.observer.forceFlush();
        if (this.runCustomHandlers(event.type, view, event))
          event.preventDefault();
        else
          handler(view, event);
      };
      for (let type in handlers) {
        let handler = handlers[type];
        view.contentDOM.addEventListener(type, (event) => {
          if (eventBelongsToEditor(view, event))
            handleEvent(handler, event);
        }, handlerOptions[type]);
        this.registeredEvents.push(type);
      }
      view.scrollDOM.addEventListener("mousedown", (event) => {
        if (event.target == view.scrollDOM && event.clientY > view.contentDOM.getBoundingClientRect().bottom) {
          handleEvent(handlers.mousedown, event);
          if (!event.defaultPrevented && event.button == 2) {
            let start = view.contentDOM.style.minHeight;
            view.contentDOM.style.minHeight = "100%";
            setTimeout(() => view.contentDOM.style.minHeight = start, 200);
          }
        }
      });
      view.scrollDOM.addEventListener("drop", (event) => {
        if (event.target == view.scrollDOM && event.clientY > view.contentDOM.getBoundingClientRect().bottom)
          handleEvent(handlers.drop, event);
      });
      if (browser.chrome && browser.chrome_version == 102) {
        view.scrollDOM.addEventListener("wheel", () => {
          if (this.chromeScrollHack < 0)
            view.contentDOM.style.pointerEvents = "none";
          else
            window.clearTimeout(this.chromeScrollHack);
          this.chromeScrollHack = setTimeout(() => {
            this.chromeScrollHack = -1;
            view.contentDOM.style.pointerEvents = "";
          }, 100);
        }, { passive: true });
      }
      this.notifiedFocused = view.hasFocus;
      if (browser.safari)
        view.contentDOM.addEventListener("input", () => null);
      if (browser.gecko)
        firefoxCopyCutHack(view.contentDOM.ownerDocument);
    }
    ensureHandlers(view, plugins) {
      var _a2;
      let handlers2;
      this.customHandlers = [];
      for (let plugin of plugins)
        if (handlers2 = (_a2 = plugin.update(view).spec) === null || _a2 === void 0 ? void 0 : _a2.domEventHandlers) {
          this.customHandlers.push({ plugin: plugin.value, handlers: handlers2 });
          for (let type in handlers2)
            if (this.registeredEvents.indexOf(type) < 0 && type != "scroll") {
              this.registeredEvents.push(type);
              view.contentDOM.addEventListener(type, (event) => {
                if (!eventBelongsToEditor(view, event))
                  return;
                if (this.runCustomHandlers(type, view, event))
                  event.preventDefault();
              });
            }
        }
    }
    runCustomHandlers(type, view, event) {
      for (let set of this.customHandlers) {
        let handler = set.handlers[type];
        if (handler) {
          try {
            if (handler.call(set.plugin, event, view) || event.defaultPrevented)
              return true;
          } catch (e) {
            logException(view.state, e);
          }
        }
      }
      return false;
    }
    runScrollHandlers(view, event) {
      this.lastScrollTop = view.scrollDOM.scrollTop;
      this.lastScrollLeft = view.scrollDOM.scrollLeft;
      for (let set of this.customHandlers) {
        let handler = set.handlers.scroll;
        if (handler) {
          try {
            handler.call(set.plugin, event, view);
          } catch (e) {
            logException(view.state, e);
          }
        }
      }
    }
    keydown(view, event) {
      this.lastKeyCode = event.keyCode;
      this.lastKeyTime = Date.now();
      if (event.keyCode == 9 && Date.now() < this.lastEscPress + 2e3)
        return true;
      if (event.keyCode != 27 && modifierCodes.indexOf(event.keyCode) < 0)
        view.inputState.lastEscPress = 0;
      if (browser.android && browser.chrome && !event.synthetic && (event.keyCode == 13 || event.keyCode == 8)) {
        view.observer.delayAndroidKey(event.key, event.keyCode);
        return true;
      }
      let pending;
      if (browser.ios && !event.synthetic && !event.altKey && !event.metaKey && ((pending = PendingKeys.find((key) => key.keyCode == event.keyCode)) && !event.ctrlKey || EmacsyPendingKeys.indexOf(event.key) > -1 && event.ctrlKey && !event.shiftKey)) {
        this.pendingIOSKey = pending || event;
        setTimeout(() => this.flushIOSKey(view), 250);
        return true;
      }
      return false;
    }
    flushIOSKey(view) {
      let key = this.pendingIOSKey;
      if (!key)
        return false;
      this.pendingIOSKey = void 0;
      return dispatchKey(view.contentDOM, key.key, key.keyCode);
    }
    ignoreDuringComposition(event) {
      if (!/^key/.test(event.type))
        return false;
      if (this.composing > 0)
        return true;
      if (browser.safari && !browser.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100) {
        this.compositionPendingKey = false;
        return true;
      }
      return false;
    }
    mustFlushObserver(event) {
      return event.type == "keydown" && event.keyCode != 229;
    }
    startMouseSelection(mouseSelection) {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
      this.mouseSelection = mouseSelection;
    }
    update(update) {
      if (this.mouseSelection)
        this.mouseSelection.update(update);
      if (update.transactions.length)
        this.lastKeyCode = this.lastSelectionTime = 0;
    }
    destroy() {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
    }
  };
  var PendingKeys = [
    { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
    { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
    { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
    { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
  ];
  var EmacsyPendingKeys = "dthko";
  var modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
  var dragScrollMargin = 6;
  function dragScrollSpeed(dist2) {
    return Math.max(0, dist2) * 0.7 + 8;
  }
  function dist(a, b) {
    return Math.max(Math.abs(a.clientX - b.clientX), Math.abs(a.clientY - b.clientY));
  }
  var MouseSelection = class {
    constructor(view, startEvent, style, mustSelect) {
      this.view = view;
      this.startEvent = startEvent;
      this.style = style;
      this.mustSelect = mustSelect;
      this.scrollSpeed = { x: 0, y: 0 };
      this.scrolling = -1;
      this.lastEvent = startEvent;
      this.scrollParent = scrollableParent(view.contentDOM);
      this.atoms = view.state.facet(atomicRanges).map((f) => f(view));
      let doc2 = view.contentDOM.ownerDocument;
      doc2.addEventListener("mousemove", this.move = this.move.bind(this));
      doc2.addEventListener("mouseup", this.up = this.up.bind(this));
      this.extend = startEvent.shiftKey;
      this.multiple = view.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view, startEvent);
      this.dragging = isInPrimarySelection(view, startEvent) && getClickType(startEvent) == 1 ? null : false;
    }
    start(event) {
      if (this.dragging === false) {
        event.preventDefault();
        this.select(event);
      }
    }
    move(event) {
      var _a2;
      if (event.buttons == 0)
        return this.destroy();
      if (this.dragging || this.dragging == null && dist(this.startEvent, event) < 10)
        return;
      this.select(this.lastEvent = event);
      let sx = 0, sy = 0;
      let rect = ((_a2 = this.scrollParent) === null || _a2 === void 0 ? void 0 : _a2.getBoundingClientRect()) || { left: 0, top: 0, right: this.view.win.innerWidth, bottom: this.view.win.innerHeight };
      let margins = getScrollMargins(this.view);
      if (event.clientX - margins.left <= rect.left + dragScrollMargin)
        sx = -dragScrollSpeed(rect.left - event.clientX);
      else if (event.clientX + margins.right >= rect.right - dragScrollMargin)
        sx = dragScrollSpeed(event.clientX - rect.right);
      if (event.clientY - margins.top <= rect.top + dragScrollMargin)
        sy = -dragScrollSpeed(rect.top - event.clientY);
      else if (event.clientY + margins.bottom >= rect.bottom - dragScrollMargin)
        sy = dragScrollSpeed(event.clientY - rect.bottom);
      this.setScrollSpeed(sx, sy);
    }
    up(event) {
      if (this.dragging == null)
        this.select(this.lastEvent);
      if (!this.dragging)
        event.preventDefault();
      this.destroy();
    }
    destroy() {
      this.setScrollSpeed(0, 0);
      let doc2 = this.view.contentDOM.ownerDocument;
      doc2.removeEventListener("mousemove", this.move);
      doc2.removeEventListener("mouseup", this.up);
      this.view.inputState.mouseSelection = null;
    }
    setScrollSpeed(sx, sy) {
      this.scrollSpeed = { x: sx, y: sy };
      if (sx || sy) {
        if (this.scrolling < 0)
          this.scrolling = setInterval(() => this.scroll(), 50);
      } else if (this.scrolling > -1) {
        clearInterval(this.scrolling);
        this.scrolling = -1;
      }
    }
    scroll() {
      if (this.scrollParent) {
        this.scrollParent.scrollLeft += this.scrollSpeed.x;
        this.scrollParent.scrollTop += this.scrollSpeed.y;
      } else {
        this.view.win.scrollBy(this.scrollSpeed.x, this.scrollSpeed.y);
      }
      if (this.dragging === false)
        this.select(this.lastEvent);
    }
    skipAtoms(sel) {
      let ranges = null;
      for (let i = 0; i < sel.ranges.length; i++) {
        let range2 = sel.ranges[i], updated = null;
        if (range2.empty) {
          let pos = skipAtomicRanges(this.atoms, range2.from, 0);
          if (pos != range2.from)
            updated = EditorSelection.cursor(pos, -1);
        } else {
          let from = skipAtomicRanges(this.atoms, range2.from, -1);
          let to = skipAtomicRanges(this.atoms, range2.to, 1);
          if (from != range2.from || to != range2.to)
            updated = EditorSelection.range(range2.from == range2.anchor ? from : to, range2.from == range2.head ? from : to);
        }
        if (updated) {
          if (!ranges)
            ranges = sel.ranges.slice();
          ranges[i] = updated;
        }
      }
      return ranges ? EditorSelection.create(ranges, sel.mainIndex) : sel;
    }
    select(event) {
      let { view } = this, selection = this.skipAtoms(this.style.get(event, this.extend, this.multiple));
      if (this.mustSelect || !selection.eq(view.state.selection) || selection.main.assoc != view.state.selection.main.assoc && this.dragging === false)
        this.view.dispatch({
          selection,
          userEvent: "select.pointer"
        });
      this.mustSelect = false;
    }
    update(update) {
      if (update.docChanged && this.dragging)
        this.dragging = this.dragging.map(update.changes);
      if (this.style.update(update))
        setTimeout(() => this.select(this.lastEvent), 20);
    }
  };
  function addsSelectionRange(view, event) {
    let facet = view.state.facet(clickAddsSelectionRange);
    return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
  }
  function dragMovesSelection(view, event) {
    let facet = view.state.facet(dragMovesSelection$1);
    return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
  }
  function isInPrimarySelection(view, event) {
    let { main } = view.state.selection;
    if (main.empty)
      return false;
    let sel = getSelection(view.root);
    if (!sel || sel.rangeCount == 0)
      return true;
    let rects = sel.getRangeAt(0).getClientRects();
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
        return true;
    }
    return false;
  }
  function eventBelongsToEditor(view, event) {
    if (!event.bubbles)
      return true;
    if (event.defaultPrevented)
      return false;
    for (let node = event.target, cView; node != view.contentDOM; node = node.parentNode)
      if (!node || node.nodeType == 11 || (cView = ContentView.get(node)) && cView.ignoreEvent(event))
        return false;
    return true;
  }
  var handlers = /* @__PURE__ */ Object.create(null);
  var handlerOptions = /* @__PURE__ */ Object.create(null);
  var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
  function capturePaste(view) {
    let parent = view.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(() => {
      view.focus();
      target.remove();
      doPaste(view, target.value);
    }, 50);
  }
  function doPaste(view, input) {
    let { state } = view, changes, i = 1, text = state.toText(input);
    let byLine = text.lines == state.selection.ranges.length;
    let linewise = lastLinewiseCopy != null && state.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
    if (linewise) {
      let lastLine = -1;
      changes = state.changeByRange((range2) => {
        let line = state.doc.lineAt(range2.from);
        if (line.from == lastLine)
          return { range: range2 };
        lastLine = line.from;
        let insert3 = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
        return {
          changes: { from: line.from, insert: insert3 },
          range: EditorSelection.cursor(range2.from + insert3.length)
        };
      });
    } else if (byLine) {
      changes = state.changeByRange((range2) => {
        let line = text.line(i++);
        return {
          changes: { from: range2.from, to: range2.to, insert: line.text },
          range: EditorSelection.cursor(range2.from + line.length)
        };
      });
    } else {
      changes = state.replaceSelection(text);
    }
    view.dispatch(changes, {
      userEvent: "input.paste",
      scrollIntoView: true
    });
  }
  handlers.keydown = (view, event) => {
    view.inputState.setSelectionOrigin("select");
    if (event.keyCode == 27)
      view.inputState.lastEscPress = Date.now();
  };
  handlers.touchstart = (view, e) => {
    view.inputState.lastTouchTime = Date.now();
    view.inputState.setSelectionOrigin("select.pointer");
  };
  handlers.touchmove = (view) => {
    view.inputState.setSelectionOrigin("select.pointer");
  };
  handlerOptions.touchstart = handlerOptions.touchmove = { passive: true };
  handlers.mousedown = (view, event) => {
    view.observer.flush();
    if (view.inputState.lastTouchTime > Date.now() - 2e3)
      return;
    let style = null;
    for (let makeStyle of view.state.facet(mouseSelectionStyle)) {
      style = makeStyle(view, event);
      if (style)
        break;
    }
    if (!style && event.button == 0)
      style = basicMouseSelection(view, event);
    if (style) {
      let mustFocus = !view.hasFocus;
      view.inputState.startMouseSelection(new MouseSelection(view, event, style, mustFocus));
      if (mustFocus)
        view.observer.ignore(() => focusPreventScroll(view.contentDOM));
      if (view.inputState.mouseSelection)
        view.inputState.mouseSelection.start(event);
    }
  };
  function rangeForClick(view, pos, bias, type) {
    if (type == 1) {
      return EditorSelection.cursor(pos, bias);
    } else if (type == 2) {
      return groupAt(view.state, pos, bias);
    } else {
      let visual = LineView.find(view.docView, pos), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
      let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
      if (to < view.state.doc.length && to == line.to)
        to++;
      return EditorSelection.range(from, to);
    }
  }
  var insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
  var inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
  function findPositionSide(view, pos, x, y) {
    let line = LineView.find(view.docView, pos);
    if (!line)
      return 1;
    let off = pos - line.posAtStart;
    if (off == 0)
      return 1;
    if (off == line.length)
      return -1;
    let before = line.coordsAt(off, -1);
    if (before && inside(x, y, before))
      return -1;
    let after = line.coordsAt(off, 1);
    if (after && inside(x, y, after))
      return 1;
    return before && insideY(y, before) ? -1 : 1;
  }
  function queryPos(view, event) {
    let pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    return { pos, bias: findPositionSide(view, pos, event.clientX, event.clientY) };
  }
  var BadMouseDetail = browser.ie && browser.ie_version <= 11;
  var lastMouseDown = null;
  var lastMouseDownCount = 0;
  var lastMouseDownTime = 0;
  function getClickType(event) {
    if (!BadMouseDetail)
      return event.detail;
    let last = lastMouseDown, lastTime = lastMouseDownTime;
    lastMouseDown = event;
    lastMouseDownTime = Date.now();
    return lastMouseDownCount = !last || lastTime > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 && Math.abs(last.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
  }
  function basicMouseSelection(view, event) {
    let start = queryPos(view, event), type = getClickType(event);
    let startSel = view.state.selection;
    return {
      update(update) {
        if (update.docChanged) {
          start.pos = update.changes.mapPos(start.pos);
          startSel = startSel.map(update.changes);
        }
      },
      get(event2, extend2, multiple) {
        let cur = queryPos(view, event2), removed;
        let range2 = rangeForClick(view, cur.pos, cur.bias, type);
        if (start.pos != cur.pos && !extend2) {
          let startRange = rangeForClick(view, start.pos, start.bias, type);
          let from = Math.min(startRange.from, range2.from), to = Math.max(startRange.to, range2.to);
          range2 = from < range2.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from);
        }
        if (extend2)
          return startSel.replaceRange(startSel.main.extend(range2.from, range2.to));
        else if (multiple && type == 1 && startSel.ranges.length > 1 && (removed = removeRangeAround(startSel, cur.pos)))
          return removed;
        else if (multiple)
          return startSel.addRange(range2);
        else
          return EditorSelection.create([range2]);
      }
    };
  }
  function removeRangeAround(sel, pos) {
    for (let i = 0; i < sel.ranges.length; i++) {
      let { from, to } = sel.ranges[i];
      if (from <= pos && to >= pos)
        return EditorSelection.create(sel.ranges.slice(0, i).concat(sel.ranges.slice(i + 1)), sel.mainIndex == i ? 0 : sel.mainIndex - (sel.mainIndex > i ? 1 : 0));
    }
    return null;
  }
  handlers.dragstart = (view, event) => {
    let { selection: { main } } = view.state;
    let { mouseSelection } = view.inputState;
    if (mouseSelection)
      mouseSelection.dragging = main;
    if (event.dataTransfer) {
      event.dataTransfer.setData("Text", view.state.sliceDoc(main.from, main.to));
      event.dataTransfer.effectAllowed = "copyMove";
    }
  };
  function dropText(view, event, text, direct) {
    if (!text)
      return;
    let dropPos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    event.preventDefault();
    let { mouseSelection } = view.inputState;
    let del = direct && mouseSelection && mouseSelection.dragging && dragMovesSelection(view, event) ? { from: mouseSelection.dragging.from, to: mouseSelection.dragging.to } : null;
    let ins = { from: dropPos, insert: text };
    let changes = view.state.changes(del ? [del, ins] : ins);
    view.focus();
    view.dispatch({
      changes,
      selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
      userEvent: del ? "move.drop" : "input.drop"
    });
  }
  handlers.drop = (view, event) => {
    if (!event.dataTransfer)
      return;
    if (view.state.readOnly)
      return event.preventDefault();
    let files = event.dataTransfer.files;
    if (files && files.length) {
      event.preventDefault();
      let text = Array(files.length), read = 0;
      let finishFile = () => {
        if (++read == files.length)
          dropText(view, event, text.filter((s) => s != null).join(view.state.lineBreak), false);
      };
      for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onerror = finishFile;
        reader.onload = () => {
          if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
            text[i] = reader.result;
          finishFile();
        };
        reader.readAsText(files[i]);
      }
    } else {
      dropText(view, event, event.dataTransfer.getData("Text"), true);
    }
  };
  handlers.paste = (view, event) => {
    if (view.state.readOnly)
      return event.preventDefault();
    view.observer.flush();
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      doPaste(view, data.getData("text/plain") || data.getData("text/uri-text"));
      event.preventDefault();
    } else {
      capturePaste(view);
    }
  };
  function captureCopy(view, text) {
    let parent = view.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.value = text;
    target.focus();
    target.selectionEnd = text.length;
    target.selectionStart = 0;
    setTimeout(() => {
      target.remove();
      view.focus();
    }, 50);
  }
  function copiedRange(state) {
    let content2 = [], ranges = [], linewise = false;
    for (let range2 of state.selection.ranges)
      if (!range2.empty) {
        content2.push(state.sliceDoc(range2.from, range2.to));
        ranges.push(range2);
      }
    if (!content2.length) {
      let upto = -1;
      for (let { from } of state.selection.ranges) {
        let line = state.doc.lineAt(from);
        if (line.number > upto) {
          content2.push(line.text);
          ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
        }
        upto = line.number;
      }
      linewise = true;
    }
    return { text: content2.join(state.lineBreak), ranges, linewise };
  }
  var lastLinewiseCopy = null;
  handlers.copy = handlers.cut = (view, event) => {
    let { text, ranges, linewise } = copiedRange(view.state);
    if (!text && !linewise)
      return;
    lastLinewiseCopy = linewise ? text : null;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      event.preventDefault();
      data.clearData();
      data.setData("text/plain", text);
    } else {
      captureCopy(view, text);
    }
    if (event.type == "cut" && !view.state.readOnly)
      view.dispatch({
        changes: ranges,
        scrollIntoView: true,
        userEvent: "delete.cut"
      });
  };
  var isFocusChange = /* @__PURE__ */ Annotation.define();
  function focusChangeTransaction(state, focus) {
    let effects = [];
    for (let getEffect of state.facet(focusChangeEffect)) {
      let effect = getEffect(state, focus);
      if (effect)
        effects.push(effect);
    }
    return effects ? state.update({ effects, annotations: isFocusChange.of(true) }) : null;
  }
  function updateForFocusChange(view) {
    setTimeout(() => {
      let focus = view.hasFocus;
      if (focus != view.inputState.notifiedFocused) {
        let tr = focusChangeTransaction(view.state, focus);
        if (tr)
          view.dispatch(tr);
        else
          view.update([]);
      }
    }, 10);
  }
  handlers.focus = (view) => {
    view.inputState.lastFocusTime = Date.now();
    if (!view.scrollDOM.scrollTop && (view.inputState.lastScrollTop || view.inputState.lastScrollLeft)) {
      view.scrollDOM.scrollTop = view.inputState.lastScrollTop;
      view.scrollDOM.scrollLeft = view.inputState.lastScrollLeft;
    }
    updateForFocusChange(view);
  };
  handlers.blur = (view) => {
    view.observer.clearSelectionRange();
    updateForFocusChange(view);
  };
  handlers.compositionstart = handlers.compositionupdate = (view) => {
    if (view.inputState.compositionFirstChange == null)
      view.inputState.compositionFirstChange = true;
    if (view.inputState.composing < 0) {
      view.inputState.composing = 0;
    }
  };
  handlers.compositionend = (view) => {
    view.inputState.composing = -1;
    view.inputState.compositionEndedAt = Date.now();
    view.inputState.compositionPendingKey = true;
    view.inputState.compositionPendingChange = view.observer.pendingRecords().length > 0;
    view.inputState.compositionFirstChange = null;
    if (browser.chrome && browser.android) {
      view.observer.flushSoon();
    } else if (view.inputState.compositionPendingChange) {
      Promise.resolve().then(() => view.observer.flush());
    } else {
      setTimeout(() => {
        if (view.inputState.composing < 0 && view.docView.hasComposition)
          view.update([]);
      }, 50);
    }
  };
  handlers.contextmenu = (view) => {
    view.inputState.lastContextMenu = Date.now();
  };
  handlers.beforeinput = (view, event) => {
    var _a2;
    let pending;
    if (browser.chrome && browser.android && (pending = PendingKeys.find((key) => key.inputType == event.inputType))) {
      view.observer.delayAndroidKey(pending.key, pending.keyCode);
      if (pending.key == "Backspace" || pending.key == "Delete") {
        let startViewHeight = ((_a2 = window.visualViewport) === null || _a2 === void 0 ? void 0 : _a2.height) || 0;
        setTimeout(() => {
          var _a3;
          if ((((_a3 = window.visualViewport) === null || _a3 === void 0 ? void 0 : _a3.height) || 0) > startViewHeight + 10 && view.hasFocus) {
            view.contentDOM.blur();
            view.focus();
          }
        }, 100);
      }
    }
  };
  var appliedFirefoxHack = /* @__PURE__ */ new Set();
  function firefoxCopyCutHack(doc2) {
    if (!appliedFirefoxHack.has(doc2)) {
      appliedFirefoxHack.add(doc2);
      doc2.addEventListener("copy", () => {
      });
      doc2.addEventListener("cut", () => {
      });
    }
  }
  var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
  var HeightOracle = class {
    constructor(lineWrapping) {
      this.lineWrapping = lineWrapping;
      this.doc = Text.empty;
      this.heightSamples = {};
      this.lineHeight = 14;
      this.charWidth = 7;
      this.textHeight = 14;
      this.lineLength = 30;
      this.heightChanged = false;
    }
    heightForGap(from, to) {
      let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
      if (this.lineWrapping)
        lines += Math.max(0, Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength));
      return this.lineHeight * lines;
    }
    heightForLine(length) {
      if (!this.lineWrapping)
        return this.lineHeight;
      let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
      return lines * this.lineHeight;
    }
    setDoc(doc2) {
      this.doc = doc2;
      return this;
    }
    mustRefreshForWrapping(whiteSpace) {
      return wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping;
    }
    mustRefreshForHeights(lineHeights) {
      let newHeight = false;
      for (let i = 0; i < lineHeights.length; i++) {
        let h = lineHeights[i];
        if (h < 0) {
          i++;
        } else if (!this.heightSamples[Math.floor(h * 10)]) {
          newHeight = true;
          this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return newHeight;
    }
    refresh(whiteSpace, lineHeight, charWidth, textHeight, lineLength, knownHeights) {
      let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
      let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping;
      this.lineWrapping = lineWrapping;
      this.lineHeight = lineHeight;
      this.charWidth = charWidth;
      this.textHeight = textHeight;
      this.lineLength = lineLength;
      if (changed) {
        this.heightSamples = {};
        for (let i = 0; i < knownHeights.length; i++) {
          let h = knownHeights[i];
          if (h < 0)
            i++;
          else
            this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return changed;
    }
  };
  var MeasuredHeights = class {
    constructor(from, heights) {
      this.from = from;
      this.heights = heights;
      this.index = 0;
    }
    get more() {
      return this.index < this.heights.length;
    }
  };
  var BlockInfo = class _BlockInfo {
    /**
    @internal
    */
    constructor(from, length, top2, height, _content) {
      this.from = from;
      this.length = length;
      this.top = top2;
      this.height = height;
      this._content = _content;
    }
    /**
    The type of element this is. When querying lines, this may be
    an array of all the blocks that make up the line.
    */
    get type() {
      return typeof this._content == "number" ? BlockType.Text : Array.isArray(this._content) ? this._content : this._content.type;
    }
    /**
    The end of the element as a document position.
    */
    get to() {
      return this.from + this.length;
    }
    /**
    The bottom position of the element.
    */
    get bottom() {
      return this.top + this.height;
    }
    /**
    If this is a widget block, this will return the widget
    associated with it.
    */
    get widget() {
      return this._content instanceof PointDecoration ? this._content.widget : null;
    }
    /**
    If this is a textblock, this holds the number of line breaks
    that appear in widgets inside the block.
    */
    get widgetLineBreaks() {
      return typeof this._content == "number" ? this._content : 0;
    }
    /**
    @internal
    */
    join(other) {
      let content2 = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(other._content) ? other._content : [other]);
      return new _BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, content2);
    }
  };
  var QueryType = /* @__PURE__ */ function(QueryType2) {
    QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
    QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
    QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
    return QueryType2;
  }(QueryType || (QueryType = {}));
  var Epsilon = 1e-3;
  var HeightMap = class _HeightMap {
    constructor(length, height, flags = 2) {
      this.length = length;
      this.height = height;
      this.flags = flags;
    }
    get outdated() {
      return (this.flags & 2) > 0;
    }
    set outdated(value) {
      this.flags = (value ? 2 : 0) | this.flags & ~2;
    }
    setHeight(oracle, height) {
      if (this.height != height) {
        if (Math.abs(this.height - height) > Epsilon)
          oracle.heightChanged = true;
        this.height = height;
      }
    }
    // Base case is to replace a leaf node, which simply builds a tree
    // from the new nodes and returns that (HeightMapBranch and
    // HeightMapGap override this to actually use from/to)
    replace(_from, _to, nodes) {
      return _HeightMap.of(nodes);
    }
    // Again, these are base cases, and are overridden for branch and gap nodes.
    decomposeLeft(_to, result) {
      result.push(this);
    }
    decomposeRight(_from, result) {
      result.push(this);
    }
    applyChanges(decorations2, oldDoc, oracle, changes) {
      let me = this, doc2 = oracle.doc;
      for (let i = changes.length - 1; i >= 0; i--) {
        let { fromA, toA, fromB, toB } = changes[i];
        let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle.setDoc(oldDoc), 0, 0);
        let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oracle, 0, 0);
        toB += end.to - toA;
        toA = end.to;
        while (i > 0 && start.from <= changes[i - 1].toA) {
          fromA = changes[i - 1].fromA;
          fromB = changes[i - 1].fromB;
          i--;
          if (fromA < start.from)
            start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle, 0, 0);
        }
        fromB += start.from - fromA;
        fromA = start.from;
        let nodes = NodeBuilder.build(oracle.setDoc(doc2), decorations2, fromB, toB);
        me = me.replace(fromA, toA, nodes);
      }
      return me.updateHeight(oracle, 0);
    }
    static empty() {
      return new HeightMapText(0, 0);
    }
    // nodes uses null values to indicate the position of line breaks.
    // There are never line breaks at the start or end of the array, or
    // two line breaks next to each other, and the array isn't allowed
    // to be empty (same restrictions as return value from the builder).
    static of(nodes) {
      if (nodes.length == 1)
        return nodes[0];
      let i = 0, j = nodes.length, before = 0, after = 0;
      for (; ; ) {
        if (i == j) {
          if (before > after * 2) {
            let split = nodes[i - 1];
            if (split.break)
              nodes.splice(--i, 1, split.left, null, split.right);
            else
              nodes.splice(--i, 1, split.left, split.right);
            j += 1 + split.break;
            before -= split.size;
          } else if (after > before * 2) {
            let split = nodes[j];
            if (split.break)
              nodes.splice(j, 1, split.left, null, split.right);
            else
              nodes.splice(j, 1, split.left, split.right);
            j += 2 + split.break;
            after -= split.size;
          } else {
            break;
          }
        } else if (before < after) {
          let next = nodes[i++];
          if (next)
            before += next.size;
        } else {
          let next = nodes[--j];
          if (next)
            after += next.size;
        }
      }
      let brk = 0;
      if (nodes[i - 1] == null) {
        brk = 1;
        i--;
      } else if (nodes[i] == null) {
        brk = 1;
        j++;
      }
      return new HeightMapBranch(_HeightMap.of(nodes.slice(0, i)), brk, _HeightMap.of(nodes.slice(j)));
    }
  };
  HeightMap.prototype.size = 1;
  var HeightMapBlock = class extends HeightMap {
    constructor(length, height, deco) {
      super(length, height);
      this.deco = deco;
    }
    blockAt(_height, _oracle, top2, offset) {
      return new BlockInfo(offset, this.length, top2, this.height, this.deco || 0);
    }
    lineAt(_value, _type, oracle, top2, offset) {
      return this.blockAt(0, oracle, top2, offset);
    }
    forEachLine(from, to, oracle, top2, offset, f) {
      if (from <= offset + this.length && to >= offset)
        f(this.blockAt(0, oracle, top2, offset));
    }
    updateHeight(oracle, offset = 0, _force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      this.outdated = false;
      return this;
    }
    toString() {
      return `block(${this.length})`;
    }
  };
  var HeightMapText = class _HeightMapText extends HeightMapBlock {
    constructor(length, height) {
      super(length, height, null);
      this.collapsed = 0;
      this.widgetHeight = 0;
      this.breaks = 0;
    }
    blockAt(_height, _oracle, top2, offset) {
      return new BlockInfo(offset, this.length, top2, this.height, this.breaks);
    }
    replace(_from, _to, nodes) {
      let node = nodes[0];
      if (nodes.length == 1 && (node instanceof _HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
        if (node instanceof HeightMapGap)
          node = new _HeightMapText(node.length, this.height);
        else
          node.height = this.height;
        if (!this.outdated)
          node.outdated = false;
        return node;
      } else {
        return HeightMap.of(nodes);
      }
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      else if (force || this.outdated)
        this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)) + this.breaks * oracle.lineHeight);
      this.outdated = false;
      return this;
    }
    toString() {
      return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
    }
  };
  var HeightMapGap = class _HeightMapGap extends HeightMap {
    constructor(length) {
      super(length, 0);
    }
    heightMetrics(oracle, offset) {
      let firstLine = oracle.doc.lineAt(offset).number, lastLine = oracle.doc.lineAt(offset + this.length).number;
      let lines = lastLine - firstLine + 1;
      let perLine, perChar = 0;
      if (oracle.lineWrapping) {
        let totalPerLine = Math.min(this.height, oracle.lineHeight * lines);
        perLine = totalPerLine / lines;
        if (this.length > lines + 1)
          perChar = (this.height - totalPerLine) / (this.length - lines - 1);
      } else {
        perLine = this.height / lines;
      }
      return { firstLine, lastLine, perLine, perChar };
    }
    blockAt(height, oracle, top2, offset) {
      let { firstLine, lastLine, perLine, perChar } = this.heightMetrics(oracle, offset);
      if (oracle.lineWrapping) {
        let guess = offset + Math.round(Math.max(0, Math.min(1, (height - top2) / this.height)) * this.length);
        let line = oracle.doc.lineAt(guess), lineHeight = perLine + line.length * perChar;
        let lineTop = Math.max(top2, height - lineHeight / 2);
        return new BlockInfo(line.from, line.length, lineTop, lineHeight, 0);
      } else {
        let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / perLine)));
        let { from, length } = oracle.doc.line(firstLine + line);
        return new BlockInfo(from, length, top2 + perLine * line, perLine, 0);
      }
    }
    lineAt(value, type, oracle, top2, offset) {
      if (type == QueryType.ByHeight)
        return this.blockAt(value, oracle, top2, offset);
      if (type == QueryType.ByPosNoHeight) {
        let { from, to } = oracle.doc.lineAt(value);
        return new BlockInfo(from, to - from, 0, 0, 0);
      }
      let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
      let line = oracle.doc.lineAt(value), lineHeight = perLine + line.length * perChar;
      let linesAbove = line.number - firstLine;
      let lineTop = top2 + perLine * linesAbove + perChar * (line.from - offset - linesAbove);
      return new BlockInfo(line.from, line.length, Math.max(top2, Math.min(lineTop, top2 + this.height - lineHeight)), lineHeight, 0);
    }
    forEachLine(from, to, oracle, top2, offset, f) {
      from = Math.max(from, offset);
      to = Math.min(to, offset + this.length);
      let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
      for (let pos = from, lineTop = top2; pos <= to; ) {
        let line = oracle.doc.lineAt(pos);
        if (pos == from) {
          let linesAbove = line.number - firstLine;
          lineTop += perLine * linesAbove + perChar * (from - offset - linesAbove);
        }
        let lineHeight = perLine + perChar * line.length;
        f(new BlockInfo(line.from, line.length, lineTop, lineHeight, 0));
        lineTop += lineHeight;
        pos = line.to + 1;
      }
    }
    replace(from, to, nodes) {
      let after = this.length - to;
      if (after > 0) {
        let last = nodes[nodes.length - 1];
        if (last instanceof _HeightMapGap)
          nodes[nodes.length - 1] = new _HeightMapGap(last.length + after);
        else
          nodes.push(null, new _HeightMapGap(after - 1));
      }
      if (from > 0) {
        let first = nodes[0];
        if (first instanceof _HeightMapGap)
          nodes[0] = new _HeightMapGap(from + first.length);
        else
          nodes.unshift(new _HeightMapGap(from - 1), null);
      }
      return HeightMap.of(nodes);
    }
    decomposeLeft(to, result) {
      result.push(new _HeightMapGap(to - 1), null);
    }
    decomposeRight(from, result) {
      result.push(null, new _HeightMapGap(this.length - from - 1));
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let end = offset + this.length;
      if (measured && measured.from <= offset + this.length && measured.more) {
        let nodes = [], pos = Math.max(offset, measured.from), singleHeight = -1;
        if (measured.from > offset)
          nodes.push(new _HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
        while (pos <= end && measured.more) {
          let len = oracle.doc.lineAt(pos).length;
          if (nodes.length)
            nodes.push(null);
          let height = measured.heights[measured.index++];
          if (singleHeight == -1)
            singleHeight = height;
          else if (Math.abs(height - singleHeight) >= Epsilon)
            singleHeight = -2;
          let line = new HeightMapText(len, height);
          line.outdated = false;
          nodes.push(line);
          pos += len + 1;
        }
        if (pos <= end)
          nodes.push(null, new _HeightMapGap(end - pos).updateHeight(oracle, pos));
        let result = HeightMap.of(nodes);
        if (singleHeight < 0 || Math.abs(result.height - this.height) >= Epsilon || Math.abs(singleHeight - this.heightMetrics(oracle, offset).perLine) >= Epsilon)
          oracle.heightChanged = true;
        return result;
      } else if (force || this.outdated) {
        this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
        this.outdated = false;
      }
      return this;
    }
    toString() {
      return `gap(${this.length})`;
    }
  };
  var HeightMapBranch = class extends HeightMap {
    constructor(left, brk, right) {
      super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
      this.left = left;
      this.right = right;
      this.size = left.size + right.size;
    }
    get break() {
      return this.flags & 1;
    }
    blockAt(height, oracle, top2, offset) {
      let mid = top2 + this.left.height;
      return height < mid ? this.left.blockAt(height, oracle, top2, offset) : this.right.blockAt(height, oracle, mid, offset + this.left.length + this.break);
    }
    lineAt(value, type, oracle, top2, offset) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      let left = type == QueryType.ByHeight ? value < rightTop : value < rightOffset;
      let base2 = left ? this.left.lineAt(value, type, oracle, top2, offset) : this.right.lineAt(value, type, oracle, rightTop, rightOffset);
      if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
        return base2;
      let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
      if (left)
        return base2.join(this.right.lineAt(rightOffset, subQuery, oracle, rightTop, rightOffset));
      else
        return this.left.lineAt(rightOffset, subQuery, oracle, top2, offset).join(base2);
    }
    forEachLine(from, to, oracle, top2, offset, f) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      if (this.break) {
        if (from < rightOffset)
          this.left.forEachLine(from, to, oracle, top2, offset, f);
        if (to >= rightOffset)
          this.right.forEachLine(from, to, oracle, rightTop, rightOffset, f);
      } else {
        let mid = this.lineAt(rightOffset, QueryType.ByPos, oracle, top2, offset);
        if (from < mid.from)
          this.left.forEachLine(from, mid.from - 1, oracle, top2, offset, f);
        if (mid.to >= from && mid.from <= to)
          f(mid);
        if (to > mid.to)
          this.right.forEachLine(mid.to + 1, to, oracle, rightTop, rightOffset, f);
      }
    }
    replace(from, to, nodes) {
      let rightStart = this.left.length + this.break;
      if (to < rightStart)
        return this.balanced(this.left.replace(from, to, nodes), this.right);
      if (from > this.left.length)
        return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
      let result = [];
      if (from > 0)
        this.decomposeLeft(from, result);
      let left = result.length;
      for (let node of nodes)
        result.push(node);
      if (from > 0)
        mergeGaps(result, left - 1);
      if (to < this.length) {
        let right = result.length;
        this.decomposeRight(to, result);
        mergeGaps(result, right);
      }
      return HeightMap.of(result);
    }
    decomposeLeft(to, result) {
      let left = this.left.length;
      if (to <= left)
        return this.left.decomposeLeft(to, result);
      result.push(this.left);
      if (this.break) {
        left++;
        if (to >= left)
          result.push(null);
      }
      if (to > left)
        this.right.decomposeLeft(to - left, result);
    }
    decomposeRight(from, result) {
      let left = this.left.length, right = left + this.break;
      if (from >= right)
        return this.right.decomposeRight(from - right, result);
      if (from < left)
        this.left.decomposeRight(from, result);
      if (this.break && from < right)
        result.push(null);
      result.push(this.right);
    }
    balanced(left, right) {
      if (left.size > 2 * right.size || right.size > 2 * left.size)
        return HeightMap.of(this.break ? [left, null, right] : [left, right]);
      this.left = left;
      this.right = right;
      this.height = left.height + right.height;
      this.outdated = left.outdated || right.outdated;
      this.size = left.size + right.size;
      this.length = left.length + this.break + right.length;
      return this;
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
      if (measured && measured.from <= offset + left.length && measured.more)
        rebalance = left = left.updateHeight(oracle, offset, force, measured);
      else
        left.updateHeight(oracle, offset, force);
      if (measured && measured.from <= rightStart + right.length && measured.more)
        rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
      else
        right.updateHeight(oracle, rightStart, force);
      if (rebalance)
        return this.balanced(left, right);
      this.height = this.left.height + this.right.height;
      this.outdated = false;
      return this;
    }
    toString() {
      return this.left + (this.break ? " " : "-") + this.right;
    }
  };
  function mergeGaps(nodes, around) {
    let before, after;
    if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
      nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
  }
  var relevantWidgetHeight = 5;
  var NodeBuilder = class _NodeBuilder {
    constructor(pos, oracle) {
      this.pos = pos;
      this.oracle = oracle;
      this.nodes = [];
      this.lineStart = -1;
      this.lineEnd = -1;
      this.covering = null;
      this.writtenTo = pos;
    }
    get isCovered() {
      return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
    }
    span(_from, to) {
      if (this.lineStart > -1) {
        let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
        if (last instanceof HeightMapText)
          last.length += end - this.pos;
        else if (end > this.pos || !this.isCovered)
          this.nodes.push(new HeightMapText(end - this.pos, -1));
        this.writtenTo = end;
        if (to > end) {
          this.nodes.push(null);
          this.writtenTo++;
          this.lineStart = -1;
        }
      }
      this.pos = to;
    }
    point(from, to, deco) {
      if (from < to || deco.heightRelevant) {
        let height = deco.widget ? deco.widget.estimatedHeight : 0;
        let breaks = deco.widget ? deco.widget.lineBreaks : 0;
        if (height < 0)
          height = this.oracle.lineHeight;
        let len = to - from;
        if (deco.block) {
          this.addBlock(new HeightMapBlock(len, height, deco));
        } else if (len || breaks || height >= relevantWidgetHeight) {
          this.addLineDeco(height, breaks, len);
        }
      } else if (to > from) {
        this.span(from, to);
      }
      if (this.lineEnd > -1 && this.lineEnd < this.pos)
        this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
    }
    enterLine() {
      if (this.lineStart > -1)
        return;
      let { from, to } = this.oracle.doc.lineAt(this.pos);
      this.lineStart = from;
      this.lineEnd = to;
      if (this.writtenTo < from) {
        if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
          this.nodes.push(this.blankContent(this.writtenTo, from - 1));
        this.nodes.push(null);
      }
      if (this.pos > from)
        this.nodes.push(new HeightMapText(this.pos - from, -1));
      this.writtenTo = this.pos;
    }
    blankContent(from, to) {
      let gap = new HeightMapGap(to - from);
      if (this.oracle.doc.lineAt(from).to == to)
        gap.flags |= 4;
      return gap;
    }
    ensureLine() {
      this.enterLine();
      let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
      if (last instanceof HeightMapText)
        return last;
      let line = new HeightMapText(0, -1);
      this.nodes.push(line);
      return line;
    }
    addBlock(block) {
      var _a2;
      this.enterLine();
      let type = (_a2 = block.deco) === null || _a2 === void 0 ? void 0 : _a2.type;
      if (type == BlockType.WidgetAfter && !this.isCovered)
        this.ensureLine();
      this.nodes.push(block);
      this.writtenTo = this.pos = this.pos + block.length;
      if (type != BlockType.WidgetBefore)
        this.covering = block;
    }
    addLineDeco(height, breaks, length) {
      let line = this.ensureLine();
      line.length += length;
      line.collapsed += length;
      line.widgetHeight = Math.max(line.widgetHeight, height);
      line.breaks += breaks;
      this.writtenTo = this.pos = this.pos + length;
    }
    finish(from) {
      let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
      if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
        this.nodes.push(new HeightMapText(0, -1));
      else if (this.writtenTo < this.pos || last == null)
        this.nodes.push(this.blankContent(this.writtenTo, this.pos));
      let pos = from;
      for (let node of this.nodes) {
        if (node instanceof HeightMapText)
          node.updateHeight(this.oracle, pos);
        pos += node ? node.length : 1;
      }
      return this.nodes;
    }
    // Always called with a region that on both sides either stretches
    // to a line break or the end of the document.
    // The returned array uses null to indicate line breaks, but never
    // starts or ends in a line break, or has multiple line breaks next
    // to each other.
    static build(oracle, decorations2, from, to) {
      let builder = new _NodeBuilder(from, oracle);
      RangeSet.spans(decorations2, from, to, builder, 0);
      return builder.finish(from);
    }
  };
  function heightRelevantDecoChanges(a, b, diff) {
    let comp = new DecorationComparator2();
    RangeSet.compare(a, b, diff, comp, 0);
    return comp.changes;
  }
  var DecorationComparator2 = class {
    constructor() {
      this.changes = [];
    }
    compareRange() {
    }
    comparePoint(from, to, a, b) {
      if (from < to || a && a.heightRelevant || b && b.heightRelevant)
        addRange(from, to, this.changes, 5);
    }
  };
  function visiblePixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
    let left = Math.max(0, rect.left), right = Math.min(win.innerWidth, rect.right);
    let top2 = Math.max(0, rect.top), bottom = Math.min(win.innerHeight, rect.bottom);
    for (let parent = dom.parentNode; parent && parent != doc2.body; ) {
      if (parent.nodeType == 1) {
        let elt = parent;
        let style = window.getComputedStyle(elt);
        if ((elt.scrollHeight > elt.clientHeight || elt.scrollWidth > elt.clientWidth) && style.overflow != "visible") {
          let parentRect = elt.getBoundingClientRect();
          left = Math.max(left, parentRect.left);
          right = Math.min(right, parentRect.right);
          top2 = Math.max(top2, parentRect.top);
          bottom = parent == dom.parentNode ? parentRect.bottom : Math.min(bottom, parentRect.bottom);
        }
        parent = style.position == "absolute" || style.position == "fixed" ? elt.offsetParent : elt.parentNode;
      } else if (parent.nodeType == 11) {
        parent = parent.host;
      } else {
        break;
      }
    }
    return {
      left: left - rect.left,
      right: Math.max(left, right) - rect.left,
      top: top2 - (rect.top + paddingTop),
      bottom: Math.max(top2, bottom) - (rect.top + paddingTop)
    };
  }
  function fullPixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    return {
      left: 0,
      right: rect.right - rect.left,
      top: paddingTop,
      bottom: rect.bottom - (rect.top + paddingTop)
    };
  }
  var LineGap = class {
    constructor(from, to, size) {
      this.from = from;
      this.to = to;
      this.size = size;
    }
    static same(a, b) {
      if (a.length != b.length)
        return false;
      for (let i = 0; i < a.length; i++) {
        let gA = a[i], gB = b[i];
        if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
          return false;
      }
      return true;
    }
    draw(viewState, wrapping) {
      return Decoration.replace({
        widget: new LineGapWidget(this.size * (wrapping ? viewState.scaleY : viewState.scaleX), wrapping)
      }).range(this.from, this.to);
    }
  };
  var LineGapWidget = class extends WidgetType {
    constructor(size, vertical) {
      super();
      this.size = size;
      this.vertical = vertical;
    }
    eq(other) {
      return other.size == this.size && other.vertical == this.vertical;
    }
    toDOM() {
      let elt = document.createElement("div");
      if (this.vertical) {
        elt.style.height = this.size + "px";
      } else {
        elt.style.width = this.size + "px";
        elt.style.height = "2px";
        elt.style.display = "inline-block";
      }
      return elt;
    }
    get estimatedHeight() {
      return this.vertical ? this.size : -1;
    }
  };
  var ViewState = class {
    constructor(state) {
      this.state = state;
      this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
      this.inView = true;
      this.paddingTop = 0;
      this.paddingBottom = 0;
      this.contentDOMWidth = 0;
      this.contentDOMHeight = 0;
      this.editorHeight = 0;
      this.editorWidth = 0;
      this.scrollTop = 0;
      this.scrolledToBottom = true;
      this.scaleX = 1;
      this.scaleY = 1;
      this.scrollAnchorPos = 0;
      this.scrollAnchorHeight = -1;
      this.scaler = IdScaler;
      this.scrollTarget = null;
      this.printing = false;
      this.mustMeasureContent = true;
      this.defaultTextDirection = Direction.LTR;
      this.visibleRanges = [];
      this.mustEnforceCursorAssoc = false;
      let guessWrapping = state.facet(contentAttributes).some((v) => typeof v != "function" && v.class == "cm-lineWrapping");
      this.heightOracle = new HeightOracle(guessWrapping);
      this.stateDeco = state.facet(decorations).filter((d) => typeof d != "function");
      this.heightMap = HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
      this.viewport = this.getViewport(0, null);
      this.updateViewportLines();
      this.updateForViewport();
      this.lineGaps = this.ensureLineGaps([]);
      this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(this, false)));
      this.computeVisibleRanges();
    }
    updateForViewport() {
      let viewports = [this.viewport], { main } = this.state.selection;
      for (let i = 0; i <= 1; i++) {
        let pos = i ? main.head : main.anchor;
        if (!viewports.some(({ from, to }) => pos >= from && pos <= to)) {
          let { from, to } = this.lineBlockAt(pos);
          viewports.push(new Viewport(from, to));
        }
      }
      this.viewports = viewports.sort((a, b) => a.from - b.from);
      this.scaler = this.heightMap.height <= 7e6 ? IdScaler : new BigScaler(this.heightOracle, this.heightMap, this.viewports);
    }
    updateViewportLines() {
      this.viewportLines = [];
      this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (block) => {
        this.viewportLines.push(this.scaler.scale == 1 ? block : scaleBlock(block, this.scaler));
      });
    }
    update(update, scrollTarget = null) {
      this.state = update.state;
      let prevDeco = this.stateDeco;
      this.stateDeco = this.state.facet(decorations).filter((d) => typeof d != "function");
      let contentChanges = update.changedRanges;
      let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(prevDeco, this.stateDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
      let prevHeight = this.heightMap.height;
      let scrollAnchor = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollTop);
      this.heightMap = this.heightMap.applyChanges(this.stateDeco, update.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
      if (this.heightMap.height != prevHeight)
        update.flags |= 2;
      if (scrollAnchor) {
        this.scrollAnchorPos = update.changes.mapPos(scrollAnchor.from, -1);
        this.scrollAnchorHeight = scrollAnchor.top;
      } else {
        this.scrollAnchorPos = -1;
        this.scrollAnchorHeight = this.heightMap.height;
      }
      let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
      if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) || !this.viewportIsAppropriate(viewport))
        viewport = this.getViewport(0, scrollTarget);
      let updateLines = !update.changes.empty || update.flags & 2 || viewport.from != this.viewport.from || viewport.to != this.viewport.to;
      this.viewport = viewport;
      this.updateForViewport();
      if (updateLines)
        this.updateViewportLines();
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
        this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
      update.flags |= this.computeVisibleRanges();
      if (scrollTarget)
        this.scrollTarget = scrollTarget;
      if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping && update.state.selection.main.empty && update.state.selection.main.assoc && !update.state.facet(nativeSelectionHidden))
        this.mustEnforceCursorAssoc = true;
    }
    measure(view) {
      let dom = view.contentDOM, style = window.getComputedStyle(dom);
      let oracle = this.heightOracle;
      let whiteSpace = style.whiteSpace;
      this.defaultTextDirection = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
      let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace);
      let domRect = dom.getBoundingClientRect();
      let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != domRect.height;
      this.contentDOMHeight = domRect.height;
      this.mustMeasureContent = false;
      let result = 0, bias = 0;
      if (domRect.width && domRect.height) {
        let scaleX = domRect.width / dom.offsetWidth;
        let scaleY = domRect.height / dom.offsetHeight;
        if (scaleX > 0.995 && scaleX < 1.005)
          scaleX = 1;
        if (scaleY > 0.995 && scaleY < 1.005)
          scaleY = 1;
        if (this.scaleX != scaleX || this.scaleY != scaleY) {
          this.scaleX = scaleX;
          this.scaleY = scaleY;
          result |= 8;
          refresh = measureContent = true;
        }
      }
      let paddingTop = (parseInt(style.paddingTop) || 0) * this.scaleY;
      let paddingBottom = (parseInt(style.paddingBottom) || 0) * this.scaleY;
      if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
        this.paddingTop = paddingTop;
        this.paddingBottom = paddingBottom;
        result |= 8 | 2;
      }
      if (this.editorWidth != view.scrollDOM.clientWidth) {
        if (oracle.lineWrapping)
          measureContent = true;
        this.editorWidth = view.scrollDOM.clientWidth;
        result |= 8;
      }
      let scrollTop = view.scrollDOM.scrollTop * this.scaleY;
      if (this.scrollTop != scrollTop) {
        this.scrollAnchorHeight = -1;
        this.scrollTop = scrollTop;
      }
      this.scrolledToBottom = isScrolledToBottom(view.scrollDOM);
      let pixelViewport = (this.printing ? fullPixelRange : visiblePixelRange)(dom, this.paddingTop);
      let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
      this.pixelViewport = pixelViewport;
      let inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
      if (inView != this.inView) {
        this.inView = inView;
        if (inView)
          measureContent = true;
      }
      if (!this.inView && !this.scrollTarget)
        return 0;
      let contentWidth = domRect.width;
      if (this.contentDOMWidth != contentWidth || this.editorHeight != view.scrollDOM.clientHeight) {
        this.contentDOMWidth = domRect.width;
        this.editorHeight = view.scrollDOM.clientHeight;
        result |= 8;
      }
      if (measureContent) {
        let lineHeights = view.docView.measureVisibleLineHeights(this.viewport);
        if (oracle.mustRefreshForHeights(lineHeights))
          refresh = true;
        if (refresh || oracle.lineWrapping && Math.abs(contentWidth - this.contentDOMWidth) > oracle.charWidth) {
          let { lineHeight, charWidth, textHeight } = view.docView.measureTextSize();
          refresh = lineHeight > 0 && oracle.refresh(whiteSpace, lineHeight, charWidth, textHeight, contentWidth / charWidth, lineHeights);
          if (refresh) {
            view.docView.minWidth = 0;
            result |= 8;
          }
        }
        if (dTop > 0 && dBottom > 0)
          bias = Math.max(dTop, dBottom);
        else if (dTop < 0 && dBottom < 0)
          bias = Math.min(dTop, dBottom);
        oracle.heightChanged = false;
        for (let vp of this.viewports) {
          let heights = vp.from == this.viewport.from ? lineHeights : view.docView.measureVisibleLineHeights(vp);
          this.heightMap = (refresh ? HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle, [new ChangedRange(0, 0, 0, view.state.doc.length)]) : this.heightMap).updateHeight(oracle, 0, refresh, new MeasuredHeights(vp.from, heights));
        }
        if (oracle.heightChanged)
          result |= 2;
      }
      let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
      if (viewportChange)
        this.viewport = this.getViewport(bias, this.scrollTarget);
      this.updateForViewport();
      if (result & 2 || viewportChange)
        this.updateViewportLines();
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
        this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps, view));
      result |= this.computeVisibleRanges();
      if (this.mustEnforceCursorAssoc) {
        this.mustEnforceCursorAssoc = false;
        view.docView.enforceCursorAssoc();
      }
      return result;
    }
    get visibleTop() {
      return this.scaler.fromDOM(this.pixelViewport.top);
    }
    get visibleBottom() {
      return this.scaler.fromDOM(this.pixelViewport.bottom);
    }
    getViewport(bias, scrollTarget) {
      let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
      let map = this.heightMap, oracle = this.heightOracle;
      let { visibleTop, visibleBottom } = this;
      let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1e3, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1e3, QueryType.ByHeight, oracle, 0, 0).to);
      if (scrollTarget) {
        let { head } = scrollTarget.range;
        if (head < viewport.from || head > viewport.to) {
          let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
          let block = map.lineAt(head, QueryType.ByPos, oracle, 0, 0), topPos;
          if (scrollTarget.y == "center")
            topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
          else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
            topPos = block.top;
          else
            topPos = block.bottom - viewHeight;
          viewport = new Viewport(map.lineAt(topPos - 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(topPos + viewHeight + 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).to);
        }
      }
      return viewport;
    }
    mapViewport(viewport, changes) {
      let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
      return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0).to);
    }
    // Checks if a given viewport covers the visible part of the
    // document and not too much beyond that.
    viewportIsAppropriate({ from, to }, bias = 0) {
      if (!this.inView)
        return true;
      let { top: top2 } = this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0);
      let { bottom } = this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0);
      let { visibleTop, visibleBottom } = this;
      return (from == 0 || top2 <= visibleTop - Math.max(10, Math.min(
        -bias,
        250
        /* VP.MaxCoverMargin */
      ))) && (to == this.state.doc.length || bottom >= visibleBottom + Math.max(10, Math.min(
        bias,
        250
        /* VP.MaxCoverMargin */
      ))) && (top2 > visibleTop - 2 * 1e3 && bottom < visibleBottom + 2 * 1e3);
    }
    mapLineGaps(gaps, changes) {
      if (!gaps.length || changes.empty)
        return gaps;
      let mapped = [];
      for (let gap of gaps)
        if (!changes.touchesRange(gap.from, gap.to))
          mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
      return mapped;
    }
    // Computes positions in the viewport where the start or end of a
    // line should be hidden, trying to reuse existing line gaps when
    // appropriate to avoid unneccesary redraws.
    // Uses crude character-counting for the positioning and sizing,
    // since actual DOM coordinates aren't always available and
    // predictable. Relies on generous margins (see LG.Margin) to hide
    // the artifacts this might produce from the user.
    ensureLineGaps(current, mayMeasure) {
      let wrapping = this.heightOracle.lineWrapping;
      let margin = wrapping ? 1e4 : 2e3, halfMargin = margin >> 1, doubleMargin = margin << 1;
      if (this.defaultTextDirection != Direction.LTR && !wrapping)
        return [];
      let gaps = [];
      let addGap = (from, to, line, structure) => {
        if (to - from < halfMargin)
          return;
        let sel = this.state.selection.main, avoid = [sel.from];
        if (!sel.empty)
          avoid.push(sel.to);
        for (let pos of avoid) {
          if (pos > from && pos < to) {
            addGap(from, pos - 10, line, structure);
            addGap(pos + 10, to, line, structure);
            return;
          }
        }
        let gap = find(current, (gap2) => gap2.from >= line.from && gap2.to <= line.to && Math.abs(gap2.from - from) < halfMargin && Math.abs(gap2.to - to) < halfMargin && !avoid.some((pos) => gap2.from < pos && gap2.to > pos));
        if (!gap) {
          if (to < line.to && mayMeasure && wrapping && mayMeasure.visibleRanges.some((r) => r.from <= to && r.to >= to)) {
            let lineStart = mayMeasure.moveToLineBoundary(EditorSelection.cursor(to), false, true).head;
            if (lineStart > from)
              to = lineStart;
          }
          gap = new LineGap(from, to, this.gapSize(line, from, to, structure));
        }
        gaps.push(gap);
      };
      for (let line of this.viewportLines) {
        if (line.length < doubleMargin)
          continue;
        let structure = lineStructure(line.from, line.to, this.stateDeco);
        if (structure.total < doubleMargin)
          continue;
        let target = this.scrollTarget ? this.scrollTarget.range.head : null;
        let viewFrom, viewTo;
        if (wrapping) {
          let marginHeight = margin / this.heightOracle.lineLength * this.heightOracle.lineHeight;
          let top2, bot;
          if (target != null) {
            let targetFrac = findFraction(structure, target);
            let spaceFrac = ((this.visibleBottom - this.visibleTop) / 2 + marginHeight) / line.height;
            top2 = targetFrac - spaceFrac;
            bot = targetFrac + spaceFrac;
          } else {
            top2 = (this.visibleTop - line.top - marginHeight) / line.height;
            bot = (this.visibleBottom - line.top + marginHeight) / line.height;
          }
          viewFrom = findPosition(structure, top2);
          viewTo = findPosition(structure, bot);
        } else {
          let totalWidth = structure.total * this.heightOracle.charWidth;
          let marginWidth = margin * this.heightOracle.charWidth;
          let left, right;
          if (target != null) {
            let targetFrac = findFraction(structure, target);
            let spaceFrac = ((this.pixelViewport.right - this.pixelViewport.left) / 2 + marginWidth) / totalWidth;
            left = targetFrac - spaceFrac;
            right = targetFrac + spaceFrac;
          } else {
            left = (this.pixelViewport.left - marginWidth) / totalWidth;
            right = (this.pixelViewport.right + marginWidth) / totalWidth;
          }
          viewFrom = findPosition(structure, left);
          viewTo = findPosition(structure, right);
        }
        if (viewFrom > line.from)
          addGap(line.from, viewFrom, line, structure);
        if (viewTo < line.to)
          addGap(viewTo, line.to, line, structure);
      }
      return gaps;
    }
    gapSize(line, from, to, structure) {
      let fraction = findFraction(structure, to) - findFraction(structure, from);
      if (this.heightOracle.lineWrapping) {
        return line.height * fraction;
      } else {
        return structure.total * this.heightOracle.charWidth * fraction;
      }
    }
    updateLineGaps(gaps) {
      if (!LineGap.same(gaps, this.lineGaps)) {
        this.lineGaps = gaps;
        this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this, this.heightOracle.lineWrapping)));
      }
    }
    computeVisibleRanges() {
      let deco = this.stateDeco;
      if (this.lineGaps.length)
        deco = deco.concat(this.lineGapDeco);
      let ranges = [];
      RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
        span(from, to) {
          ranges.push({ from, to });
        },
        point() {
        }
      }, 20);
      let changed = ranges.length != this.visibleRanges.length || this.visibleRanges.some((r, i) => r.from != ranges[i].from || r.to != ranges[i].to);
      this.visibleRanges = ranges;
      return changed ? 4 : 0;
    }
    lineBlockAt(pos) {
      return pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find((b) => b.from <= pos && b.to >= pos) || scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.heightOracle, 0, 0), this.scaler);
    }
    lineBlockAtHeight(height) {
      return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), QueryType.ByHeight, this.heightOracle, 0, 0), this.scaler);
    }
    scrollAnchorAt(scrollTop) {
      let block = this.lineBlockAtHeight(scrollTop + 8);
      return block.from >= this.viewport.from || this.viewportLines[0].top - scrollTop > 200 ? block : this.viewportLines[0];
    }
    elementAtHeight(height) {
      return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height), this.heightOracle, 0, 0), this.scaler);
    }
    get docHeight() {
      return this.scaler.toDOM(this.heightMap.height);
    }
    get contentHeight() {
      return this.docHeight + this.paddingTop + this.paddingBottom;
    }
  };
  var Viewport = class {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
  };
  function lineStructure(from, to, stateDeco) {
    let ranges = [], pos = from, total2 = 0;
    RangeSet.spans(stateDeco, from, to, {
      span() {
      },
      point(from2, to2) {
        if (from2 > pos) {
          ranges.push({ from: pos, to: from2 });
          total2 += from2 - pos;
        }
        pos = to2;
      }
    }, 20);
    if (pos < to) {
      ranges.push({ from: pos, to });
      total2 += to - pos;
    }
    return { total: total2, ranges };
  }
  function findPosition({ total: total2, ranges }, ratio) {
    if (ratio <= 0)
      return ranges[0].from;
    if (ratio >= 1)
      return ranges[ranges.length - 1].to;
    let dist2 = Math.floor(total2 * ratio);
    for (let i = 0; ; i++) {
      let { from, to } = ranges[i], size = to - from;
      if (dist2 <= size)
        return from + dist2;
      dist2 -= size;
    }
  }
  function findFraction(structure, pos) {
    let counted = 0;
    for (let { from, to } of structure.ranges) {
      if (pos <= to) {
        counted += pos - from;
        break;
      }
      counted += to - from;
    }
    return counted / structure.total;
  }
  function find(array, f) {
    for (let val of array)
      if (f(val))
        return val;
    return void 0;
  }
  var IdScaler = {
    toDOM(n) {
      return n;
    },
    fromDOM(n) {
      return n;
    },
    scale: 1
  };
  var BigScaler = class {
    constructor(oracle, heightMap, viewports) {
      let vpHeight = 0, base2 = 0, domBase = 0;
      this.viewports = viewports.map(({ from, to }) => {
        let top2 = heightMap.lineAt(from, QueryType.ByPos, oracle, 0, 0).top;
        let bottom = heightMap.lineAt(to, QueryType.ByPos, oracle, 0, 0).bottom;
        vpHeight += bottom - top2;
        return { from, to, top: top2, bottom, domTop: 0, domBottom: 0 };
      });
      this.scale = (7e6 - vpHeight) / (heightMap.height - vpHeight);
      for (let obj of this.viewports) {
        obj.domTop = domBase + (obj.top - base2) * this.scale;
        domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
        base2 = obj.bottom;
      }
    }
    toDOM(n) {
      for (let i = 0, base2 = 0, domBase = 0; ; i++) {
        let vp = i < this.viewports.length ? this.viewports[i] : null;
        if (!vp || n < vp.top)
          return domBase + (n - base2) * this.scale;
        if (n <= vp.bottom)
          return vp.domTop + (n - vp.top);
        base2 = vp.bottom;
        domBase = vp.domBottom;
      }
    }
    fromDOM(n) {
      for (let i = 0, base2 = 0, domBase = 0; ; i++) {
        let vp = i < this.viewports.length ? this.viewports[i] : null;
        if (!vp || n < vp.domTop)
          return base2 + (n - domBase) / this.scale;
        if (n <= vp.domBottom)
          return vp.top + (n - vp.domTop);
        base2 = vp.bottom;
        domBase = vp.domBottom;
      }
    }
  };
  function scaleBlock(block, scaler) {
    if (scaler.scale == 1)
      return block;
    let bTop = scaler.toDOM(block.top), bBottom = scaler.toDOM(block.bottom);
    return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block._content) ? block._content.map((b) => scaleBlock(b, scaler)) : block._content);
  }
  var theme = /* @__PURE__ */ Facet.define({ combine: (strs) => strs.join(" ") });
  var darkTheme = /* @__PURE__ */ Facet.define({ combine: (values) => values.indexOf(true) > -1 });
  var baseThemeID = /* @__PURE__ */ StyleModule.newName();
  var baseLightID = /* @__PURE__ */ StyleModule.newName();
  var baseDarkID = /* @__PURE__ */ StyleModule.newName();
  var lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
  function buildTheme(main, spec, scopes) {
    return new StyleModule(spec, {
      finish(sel) {
        return /&/.test(sel) ? sel.replace(/&\w*/, (m) => {
          if (m == "&")
            return main;
          if (!scopes || !scopes[m])
            throw new RangeError(`Unsupported selector: ${m}`);
          return scopes[m];
        }) : main + " " + sel;
      }
    });
  }
  var baseTheme$1 = /* @__PURE__ */ buildTheme("." + baseThemeID, {
    "&": {
      position: "relative !important",
      boxSizing: "border-box",
      "&.cm-focused": {
        // Provide a simple default outline to make sure a focused
        // editor is visually distinct. Can't leave the default behavior
        // because that will apply to the content element, which is
        // inside the scrollable container and doesn't include the
        // gutters. We also can't use an 'auto' outline, since those
        // are, for some reason, drawn behind the element content, which
        // will cause things like the active line background to cover
        // the outline (#297).
        outline: "1px dotted #212121"
      },
      display: "flex !important",
      flexDirection: "column"
    },
    ".cm-scroller": {
      display: "flex !important",
      alignItems: "flex-start !important",
      fontFamily: "monospace",
      lineHeight: 1.4,
      height: "100%",
      overflowX: "auto",
      position: "relative",
      zIndex: 0
    },
    ".cm-content": {
      margin: 0,
      flexGrow: 2,
      flexShrink: 0,
      display: "block",
      whiteSpace: "pre",
      wordWrap: "normal",
      boxSizing: "border-box",
      padding: "4px 0",
      outline: "none",
      "&[contenteditable=true]": {
        WebkitUserModify: "read-write-plaintext-only"
      }
    },
    ".cm-lineWrapping": {
      whiteSpace_fallback: "pre-wrap",
      whiteSpace: "break-spaces",
      wordBreak: "break-word",
      overflowWrap: "anywhere",
      flexShrink: 1
    },
    "&light .cm-content": { caretColor: "black" },
    "&dark .cm-content": { caretColor: "white" },
    ".cm-line": {
      display: "block",
      padding: "0 2px 0 6px"
    },
    ".cm-layer": {
      position: "absolute",
      left: 0,
      top: 0,
      contain: "size style",
      "& > *": {
        position: "absolute"
      }
    },
    "&light .cm-selectionBackground": {
      background: "#d9d9d9"
    },
    "&dark .cm-selectionBackground": {
      background: "#222"
    },
    "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
      background: "#d7d4f0"
    },
    "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
      background: "#233"
    },
    ".cm-cursorLayer": {
      pointerEvents: "none"
    },
    "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
      animation: "steps(1) cm-blink 1.2s infinite"
    },
    // Two animations defined so that we can switch between them to
    // restart the animation without forcing another style
    // recomputation.
    "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
    "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
    ".cm-cursor, .cm-dropCursor": {
      borderLeft: "1.2px solid black",
      marginLeft: "-0.6px",
      pointerEvents: "none"
    },
    ".cm-cursor": {
      display: "none"
    },
    "&dark .cm-cursor": {
      borderLeftColor: "#444"
    },
    ".cm-dropCursor": {
      position: "absolute"
    },
    "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
      display: "block"
    },
    "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
    "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
    "&light .cm-specialChar": { color: "red" },
    "&dark .cm-specialChar": { color: "#f78" },
    ".cm-gutters": {
      flexShrink: 0,
      display: "flex",
      height: "100%",
      boxSizing: "border-box",
      insetInlineStart: 0,
      zIndex: 200
    },
    "&light .cm-gutters": {
      backgroundColor: "#f5f5f5",
      color: "#6c6c6c",
      borderRight: "1px solid #ddd"
    },
    "&dark .cm-gutters": {
      backgroundColor: "#333338",
      color: "#ccc"
    },
    ".cm-gutter": {
      display: "flex !important",
      flexDirection: "column",
      flexShrink: 0,
      boxSizing: "border-box",
      minHeight: "100%",
      overflow: "hidden"
    },
    ".cm-gutterElement": {
      boxSizing: "border-box"
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 3px 0 5px",
      minWidth: "20px",
      textAlign: "right",
      whiteSpace: "nowrap"
    },
    "&light .cm-activeLineGutter": {
      backgroundColor: "#e2f2ff"
    },
    "&dark .cm-activeLineGutter": {
      backgroundColor: "#222227"
    },
    ".cm-panels": {
      boxSizing: "border-box",
      position: "sticky",
      left: 0,
      right: 0
    },
    "&light .cm-panels": {
      backgroundColor: "#f5f5f5",
      color: "black"
    },
    "&light .cm-panels-top": {
      borderBottom: "1px solid #ddd"
    },
    "&light .cm-panels-bottom": {
      borderTop: "1px solid #ddd"
    },
    "&dark .cm-panels": {
      backgroundColor: "#333338",
      color: "white"
    },
    ".cm-tab": {
      display: "inline-block",
      overflow: "hidden",
      verticalAlign: "bottom"
    },
    ".cm-widgetBuffer": {
      verticalAlign: "text-top",
      height: "1em",
      width: 0,
      display: "inline"
    },
    ".cm-placeholder": {
      color: "#888",
      display: "inline-block",
      verticalAlign: "top"
    },
    ".cm-highlightSpace:before": {
      content: "attr(data-display)",
      position: "absolute",
      pointerEvents: "none",
      color: "#888"
    },
    ".cm-highlightTab": {
      backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
      backgroundSize: "auto 100%",
      backgroundPosition: "right 90%",
      backgroundRepeat: "no-repeat"
    },
    ".cm-trailingSpace": {
      backgroundColor: "#ff332255"
    },
    ".cm-button": {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      padding: ".2em 1em",
      borderRadius: "1px"
    },
    "&light .cm-button": {
      backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
      }
    },
    "&dark .cm-button": {
      backgroundImage: "linear-gradient(#393939, #111)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#111, #333)"
      }
    },
    ".cm-textfield": {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      border: "1px solid silver",
      padding: ".2em .5em"
    },
    "&light .cm-textfield": {
      backgroundColor: "white"
    },
    "&dark .cm-textfield": {
      border: "1px solid #555",
      backgroundColor: "inherit"
    }
  }, lightDarkIDs);
  var DOMChange = class {
    constructor(view, start, end, typeOver) {
      this.typeOver = typeOver;
      this.bounds = null;
      this.text = "";
      let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view.docView;
      if (view.state.readOnly && start > -1) {
        this.newSel = null;
      } else if (start > -1 && (this.bounds = view.docView.domBoundsAround(start, end, 0))) {
        let selPoints = iHead || iAnchor ? [] : selectionPoints(view);
        let reader = new DOMReader(selPoints, view.state);
        reader.readRange(this.bounds.startDOM, this.bounds.endDOM);
        this.text = reader.text;
        this.newSel = selectionFromPoints(selPoints, this.bounds.from);
      } else {
        let domSel = view.observer.selectionRange;
        let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !contains(view.contentDOM, domSel.focusNode) ? view.state.selection.main.head : view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
        let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !contains(view.contentDOM, domSel.anchorNode) ? view.state.selection.main.anchor : view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
        this.newSel = EditorSelection.single(anchor, head);
      }
    }
  };
  function applyDOMChange(view, domChange) {
    let change;
    let { newSel } = domChange, sel = view.state.selection.main;
    let lastKey = view.inputState.lastKeyTime > Date.now() - 100 ? view.inputState.lastKeyCode : -1;
    if (domChange.bounds) {
      let { from, to } = domChange.bounds;
      let preferredPos = sel.from, preferredSide = null;
      if (lastKey === 8 || browser.android && domChange.text.length < to - from) {
        preferredPos = sel.to;
        preferredSide = "end";
      }
      let diff = findDiff(view.state.doc.sliceString(from, to, LineBreakPlaceholder), domChange.text, preferredPos - from, preferredSide);
      if (diff) {
        if (browser.chrome && lastKey == 13 && diff.toB == diff.from + 2 && domChange.text.slice(diff.from, diff.toB) == LineBreakPlaceholder + LineBreakPlaceholder)
          diff.toB--;
        change = {
          from: from + diff.from,
          to: from + diff.toA,
          insert: Text.of(domChange.text.slice(diff.from, diff.toB).split(LineBreakPlaceholder))
        };
      }
    } else if (newSel && (!view.hasFocus && view.state.facet(editable) || newSel.main.eq(sel))) {
      newSel = null;
    }
    if (!change && !newSel)
      return false;
    if (!change && domChange.typeOver && !sel.empty && newSel && newSel.main.empty) {
      change = { from: sel.from, to: sel.to, insert: view.state.doc.slice(sel.from, sel.to) };
    } else if (change && change.from >= sel.from && change.to <= sel.to && (change.from != sel.from || change.to != sel.to) && sel.to - sel.from - (change.to - change.from) <= 4) {
      change = {
        from: sel.from,
        to: sel.to,
        insert: view.state.doc.slice(sel.from, change.from).append(change.insert).append(view.state.doc.slice(change.to, sel.to))
      };
    } else if ((browser.mac || browser.android) && change && change.from == change.to && change.from == sel.head - 1 && /^\. ?$/.test(change.insert.toString()) && view.contentDOM.getAttribute("autocorrect") == "off") {
      if (newSel && change.insert.length == 2)
        newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
      change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
    } else if (browser.chrome && change && change.from == change.to && change.from == sel.head && change.insert.toString() == "\n " && view.lineWrapping) {
      if (newSel)
        newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
      change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
    }
    if (change) {
      if (browser.ios && view.inputState.flushIOSKey(view))
        return true;
      if (browser.android && (change.from == sel.from && change.to == sel.to && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view.contentDOM, "Enter", 13) || (change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 || lastKey == 8 && change.insert.length < change.to - change.from && change.to > sel.head) && dispatchKey(view.contentDOM, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view.contentDOM, "Delete", 46)))
        return true;
      let text = change.insert.toString();
      if (view.inputState.composing >= 0)
        view.inputState.composing++;
      let defaultTr;
      let defaultInsert = () => defaultTr || (defaultTr = applyDefaultInsert(view, change, newSel));
      if (!view.state.facet(inputHandler).some((h) => h(view, change.from, change.to, text, defaultInsert)))
        view.dispatch(defaultInsert());
      return true;
    } else if (newSel && !newSel.main.eq(sel)) {
      let scrollIntoView2 = false, userEvent = "select";
      if (view.inputState.lastSelectionTime > Date.now() - 50) {
        if (view.inputState.lastSelectionOrigin == "select")
          scrollIntoView2 = true;
        userEvent = view.inputState.lastSelectionOrigin;
      }
      view.dispatch({ selection: newSel, scrollIntoView: scrollIntoView2, userEvent });
      return true;
    } else {
      return false;
    }
  }
  function applyDefaultInsert(view, change, newSel) {
    let tr, startState = view.state, sel = startState.selection.main;
    if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 && (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length) && view.inputState.composing < 0) {
      let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
      let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
      tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, void 0, view.state.lineBreak) + after));
    } else {
      let changes = startState.changes(change);
      let mainSel = newSel && newSel.main.to <= changes.newLength ? newSel.main : void 0;
      if (startState.selection.ranges.length > 1 && view.inputState.composing >= 0 && change.to <= sel.to && change.to >= sel.to - 10) {
        let replaced = view.state.sliceDoc(change.from, change.to);
        let composition = findCompositionNode(view, change.insert.length - (change.to - change.from)) || view.state.doc.lineAt(sel.head);
        let offset = sel.to - change.to, size = sel.to - sel.from;
        tr = startState.changeByRange((range2) => {
          if (range2.from == sel.from && range2.to == sel.to)
            return { changes, range: mainSel || range2.map(changes) };
          let to = range2.to - offset, from = to - replaced.length;
          if (range2.to - range2.from != size || view.state.sliceDoc(from, to) != replaced || // Unfortunately, there's no way to make multiple
          // changes in the same node work without aborting
          // composition, so cursors in the composition range are
          // ignored.
          composition && range2.to >= composition.from && range2.from <= composition.to)
            return { range: range2 };
          let rangeChanges = startState.changes({ from, to, insert: change.insert }), selOff = range2.to - sel.to;
          return {
            changes: rangeChanges,
            range: !mainSel ? range2.map(rangeChanges) : EditorSelection.range(Math.max(0, mainSel.anchor + selOff), Math.max(0, mainSel.head + selOff))
          };
        });
      } else {
        tr = {
          changes,
          selection: mainSel && startState.selection.replaceRange(mainSel)
        };
      }
    }
    let userEvent = "input.type";
    if (view.composing || view.inputState.compositionPendingChange && view.inputState.compositionEndedAt > Date.now() - 50) {
      view.inputState.compositionPendingChange = false;
      userEvent += ".compose";
      if (view.inputState.compositionFirstChange) {
        userEvent += ".start";
        view.inputState.compositionFirstChange = false;
      }
    }
    return startState.update(tr, { userEvent, scrollIntoView: true });
  }
  function findDiff(a, b, preferredPos, preferredSide) {
    let minLen = Math.min(a.length, b.length);
    let from = 0;
    while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
      from++;
    if (from == minLen && a.length == b.length)
      return null;
    let toA = a.length, toB = b.length;
    while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
      toA--;
      toB--;
    }
    if (preferredSide == "end") {
      let adjust = Math.max(0, from - Math.min(toA, toB));
      preferredPos -= toA + adjust - from;
    }
    if (toA < from && a.length < b.length) {
      let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
      from -= move;
      toB = from + (toB - toA);
      toA = from;
    } else if (toB < from) {
      let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
      from -= move;
      toA = from + (toA - toB);
      toB = from;
    }
    return { from, toA, toB };
  }
  function selectionPoints(view) {
    let result = [];
    if (view.root.activeElement != view.contentDOM)
      return result;
    let { anchorNode, anchorOffset, focusNode, focusOffset } = view.observer.selectionRange;
    if (anchorNode) {
      result.push(new DOMPoint(anchorNode, anchorOffset));
      if (focusNode != anchorNode || focusOffset != anchorOffset)
        result.push(new DOMPoint(focusNode, focusOffset));
    }
    return result;
  }
  function selectionFromPoints(points, base2) {
    if (points.length == 0)
      return null;
    let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
    return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base2, head + base2) : null;
  }
  var observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    characterDataOldValue: true
  };
  var useCharData = browser.ie && browser.ie_version <= 11;
  var DOMObserver = class {
    constructor(view) {
      this.view = view;
      this.active = false;
      this.selectionRange = new DOMSelectionState();
      this.selectionChanged = false;
      this.delayedFlush = -1;
      this.resizeTimeout = -1;
      this.queue = [];
      this.delayedAndroidKey = null;
      this.flushingAndroidKey = -1;
      this.lastChange = 0;
      this.scrollTargets = [];
      this.intersection = null;
      this.resizeScroll = null;
      this.resizeContent = null;
      this.intersecting = false;
      this.gapIntersection = null;
      this.gaps = [];
      this.parentCheck = -1;
      this.dom = view.contentDOM;
      this.observer = new MutationObserver((mutations) => {
        for (let mut of mutations)
          this.queue.push(mut);
        if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
          this.flushSoon();
        else
          this.flush();
      });
      if (useCharData)
        this.onCharData = (event) => {
          this.queue.push({
            target: event.target,
            type: "characterData",
            oldValue: event.prevValue
          });
          this.flushSoon();
        };
      this.onSelectionChange = this.onSelectionChange.bind(this);
      this.onResize = this.onResize.bind(this);
      this.onPrint = this.onPrint.bind(this);
      this.onScroll = this.onScroll.bind(this);
      if (typeof ResizeObserver == "function") {
        this.resizeScroll = new ResizeObserver(() => {
          var _a2;
          if (((_a2 = this.view.docView) === null || _a2 === void 0 ? void 0 : _a2.lastUpdate) < Date.now() - 75)
            this.onResize();
        });
        this.resizeScroll.observe(view.scrollDOM);
        this.resizeContent = new ResizeObserver(() => this.view.requestMeasure());
        this.resizeContent.observe(view.contentDOM);
      }
      this.addWindowListeners(this.win = view.win);
      this.start();
      if (typeof IntersectionObserver == "function") {
        this.intersection = new IntersectionObserver((entries) => {
          if (this.parentCheck < 0)
            this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
          if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
            this.intersecting = !this.intersecting;
            if (this.intersecting != this.view.inView)
              this.onScrollChanged(document.createEvent("Event"));
          }
        }, { threshold: [0, 1e-3] });
        this.intersection.observe(this.dom);
        this.gapIntersection = new IntersectionObserver((entries) => {
          if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
            this.onScrollChanged(document.createEvent("Event"));
        }, {});
      }
      this.listenForScroll();
      this.readSelectionRange();
    }
    onScrollChanged(e) {
      this.view.inputState.runScrollHandlers(this.view, e);
      if (this.intersecting)
        this.view.measure();
    }
    onScroll(e) {
      if (this.intersecting)
        this.flush(false);
      this.onScrollChanged(e);
    }
    onResize() {
      if (this.resizeTimeout < 0)
        this.resizeTimeout = setTimeout(() => {
          this.resizeTimeout = -1;
          this.view.requestMeasure();
        }, 50);
    }
    onPrint() {
      this.view.viewState.printing = true;
      this.view.measure();
      setTimeout(() => {
        this.view.viewState.printing = false;
        this.view.requestMeasure();
      }, 500);
    }
    updateGaps(gaps) {
      if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g, i) => g != gaps[i]))) {
        this.gapIntersection.disconnect();
        for (let gap of gaps)
          this.gapIntersection.observe(gap);
        this.gaps = gaps;
      }
    }
    onSelectionChange(event) {
      let wasChanged = this.selectionChanged;
      if (!this.readSelectionRange() || this.delayedAndroidKey)
        return;
      let { view } = this, sel = this.selectionRange;
      if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(view.dom, sel))
        return;
      let context = sel.anchorNode && view.docView.nearest(sel.anchorNode);
      if (context && context.ignoreEvent(event)) {
        if (!wasChanged)
          this.selectionChanged = false;
        return;
      }
      if ((browser.ie && browser.ie_version <= 11 || browser.android && browser.chrome) && !view.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
      sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
        this.flushSoon();
      else
        this.flush(false);
    }
    readSelectionRange() {
      let { view } = this;
      let range2 = browser.safari && view.root.nodeType == 11 && deepActiveElement(this.dom.ownerDocument) == this.dom && safariSelectionRangeHack(this.view) || getSelection(view.root);
      if (!range2 || this.selectionRange.eq(range2))
        return false;
      let local = hasSelection(this.dom, range2);
      if (local && !this.selectionChanged && view.inputState.lastFocusTime > Date.now() - 200 && view.inputState.lastTouchTime < Date.now() - 300 && atElementStart(this.dom, range2)) {
        this.view.inputState.lastFocusTime = 0;
        view.docView.updateSelection();
        return false;
      }
      this.selectionRange.setRange(range2);
      if (local)
        this.selectionChanged = true;
      return true;
    }
    setSelectionRange(anchor, head) {
      this.selectionRange.set(anchor.node, anchor.offset, head.node, head.offset);
      this.selectionChanged = false;
    }
    clearSelectionRange() {
      this.selectionRange.set(null, 0, null, 0);
    }
    listenForScroll() {
      this.parentCheck = -1;
      let i = 0, changed = null;
      for (let dom = this.dom; dom; ) {
        if (dom.nodeType == 1) {
          if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
            i++;
          else if (!changed)
            changed = this.scrollTargets.slice(0, i);
          if (changed)
            changed.push(dom);
          dom = dom.assignedSlot || dom.parentNode;
        } else if (dom.nodeType == 11) {
          dom = dom.host;
        } else {
          break;
        }
      }
      if (i < this.scrollTargets.length && !changed)
        changed = this.scrollTargets.slice(0, i);
      if (changed) {
        for (let dom of this.scrollTargets)
          dom.removeEventListener("scroll", this.onScroll);
        for (let dom of this.scrollTargets = changed)
          dom.addEventListener("scroll", this.onScroll);
      }
    }
    ignore(f) {
      if (!this.active)
        return f();
      try {
        this.stop();
        return f();
      } finally {
        this.start();
        this.clear();
      }
    }
    start() {
      if (this.active)
        return;
      this.observer.observe(this.dom, observeOptions);
      if (useCharData)
        this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
      this.active = true;
    }
    stop() {
      if (!this.active)
        return;
      this.active = false;
      this.observer.disconnect();
      if (useCharData)
        this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    // Throw away any pending changes
    clear() {
      this.processRecords();
      this.queue.length = 0;
      this.selectionChanged = false;
    }
    // Chrome Android, especially in combination with GBoard, not only
    // doesn't reliably fire regular key events, but also often
    // surrounds the effect of enter or backspace with a bunch of
    // composition events that, when interrupted, cause text duplication
    // or other kinds of corruption. This hack makes the editor back off
    // from handling DOM changes for a moment when such a key is
    // detected (via beforeinput or keydown), and then tries to flush
    // them or, if that has no effect, dispatches the given key.
    delayAndroidKey(key, keyCode) {
      var _a2;
      if (!this.delayedAndroidKey) {
        let flush = () => {
          let key2 = this.delayedAndroidKey;
          if (key2) {
            this.clearDelayedAndroidKey();
            this.view.inputState.lastKeyCode = key2.keyCode;
            this.view.inputState.lastKeyTime = Date.now();
            let flushed = this.flush();
            if (!flushed && key2.force)
              dispatchKey(this.dom, key2.key, key2.keyCode);
          }
        };
        this.flushingAndroidKey = this.view.win.requestAnimationFrame(flush);
      }
      if (!this.delayedAndroidKey || key == "Enter")
        this.delayedAndroidKey = {
          key,
          keyCode,
          // Only run the key handler when no changes are detected if
          // this isn't coming right after another change, in which case
          // it is probably part of a weird chain of updates, and should
          // be ignored if it returns the DOM to its previous state.
          force: this.lastChange < Date.now() - 50 || !!((_a2 = this.delayedAndroidKey) === null || _a2 === void 0 ? void 0 : _a2.force)
        };
    }
    clearDelayedAndroidKey() {
      this.win.cancelAnimationFrame(this.flushingAndroidKey);
      this.delayedAndroidKey = null;
      this.flushingAndroidKey = -1;
    }
    flushSoon() {
      if (this.delayedFlush < 0)
        this.delayedFlush = this.view.win.requestAnimationFrame(() => {
          this.delayedFlush = -1;
          this.flush();
        });
    }
    forceFlush() {
      if (this.delayedFlush >= 0) {
        this.view.win.cancelAnimationFrame(this.delayedFlush);
        this.delayedFlush = -1;
      }
      this.flush();
    }
    pendingRecords() {
      for (let mut of this.observer.takeRecords())
        this.queue.push(mut);
      return this.queue;
    }
    processRecords() {
      let records = this.pendingRecords();
      if (records.length)
        this.queue = [];
      let from = -1, to = -1, typeOver = false;
      for (let record of records) {
        let range2 = this.readMutation(record);
        if (!range2)
          continue;
        if (range2.typeOver)
          typeOver = true;
        if (from == -1) {
          ({ from, to } = range2);
        } else {
          from = Math.min(range2.from, from);
          to = Math.max(range2.to, to);
        }
      }
      return { from, to, typeOver };
    }
    readChange() {
      let { from, to, typeOver } = this.processRecords();
      let newSel = this.selectionChanged && hasSelection(this.dom, this.selectionRange);
      if (from < 0 && !newSel)
        return null;
      if (from > -1)
        this.lastChange = Date.now();
      this.view.inputState.lastFocusTime = 0;
      this.selectionChanged = false;
      return new DOMChange(this.view, from, to, typeOver);
    }
    // Apply pending changes, if any
    flush(readSelection = true) {
      if (this.delayedFlush >= 0 || this.delayedAndroidKey)
        return false;
      if (readSelection)
        this.readSelectionRange();
      let domChange = this.readChange();
      if (!domChange)
        return false;
      let startState = this.view.state;
      let handled = applyDOMChange(this.view, domChange);
      if (this.view.state == startState)
        this.view.update([]);
      return handled;
    }
    readMutation(rec) {
      let cView = this.view.docView.nearest(rec.target);
      if (!cView || cView.ignoreMutation(rec))
        return null;
      cView.markDirty(rec.type == "attributes");
      if (rec.type == "attributes")
        cView.flags |= 4;
      if (rec.type == "childList") {
        let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
        let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
        return {
          from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
          to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd,
          typeOver: false
        };
      } else if (rec.type == "characterData") {
        return { from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
      } else {
        return null;
      }
    }
    setWindow(win) {
      if (win != this.win) {
        this.removeWindowListeners(this.win);
        this.win = win;
        this.addWindowListeners(this.win);
      }
    }
    addWindowListeners(win) {
      win.addEventListener("resize", this.onResize);
      win.addEventListener("beforeprint", this.onPrint);
      win.addEventListener("scroll", this.onScroll);
      win.document.addEventListener("selectionchange", this.onSelectionChange);
    }
    removeWindowListeners(win) {
      win.removeEventListener("scroll", this.onScroll);
      win.removeEventListener("resize", this.onResize);
      win.removeEventListener("beforeprint", this.onPrint);
      win.document.removeEventListener("selectionchange", this.onSelectionChange);
    }
    destroy() {
      var _a2, _b, _c, _d;
      this.stop();
      (_a2 = this.intersection) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
      (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
      (_c = this.resizeScroll) === null || _c === void 0 ? void 0 : _c.disconnect();
      (_d = this.resizeContent) === null || _d === void 0 ? void 0 : _d.disconnect();
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      this.removeWindowListeners(this.win);
      clearTimeout(this.parentCheck);
      clearTimeout(this.resizeTimeout);
      this.win.cancelAnimationFrame(this.delayedFlush);
      this.win.cancelAnimationFrame(this.flushingAndroidKey);
    }
  };
  function findChild(cView, dom, dir) {
    while (dom) {
      let curView = ContentView.get(dom);
      if (curView && curView.parent == cView)
        return curView;
      let parent = dom.parentNode;
      dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
    }
    return null;
  }
  function safariSelectionRangeHack(view) {
    let found = null;
    function read(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      found = event.getTargetRanges()[0];
    }
    view.contentDOM.addEventListener("beforeinput", read, true);
    view.dom.ownerDocument.execCommand("indent");
    view.contentDOM.removeEventListener("beforeinput", read, true);
    if (!found)
      return null;
    let anchorNode = found.startContainer, anchorOffset = found.startOffset;
    let focusNode = found.endContainer, focusOffset = found.endOffset;
    let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor);
    if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
      [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
  }
  var EditorView = class _EditorView {
    /**
    The current editor state.
    */
    get state() {
      return this.viewState.state;
    }
    /**
    To be able to display large documents without consuming too much
    memory or overloading the browser, CodeMirror only draws the
    code that is visible (plus a margin around it) to the DOM. This
    property tells you the extent of the current drawn viewport, in
    document positions.
    */
    get viewport() {
      return this.viewState.viewport;
    }
    /**
    When there are, for example, large collapsed ranges in the
    viewport, its size can be a lot bigger than the actual visible
    content. Thus, if you are doing something like styling the
    content in the viewport, it is preferable to only do so for
    these ranges, which are the subset of the viewport that is
    actually drawn.
    */
    get visibleRanges() {
      return this.viewState.visibleRanges;
    }
    /**
    Returns false when the editor is entirely scrolled out of view
    or otherwise hidden.
    */
    get inView() {
      return this.viewState.inView;
    }
    /**
    Indicates whether the user is currently composing text via
    [IME](https://en.wikipedia.org/wiki/Input_method), and at least
    one change has been made in the current composition.
    */
    get composing() {
      return this.inputState.composing > 0;
    }
    /**
    Indicates whether the user is currently in composing state. Note
    that on some platforms, like Android, this will be the case a
    lot, since just putting the cursor on a word starts a
    composition there.
    */
    get compositionStarted() {
      return this.inputState.composing >= 0;
    }
    /**
    The document or shadow root that the view lives in.
    */
    get root() {
      return this._root;
    }
    /**
    @internal
    */
    get win() {
      return this.dom.ownerDocument.defaultView || window;
    }
    /**
    Construct a new view. You'll want to either provide a `parent`
    option, or put `view.dom` into your document after creating a
    view, so that the user can see the editor.
    */
    constructor(config = {}) {
      this.plugins = [];
      this.pluginMap = /* @__PURE__ */ new Map();
      this.editorAttrs = {};
      this.contentAttrs = {};
      this.bidiCache = [];
      this.destroyed = false;
      this.updateState = 2;
      this.measureScheduled = -1;
      this.measureRequests = [];
      this.contentDOM = document.createElement("div");
      this.scrollDOM = document.createElement("div");
      this.scrollDOM.tabIndex = -1;
      this.scrollDOM.className = "cm-scroller";
      this.scrollDOM.appendChild(this.contentDOM);
      this.announceDOM = document.createElement("div");
      this.announceDOM.style.cssText = "position: fixed; top: -10000px";
      this.announceDOM.setAttribute("aria-live", "polite");
      this.dom = document.createElement("div");
      this.dom.appendChild(this.announceDOM);
      this.dom.appendChild(this.scrollDOM);
      let { dispatch } = config;
      this.dispatchTransactions = config.dispatchTransactions || dispatch && ((trs) => trs.forEach((tr) => dispatch(tr, this))) || ((trs) => this.update(trs));
      this.dispatch = this.dispatch.bind(this);
      this._root = config.root || getRoot(config.parent) || document;
      this.viewState = new ViewState(config.state || EditorState.create(config));
      this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec));
      for (let plugin of this.plugins)
        plugin.update(this);
      this.observer = new DOMObserver(this);
      this.inputState = new InputState(this);
      this.inputState.ensureHandlers(this, this.plugins);
      this.docView = new DocView(this);
      this.mountStyles();
      this.updateAttrs();
      this.updateState = 0;
      this.requestMeasure();
      if (config.parent)
        config.parent.appendChild(this.dom);
    }
    dispatch(...input) {
      let trs = input.length == 1 && input[0] instanceof Transaction ? input : input.length == 1 && Array.isArray(input[0]) ? input[0] : [this.state.update(...input)];
      this.dispatchTransactions(trs, this);
    }
    /**
    Update the view for the given array of transactions. This will
    update the visible document and selection to match the state
    produced by the transactions, and notify view plugins of the
    change. You should usually call
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
    as a primitive.
    */
    update(transactions) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
      let redrawn = false, attrsChanged = false, update;
      let state = this.state;
      for (let tr of transactions) {
        if (tr.startState != state)
          throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
        state = tr.state;
      }
      if (this.destroyed) {
        this.viewState.state = state;
        return;
      }
      let focus = this.hasFocus, focusFlag = 0, dispatchFocus = null;
      if (transactions.some((tr) => tr.annotation(isFocusChange))) {
        this.inputState.notifiedFocused = focus;
        focusFlag = 1;
      } else if (focus != this.inputState.notifiedFocused) {
        this.inputState.notifiedFocused = focus;
        dispatchFocus = focusChangeTransaction(state, focus);
        if (!dispatchFocus)
          focusFlag = 1;
      }
      let pendingKey = this.observer.delayedAndroidKey, domChange = null;
      if (pendingKey) {
        this.observer.clearDelayedAndroidKey();
        domChange = this.observer.readChange();
        if (domChange && !this.state.doc.eq(state.doc) || !this.state.selection.eq(state.selection))
          domChange = null;
      } else {
        this.observer.clear();
      }
      if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
        return this.setState(state);
      update = ViewUpdate.create(this, state, transactions);
      update.flags |= focusFlag;
      let scrollTarget = this.viewState.scrollTarget;
      try {
        this.updateState = 2;
        for (let tr of transactions) {
          if (scrollTarget)
            scrollTarget = scrollTarget.map(tr.changes);
          if (tr.scrollIntoView) {
            let { main } = tr.state.selection;
            scrollTarget = new ScrollTarget(main.empty ? main : EditorSelection.cursor(main.head, main.head > main.anchor ? -1 : 1));
          }
          for (let e of tr.effects)
            if (e.is(scrollIntoView))
              scrollTarget = e.value;
        }
        this.viewState.update(update, scrollTarget);
        this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
        if (!update.empty) {
          this.updatePlugins(update);
          this.inputState.update(update);
        }
        redrawn = this.docView.update(update);
        if (this.state.facet(styleModule) != this.styleModules)
          this.mountStyles();
        attrsChanged = this.updateAttrs();
        this.showAnnouncements(transactions);
        this.docView.updateSelection(redrawn, transactions.some((tr) => tr.isUserEvent("select.pointer")));
      } finally {
        this.updateState = 0;
      }
      if (update.startState.facet(theme) != update.state.facet(theme))
        this.viewState.mustMeasureContent = true;
      if (redrawn || attrsChanged || scrollTarget || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent)
        this.requestMeasure();
      if (!update.empty)
        for (let listener of this.state.facet(updateListener))
          listener(update);
      if (dispatchFocus || domChange)
        Promise.resolve().then(() => {
          if (dispatchFocus && this.state == dispatchFocus.startState)
            this.dispatch(dispatchFocus);
          if (domChange) {
            if (!applyDOMChange(this, domChange) && pendingKey.force)
              dispatchKey(this.contentDOM, pendingKey.key, pendingKey.keyCode);
          }
        });
    }
    /**
    Reset the view to the given state. (This will cause the entire
    document to be redrawn and all view plugins to be reinitialized,
    so you should probably only use it when the new state isn't
    derived from the old state. Otherwise, use
    [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
    */
    setState(newState) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
      if (this.destroyed) {
        this.viewState.state = newState;
        return;
      }
      this.updateState = 2;
      let hadFocus = this.hasFocus;
      try {
        for (let plugin of this.plugins)
          plugin.destroy(this);
        this.viewState = new ViewState(newState);
        this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec));
        this.pluginMap.clear();
        for (let plugin of this.plugins)
          plugin.update(this);
        this.docView = new DocView(this);
        this.inputState.ensureHandlers(this, this.plugins);
        this.mountStyles();
        this.updateAttrs();
        this.bidiCache = [];
      } finally {
        this.updateState = 0;
      }
      if (hadFocus)
        this.focus();
      this.requestMeasure();
    }
    updatePlugins(update) {
      let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
      if (prevSpecs != specs) {
        let newPlugins = [];
        for (let spec of specs) {
          let found = prevSpecs.indexOf(spec);
          if (found < 0) {
            newPlugins.push(new PluginInstance(spec));
          } else {
            let plugin = this.plugins[found];
            plugin.mustUpdate = update;
            newPlugins.push(plugin);
          }
        }
        for (let plugin of this.plugins)
          if (plugin.mustUpdate != update)
            plugin.destroy(this);
        this.plugins = newPlugins;
        this.pluginMap.clear();
        this.inputState.ensureHandlers(this, this.plugins);
      } else {
        for (let p of this.plugins)
          p.mustUpdate = update;
      }
      for (let i = 0; i < this.plugins.length; i++)
        this.plugins[i].update(this);
    }
    /**
    @internal
    */
    measure(flush = true) {
      if (this.destroyed)
        return;
      if (this.measureScheduled > -1)
        this.win.cancelAnimationFrame(this.measureScheduled);
      if (this.observer.delayedAndroidKey) {
        this.measureScheduled = -1;
        this.requestMeasure();
        return;
      }
      this.measureScheduled = 0;
      if (flush)
        this.observer.forceFlush();
      let updated = null;
      let sDOM = this.scrollDOM, scrollTop = sDOM.scrollTop * this.scaleY;
      let { scrollAnchorPos, scrollAnchorHeight } = this.viewState;
      if (Math.abs(scrollTop - this.viewState.scrollTop) > 1)
        scrollAnchorHeight = -1;
      this.viewState.scrollAnchorHeight = -1;
      try {
        for (let i = 0; ; i++) {
          if (scrollAnchorHeight < 0) {
            if (isScrolledToBottom(sDOM)) {
              scrollAnchorPos = -1;
              scrollAnchorHeight = this.viewState.heightMap.height;
            } else {
              let block = this.viewState.scrollAnchorAt(scrollTop);
              scrollAnchorPos = block.from;
              scrollAnchorHeight = block.top;
            }
          }
          this.updateState = 1;
          let changed = this.viewState.measure(this);
          if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
            break;
          if (i > 5) {
            console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
            break;
          }
          let measuring = [];
          if (!(changed & 4))
            [this.measureRequests, measuring] = [measuring, this.measureRequests];
          let measured = measuring.map((m) => {
            try {
              return m.read(this);
            } catch (e) {
              logException(this.state, e);
              return BadMeasure;
            }
          });
          let update = ViewUpdate.create(this, this.state, []), redrawn = false;
          update.flags |= changed;
          if (!updated)
            updated = update;
          else
            updated.flags |= changed;
          this.updateState = 2;
          if (!update.empty) {
            this.updatePlugins(update);
            this.inputState.update(update);
            this.updateAttrs();
            redrawn = this.docView.update(update);
          }
          for (let i2 = 0; i2 < measuring.length; i2++)
            if (measured[i2] != BadMeasure) {
              try {
                let m = measuring[i2];
                if (m.write)
                  m.write(measured[i2], this);
              } catch (e) {
                logException(this.state, e);
              }
            }
          if (redrawn)
            this.docView.updateSelection(true);
          if (!update.viewportChanged && this.measureRequests.length == 0) {
            if (this.viewState.editorHeight) {
              if (this.viewState.scrollTarget) {
                this.docView.scrollIntoView(this.viewState.scrollTarget);
                this.viewState.scrollTarget = null;
                continue;
              } else {
                let newAnchorHeight = scrollAnchorPos < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(scrollAnchorPos).top;
                let diff = newAnchorHeight - scrollAnchorHeight;
                if (diff > 1 || diff < -1) {
                  scrollTop = scrollTop + diff;
                  sDOM.scrollTop = scrollTop / this.scaleY;
                  scrollAnchorHeight = -1;
                  continue;
                }
              }
            }
            break;
          }
        }
      } finally {
        this.updateState = 0;
        this.measureScheduled = -1;
      }
      if (updated && !updated.empty)
        for (let listener of this.state.facet(updateListener))
          listener(updated);
    }
    /**
    Get the CSS classes for the currently active editor themes.
    */
    get themeClasses() {
      return baseThemeID + " " + (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " + this.state.facet(theme);
    }
    updateAttrs() {
      let editorAttrs = attrsFromFacet(this, editorAttributes, {
        class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
      });
      let contentAttrs = {
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
        translate: "no",
        contenteditable: !this.state.facet(editable) ? "false" : "true",
        class: "cm-content",
        style: `${browser.tabSize}: ${this.state.tabSize}`,
        role: "textbox",
        "aria-multiline": "true"
      };
      if (this.state.readOnly)
        contentAttrs["aria-readonly"] = "true";
      attrsFromFacet(this, contentAttributes, contentAttrs);
      let changed = this.observer.ignore(() => {
        let changedContent = updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
        let changedEditor = updateAttrs(this.dom, this.editorAttrs, editorAttrs);
        return changedContent || changedEditor;
      });
      this.editorAttrs = editorAttrs;
      this.contentAttrs = contentAttrs;
      return changed;
    }
    showAnnouncements(trs) {
      let first = true;
      for (let tr of trs)
        for (let effect of tr.effects)
          if (effect.is(_EditorView.announce)) {
            if (first)
              this.announceDOM.textContent = "";
            first = false;
            let div = this.announceDOM.appendChild(document.createElement("div"));
            div.textContent = effect.value;
          }
    }
    mountStyles() {
      this.styleModules = this.state.facet(styleModule);
      let nonce = this.state.facet(_EditorView.cspNonce);
      StyleModule.mount(this.root, this.styleModules.concat(baseTheme$1).reverse(), nonce ? { nonce } : void 0);
    }
    readMeasured() {
      if (this.updateState == 2)
        throw new Error("Reading the editor layout isn't allowed during an update");
      if (this.updateState == 0 && this.measureScheduled > -1)
        this.measure(false);
    }
    /**
    Schedule a layout measurement, optionally providing callbacks to
    do custom DOM measuring followed by a DOM write phase. Using
    this is preferable reading DOM layout directly from, for
    example, an event handler, because it'll make sure measuring and
    drawing done by other components is synchronized, avoiding
    unnecessary DOM layout computations.
    */
    requestMeasure(request) {
      if (this.measureScheduled < 0)
        this.measureScheduled = this.win.requestAnimationFrame(() => this.measure());
      if (request) {
        if (this.measureRequests.indexOf(request) > -1)
          return;
        if (request.key != null)
          for (let i = 0; i < this.measureRequests.length; i++) {
            if (this.measureRequests[i].key === request.key) {
              this.measureRequests[i] = request;
              return;
            }
          }
        this.measureRequests.push(request);
      }
    }
    /**
    Get the value of a specific plugin, if present. Note that
    plugins that crash can be dropped from a view, so even when you
    know you registered a given plugin, it is recommended to check
    the return value of this method.
    */
    plugin(plugin) {
      let known = this.pluginMap.get(plugin);
      if (known === void 0 || known && known.spec != plugin)
        this.pluginMap.set(plugin, known = this.plugins.find((p) => p.spec == plugin) || null);
      return known && known.update(this).value;
    }
    /**
    The top position of the document, in screen coordinates. This
    may be negative when the editor is scrolled down. Points
    directly to the top of the first line, not above the padding.
    */
    get documentTop() {
      return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
    }
    /**
    Reports the padding above and below the document.
    */
    get documentPadding() {
      return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
    }
    /**
    If the editor is transformed with CSS, this provides the scale
    along the X axis. Otherwise, it will just be 1. Note that
    transforms other than translation and scaling are not supported.
    */
    get scaleX() {
      return this.viewState.scaleX;
    }
    /**
    Provide the CSS transformed scale along the Y axis.
    */
    get scaleY() {
      return this.viewState.scaleY;
    }
    /**
    Find the text line or block widget at the given vertical
    position (which is interpreted as relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
    */
    elementAtHeight(height) {
      this.readMeasured();
      return this.viewState.elementAtHeight(height);
    }
    /**
    Find the line block (see
    [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) at the given
    height, again interpreted relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
    */
    lineBlockAtHeight(height) {
      this.readMeasured();
      return this.viewState.lineBlockAtHeight(height);
    }
    /**
    Get the extent and vertical position of all [line
    blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
    are relative to the [top of the
    document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
    */
    get viewportLineBlocks() {
      return this.viewState.viewportLines;
    }
    /**
    Find the line block around the given document position. A line
    block is a range delimited on both sides by either a
    non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line breaks, or the
    start/end of the document. It will usually just hold a line of
    text, but may be broken into multiple textblocks by block
    widgets.
    */
    lineBlockAt(pos) {
      return this.viewState.lineBlockAt(pos);
    }
    /**
    The editor's total content height.
    */
    get contentHeight() {
      return this.viewState.contentHeight;
    }
    /**
    Move a cursor position by [grapheme
    cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
    the motion is away from the line start, or towards it. In
    bidirectional text, the line is traversed in visual order, using
    the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
    When the start position was the last one on the line, the
    returned position will be across the line break. If there is no
    further line, the original position is returned.
    
    By default, this method moves over a single cluster. The
    optional `by` argument can be used to move across more. It will
    be called with the first cluster as argument, and should return
    a predicate that determines, for each subsequent cluster,
    whether it should also be moved over.
    */
    moveByChar(start, forward, by) {
      return skipAtoms(this, start, moveByChar(this, start, forward, by));
    }
    /**
    Move a cursor position across the next group of either
    [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
    non-whitespace characters.
    */
    moveByGroup(start, forward) {
      return skipAtoms(this, start, moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial)));
    }
    /**
    Move to the next line boundary in the given direction. If
    `includeWrap` is true, line wrapping is on, and there is a
    further wrap point on the current line, the wrap point will be
    returned. Otherwise this function will return the start or end
    of the line.
    */
    moveToLineBoundary(start, forward, includeWrap = true) {
      return moveToLineBoundary(this, start, forward, includeWrap);
    }
    /**
    Move a cursor position vertically. When `distance` isn't given,
    it defaults to moving to the next line (including wrapped
    lines). Otherwise, `distance` should provide a positive distance
    in pixels.
    
    When `start` has a
    [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
    motion will use that as a target horizontal position. Otherwise,
    the cursor's own horizontal position is used. The returned
    cursor will have its goal column set to whichever column was
    used.
    */
    moveVertically(start, forward, distance) {
      return skipAtoms(this, start, moveVertically(this, start, forward, distance));
    }
    /**
    Find the DOM parent node and offset (child offset if `node` is
    an element, character offset when it is a text node) at the
    given document position.
    
    Note that for positions that aren't currently in
    `visibleRanges`, the resulting DOM position isn't necessarily
    meaningful (it may just point before or after a placeholder
    element).
    */
    domAtPos(pos) {
      return this.docView.domAtPos(pos);
    }
    /**
    Find the document position at the given DOM node. Can be useful
    for associating positions with DOM events. Will raise an error
    when `node` isn't part of the editor content.
    */
    posAtDOM(node, offset = 0) {
      return this.docView.posFromDOM(node, offset);
    }
    posAtCoords(coords, precise = true) {
      this.readMeasured();
      return posAtCoords(this, coords, precise);
    }
    /**
    Get the screen coordinates at the given document position.
    `side` determines whether the coordinates are based on the
    element before (-1) or after (1) the position (if no element is
    available on the given side, the method will transparently use
    another strategy to get reasonable coordinates).
    */
    coordsAtPos(pos, side = 1) {
      this.readMeasured();
      let rect = this.docView.coordsAt(pos, side);
      if (!rect || rect.left == rect.right)
        return rect;
      let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
      let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
      return flattenRect(rect, span.dir == Direction.LTR == side > 0);
    }
    /**
    Return the rectangle around a given character. If `pos` does not
    point in front of a character that is in the viewport and
    rendered (i.e. not replaced, not a line break), this will return
    null. For space characters that are a line wrap point, this will
    return the position before the line break.
    */
    coordsForChar(pos) {
      this.readMeasured();
      return this.docView.coordsForChar(pos);
    }
    /**
    The default width of a character in the editor. May not
    accurately reflect the width of all characters (given variable
    width fonts or styling of invididual ranges).
    */
    get defaultCharacterWidth() {
      return this.viewState.heightOracle.charWidth;
    }
    /**
    The default height of a line in the editor. May not be accurate
    for all lines.
    */
    get defaultLineHeight() {
      return this.viewState.heightOracle.lineHeight;
    }
    /**
    The text direction
    ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
    CSS property) of the editor's content element.
    */
    get textDirection() {
      return this.viewState.defaultTextDirection;
    }
    /**
    Find the text direction of the block at the given position, as
    assigned by CSS. If
    [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
    isn't enabled, or the given position is outside of the viewport,
    this will always return the same as
    [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
    this may trigger a DOM layout.
    */
    textDirectionAt(pos) {
      let perLine = this.state.facet(perLineTextDirection);
      if (!perLine || pos < this.viewport.from || pos > this.viewport.to)
        return this.textDirection;
      this.readMeasured();
      return this.docView.textDirectionAt(pos);
    }
    /**
    Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
    (as determined by the
    [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
    CSS property of its content element).
    */
    get lineWrapping() {
      return this.viewState.heightOracle.lineWrapping;
    }
    /**
    Returns the bidirectional text structure of the given line
    (which should be in the current document) as an array of span
    objects. The order of these spans matches the [text
    direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
    left-to-right, the leftmost spans come first, otherwise the
    rightmost spans come first.
    */
    bidiSpans(line) {
      if (line.length > MaxBidiLine)
        return trivialOrder(line.length);
      let dir = this.textDirectionAt(line.from), isolates;
      for (let entry of this.bidiCache) {
        if (entry.from == line.from && entry.dir == dir && (entry.fresh || isolatesEq(entry.isolates, isolates = getIsolatedRanges(this, line.from, line.to))))
          return entry.order;
      }
      if (!isolates)
        isolates = getIsolatedRanges(this, line.from, line.to);
      let order = computeOrder(line.text, dir, isolates);
      this.bidiCache.push(new CachedOrder(line.from, line.to, dir, isolates, true, order));
      return order;
    }
    /**
    Check whether the editor has focus.
    */
    get hasFocus() {
      var _a2;
      return (this.dom.ownerDocument.hasFocus() || browser.safari && ((_a2 = this.inputState) === null || _a2 === void 0 ? void 0 : _a2.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
    }
    /**
    Put focus on the editor.
    */
    focus() {
      this.observer.ignore(() => {
        focusPreventScroll(this.contentDOM);
        this.docView.updateSelection();
      });
    }
    /**
    Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
    necessary when moving the editor's existing DOM to a new window or shadow root.
    */
    setRoot(root2) {
      if (this._root != root2) {
        this._root = root2;
        this.observer.setWindow((root2.nodeType == 9 ? root2 : root2.ownerDocument).defaultView || window);
        this.mountStyles();
      }
    }
    /**
    Clean up this editor view, removing its element from the
    document, unregistering event handlers, and notifying
    plugins. The view instance can no longer be used after
    calling this.
    */
    destroy() {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.plugins = [];
      this.inputState.destroy();
      this.dom.remove();
      this.observer.destroy();
      if (this.measureScheduled > -1)
        this.win.cancelAnimationFrame(this.measureScheduled);
      this.destroyed = true;
    }
    /**
    Returns an effect that can be
    [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
    cause it to scroll the given position or range into view.
    */
    static scrollIntoView(pos, options = {}) {
      return scrollIntoView.of(new ScrollTarget(typeof pos == "number" ? EditorSelection.cursor(pos) : pos, options.y, options.x, options.yMargin, options.xMargin));
    }
    /**
    Returns an extension that can be used to add DOM event handlers.
    The value should be an object mapping event names to handler
    functions. For any given event, such functions are ordered by
    extension precedence, and the first handler to return true will
    be assumed to have handled that event, and no other handlers or
    built-in behavior will be activated for it. These are registered
    on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
    for `scroll` handlers, which will be called any time the
    editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
    its parent nodes is scrolled.
    */
    static domEventHandlers(handlers2) {
      return ViewPlugin.define(() => ({}), { eventHandlers: handlers2 });
    }
    /**
    Create a theme extension. The first argument can be a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)
    style spec providing the styles for the theme. These will be
    prefixed with a generated class for the style.
    
    Because the selectors will be prefixed with a scope class, rule
    that directly match the editor's [wrapper
    element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
    added—need to be explicitly differentiated by adding an `&` to
    the selector for that element—for example
    `&.cm-focused`.
    
    When `dark` is set to true, the theme will be marked as dark,
    which will cause the `&dark` rules from [base
    themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
    `&light` when a light theme is active).
    */
    static theme(spec, options) {
      let prefix = StyleModule.newName();
      let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
      if (options && options.dark)
        result.push(darkTheme.of(true));
      return result;
    }
    /**
    Create an extension that adds styles to the base theme. Like
    with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
    place of the editor wrapper element when directly targeting
    that. You can also use `&dark` or `&light` instead to only
    target editors with a dark or light theme.
    */
    static baseTheme(spec) {
      return Prec.lowest(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
    }
    /**
    Retrieve an editor view instance from the view's DOM
    representation.
    */
    static findFromDOM(dom) {
      var _a2;
      let content2 = dom.querySelector(".cm-content");
      let cView = content2 && ContentView.get(content2) || ContentView.get(dom);
      return ((_a2 = cView === null || cView === void 0 ? void 0 : cView.rootView) === null || _a2 === void 0 ? void 0 : _a2.view) || null;
    }
  };
  EditorView.styleModule = styleModule;
  EditorView.inputHandler = inputHandler;
  EditorView.focusChangeEffect = focusChangeEffect;
  EditorView.perLineTextDirection = perLineTextDirection;
  EditorView.exceptionSink = exceptionSink;
  EditorView.updateListener = updateListener;
  EditorView.editable = editable;
  EditorView.mouseSelectionStyle = mouseSelectionStyle;
  EditorView.dragMovesSelection = dragMovesSelection$1;
  EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
  EditorView.decorations = decorations;
  EditorView.atomicRanges = atomicRanges;
  EditorView.bidiIsolatedRanges = bidiIsolatedRanges;
  EditorView.scrollMargins = scrollMargins;
  EditorView.darkTheme = darkTheme;
  EditorView.cspNonce = /* @__PURE__ */ Facet.define({ combine: (values) => values.length ? values[0] : "" });
  EditorView.contentAttributes = contentAttributes;
  EditorView.editorAttributes = editorAttributes;
  EditorView.lineWrapping = /* @__PURE__ */ EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
  EditorView.announce = /* @__PURE__ */ StateEffect.define();
  var MaxBidiLine = 4096;
  var BadMeasure = {};
  var CachedOrder = class _CachedOrder {
    constructor(from, to, dir, isolates, fresh, order) {
      this.from = from;
      this.to = to;
      this.dir = dir;
      this.isolates = isolates;
      this.fresh = fresh;
      this.order = order;
    }
    static update(cache, changes) {
      if (changes.empty && !cache.some((c) => c.fresh))
        return cache;
      let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
      for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
        let entry = cache[i];
        if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
          result.push(new _CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.isolates, false, entry.order));
      }
      return result;
    }
  };
  function attrsFromFacet(view, facet, base2) {
    for (let sources = view.state.facet(facet), i = sources.length - 1; i >= 0; i--) {
      let source = sources[i], value = typeof source == "function" ? source(view) : source;
      if (value)
        combineAttrs(value, base2);
    }
    return base2;
  }
  var currentPlatform = browser.mac ? "mac" : browser.windows ? "win" : browser.linux ? "linux" : "key";
  function normalizeKeyName(name2, platform) {
    const parts = name2.split(/-(?!$)/);
    let result = parts[parts.length - 1];
    if (result == "Space")
      result = " ";
    let alt, ctrl, shift2, meta2;
    for (let i = 0; i < parts.length - 1; ++i) {
      const mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod))
        meta2 = true;
      else if (/^a(lt)?$/i.test(mod))
        alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod))
        ctrl = true;
      else if (/^s(hift)?$/i.test(mod))
        shift2 = true;
      else if (/^mod$/i.test(mod)) {
        if (platform == "mac")
          meta2 = true;
        else
          ctrl = true;
      } else
        throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
      result = "Alt-" + result;
    if (ctrl)
      result = "Ctrl-" + result;
    if (meta2)
      result = "Meta-" + result;
    if (shift2)
      result = "Shift-" + result;
    return result;
  }
  function modifiers(name2, event, shift2) {
    if (event.altKey)
      name2 = "Alt-" + name2;
    if (event.ctrlKey)
      name2 = "Ctrl-" + name2;
    if (event.metaKey)
      name2 = "Meta-" + name2;
    if (shift2 !== false && event.shiftKey)
      name2 = "Shift-" + name2;
    return name2;
  }
  var handleKeyEvents = /* @__PURE__ */ Prec.default(/* @__PURE__ */ EditorView.domEventHandlers({
    keydown(event, view) {
      return runHandlers(getKeymap(view.state), event, view, "editor");
    }
  }));
  var keymap = /* @__PURE__ */ Facet.define({ enables: handleKeyEvents });
  var Keymaps = /* @__PURE__ */ new WeakMap();
  function getKeymap(state) {
    let bindings = state.facet(keymap);
    let map = Keymaps.get(bindings);
    if (!map)
      Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
    return map;
  }
  var storedPrefix = null;
  var PrefixTimeout = 4e3;
  function buildKeymap(bindings, platform = currentPlatform) {
    let bound = /* @__PURE__ */ Object.create(null);
    let isPrefix = /* @__PURE__ */ Object.create(null);
    let checkPrefix = (name2, is) => {
      let current = isPrefix[name2];
      if (current == null)
        isPrefix[name2] = is;
      else if (current != is)
        throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
    };
    let add2 = (scope, key, command2, preventDefault, stopPropagation) => {
      var _a2, _b;
      let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
      let parts = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
      for (let i = 1; i < parts.length; i++) {
        let prefix = parts.slice(0, i).join(" ");
        checkPrefix(prefix, true);
        if (!scopeObj[prefix])
          scopeObj[prefix] = {
            preventDefault: true,
            stopPropagation: false,
            run: [(view) => {
              let ourObj = storedPrefix = { view, prefix, scope };
              setTimeout(() => {
                if (storedPrefix == ourObj)
                  storedPrefix = null;
              }, PrefixTimeout);
              return true;
            }]
          };
      }
      let full = parts.join(" ");
      checkPrefix(full, false);
      let binding = scopeObj[full] || (scopeObj[full] = {
        preventDefault: false,
        stopPropagation: false,
        run: ((_b = (_a2 = scopeObj._any) === null || _a2 === void 0 ? void 0 : _a2.run) === null || _b === void 0 ? void 0 : _b.slice()) || []
      });
      if (command2)
        binding.run.push(command2);
      if (preventDefault)
        binding.preventDefault = true;
      if (stopPropagation)
        binding.stopPropagation = true;
    };
    for (let b of bindings) {
      let scopes = b.scope ? b.scope.split(" ") : ["editor"];
      if (b.any)
        for (let scope of scopes) {
          let scopeObj = bound[scope] || (bound[scope] = /* @__PURE__ */ Object.create(null));
          if (!scopeObj._any)
            scopeObj._any = { preventDefault: false, stopPropagation: false, run: [] };
          for (let key in scopeObj)
            scopeObj[key].run.push(b.any);
        }
      let name2 = b[platform] || b.key;
      if (!name2)
        continue;
      for (let scope of scopes) {
        add2(scope, name2, b.run, b.preventDefault, b.stopPropagation);
        if (b.shift)
          add2(scope, "Shift-" + name2, b.shift, b.preventDefault, b.stopPropagation);
      }
    }
    return bound;
  }
  function runHandlers(map, event, view, scope) {
    let name2 = keyName(event);
    let charCode = codePointAt(name2, 0), isChar = codePointSize(charCode) == name2.length && name2 != " ";
    let prefix = "", handled = false, prevented = false, stopPropagation = false;
    if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
      prefix = storedPrefix.prefix + " ";
      if (modifierCodes.indexOf(event.keyCode) < 0) {
        prevented = true;
        storedPrefix = null;
      }
    }
    let ran = /* @__PURE__ */ new Set();
    let runFor = (binding) => {
      if (binding) {
        for (let cmd of binding.run)
          if (!ran.has(cmd)) {
            ran.add(cmd);
            if (cmd(view, event)) {
              if (binding.stopPropagation)
                stopPropagation = true;
              return true;
            }
          }
        if (binding.preventDefault) {
          if (binding.stopPropagation)
            stopPropagation = true;
          prevented = true;
        }
      }
      return false;
    };
    let scopeObj = map[scope], baseName, shiftName;
    if (scopeObj) {
      if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)])) {
        handled = true;
      } else if (isChar && (event.altKey || event.metaKey || event.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
      !(browser.windows && event.ctrlKey && event.altKey) && (baseName = base[event.keyCode]) && baseName != name2) {
        if (runFor(scopeObj[prefix + modifiers(baseName, event, true)])) {
          handled = true;
        } else if (event.shiftKey && (shiftName = shift[event.keyCode]) != name2 && shiftName != baseName && runFor(scopeObj[prefix + modifiers(shiftName, event, false)])) {
          handled = true;
        }
      } else if (isChar && event.shiftKey && runFor(scopeObj[prefix + modifiers(name2, event, true)])) {
        handled = true;
      }
      if (!handled && runFor(scopeObj._any))
        handled = true;
    }
    if (prevented)
      handled = true;
    if (handled && stopPropagation)
      event.stopPropagation();
    return handled;
  }
  var CanHidePrimary = !browser.ios;
  var themeSpec = {
    ".cm-line": {
      "& ::selection": { backgroundColor: "transparent !important" },
      "&::selection": { backgroundColor: "transparent !important" }
    }
  };
  if (CanHidePrimary)
    themeSpec[".cm-line"].caretColor = "transparent !important";
  var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
  var Outside = "-10000px";
  var TooltipViewManager = class {
    constructor(view, facet, createTooltipView) {
      this.facet = facet;
      this.createTooltipView = createTooltipView;
      this.input = view.state.facet(facet);
      this.tooltips = this.input.filter((t2) => t2);
      this.tooltipViews = this.tooltips.map(createTooltipView);
    }
    update(update) {
      var _a2;
      let input = update.state.facet(this.facet);
      let tooltips = input.filter((x) => x);
      if (input === this.input) {
        for (let t2 of this.tooltipViews)
          if (t2.update)
            t2.update(update);
        return false;
      }
      let tooltipViews = [];
      for (let i = 0; i < tooltips.length; i++) {
        let tip = tooltips[i], known = -1;
        if (!tip)
          continue;
        for (let i2 = 0; i2 < this.tooltips.length; i2++) {
          let other = this.tooltips[i2];
          if (other && other.create == tip.create)
            known = i2;
        }
        if (known < 0) {
          tooltipViews[i] = this.createTooltipView(tip);
        } else {
          let tooltipView = tooltipViews[i] = this.tooltipViews[known];
          if (tooltipView.update)
            tooltipView.update(update);
        }
      }
      for (let t2 of this.tooltipViews)
        if (tooltipViews.indexOf(t2) < 0) {
          t2.dom.remove();
          (_a2 = t2.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(t2);
        }
      this.input = input;
      this.tooltips = tooltips;
      this.tooltipViews = tooltipViews;
      return true;
    }
  };
  function windowSpace(view) {
    let { win } = view;
    return { top: 0, left: 0, bottom: win.innerHeight, right: win.innerWidth };
  }
  var tooltipConfig = /* @__PURE__ */ Facet.define({
    combine: (values) => {
      var _a2, _b, _c;
      return {
        position: browser.ios ? "absolute" : ((_a2 = values.find((conf) => conf.position)) === null || _a2 === void 0 ? void 0 : _a2.position) || "fixed",
        parent: ((_b = values.find((conf) => conf.parent)) === null || _b === void 0 ? void 0 : _b.parent) || null,
        tooltipSpace: ((_c = values.find((conf) => conf.tooltipSpace)) === null || _c === void 0 ? void 0 : _c.tooltipSpace) || windowSpace
      };
    }
  });
  var knownHeight = /* @__PURE__ */ new WeakMap();
  var tooltipPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.inView = true;
      this.madeAbsolute = false;
      this.lastTransaction = 0;
      this.measureTimeout = -1;
      let config = view.state.facet(tooltipConfig);
      this.position = config.position;
      this.parent = config.parent;
      this.classes = view.themeClasses;
      this.createContainer();
      this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this };
      this.manager = new TooltipViewManager(view, showTooltip, (t2) => this.createTooltip(t2));
      this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((entries) => {
        if (Date.now() > this.lastTransaction - 50 && entries.length > 0 && entries[entries.length - 1].intersectionRatio < 1)
          this.measureSoon();
      }, { threshold: [1] }) : null;
      this.observeIntersection();
      view.win.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this));
      this.maybeMeasure();
    }
    createContainer() {
      if (this.parent) {
        this.container = document.createElement("div");
        this.container.style.position = "relative";
        this.container.className = this.view.themeClasses;
        this.parent.appendChild(this.container);
      } else {
        this.container = this.view.dom;
      }
    }
    observeIntersection() {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        for (let tooltip of this.manager.tooltipViews)
          this.intersectionObserver.observe(tooltip.dom);
      }
    }
    measureSoon() {
      if (this.measureTimeout < 0)
        this.measureTimeout = setTimeout(() => {
          this.measureTimeout = -1;
          this.maybeMeasure();
        }, 50);
    }
    update(update) {
      if (update.transactions.length)
        this.lastTransaction = Date.now();
      let updated = this.manager.update(update);
      if (updated)
        this.observeIntersection();
      let shouldMeasure = updated || update.geometryChanged;
      let newConfig = update.state.facet(tooltipConfig);
      if (newConfig.position != this.position && !this.madeAbsolute) {
        this.position = newConfig.position;
        for (let t2 of this.manager.tooltipViews)
          t2.dom.style.position = this.position;
        shouldMeasure = true;
      }
      if (newConfig.parent != this.parent) {
        if (this.parent)
          this.container.remove();
        this.parent = newConfig.parent;
        this.createContainer();
        for (let t2 of this.manager.tooltipViews)
          this.container.appendChild(t2.dom);
        shouldMeasure = true;
      } else if (this.parent && this.view.themeClasses != this.classes) {
        this.classes = this.container.className = this.view.themeClasses;
      }
      if (shouldMeasure)
        this.maybeMeasure();
    }
    createTooltip(tooltip) {
      let tooltipView = tooltip.create(this.view);
      tooltipView.dom.classList.add("cm-tooltip");
      if (tooltip.arrow && !tooltipView.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
        let arrow = document.createElement("div");
        arrow.className = "cm-tooltip-arrow";
        tooltipView.dom.appendChild(arrow);
      }
      tooltipView.dom.style.position = this.position;
      tooltipView.dom.style.top = Outside;
      this.container.appendChild(tooltipView.dom);
      if (tooltipView.mount)
        tooltipView.mount(this.view);
      return tooltipView;
    }
    destroy() {
      var _a2, _b;
      this.view.win.removeEventListener("resize", this.measureSoon);
      for (let tooltipView of this.manager.tooltipViews) {
        tooltipView.dom.remove();
        (_a2 = tooltipView.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(tooltipView);
      }
      (_b = this.intersectionObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
      clearTimeout(this.measureTimeout);
    }
    readMeasure() {
      let editor = this.view.dom.getBoundingClientRect();
      let scaleX = 1, scaleY = 1, makeAbsolute = false;
      if (this.position == "fixed") {
        let views = this.manager.tooltipViews;
        makeAbsolute = views.length > 0 && views[0].dom.offsetParent != this.container.ownerDocument.body;
      }
      if (makeAbsolute || this.position == "absolute") {
        if (this.parent) {
          let rect = this.parent.getBoundingClientRect();
          if (rect.width && rect.height) {
            scaleX = rect.width / this.parent.offsetWidth;
            scaleY = rect.height / this.parent.offsetHeight;
          }
        } else {
          ({ scaleX, scaleY } = this.view.viewState);
        }
      }
      return {
        editor,
        parent: this.parent ? this.container.getBoundingClientRect() : editor,
        pos: this.manager.tooltips.map((t2, i) => {
          let tv = this.manager.tooltipViews[i];
          return tv.getCoords ? tv.getCoords(t2.pos) : this.view.coordsAtPos(t2.pos);
        }),
        size: this.manager.tooltipViews.map(({ dom }) => dom.getBoundingClientRect()),
        space: this.view.state.facet(tooltipConfig).tooltipSpace(this.view),
        scaleX,
        scaleY,
        makeAbsolute
      };
    }
    writeMeasure(measured) {
      var _a2;
      if (measured.makeAbsolute) {
        this.madeAbsolute = true;
        this.position = "absolute";
        for (let t2 of this.manager.tooltipViews)
          t2.dom.style.position = "absolute";
      }
      let { editor, space, scaleX, scaleY } = measured;
      let others = [];
      for (let i = 0; i < this.manager.tooltips.length; i++) {
        let tooltip = this.manager.tooltips[i], tView = this.manager.tooltipViews[i], { dom } = tView;
        let pos = measured.pos[i], size = measured.size[i];
        if (!pos || pos.bottom <= Math.max(editor.top, space.top) || pos.top >= Math.min(editor.bottom, space.bottom) || pos.right < Math.max(editor.left, space.left) - 0.1 || pos.left > Math.min(editor.right, space.right) + 0.1) {
          dom.style.top = Outside;
          continue;
        }
        let arrow = tooltip.arrow ? tView.dom.querySelector(".cm-tooltip-arrow") : null;
        let arrowHeight = arrow ? 7 : 0;
        let width = size.right - size.left, height = (_a2 = knownHeight.get(tView)) !== null && _a2 !== void 0 ? _a2 : size.bottom - size.top;
        let offset = tView.offset || noOffset, ltr = this.view.textDirection == Direction.LTR;
        let left = size.width > space.right - space.left ? ltr ? space.left : space.right - size.width : ltr ? Math.min(pos.left - (arrow ? 14 : 0) + offset.x, space.right - width) : Math.max(space.left, pos.left - width + (arrow ? 14 : 0) - offset.x);
        let above = !!tooltip.above;
        if (!tooltip.strictSide && (above ? pos.top - (size.bottom - size.top) - offset.y < space.top : pos.bottom + (size.bottom - size.top) + offset.y > space.bottom) && above == space.bottom - pos.bottom > pos.top - space.top)
          above = !above;
        let spaceVert = (above ? pos.top - space.top : space.bottom - pos.bottom) - arrowHeight;
        if (spaceVert < height && tView.resize !== false) {
          if (spaceVert < this.view.defaultLineHeight) {
            dom.style.top = Outside;
            continue;
          }
          knownHeight.set(tView, height);
          dom.style.height = (height = spaceVert) / scaleY + "px";
        } else if (dom.style.height) {
          dom.style.height = "";
        }
        let top2 = above ? pos.top - height - arrowHeight - offset.y : pos.bottom + arrowHeight + offset.y;
        let right = left + width;
        if (tView.overlap !== true) {
          for (let r of others)
            if (r.left < right && r.right > left && r.top < top2 + height && r.bottom > top2)
              top2 = above ? r.top - height - 2 - arrowHeight : r.bottom + arrowHeight + 2;
        }
        if (this.position == "absolute") {
          dom.style.top = (top2 - measured.parent.top) / scaleY + "px";
          dom.style.left = (left - measured.parent.left) / scaleX + "px";
        } else {
          dom.style.top = top2 / scaleY + "px";
          dom.style.left = left / scaleX + "px";
        }
        if (arrow) {
          let arrowLeft = pos.left + (ltr ? offset.x : -offset.x) - (left + 14 - 7);
          arrow.style.left = arrowLeft / scaleX + "px";
        }
        if (tView.overlap !== true)
          others.push({ left, top: top2, right, bottom: top2 + height });
        dom.classList.toggle("cm-tooltip-above", above);
        dom.classList.toggle("cm-tooltip-below", !above);
        if (tView.positioned)
          tView.positioned(measured.space);
      }
    }
    maybeMeasure() {
      if (this.manager.tooltips.length) {
        if (this.view.inView)
          this.view.requestMeasure(this.measureReq);
        if (this.inView != this.view.inView) {
          this.inView = this.view.inView;
          if (!this.inView)
            for (let tv of this.manager.tooltipViews)
              tv.dom.style.top = Outside;
        }
      }
    }
  }, {
    eventHandlers: {
      scroll() {
        this.maybeMeasure();
      }
    }
  });
  var baseTheme = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-tooltip": {
      zIndex: 100,
      boxSizing: "border-box"
    },
    "&light .cm-tooltip": {
      border: "1px solid #bbb",
      backgroundColor: "#f5f5f5"
    },
    "&light .cm-tooltip-section:not(:first-child)": {
      borderTop: "1px solid #bbb"
    },
    "&dark .cm-tooltip": {
      backgroundColor: "#333338",
      color: "white"
    },
    ".cm-tooltip-arrow": {
      height: `${7}px`,
      width: `${7 * 2}px`,
      position: "absolute",
      zIndex: -1,
      overflow: "hidden",
      "&:before, &:after": {
        content: "''",
        position: "absolute",
        width: 0,
        height: 0,
        borderLeft: `${7}px solid transparent`,
        borderRight: `${7}px solid transparent`
      },
      ".cm-tooltip-above &": {
        bottom: `-${7}px`,
        "&:before": {
          borderTop: `${7}px solid #bbb`
        },
        "&:after": {
          borderTop: `${7}px solid #f5f5f5`,
          bottom: "1px"
        }
      },
      ".cm-tooltip-below &": {
        top: `-${7}px`,
        "&:before": {
          borderBottom: `${7}px solid #bbb`
        },
        "&:after": {
          borderBottom: `${7}px solid #f5f5f5`,
          top: "1px"
        }
      }
    },
    "&dark .cm-tooltip .cm-tooltip-arrow": {
      "&:before": {
        borderTopColor: "#333338",
        borderBottomColor: "#333338"
      },
      "&:after": {
        borderTopColor: "transparent",
        borderBottomColor: "transparent"
      }
    }
  });
  var noOffset = { x: 0, y: 0 };
  var showTooltip = /* @__PURE__ */ Facet.define({
    enables: [tooltipPlugin, baseTheme]
  });
  var showHoverTooltip = /* @__PURE__ */ Facet.define();
  var HoverTooltipHost = class _HoverTooltipHost {
    // Needs to be static so that host tooltip instances always match
    static create(view) {
      return new _HoverTooltipHost(view);
    }
    constructor(view) {
      this.view = view;
      this.mounted = false;
      this.dom = document.createElement("div");
      this.dom.classList.add("cm-tooltip-hover");
      this.manager = new TooltipViewManager(view, showHoverTooltip, (t2) => this.createHostedView(t2));
    }
    createHostedView(tooltip) {
      let hostedView = tooltip.create(this.view);
      hostedView.dom.classList.add("cm-tooltip-section");
      this.dom.appendChild(hostedView.dom);
      if (this.mounted && hostedView.mount)
        hostedView.mount(this.view);
      return hostedView;
    }
    mount(view) {
      for (let hostedView of this.manager.tooltipViews) {
        if (hostedView.mount)
          hostedView.mount(view);
      }
      this.mounted = true;
    }
    positioned(space) {
      for (let hostedView of this.manager.tooltipViews) {
        if (hostedView.positioned)
          hostedView.positioned(space);
      }
    }
    update(update) {
      this.manager.update(update);
    }
    destroy() {
      var _a2;
      for (let t2 of this.manager.tooltipViews)
        (_a2 = t2.destroy) === null || _a2 === void 0 ? void 0 : _a2.call(t2);
    }
  };
  var showHoverTooltipHost = /* @__PURE__ */ showTooltip.compute([showHoverTooltip], (state) => {
    let tooltips = state.facet(showHoverTooltip).filter((t2) => t2);
    if (tooltips.length === 0)
      return null;
    return {
      pos: Math.min(...tooltips.map((t2) => t2.pos)),
      end: Math.max(...tooltips.filter((t2) => t2.end != null).map((t2) => t2.end)),
      create: HoverTooltipHost.create,
      above: tooltips[0].above,
      arrow: tooltips.some((t2) => t2.arrow)
    };
  });
  var HoverPlugin = class {
    constructor(view, source, field, setHover, hoverTime) {
      this.view = view;
      this.source = source;
      this.field = field;
      this.setHover = setHover;
      this.hoverTime = hoverTime;
      this.hoverTimeout = -1;
      this.restartTimeout = -1;
      this.pending = null;
      this.lastMove = { x: 0, y: 0, target: view.dom, time: 0 };
      this.checkHover = this.checkHover.bind(this);
      view.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
      view.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
    }
    update() {
      if (this.pending) {
        this.pending = null;
        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => this.startHover(), 20);
      }
    }
    get active() {
      return this.view.state.field(this.field);
    }
    checkHover() {
      this.hoverTimeout = -1;
      if (this.active)
        return;
      let hovered = Date.now() - this.lastMove.time;
      if (hovered < this.hoverTime)
        this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime - hovered);
      else
        this.startHover();
    }
    startHover() {
      clearTimeout(this.restartTimeout);
      let { view, lastMove } = this;
      let desc = view.docView.nearest(lastMove.target);
      if (!desc)
        return;
      let pos, side = 1;
      if (desc instanceof WidgetView) {
        pos = desc.posAtStart;
      } else {
        pos = view.posAtCoords(lastMove);
        if (pos == null)
          return;
        let posCoords = view.coordsAtPos(pos);
        if (!posCoords || lastMove.y < posCoords.top || lastMove.y > posCoords.bottom || lastMove.x < posCoords.left - view.defaultCharacterWidth || lastMove.x > posCoords.right + view.defaultCharacterWidth)
          return;
        let bidi = view.bidiSpans(view.state.doc.lineAt(pos)).find((s) => s.from <= pos && s.to >= pos);
        let rtl = bidi && bidi.dir == Direction.RTL ? -1 : 1;
        side = lastMove.x < posCoords.left ? -rtl : rtl;
      }
      let open = this.source(view, pos, side);
      if (open === null || open === void 0 ? void 0 : open.then) {
        let pending = this.pending = { pos };
        open.then((result) => {
          if (this.pending == pending) {
            this.pending = null;
            if (result)
              view.dispatch({ effects: this.setHover.of(result) });
          }
        }, (e) => logException(view.state, e, "hover tooltip"));
      } else if (open) {
        view.dispatch({ effects: this.setHover.of(open) });
      }
    }
    mousemove(event) {
      var _a2;
      this.lastMove = { x: event.clientX, y: event.clientY, target: event.target, time: Date.now() };
      if (this.hoverTimeout < 0)
        this.hoverTimeout = setTimeout(this.checkHover, this.hoverTime);
      let tooltip = this.active;
      if (tooltip && !isInTooltip(this.lastMove.target) || this.pending) {
        let { pos } = tooltip || this.pending, end = (_a2 = tooltip === null || tooltip === void 0 ? void 0 : tooltip.end) !== null && _a2 !== void 0 ? _a2 : pos;
        if (pos == end ? this.view.posAtCoords(this.lastMove) != pos : !isOverRange(this.view, pos, end, event.clientX, event.clientY)) {
          this.view.dispatch({ effects: this.setHover.of(null) });
          this.pending = null;
        }
      }
    }
    mouseleave(e) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = -1;
      if (this.active && !isInTooltip(e.relatedTarget))
        this.view.dispatch({ effects: this.setHover.of(null) });
    }
    destroy() {
      clearTimeout(this.hoverTimeout);
      this.view.dom.removeEventListener("mouseleave", this.mouseleave);
      this.view.dom.removeEventListener("mousemove", this.mousemove);
    }
  };
  function isInTooltip(elt) {
    for (let cur = elt; cur; cur = cur.parentNode)
      if (cur.nodeType == 1 && cur.classList.contains("cm-tooltip"))
        return true;
    return false;
  }
  function isOverRange(view, from, to, x, y, margin) {
    let rect = view.scrollDOM.getBoundingClientRect();
    let docBottom = view.documentTop + view.documentPadding.top + view.contentHeight;
    if (rect.left > x || rect.right < x || rect.top > y || Math.min(rect.bottom, docBottom) < y)
      return false;
    let pos = view.posAtCoords({ x, y }, false);
    return pos >= from && pos <= to;
  }
  function hoverTooltip(source, options = {}) {
    let setHover = StateEffect.define();
    let hoverState = StateField.define({
      create() {
        return null;
      },
      update(value, tr) {
        if (value && (options.hideOnChange && (tr.docChanged || tr.selection) || options.hideOn && options.hideOn(tr, value)))
          return null;
        if (value && tr.docChanged) {
          let newPos = tr.changes.mapPos(value.pos, -1, MapMode.TrackDel);
          if (newPos == null)
            return null;
          let copy = Object.assign(/* @__PURE__ */ Object.create(null), value);
          copy.pos = newPos;
          if (value.end != null)
            copy.end = tr.changes.mapPos(value.end);
          value = copy;
        }
        for (let effect of tr.effects) {
          if (effect.is(setHover))
            value = effect.value;
          if (effect.is(closeHoverTooltipEffect))
            value = null;
        }
        return value;
      },
      provide: (f) => showHoverTooltip.from(f)
    });
    return [
      hoverState,
      ViewPlugin.define((view) => new HoverPlugin(
        view,
        source,
        hoverState,
        setHover,
        options.hoverTime || 300
        /* Hover.Time */
      )),
      showHoverTooltipHost
    ];
  }
  var closeHoverTooltipEffect = /* @__PURE__ */ StateEffect.define();
  var panelConfig = /* @__PURE__ */ Facet.define({
    combine(configs) {
      let topContainer, bottomContainer;
      for (let c of configs) {
        topContainer = topContainer || c.topContainer;
        bottomContainer = bottomContainer || c.bottomContainer;
      }
      return { topContainer, bottomContainer };
    }
  });
  var panelPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.input = view.state.facet(showPanel);
      this.specs = this.input.filter((s) => s);
      this.panels = this.specs.map((spec) => spec(view));
      let conf = view.state.facet(panelConfig);
      this.top = new PanelGroup(view, true, conf.topContainer);
      this.bottom = new PanelGroup(view, false, conf.bottomContainer);
      this.top.sync(this.panels.filter((p) => p.top));
      this.bottom.sync(this.panels.filter((p) => !p.top));
      for (let p of this.panels) {
        p.dom.classList.add("cm-panel");
        if (p.mount)
          p.mount();
      }
    }
    update(update) {
      let conf = update.state.facet(panelConfig);
      if (this.top.container != conf.topContainer) {
        this.top.sync([]);
        this.top = new PanelGroup(update.view, true, conf.topContainer);
      }
      if (this.bottom.container != conf.bottomContainer) {
        this.bottom.sync([]);
        this.bottom = new PanelGroup(update.view, false, conf.bottomContainer);
      }
      this.top.syncClasses();
      this.bottom.syncClasses();
      let input = update.state.facet(showPanel);
      if (input != this.input) {
        let specs = input.filter((x) => x);
        let panels = [], top2 = [], bottom = [], mount = [];
        for (let spec of specs) {
          let known = this.specs.indexOf(spec), panel;
          if (known < 0) {
            panel = spec(update.view);
            mount.push(panel);
          } else {
            panel = this.panels[known];
            if (panel.update)
              panel.update(update);
          }
          panels.push(panel);
          (panel.top ? top2 : bottom).push(panel);
        }
        this.specs = specs;
        this.panels = panels;
        this.top.sync(top2);
        this.bottom.sync(bottom);
        for (let p of mount) {
          p.dom.classList.add("cm-panel");
          if (p.mount)
            p.mount();
        }
      } else {
        for (let p of this.panels)
          if (p.update)
            p.update(update);
      }
    }
    destroy() {
      this.top.sync([]);
      this.bottom.sync([]);
    }
  }, {
    provide: (plugin) => EditorView.scrollMargins.of((view) => {
      let value = view.plugin(plugin);
      return value && { top: value.top.scrollMargin(), bottom: value.bottom.scrollMargin() };
    })
  });
  var PanelGroup = class {
    constructor(view, top2, container) {
      this.view = view;
      this.top = top2;
      this.container = container;
      this.dom = void 0;
      this.classes = "";
      this.panels = [];
      this.syncClasses();
    }
    sync(panels) {
      for (let p of this.panels)
        if (p.destroy && panels.indexOf(p) < 0)
          p.destroy();
      this.panels = panels;
      this.syncDOM();
    }
    syncDOM() {
      if (this.panels.length == 0) {
        if (this.dom) {
          this.dom.remove();
          this.dom = void 0;
        }
        return;
      }
      if (!this.dom) {
        this.dom = document.createElement("div");
        this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom";
        this.dom.style[this.top ? "top" : "bottom"] = "0";
        let parent = this.container || this.view.dom;
        parent.insertBefore(this.dom, this.top ? parent.firstChild : null);
      }
      let curDOM = this.dom.firstChild;
      for (let panel of this.panels) {
        if (panel.dom.parentNode == this.dom) {
          while (curDOM != panel.dom)
            curDOM = rm(curDOM);
          curDOM = curDOM.nextSibling;
        } else {
          this.dom.insertBefore(panel.dom, curDOM);
        }
      }
      while (curDOM)
        curDOM = rm(curDOM);
    }
    scrollMargin() {
      return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
    }
    syncClasses() {
      if (!this.container || this.classes == this.view.themeClasses)
        return;
      for (let cls of this.classes.split(" "))
        if (cls)
          this.container.classList.remove(cls);
      for (let cls of (this.classes = this.view.themeClasses).split(" "))
        if (cls)
          this.container.classList.add(cls);
    }
  };
  function rm(node) {
    let next = node.nextSibling;
    node.remove();
    return next;
  }
  var showPanel = /* @__PURE__ */ Facet.define({
    enables: panelPlugin
  });
  var GutterMarker = class extends RangeValue {
    /**
    @internal
    */
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    /**
    Compare this marker to another marker of the same type.
    */
    eq(other) {
      return false;
    }
    /**
    Called if the marker has a `toDOM` method and its representation
    was removed from a gutter.
    */
    destroy(dom) {
    }
  };
  GutterMarker.prototype.elementClass = "";
  GutterMarker.prototype.toDOM = void 0;
  GutterMarker.prototype.mapMode = MapMode.TrackBefore;
  GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
  GutterMarker.prototype.point = true;

  // node_modules/@lezer/common/dist/index.js
  var DefaultBufferLength = 1024;
  var nextPropID = 0;
  var Range2 = class {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
  };
  var NodeProp = class {
    /**
    Create a new node prop type.
    */
    constructor(config = {}) {
      this.id = nextPropID++;
      this.perNode = !!config.perNode;
      this.deserialize = config.deserialize || (() => {
        throw new Error("This node type doesn't define a deserialize function");
      });
    }
    /**
    This is meant to be used with
    [`NodeSet.extend`](#common.NodeSet.extend) or
    [`LRParser.configure`](#lr.ParserConfig.props) to compute
    prop values for each node type in the set. Takes a [match
    object](#common.NodeType^match) or function that returns undefined
    if the node type doesn't get this prop, and the prop's value if
    it does.
    */
    add(match2) {
      if (this.perNode)
        throw new RangeError("Can't add per-node props to node types");
      if (typeof match2 != "function")
        match2 = NodeType.match(match2);
      return (type) => {
        let result = match2(type);
        return result === void 0 ? null : [this, result];
      };
    }
  };
  NodeProp.closedBy = new NodeProp({ deserialize: (str2) => str2.split(" ") });
  NodeProp.openedBy = new NodeProp({ deserialize: (str2) => str2.split(" ") });
  NodeProp.group = new NodeProp({ deserialize: (str2) => str2.split(" ") });
  NodeProp.contextHash = new NodeProp({ perNode: true });
  NodeProp.lookAhead = new NodeProp({ perNode: true });
  NodeProp.mounted = new NodeProp({ perNode: true });
  var noProps = /* @__PURE__ */ Object.create(null);
  var NodeType = class _NodeType {
    /**
    @internal
    */
    constructor(name2, props, id, flags = 0) {
      this.name = name2;
      this.props = props;
      this.id = id;
      this.flags = flags;
    }
    /**
    Define a node type.
    */
    static define(spec) {
      let props = spec.props && spec.props.length ? /* @__PURE__ */ Object.create(null) : noProps;
      let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
      let type = new _NodeType(spec.name || "", props, spec.id, flags);
      if (spec.props)
        for (let src of spec.props) {
          if (!Array.isArray(src))
            src = src(type);
          if (src) {
            if (src[0].perNode)
              throw new RangeError("Can't store a per-node prop on a node type");
            props[src[0].id] = src[1];
          }
        }
      return type;
    }
    /**
    Retrieves a node prop for this type. Will return `undefined` if
    the prop isn't present on this node.
    */
    prop(prop) {
      return this.props[prop.id];
    }
    /**
    True when this is the top node of a grammar.
    */
    get isTop() {
      return (this.flags & 1) > 0;
    }
    /**
    True when this node is produced by a skip rule.
    */
    get isSkipped() {
      return (this.flags & 2) > 0;
    }
    /**
    Indicates whether this is an error node.
    */
    get isError() {
      return (this.flags & 4) > 0;
    }
    /**
    When true, this node type doesn't correspond to a user-declared
    named node, for example because it is used to cache repetition.
    */
    get isAnonymous() {
      return (this.flags & 8) > 0;
    }
    /**
    Returns true when this node's name or one of its
    [groups](#common.NodeProp^group) matches the given string.
    */
    is(name2) {
      if (typeof name2 == "string") {
        if (this.name == name2)
          return true;
        let group = this.prop(NodeProp.group);
        return group ? group.indexOf(name2) > -1 : false;
      }
      return this.id == name2;
    }
    /**
    Create a function from node types to arbitrary values by
    specifying an object whose property names are node or
    [group](#common.NodeProp^group) names. Often useful with
    [`NodeProp.add`](#common.NodeProp.add). You can put multiple
    names, separated by spaces, in a single property name to map
    multiple node names to a single value.
    */
    static match(map) {
      let direct = /* @__PURE__ */ Object.create(null);
      for (let prop in map)
        for (let name2 of prop.split(" "))
          direct[name2] = map[prop];
      return (node) => {
        for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
          let found = direct[i < 0 ? node.name : groups[i]];
          if (found)
            return found;
        }
      };
    }
  };
  NodeType.none = new NodeType(
    "",
    /* @__PURE__ */ Object.create(null),
    0,
    8
    /* NodeFlag.Anonymous */
  );
  var CachedNode = /* @__PURE__ */ new WeakMap();
  var CachedInnerNode = /* @__PURE__ */ new WeakMap();
  var IterMode;
  (function(IterMode2) {
    IterMode2[IterMode2["ExcludeBuffers"] = 1] = "ExcludeBuffers";
    IterMode2[IterMode2["IncludeAnonymous"] = 2] = "IncludeAnonymous";
    IterMode2[IterMode2["IgnoreMounts"] = 4] = "IgnoreMounts";
    IterMode2[IterMode2["IgnoreOverlays"] = 8] = "IgnoreOverlays";
  })(IterMode || (IterMode = {}));
  var Tree = class _Tree {
    /**
    Construct a new tree. See also [`Tree.build`](#common.Tree^build).
    */
    constructor(type, children2, positions, length, props) {
      this.type = type;
      this.children = children2;
      this.positions = positions;
      this.length = length;
      this.props = null;
      if (props && props.length) {
        this.props = /* @__PURE__ */ Object.create(null);
        for (let [prop, value] of props)
          this.props[typeof prop == "number" ? prop : prop.id] = value;
      }
    }
    /**
    @internal
    */
    toString() {
      let mounted = this.prop(NodeProp.mounted);
      if (mounted && !mounted.overlay)
        return mounted.tree.toString();
      let children2 = "";
      for (let ch of this.children) {
        let str2 = ch.toString();
        if (str2) {
          if (children2)
            children2 += ",";
          children2 += str2;
        }
      }
      return !this.type.name ? children2 : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children2.length ? "(" + children2 + ")" : "");
    }
    /**
    Get a [tree cursor](#common.TreeCursor) positioned at the top of
    the tree. Mode can be used to [control](#common.IterMode) which
    nodes the cursor visits.
    */
    cursor(mode = 0) {
      return new TreeCursor(this.topNode, mode);
    }
    /**
    Get a [tree cursor](#common.TreeCursor) pointing into this tree
    at the given position and side (see
    [`moveTo`](#common.TreeCursor.moveTo).
    */
    cursorAt(pos, side = 0, mode = 0) {
      let scope = CachedNode.get(this) || this.topNode;
      let cursor = new TreeCursor(scope);
      cursor.moveTo(pos, side);
      CachedNode.set(this, cursor._tree);
      return cursor;
    }
    /**
    Get a [syntax node](#common.SyntaxNode) object for the top of the
    tree.
    */
    get topNode() {
      return new TreeNode(this, 0, 0, null);
    }
    /**
    Get the [syntax node](#common.SyntaxNode) at the given position.
    If `side` is -1, this will move into nodes that end at the
    position. If 1, it'll move into nodes that start at the
    position. With 0, it'll only enter nodes that cover the position
    from both sides.
    
    Note that this will not enter
    [overlays](#common.MountedTree.overlay), and you often want
    [`resolveInner`](#common.Tree.resolveInner) instead.
    */
    resolve(pos, side = 0) {
      let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
      CachedNode.set(this, node);
      return node;
    }
    /**
    Like [`resolve`](#common.Tree.resolve), but will enter
    [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
    pointing into the innermost overlaid tree at the given position
    (with parent links going through all parent structure, including
    the host trees).
    */
    resolveInner(pos, side = 0) {
      let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
      CachedInnerNode.set(this, node);
      return node;
    }
    /**
    Iterate over the tree and its children, calling `enter` for any
    node that touches the `from`/`to` region (if given) before
    running over such a node's children, and `leave` (if given) when
    leaving the node. When `enter` returns `false`, that node will
    not have its children iterated over (or `leave` called).
    */
    iterate(spec) {
      let { enter, leave, from = 0, to = this.length } = spec;
      let mode = spec.mode || 0, anon = (mode & IterMode.IncludeAnonymous) > 0;
      for (let c = this.cursor(mode | IterMode.IncludeAnonymous); ; ) {
        let entered = false;
        if (c.from <= to && c.to >= from && (!anon && c.type.isAnonymous || enter(c) !== false)) {
          if (c.firstChild())
            continue;
          entered = true;
        }
        for (; ; ) {
          if (entered && leave && (anon || !c.type.isAnonymous))
            leave(c);
          if (c.nextSibling())
            break;
          if (!c.parent())
            return;
          entered = true;
        }
      }
    }
    /**
    Get the value of the given [node prop](#common.NodeProp) for this
    node. Works with both per-node and per-type props.
    */
    prop(prop) {
      return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : void 0;
    }
    /**
    Returns the node's [per-node props](#common.NodeProp.perNode) in a
    format that can be passed to the [`Tree`](#common.Tree)
    constructor.
    */
    get propValues() {
      let result = [];
      if (this.props)
        for (let id in this.props)
          result.push([+id, this.props[id]]);
      return result;
    }
    /**
    Balance the direct children of this tree, producing a copy of
    which may have children grouped into subtrees with type
    [`NodeType.none`](#common.NodeType^none).
    */
    balance(config = {}) {
      return this.children.length <= 8 ? this : balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children2, positions, length) => new _Tree(this.type, children2, positions, length, this.propValues), config.makeTree || ((children2, positions, length) => new _Tree(NodeType.none, children2, positions, length)));
    }
    /**
    Build a tree from a postfix-ordered buffer of node information,
    or a cursor over such a buffer.
    */
    static build(data) {
      return buildTree(data);
    }
  };
  Tree.empty = new Tree(NodeType.none, [], [], 0);
  var FlatBufferCursor = class _FlatBufferCursor {
    constructor(buffer, index) {
      this.buffer = buffer;
      this.index = index;
    }
    get id() {
      return this.buffer[this.index - 4];
    }
    get start() {
      return this.buffer[this.index - 3];
    }
    get end() {
      return this.buffer[this.index - 2];
    }
    get size() {
      return this.buffer[this.index - 1];
    }
    get pos() {
      return this.index;
    }
    next() {
      this.index -= 4;
    }
    fork() {
      return new _FlatBufferCursor(this.buffer, this.index);
    }
  };
  var TreeBuffer = class _TreeBuffer {
    /**
    Create a tree buffer.
    */
    constructor(buffer, length, set) {
      this.buffer = buffer;
      this.length = length;
      this.set = set;
    }
    /**
    @internal
    */
    get type() {
      return NodeType.none;
    }
    /**
    @internal
    */
    toString() {
      let result = [];
      for (let index = 0; index < this.buffer.length; ) {
        result.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result.join(",");
    }
    /**
    @internal
    */
    childString(index) {
      let id = this.buffer[index], endIndex = this.buffer[index + 3];
      let type = this.set.types[id], result = type.name;
      if (/\W/.test(result) && !type.isError)
        result = JSON.stringify(result);
      index += 4;
      if (endIndex == index)
        return result;
      let children2 = [];
      while (index < endIndex) {
        children2.push(this.childString(index));
        index = this.buffer[index + 3];
      }
      return result + "(" + children2.join(",") + ")";
    }
    /**
    @internal
    */
    findChild(startIndex, endIndex, dir, pos, side) {
      let { buffer } = this, pick = -1;
      for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
        if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
          pick = i;
          if (dir > 0)
            break;
        }
      }
      return pick;
    }
    /**
    @internal
    */
    slice(startI, endI, from) {
      let b = this.buffer;
      let copy = new Uint16Array(endI - startI), len = 0;
      for (let i = startI, j = 0; i < endI; ) {
        copy[j++] = b[i++];
        copy[j++] = b[i++] - from;
        let to = copy[j++] = b[i++] - from;
        copy[j++] = b[i++] - startI;
        len = Math.max(len, to);
      }
      return new _TreeBuffer(copy, len, this.set);
    }
  };
  function checkSide(side, pos, from, to) {
    switch (side) {
      case -2:
        return from < pos;
      case -1:
        return to >= pos && from < pos;
      case 0:
        return from < pos && to > pos;
      case 1:
        return from <= pos && to > pos;
      case 2:
        return to > pos;
      case 4:
        return true;
    }
  }
  function enterUnfinishedNodesBefore(node, pos) {
    let scan = node.childBefore(pos);
    while (scan) {
      let last = scan.lastChild;
      if (!last || last.to != scan.to)
        break;
      if (last.type.isError && last.from == last.to) {
        node = scan;
        scan = last.prevSibling;
      } else {
        scan = last;
      }
    }
    return node;
  }
  function resolveNode(node, pos, side, overlays) {
    var _a2;
    while (node.from == node.to || (side < 1 ? node.from >= pos : node.from > pos) || (side > -1 ? node.to <= pos : node.to < pos)) {
      let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
      if (!parent)
        return node;
      node = parent;
    }
    let mode = overlays ? 0 : IterMode.IgnoreOverlays;
    if (overlays)
      for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
        if (scan instanceof TreeNode && scan.index < 0 && ((_a2 = parent.enter(pos, side, mode)) === null || _a2 === void 0 ? void 0 : _a2.from) != scan.from)
          node = parent;
      }
    for (; ; ) {
      let inner = node.enter(pos, side, mode);
      if (!inner)
        return node;
      node = inner;
    }
  }
  var TreeNode = class _TreeNode {
    constructor(_tree, from, index, _parent) {
      this._tree = _tree;
      this.from = from;
      this.index = index;
      this._parent = _parent;
    }
    get type() {
      return this._tree.type;
    }
    get name() {
      return this._tree.type.name;
    }
    get to() {
      return this.from + this._tree.length;
    }
    nextChild(i, dir, pos, side, mode = 0) {
      for (let parent = this; ; ) {
        for (let { children: children2, positions } = parent._tree, e = dir > 0 ? children2.length : -1; i != e; i += dir) {
          let next = children2[i], start = positions[i] + parent.from;
          if (!checkSide(side, pos, start, start + next.length))
            continue;
          if (next instanceof TreeBuffer) {
            if (mode & IterMode.ExcludeBuffers)
              continue;
            let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
            if (index > -1)
              return new BufferNode(new BufferContext(parent, next, i, start), null, index);
          } else if (mode & IterMode.IncludeAnonymous || (!next.type.isAnonymous || hasChild(next))) {
            let mounted;
            if (!(mode & IterMode.IgnoreMounts) && next.props && (mounted = next.prop(NodeProp.mounted)) && !mounted.overlay)
              return new _TreeNode(mounted.tree, start, i, parent);
            let inner = new _TreeNode(next, start, i, parent);
            return mode & IterMode.IncludeAnonymous || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side);
          }
        }
        if (mode & IterMode.IncludeAnonymous || !parent.type.isAnonymous)
          return null;
        if (parent.index >= 0)
          i = parent.index + dir;
        else
          i = dir < 0 ? -1 : parent._parent._tree.children.length;
        parent = parent._parent;
        if (!parent)
          return null;
      }
    }
    get firstChild() {
      return this.nextChild(
        0,
        1,
        0,
        4
        /* Side.DontCare */
      );
    }
    get lastChild() {
      return this.nextChild(
        this._tree.children.length - 1,
        -1,
        0,
        4
        /* Side.DontCare */
      );
    }
    childAfter(pos) {
      return this.nextChild(
        0,
        1,
        pos,
        2
        /* Side.After */
      );
    }
    childBefore(pos) {
      return this.nextChild(
        this._tree.children.length - 1,
        -1,
        pos,
        -2
        /* Side.Before */
      );
    }
    enter(pos, side, mode = 0) {
      let mounted;
      if (!(mode & IterMode.IgnoreOverlays) && (mounted = this._tree.prop(NodeProp.mounted)) && mounted.overlay) {
        let rPos = pos - this.from;
        for (let { from, to } of mounted.overlay) {
          if ((side > 0 ? from <= rPos : from < rPos) && (side < 0 ? to >= rPos : to > rPos))
            return new _TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
        }
      }
      return this.nextChild(0, 1, pos, side, mode);
    }
    nextSignificantParent() {
      let val = this;
      while (val.type.isAnonymous && val._parent)
        val = val._parent;
      return val;
    }
    get parent() {
      return this._parent ? this._parent.nextSignificantParent() : null;
    }
    get nextSibling() {
      return this._parent && this.index >= 0 ? this._parent.nextChild(
        this.index + 1,
        1,
        0,
        4
        /* Side.DontCare */
      ) : null;
    }
    get prevSibling() {
      return this._parent && this.index >= 0 ? this._parent.nextChild(
        this.index - 1,
        -1,
        0,
        4
        /* Side.DontCare */
      ) : null;
    }
    cursor(mode = 0) {
      return new TreeCursor(this, mode);
    }
    get tree() {
      return this._tree;
    }
    toTree() {
      return this._tree;
    }
    resolve(pos, side = 0) {
      return resolveNode(this, pos, side, false);
    }
    resolveInner(pos, side = 0) {
      return resolveNode(this, pos, side, true);
    }
    enterUnfinishedNodesBefore(pos) {
      return enterUnfinishedNodesBefore(this, pos);
    }
    getChild(type, before = null, after = null) {
      let r = getChildren(this, type, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
      return getChildren(this, type, before, after);
    }
    /**
    @internal
    */
    toString() {
      return this._tree.toString();
    }
    get node() {
      return this;
    }
    matchContext(context) {
      return matchNodeContext(this, context);
    }
  };
  function getChildren(node, type, before, after) {
    let cur = node.cursor(), result = [];
    if (!cur.firstChild())
      return result;
    if (before != null) {
      while (!cur.type.is(before))
        if (!cur.nextSibling())
          return result;
    }
    for (; ; ) {
      if (after != null && cur.type.is(after))
        return result;
      if (cur.type.is(type))
        result.push(cur.node);
      if (!cur.nextSibling())
        return after == null ? result : [];
    }
  }
  function matchNodeContext(node, context, i = context.length - 1) {
    for (let p = node.parent; i >= 0; p = p.parent) {
      if (!p)
        return false;
      if (!p.type.isAnonymous) {
        if (context[i] && context[i] != p.name)
          return false;
        i--;
      }
    }
    return true;
  }
  var BufferContext = class {
    constructor(parent, buffer, index, start) {
      this.parent = parent;
      this.buffer = buffer;
      this.index = index;
      this.start = start;
    }
  };
  var BufferNode = class _BufferNode {
    get name() {
      return this.type.name;
    }
    get from() {
      return this.context.start + this.context.buffer.buffer[this.index + 1];
    }
    get to() {
      return this.context.start + this.context.buffer.buffer[this.index + 2];
    }
    constructor(context, _parent, index) {
      this.context = context;
      this._parent = _parent;
      this.index = index;
      this.type = context.buffer.set.types[context.buffer.buffer[index]];
    }
    child(dir, pos, side) {
      let { buffer } = this.context;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
      return index < 0 ? null : new _BufferNode(this.context, this, index);
    }
    get firstChild() {
      return this.child(
        1,
        0,
        4
        /* Side.DontCare */
      );
    }
    get lastChild() {
      return this.child(
        -1,
        0,
        4
        /* Side.DontCare */
      );
    }
    childAfter(pos) {
      return this.child(
        1,
        pos,
        2
        /* Side.After */
      );
    }
    childBefore(pos) {
      return this.child(
        -1,
        pos,
        -2
        /* Side.Before */
      );
    }
    enter(pos, side, mode = 0) {
      if (mode & IterMode.ExcludeBuffers)
        return null;
      let { buffer } = this.context;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
      return index < 0 ? null : new _BufferNode(this.context, this, index);
    }
    get parent() {
      return this._parent || this.context.parent.nextSignificantParent();
    }
    externalSibling(dir) {
      return this._parent ? null : this.context.parent.nextChild(
        this.context.index + dir,
        dir,
        0,
        4
        /* Side.DontCare */
      );
    }
    get nextSibling() {
      let { buffer } = this.context;
      let after = buffer.buffer[this.index + 3];
      if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
        return new _BufferNode(this.context, this._parent, after);
      return this.externalSibling(1);
    }
    get prevSibling() {
      let { buffer } = this.context;
      let parentStart = this._parent ? this._parent.index + 4 : 0;
      if (this.index == parentStart)
        return this.externalSibling(-1);
      return new _BufferNode(this.context, this._parent, buffer.findChild(
        parentStart,
        this.index,
        -1,
        0,
        4
        /* Side.DontCare */
      ));
    }
    cursor(mode = 0) {
      return new TreeCursor(this, mode);
    }
    get tree() {
      return null;
    }
    toTree() {
      let children2 = [], positions = [];
      let { buffer } = this.context;
      let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
      if (endI > startI) {
        let from = buffer.buffer[this.index + 1];
        children2.push(buffer.slice(startI, endI, from));
        positions.push(0);
      }
      return new Tree(this.type, children2, positions, this.to - this.from);
    }
    resolve(pos, side = 0) {
      return resolveNode(this, pos, side, false);
    }
    resolveInner(pos, side = 0) {
      return resolveNode(this, pos, side, true);
    }
    enterUnfinishedNodesBefore(pos) {
      return enterUnfinishedNodesBefore(this, pos);
    }
    /**
    @internal
    */
    toString() {
      return this.context.buffer.childString(this.index);
    }
    getChild(type, before = null, after = null) {
      let r = getChildren(this, type, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
      return getChildren(this, type, before, after);
    }
    get node() {
      return this;
    }
    matchContext(context) {
      return matchNodeContext(this, context);
    }
  };
  var TreeCursor = class {
    /**
    Shorthand for `.type.name`.
    */
    get name() {
      return this.type.name;
    }
    /**
    @internal
    */
    constructor(node, mode = 0) {
      this.mode = mode;
      this.buffer = null;
      this.stack = [];
      this.index = 0;
      this.bufferNode = null;
      if (node instanceof TreeNode) {
        this.yieldNode(node);
      } else {
        this._tree = node.context.parent;
        this.buffer = node.context;
        for (let n = node._parent; n; n = n._parent)
          this.stack.unshift(n.index);
        this.bufferNode = node;
        this.yieldBuf(node.index);
      }
    }
    yieldNode(node) {
      if (!node)
        return false;
      this._tree = node;
      this.type = node.type;
      this.from = node.from;
      this.to = node.to;
      return true;
    }
    yieldBuf(index, type) {
      this.index = index;
      let { start, buffer } = this.buffer;
      this.type = type || buffer.set.types[buffer.buffer[index]];
      this.from = start + buffer.buffer[index + 1];
      this.to = start + buffer.buffer[index + 2];
      return true;
    }
    yield(node) {
      if (!node)
        return false;
      if (node instanceof TreeNode) {
        this.buffer = null;
        return this.yieldNode(node);
      }
      this.buffer = node.context;
      return this.yieldBuf(node.index, node.type);
    }
    /**
    @internal
    */
    toString() {
      return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
    }
    /**
    @internal
    */
    enterChild(dir, pos, side) {
      if (!this.buffer)
        return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
      let { buffer } = this.buffer;
      let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
      if (index < 0)
        return false;
      this.stack.push(this.index);
      return this.yieldBuf(index);
    }
    /**
    Move the cursor to this node's first child. When this returns
    false, the node has no child, and the cursor has not been moved.
    */
    firstChild() {
      return this.enterChild(
        1,
        0,
        4
        /* Side.DontCare */
      );
    }
    /**
    Move the cursor to this node's last child.
    */
    lastChild() {
      return this.enterChild(
        -1,
        0,
        4
        /* Side.DontCare */
      );
    }
    /**
    Move the cursor to the first child that ends after `pos`.
    */
    childAfter(pos) {
      return this.enterChild(
        1,
        pos,
        2
        /* Side.After */
      );
    }
    /**
    Move to the last child that starts before `pos`.
    */
    childBefore(pos) {
      return this.enterChild(
        -1,
        pos,
        -2
        /* Side.Before */
      );
    }
    /**
    Move the cursor to the child around `pos`. If side is -1 the
    child may end at that position, when 1 it may start there. This
    will also enter [overlaid](#common.MountedTree.overlay)
    [mounted](#common.NodeProp^mounted) trees unless `overlays` is
    set to false.
    */
    enter(pos, side, mode = this.mode) {
      if (!this.buffer)
        return this.yield(this._tree.enter(pos, side, mode));
      return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
    }
    /**
    Move to the node's parent node, if this isn't the top node.
    */
    parent() {
      if (!this.buffer)
        return this.yieldNode(this.mode & IterMode.IncludeAnonymous ? this._tree._parent : this._tree.parent);
      if (this.stack.length)
        return this.yieldBuf(this.stack.pop());
      let parent = this.mode & IterMode.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
      this.buffer = null;
      return this.yieldNode(parent);
    }
    /**
    @internal
    */
    sibling(dir) {
      if (!this.buffer)
        return !this._tree._parent ? false : this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4, this.mode));
      let { buffer } = this.buffer, d = this.stack.length - 1;
      if (dir < 0) {
        let parentStart = d < 0 ? 0 : this.stack[d] + 4;
        if (this.index != parentStart)
          return this.yieldBuf(buffer.findChild(
            parentStart,
            this.index,
            -1,
            0,
            4
            /* Side.DontCare */
          ));
      } else {
        let after = buffer.buffer[this.index + 3];
        if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
          return this.yieldBuf(after);
      }
      return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4, this.mode)) : false;
    }
    /**
    Move to this node's next sibling, if any.
    */
    nextSibling() {
      return this.sibling(1);
    }
    /**
    Move to this node's previous sibling, if any.
    */
    prevSibling() {
      return this.sibling(-1);
    }
    atLastNode(dir) {
      let index, parent, { buffer } = this;
      if (buffer) {
        if (dir > 0) {
          if (this.index < buffer.buffer.buffer.length)
            return false;
        } else {
          for (let i = 0; i < this.index; i++)
            if (buffer.buffer.buffer[i + 3] < this.index)
              return false;
        }
        ({ index, parent } = buffer);
      } else {
        ({ index, _parent: parent } = this._tree);
      }
      for (; parent; { index, _parent: parent } = parent) {
        if (index > -1)
          for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
            let child = parent._tree.children[i];
            if (this.mode & IterMode.IncludeAnonymous || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
              return false;
          }
      }
      return true;
    }
    move(dir, enter) {
      if (enter && this.enterChild(
        dir,
        0,
        4
        /* Side.DontCare */
      ))
        return true;
      for (; ; ) {
        if (this.sibling(dir))
          return true;
        if (this.atLastNode(dir) || !this.parent())
          return false;
      }
    }
    /**
    Move to the next node in a
    [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
    traversal, going from a node to its first child or, if the
    current node is empty or `enter` is false, its next sibling or
    the next sibling of the first parent node that has one.
    */
    next(enter = true) {
      return this.move(1, enter);
    }
    /**
    Move to the next node in a last-to-first pre-order traveral. A
    node is followed by its last child or, if it has none, its
    previous sibling or the previous sibling of the first parent
    node that has one.
    */
    prev(enter = true) {
      return this.move(-1, enter);
    }
    /**
    Move the cursor to the innermost node that covers `pos`. If
    `side` is -1, it will enter nodes that end at `pos`. If it is 1,
    it will enter nodes that start at `pos`.
    */
    moveTo(pos, side = 0) {
      while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
        if (!this.parent())
          break;
      while (this.enterChild(1, pos, side)) {
      }
      return this;
    }
    /**
    Get a [syntax node](#common.SyntaxNode) at the cursor's current
    position.
    */
    get node() {
      if (!this.buffer)
        return this._tree;
      let cache = this.bufferNode, result = null, depth = 0;
      if (cache && cache.context == this.buffer) {
        scan:
          for (let index = this.index, d = this.stack.length; d >= 0; ) {
            for (let c = cache; c; c = c._parent)
              if (c.index == index) {
                if (index == this.index)
                  return c;
                result = c;
                depth = d + 1;
                break scan;
              }
            index = this.stack[--d];
          }
      }
      for (let i = depth; i < this.stack.length; i++)
        result = new BufferNode(this.buffer, result, this.stack[i]);
      return this.bufferNode = new BufferNode(this.buffer, result, this.index);
    }
    /**
    Get the [tree](#common.Tree) that represents the current node, if
    any. Will return null when the node is in a [tree
    buffer](#common.TreeBuffer).
    */
    get tree() {
      return this.buffer ? null : this._tree._tree;
    }
    /**
    Iterate over the current node and all its descendants, calling
    `enter` when entering a node and `leave`, if given, when leaving
    one. When `enter` returns `false`, any children of that node are
    skipped, and `leave` isn't called for it.
    */
    iterate(enter, leave) {
      for (let depth = 0; ; ) {
        let mustLeave = false;
        if (this.type.isAnonymous || enter(this) !== false) {
          if (this.firstChild()) {
            depth++;
            continue;
          }
          if (!this.type.isAnonymous)
            mustLeave = true;
        }
        for (; ; ) {
          if (mustLeave && leave)
            leave(this);
          mustLeave = this.type.isAnonymous;
          if (this.nextSibling())
            break;
          if (!depth)
            return;
          this.parent();
          depth--;
          mustLeave = true;
        }
      }
    }
    /**
    Test whether the current node matches a given context—a sequence
    of direct parent node names. Empty strings in the context array
    are treated as wildcards.
    */
    matchContext(context) {
      if (!this.buffer)
        return matchNodeContext(this.node, context);
      let { buffer } = this.buffer, { types: types2 } = buffer.set;
      for (let i = context.length - 1, d = this.stack.length - 1; i >= 0; d--) {
        if (d < 0)
          return matchNodeContext(this.node, context, i);
        let type = types2[buffer.buffer[this.stack[d]]];
        if (!type.isAnonymous) {
          if (context[i] && context[i] != type.name)
            return false;
          i--;
        }
      }
      return true;
    }
  };
  function hasChild(tree) {
    return tree.children.some((ch) => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
  }
  function buildTree(data) {
    var _a2;
    let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data;
    let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
    let types2 = nodeSet.types;
    let contextHash = 0, lookAhead = 0;
    function takeNode(parentStart, minPos, children3, positions2, inRepeat) {
      let { id, start, end, size } = cursor;
      let lookAheadAtStart = lookAhead;
      while (size < 0) {
        cursor.next();
        if (size == -1) {
          let node2 = reused[id];
          children3.push(node2);
          positions2.push(start - parentStart);
          return;
        } else if (size == -3) {
          contextHash = id;
          return;
        } else if (size == -4) {
          lookAhead = id;
          return;
        } else {
          throw new RangeError(`Unrecognized record size: ${size}`);
        }
      }
      let type = types2[id], node, buffer2;
      let startPos = start - parentStart;
      if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
        let data2 = new Uint16Array(buffer2.size - buffer2.skip);
        let endPos = cursor.pos - buffer2.size, index = data2.length;
        while (cursor.pos > endPos)
          index = copyToBuffer(buffer2.start, data2, index);
        node = new TreeBuffer(data2, end - buffer2.start, nodeSet);
        startPos = buffer2.start - parentStart;
      } else {
        let endPos = cursor.pos - size;
        cursor.next();
        let localChildren = [], localPositions = [];
        let localInRepeat = id >= minRepeatType ? id : -1;
        let lastGroup = 0, lastEnd = end;
        while (cursor.pos > endPos) {
          if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
            if (cursor.end <= lastEnd - maxBufferLength) {
              makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart);
              lastGroup = localChildren.length;
              lastEnd = cursor.end;
            }
            cursor.next();
          } else {
            takeNode(start, endPos, localChildren, localPositions, localInRepeat);
          }
        }
        if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
          makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart);
        localChildren.reverse();
        localPositions.reverse();
        if (localInRepeat > -1 && lastGroup > 0) {
          let make = makeBalanced(type);
          node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
        } else {
          node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end);
        }
      }
      children3.push(node);
      positions2.push(startPos);
    }
    function makeBalanced(type) {
      return (children3, positions2, length2) => {
        let lookAhead2 = 0, lastI = children3.length - 1, last, lookAheadProp;
        if (lastI >= 0 && (last = children3[lastI]) instanceof Tree) {
          if (!lastI && last.type == type && last.length == length2)
            return last;
          if (lookAheadProp = last.prop(NodeProp.lookAhead))
            lookAhead2 = positions2[lastI] + last.length + lookAheadProp;
        }
        return makeTree(type, children3, positions2, length2, lookAhead2);
      };
    }
    function makeRepeatLeaf(children3, positions2, base2, i, from, to, type, lookAhead2) {
      let localChildren = [], localPositions = [];
      while (children3.length > i) {
        localChildren.push(children3.pop());
        localPositions.push(positions2.pop() + base2 - from);
      }
      children3.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead2 - to));
      positions2.push(from - base2);
    }
    function makeTree(type, children3, positions2, length2, lookAhead2 = 0, props) {
      if (contextHash) {
        let pair = [NodeProp.contextHash, contextHash];
        props = props ? [pair].concat(props) : [pair];
      }
      if (lookAhead2 > 25) {
        let pair = [NodeProp.lookAhead, lookAhead2];
        props = props ? [pair].concat(props) : [pair];
      }
      return new Tree(type, children3, positions2, length2, props);
    }
    function findBufferSize(maxSize, inRepeat) {
      let fork = cursor.fork();
      let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
      let result = { size: 0, start: 0, skip: 0 };
      scan:
        for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
          let nodeSize2 = fork.size;
          if (fork.id == inRepeat && nodeSize2 >= 0) {
            result.size = size;
            result.start = start;
            result.skip = skip;
            skip += 4;
            size += 4;
            fork.next();
            continue;
          }
          let startPos = fork.pos - nodeSize2;
          if (nodeSize2 < 0 || startPos < minPos || fork.start < minStart)
            break;
          let localSkipped = fork.id >= minRepeatType ? 4 : 0;
          let nodeStart = fork.start;
          fork.next();
          while (fork.pos > startPos) {
            if (fork.size < 0) {
              if (fork.size == -3)
                localSkipped += 4;
              else
                break scan;
            } else if (fork.id >= minRepeatType) {
              localSkipped += 4;
            }
            fork.next();
          }
          start = nodeStart;
          size += nodeSize2;
          skip += localSkipped;
        }
      if (inRepeat < 0 || size == maxSize) {
        result.size = size;
        result.start = start;
        result.skip = skip;
      }
      return result.size > 4 ? result : void 0;
    }
    function copyToBuffer(bufferStart, buffer2, index) {
      let { id, start, end, size } = cursor;
      cursor.next();
      if (size >= 0 && id < minRepeatType) {
        let startIndex = index;
        if (size > 4) {
          let endPos = cursor.pos - (size - 4);
          while (cursor.pos > endPos)
            index = copyToBuffer(bufferStart, buffer2, index);
        }
        buffer2[--index] = startIndex;
        buffer2[--index] = end - bufferStart;
        buffer2[--index] = start - bufferStart;
        buffer2[--index] = id;
      } else if (size == -3) {
        contextHash = id;
      } else if (size == -4) {
        lookAhead = id;
      }
      return index;
    }
    let children2 = [], positions = [];
    while (cursor.pos > 0)
      takeNode(data.start || 0, data.bufferStart || 0, children2, positions, -1);
    let length = (_a2 = data.length) !== null && _a2 !== void 0 ? _a2 : children2.length ? positions[0] + children2[0].length : 0;
    return new Tree(types2[data.topID], children2.reverse(), positions.reverse(), length);
  }
  var nodeSizeCache = /* @__PURE__ */ new WeakMap();
  function nodeSize(balanceType, node) {
    if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
      return 1;
    let size = nodeSizeCache.get(node);
    if (size == null) {
      size = 1;
      for (let child of node.children) {
        if (child.type != balanceType || !(child instanceof Tree)) {
          size = 1;
          break;
        }
        size += nodeSize(balanceType, child);
      }
      nodeSizeCache.set(node, size);
    }
    return size;
  }
  function balanceRange(balanceType, children2, positions, from, to, start, length, mkTop, mkTree) {
    let total2 = 0;
    for (let i = from; i < to; i++)
      total2 += nodeSize(balanceType, children2[i]);
    let maxChild = Math.ceil(
      total2 * 1.5 / 8
      /* Balance.BranchFactor */
    );
    let localChildren = [], localPositions = [];
    function divide(children3, positions2, from2, to2, offset) {
      for (let i = from2; i < to2; ) {
        let groupFrom = i, groupStart = positions2[i], groupSize = nodeSize(balanceType, children3[i]);
        i++;
        for (; i < to2; i++) {
          let nextSize = nodeSize(balanceType, children3[i]);
          if (groupSize + nextSize >= maxChild)
            break;
          groupSize += nextSize;
        }
        if (i == groupFrom + 1) {
          if (groupSize > maxChild) {
            let only = children3[groupFrom];
            divide(only.children, only.positions, 0, only.children.length, positions2[groupFrom] + offset);
            continue;
          }
          localChildren.push(children3[groupFrom]);
        } else {
          let length2 = positions2[i - 1] + children3[i - 1].length - groupStart;
          localChildren.push(balanceRange(balanceType, children3, positions2, groupFrom, i, groupStart, length2, null, mkTree));
        }
        localPositions.push(groupStart + offset - start);
      }
    }
    divide(children2, positions, from, to, 0);
    return (mkTop || mkTree)(localChildren, localPositions, length);
  }
  var TreeFragment = class _TreeFragment {
    /**
    Construct a tree fragment. You'll usually want to use
    [`addTree`](#common.TreeFragment^addTree) and
    [`applyChanges`](#common.TreeFragment^applyChanges) instead of
    calling this directly.
    */
    constructor(from, to, tree, offset, openStart = false, openEnd = false) {
      this.from = from;
      this.to = to;
      this.tree = tree;
      this.offset = offset;
      this.open = (openStart ? 1 : 0) | (openEnd ? 2 : 0);
    }
    /**
    Whether the start of the fragment represents the start of a
    parse, or the end of a change. (In the second case, it may not
    be safe to reuse some nodes at the start, depending on the
    parsing algorithm.)
    */
    get openStart() {
      return (this.open & 1) > 0;
    }
    /**
    Whether the end of the fragment represents the end of a
    full-document parse, or the start of a change.
    */
    get openEnd() {
      return (this.open & 2) > 0;
    }
    /**
    Create a set of fragments from a freshly parsed tree, or update
    an existing set of fragments by replacing the ones that overlap
    with a tree with content from the new tree. When `partial` is
    true, the parse is treated as incomplete, and the resulting
    fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
    true.
    */
    static addTree(tree, fragments = [], partial = false) {
      let result = [new _TreeFragment(0, tree.length, tree, 0, false, partial)];
      for (let f of fragments)
        if (f.to > tree.length)
          result.push(f);
      return result;
    }
    /**
    Apply a set of edits to an array of fragments, removing or
    splitting fragments as necessary to remove edited ranges, and
    adjusting offsets for fragments that moved.
    */
    static applyChanges(fragments, changes, minGap = 128) {
      if (!changes.length)
        return fragments;
      let result = [];
      let fI = 1, nextF = fragments.length ? fragments[0] : null;
      for (let cI = 0, pos = 0, off = 0; ; cI++) {
        let nextC = cI < changes.length ? changes[cI] : null;
        let nextPos = nextC ? nextC.fromA : 1e9;
        if (nextPos - pos >= minGap)
          while (nextF && nextF.from < nextPos) {
            let cut = nextF;
            if (pos >= cut.from || nextPos <= cut.to || off) {
              let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
              cut = fFrom >= fTo ? null : new _TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
            }
            if (cut)
              result.push(cut);
            if (nextF.to > nextPos)
              break;
            nextF = fI < fragments.length ? fragments[fI++] : null;
          }
        if (!nextC)
          break;
        pos = nextC.toA;
        off = nextC.toA - nextC.toB;
      }
      return result;
    }
  };
  var Parser = class {
    /**
    Start a parse, returning a [partial parse](#common.PartialParse)
    object. [`fragments`](#common.TreeFragment) can be passed in to
    make the parse incremental.
    
    By default, the entire input is parsed. You can pass `ranges`,
    which should be a sorted array of non-empty, non-overlapping
    ranges, to parse only those ranges. The tree returned in that
    case will start at `ranges[0].from`.
    */
    startParse(input, fragments, ranges) {
      if (typeof input == "string")
        input = new StringInput(input);
      ranges = !ranges ? [new Range2(0, input.length)] : ranges.length ? ranges.map((r) => new Range2(r.from, r.to)) : [new Range2(0, 0)];
      return this.createParse(input, fragments || [], ranges);
    }
    /**
    Run a full parse, returning the resulting tree.
    */
    parse(input, fragments, ranges) {
      let parse = this.startParse(input, fragments, ranges);
      for (; ; ) {
        let done = parse.advance();
        if (done)
          return done;
      }
    }
  };
  var StringInput = class {
    constructor(string2) {
      this.string = string2;
    }
    get length() {
      return this.string.length;
    }
    chunk(from) {
      return this.string.slice(from);
    }
    get lineChunks() {
      return false;
    }
    read(from, to) {
      return this.string.slice(from, to);
    }
  };
  var stoppedInner = new NodeProp({ perNode: true });

  // node_modules/@lezer/highlight/dist/index.js
  var nextTagID = 0;
  var Tag = class _Tag {
    /**
    @internal
    */
    constructor(set, base2, modified) {
      this.set = set;
      this.base = base2;
      this.modified = modified;
      this.id = nextTagID++;
    }
    /**
    Define a new tag. If `parent` is given, the tag is treated as a
    sub-tag of that parent, and
    [highlighters](#highlight.tagHighlighter) that don't mention
    this tag will try to fall back to the parent tag (or grandparent
    tag, etc).
    */
    static define(parent) {
      if (parent === null || parent === void 0 ? void 0 : parent.base)
        throw new Error("Can not derive from a modified tag");
      let tag = new _Tag([], null, []);
      tag.set.push(tag);
      if (parent)
        for (let t2 of parent.set)
          tag.set.push(t2);
      return tag;
    }
    /**
    Define a tag _modifier_, which is a function that, given a tag,
    will return a tag that is a subtag of the original. Applying the
    same modifier to a twice tag will return the same value (`m1(t1)
    == m1(t1)`) and applying multiple modifiers will, regardless or
    order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
    
    When multiple modifiers are applied to a given base tag, each
    smaller set of modifiers is registered as a parent, so that for
    example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
    `m1(m3(t1)`, and so on.
    */
    static defineModifier() {
      let mod = new Modifier();
      return (tag) => {
        if (tag.modified.indexOf(mod) > -1)
          return tag;
        return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
      };
    }
  };
  var nextModifierID = 0;
  var Modifier = class _Modifier {
    constructor() {
      this.instances = [];
      this.id = nextModifierID++;
    }
    static get(base2, mods) {
      if (!mods.length)
        return base2;
      let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
      if (exists)
        return exists;
      let set = [], tag = new Tag(set, base2, mods);
      for (let m of mods)
        m.instances.push(tag);
      let configs = powerSet(mods);
      for (let parent of base2.set)
        if (!parent.modified.length)
          for (let config of configs)
            set.push(_Modifier.get(parent, config));
      return tag;
    }
  };
  function sameArray2(a, b) {
    return a.length == b.length && a.every((x, i) => x == b[i]);
  }
  function powerSet(array) {
    let sets = [[]];
    for (let i = 0; i < array.length; i++) {
      for (let j = 0, e = sets.length; j < e; j++) {
        sets.push(sets[j].concat(array[i]));
      }
    }
    return sets.sort((a, b) => b.length - a.length);
  }
  function styleTags(spec) {
    let byName = /* @__PURE__ */ Object.create(null);
    for (let prop in spec) {
      let tags2 = spec[prop];
      if (!Array.isArray(tags2))
        tags2 = [tags2];
      for (let part of prop.split(" "))
        if (part) {
          let pieces = [], mode = 2, rest = part;
          for (let pos = 0; ; ) {
            if (rest == "..." && pos > 0 && pos + 3 == part.length) {
              mode = 1;
              break;
            }
            let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
            if (!m)
              throw new RangeError("Invalid path: " + part);
            pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
            pos += m[0].length;
            if (pos == part.length)
              break;
            let next = part[pos++];
            if (pos == part.length && next == "!") {
              mode = 0;
              break;
            }
            if (next != "/")
              throw new RangeError("Invalid path: " + part);
            rest = part.slice(pos);
          }
          let last = pieces.length - 1, inner = pieces[last];
          if (!inner)
            throw new RangeError("Invalid path: " + part);
          let rule = new Rule(tags2, mode, last > 0 ? pieces.slice(0, last) : null);
          byName[inner] = rule.sort(byName[inner]);
        }
    }
    return ruleNodeProp.add(byName);
  }
  var ruleNodeProp = new NodeProp();
  var Rule = class {
    constructor(tags2, mode, context, next) {
      this.tags = tags2;
      this.mode = mode;
      this.context = context;
      this.next = next;
    }
    get opaque() {
      return this.mode == 0;
    }
    get inherit() {
      return this.mode == 1;
    }
    sort(other) {
      if (!other || other.depth < this.depth) {
        this.next = other;
        return this;
      }
      other.next = this.sort(other.next);
      return other;
    }
    get depth() {
      return this.context ? this.context.length : 0;
    }
  };
  Rule.empty = new Rule([], 2, null);
  function tagHighlighter(tags2, options) {
    let map = /* @__PURE__ */ Object.create(null);
    for (let style of tags2) {
      if (!Array.isArray(style.tag))
        map[style.tag.id] = style.class;
      else
        for (let tag of style.tag)
          map[tag.id] = style.class;
    }
    let { scope, all = null } = options || {};
    return {
      style: (tags3) => {
        let cls = all;
        for (let tag of tags3) {
          for (let sub of tag.set) {
            let tagClass = map[sub.id];
            if (tagClass) {
              cls = cls ? cls + " " + tagClass : tagClass;
              break;
            }
          }
        }
        return cls;
      },
      scope
    };
  }
  function highlightTags(highlighters, tags2) {
    let result = null;
    for (let highlighter of highlighters) {
      let value = highlighter.style(tags2);
      if (value)
        result = result ? result + " " + value : value;
    }
    return result;
  }
  function highlightTree(tree, highlighter, putStyle, from = 0, to = tree.length) {
    let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
    builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters);
    builder.flush(to);
  }
  var HighlightBuilder = class {
    constructor(at, highlighters, span) {
      this.at = at;
      this.highlighters = highlighters;
      this.span = span;
      this.class = "";
    }
    startSpan(at, cls) {
      if (cls != this.class) {
        this.flush(at);
        if (at > this.at)
          this.at = at;
        this.class = cls;
      }
    }
    flush(to) {
      if (to > this.at && this.class)
        this.span(this.at, to, this.class);
    }
    highlightRange(cursor, from, to, inheritedClass, highlighters) {
      let { type, from: start, to: end } = cursor;
      if (start >= to || end <= from)
        return;
      if (type.isTop)
        highlighters = this.highlighters.filter((h) => !h.scope || h.scope(type));
      let cls = inheritedClass;
      let rule = getStyleTags(cursor) || Rule.empty;
      let tagCls = highlightTags(highlighters, rule.tags);
      if (tagCls) {
        if (cls)
          cls += " ";
        cls += tagCls;
        if (rule.mode == 1)
          inheritedClass += (inheritedClass ? " " : "") + tagCls;
      }
      this.startSpan(Math.max(from, start), cls);
      if (rule.opaque)
        return;
      let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
      if (mounted && mounted.overlay) {
        let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
        let innerHighlighters = this.highlighters.filter((h) => !h.scope || h.scope(mounted.tree.type));
        let hasChild2 = cursor.firstChild();
        for (let i = 0, pos = start; ; i++) {
          let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
          let nextPos = next ? next.from + start : end;
          let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to, nextPos);
          if (rangeFrom < rangeTo && hasChild2) {
            while (cursor.from < rangeTo) {
              this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, highlighters);
              this.startSpan(Math.min(rangeTo, cursor.to), cls);
              if (cursor.to >= nextPos || !cursor.nextSibling())
                break;
            }
          }
          if (!next || nextPos > to)
            break;
          pos = next.to + start;
          if (pos > from) {
            this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos), "", innerHighlighters);
            this.startSpan(Math.min(to, pos), cls);
          }
        }
        if (hasChild2)
          cursor.parent();
      } else if (cursor.firstChild()) {
        if (mounted)
          inheritedClass = "";
        do {
          if (cursor.to <= from)
            continue;
          if (cursor.from >= to)
            break;
          this.highlightRange(cursor, from, to, inheritedClass, highlighters);
          this.startSpan(Math.min(to, cursor.to), cls);
        } while (cursor.nextSibling());
        cursor.parent();
      }
    }
  };
  function getStyleTags(node) {
    let rule = node.type.prop(ruleNodeProp);
    while (rule && rule.context && !node.matchContext(rule.context))
      rule = rule.next;
    return rule || null;
  }
  var t = Tag.define;
  var comment = t();
  var name = t();
  var typeName = t(name);
  var propertyName = t(name);
  var literal = t();
  var string = t(literal);
  var number = t(literal);
  var content = t();
  var heading = t(content);
  var keyword = t();
  var operator = t();
  var punctuation = t();
  var bracket = t(punctuation);
  var meta = t();
  var tags = {
    /**
    A comment.
    */
    comment,
    /**
    A line [comment](#highlight.tags.comment).
    */
    lineComment: t(comment),
    /**
    A block [comment](#highlight.tags.comment).
    */
    blockComment: t(comment),
    /**
    A documentation [comment](#highlight.tags.comment).
    */
    docComment: t(comment),
    /**
    Any kind of identifier.
    */
    name,
    /**
    The [name](#highlight.tags.name) of a variable.
    */
    variableName: t(name),
    /**
    A type [name](#highlight.tags.name).
    */
    typeName,
    /**
    A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
    */
    tagName: t(typeName),
    /**
    A property or field [name](#highlight.tags.name).
    */
    propertyName,
    /**
    An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
    */
    attributeName: t(propertyName),
    /**
    The [name](#highlight.tags.name) of a class.
    */
    className: t(name),
    /**
    A label [name](#highlight.tags.name).
    */
    labelName: t(name),
    /**
    A namespace [name](#highlight.tags.name).
    */
    namespace: t(name),
    /**
    The [name](#highlight.tags.name) of a macro.
    */
    macroName: t(name),
    /**
    A literal value.
    */
    literal,
    /**
    A string [literal](#highlight.tags.literal).
    */
    string,
    /**
    A documentation [string](#highlight.tags.string).
    */
    docString: t(string),
    /**
    A character literal (subtag of [string](#highlight.tags.string)).
    */
    character: t(string),
    /**
    An attribute value (subtag of [string](#highlight.tags.string)).
    */
    attributeValue: t(string),
    /**
    A number [literal](#highlight.tags.literal).
    */
    number,
    /**
    An integer [number](#highlight.tags.number) literal.
    */
    integer: t(number),
    /**
    A floating-point [number](#highlight.tags.number) literal.
    */
    float: t(number),
    /**
    A boolean [literal](#highlight.tags.literal).
    */
    bool: t(literal),
    /**
    Regular expression [literal](#highlight.tags.literal).
    */
    regexp: t(literal),
    /**
    An escape [literal](#highlight.tags.literal), for example a
    backslash escape in a string.
    */
    escape: t(literal),
    /**
    A color [literal](#highlight.tags.literal).
    */
    color: t(literal),
    /**
    A URL [literal](#highlight.tags.literal).
    */
    url: t(literal),
    /**
    A language keyword.
    */
    keyword,
    /**
    The [keyword](#highlight.tags.keyword) for the self or this
    object.
    */
    self: t(keyword),
    /**
    The [keyword](#highlight.tags.keyword) for null.
    */
    null: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) denoting some atomic value.
    */
    atom: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) that represents a unit.
    */
    unit: t(keyword),
    /**
    A modifier [keyword](#highlight.tags.keyword).
    */
    modifier: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) that acts as an operator.
    */
    operatorKeyword: t(keyword),
    /**
    A control-flow related [keyword](#highlight.tags.keyword).
    */
    controlKeyword: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) that defines something.
    */
    definitionKeyword: t(keyword),
    /**
    A [keyword](#highlight.tags.keyword) related to defining or
    interfacing with modules.
    */
    moduleKeyword: t(keyword),
    /**
    An operator.
    */
    operator,
    /**
    An [operator](#highlight.tags.operator) that dereferences something.
    */
    derefOperator: t(operator),
    /**
    Arithmetic-related [operator](#highlight.tags.operator).
    */
    arithmeticOperator: t(operator),
    /**
    Logical [operator](#highlight.tags.operator).
    */
    logicOperator: t(operator),
    /**
    Bit [operator](#highlight.tags.operator).
    */
    bitwiseOperator: t(operator),
    /**
    Comparison [operator](#highlight.tags.operator).
    */
    compareOperator: t(operator),
    /**
    [Operator](#highlight.tags.operator) that updates its operand.
    */
    updateOperator: t(operator),
    /**
    [Operator](#highlight.tags.operator) that defines something.
    */
    definitionOperator: t(operator),
    /**
    Type-related [operator](#highlight.tags.operator).
    */
    typeOperator: t(operator),
    /**
    Control-flow [operator](#highlight.tags.operator).
    */
    controlOperator: t(operator),
    /**
    Program or markup punctuation.
    */
    punctuation,
    /**
    [Punctuation](#highlight.tags.punctuation) that separates
    things.
    */
    separator: t(punctuation),
    /**
    Bracket-style [punctuation](#highlight.tags.punctuation).
    */
    bracket,
    /**
    Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
    tokens).
    */
    angleBracket: t(bracket),
    /**
    Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
    tokens).
    */
    squareBracket: t(bracket),
    /**
    Parentheses (usually `(` and `)` tokens). Subtag of
    [bracket](#highlight.tags.bracket).
    */
    paren: t(bracket),
    /**
    Braces (usually `{` and `}` tokens). Subtag of
    [bracket](#highlight.tags.bracket).
    */
    brace: t(bracket),
    /**
    Content, for example plain text in XML or markup documents.
    */
    content,
    /**
    [Content](#highlight.tags.content) that represents a heading.
    */
    heading,
    /**
    A level 1 [heading](#highlight.tags.heading).
    */
    heading1: t(heading),
    /**
    A level 2 [heading](#highlight.tags.heading).
    */
    heading2: t(heading),
    /**
    A level 3 [heading](#highlight.tags.heading).
    */
    heading3: t(heading),
    /**
    A level 4 [heading](#highlight.tags.heading).
    */
    heading4: t(heading),
    /**
    A level 5 [heading](#highlight.tags.heading).
    */
    heading5: t(heading),
    /**
    A level 6 [heading](#highlight.tags.heading).
    */
    heading6: t(heading),
    /**
    A prose separator (such as a horizontal rule).
    */
    contentSeparator: t(content),
    /**
    [Content](#highlight.tags.content) that represents a list.
    */
    list: t(content),
    /**
    [Content](#highlight.tags.content) that represents a quote.
    */
    quote: t(content),
    /**
    [Content](#highlight.tags.content) that is emphasized.
    */
    emphasis: t(content),
    /**
    [Content](#highlight.tags.content) that is styled strong.
    */
    strong: t(content),
    /**
    [Content](#highlight.tags.content) that is part of a link.
    */
    link: t(content),
    /**
    [Content](#highlight.tags.content) that is styled as code or
    monospace.
    */
    monospace: t(content),
    /**
    [Content](#highlight.tags.content) that has a strike-through
    style.
    */
    strikethrough: t(content),
    /**
    Inserted text in a change-tracking format.
    */
    inserted: t(),
    /**
    Deleted text.
    */
    deleted: t(),
    /**
    Changed text.
    */
    changed: t(),
    /**
    An invalid or unsyntactic element.
    */
    invalid: t(),
    /**
    Metadata or meta-instruction.
    */
    meta,
    /**
    [Metadata](#highlight.tags.meta) that applies to the entire
    document.
    */
    documentMeta: t(meta),
    /**
    [Metadata](#highlight.tags.meta) that annotates or adds
    attributes to a given syntactic element.
    */
    annotation: t(meta),
    /**
    Processing instruction or preprocessor directive. Subtag of
    [meta](#highlight.tags.meta).
    */
    processingInstruction: t(meta),
    /**
    [Modifier](#highlight.Tag^defineModifier) that indicates that a
    given element is being defined. Expected to be used with the
    various [name](#highlight.tags.name) tags.
    */
    definition: Tag.defineModifier(),
    /**
    [Modifier](#highlight.Tag^defineModifier) that indicates that
    something is constant. Mostly expected to be used with
    [variable names](#highlight.tags.variableName).
    */
    constant: Tag.defineModifier(),
    /**
    [Modifier](#highlight.Tag^defineModifier) used to indicate that
    a [variable](#highlight.tags.variableName) or [property
    name](#highlight.tags.propertyName) is being called or defined
    as a function.
    */
    function: Tag.defineModifier(),
    /**
    [Modifier](#highlight.Tag^defineModifier) that can be applied to
    [names](#highlight.tags.name) to indicate that they belong to
    the language's standard environment.
    */
    standard: Tag.defineModifier(),
    /**
    [Modifier](#highlight.Tag^defineModifier) that indicates a given
    [names](#highlight.tags.name) is local to some scope.
    */
    local: Tag.defineModifier(),
    /**
    A generic variant [modifier](#highlight.Tag^defineModifier) that
    can be used to tag language-specific alternative variants of
    some common tag. It is recommended for themes to define special
    forms of at least the [string](#highlight.tags.string) and
    [variable name](#highlight.tags.variableName) tags, since those
    come up a lot.
    */
    special: Tag.defineModifier()
  };
  var classHighlighter = tagHighlighter([
    { tag: tags.link, class: "tok-link" },
    { tag: tags.heading, class: "tok-heading" },
    { tag: tags.emphasis, class: "tok-emphasis" },
    { tag: tags.strong, class: "tok-strong" },
    { tag: tags.keyword, class: "tok-keyword" },
    { tag: tags.atom, class: "tok-atom" },
    { tag: tags.bool, class: "tok-bool" },
    { tag: tags.url, class: "tok-url" },
    { tag: tags.labelName, class: "tok-labelName" },
    { tag: tags.inserted, class: "tok-inserted" },
    { tag: tags.deleted, class: "tok-deleted" },
    { tag: tags.literal, class: "tok-literal" },
    { tag: tags.string, class: "tok-string" },
    { tag: tags.number, class: "tok-number" },
    { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
    { tag: tags.variableName, class: "tok-variableName" },
    { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
    { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
    { tag: tags.special(tags.variableName), class: "tok-variableName2" },
    { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
    { tag: tags.typeName, class: "tok-typeName" },
    { tag: tags.namespace, class: "tok-namespace" },
    { tag: tags.className, class: "tok-className" },
    { tag: tags.macroName, class: "tok-macroName" },
    { tag: tags.propertyName, class: "tok-propertyName" },
    { tag: tags.operator, class: "tok-operator" },
    { tag: tags.comment, class: "tok-comment" },
    { tag: tags.meta, class: "tok-meta" },
    { tag: tags.invalid, class: "tok-invalid" },
    { tag: tags.punctuation, class: "tok-punctuation" }
  ]);

  // node_modules/@codemirror/language/dist/index.js
  var _a;
  var languageDataProp = /* @__PURE__ */ new NodeProp();
  var sublanguageProp = /* @__PURE__ */ new NodeProp();
  var Language = class {
    /**
    Construct a language object. If you need to invoke this
    directly, first define a data facet with
    [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
    configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
    to the language's outer syntax node.
    */
    constructor(data, parser, extraExtensions = [], name2 = "") {
      this.data = data;
      this.name = name2;
      if (!EditorState.prototype.hasOwnProperty("tree"))
        Object.defineProperty(EditorState.prototype, "tree", { get() {
          return syntaxTree(this);
        } });
      this.parser = parser;
      this.extension = [
        language.of(this),
        EditorState.languageData.of((state, pos, side) => {
          let top2 = topNodeAt(state, pos, side), data2 = top2.type.prop(languageDataProp);
          if (!data2)
            return [];
          let base2 = state.facet(data2), sub = top2.type.prop(sublanguageProp);
          if (sub) {
            let innerNode = top2.resolve(pos - top2.from, side);
            for (let sublang of sub)
              if (sublang.test(innerNode, state)) {
                let data3 = state.facet(sublang.facet);
                return sublang.type == "replace" ? data3 : data3.concat(base2);
              }
          }
          return base2;
        })
      ].concat(extraExtensions);
    }
    /**
    Query whether this language is active at the given position.
    */
    isActiveAt(state, pos, side = -1) {
      return topNodeAt(state, pos, side).type.prop(languageDataProp) == this.data;
    }
    /**
    Find the document regions that were parsed using this language.
    The returned regions will _include_ any nested languages rooted
    in this language, when those exist.
    */
    findRegions(state) {
      let lang = state.facet(language);
      if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
        return [{ from: 0, to: state.doc.length }];
      if (!lang || !lang.allowsNesting)
        return [];
      let result = [];
      let explore = (tree, from) => {
        if (tree.prop(languageDataProp) == this.data) {
          result.push({ from, to: from + tree.length });
          return;
        }
        let mount = tree.prop(NodeProp.mounted);
        if (mount) {
          if (mount.tree.prop(languageDataProp) == this.data) {
            if (mount.overlay)
              for (let r of mount.overlay)
                result.push({ from: r.from + from, to: r.to + from });
            else
              result.push({ from, to: from + tree.length });
            return;
          } else if (mount.overlay) {
            let size = result.length;
            explore(mount.tree, mount.overlay[0].from + from);
            if (result.length > size)
              return;
          }
        }
        for (let i = 0; i < tree.children.length; i++) {
          let ch = tree.children[i];
          if (ch instanceof Tree)
            explore(ch, tree.positions[i] + from);
        }
      };
      explore(syntaxTree(state), 0);
      return result;
    }
    /**
    Indicates whether this language allows nested languages. The
    default implementation returns true.
    */
    get allowsNesting() {
      return true;
    }
  };
  Language.setState = /* @__PURE__ */ StateEffect.define();
  function topNodeAt(state, pos, side) {
    let topLang = state.facet(language), tree = syntaxTree(state).topNode;
    if (!topLang || topLang.allowsNesting) {
      for (let node = tree; node; node = node.enter(pos, side, IterMode.ExcludeBuffers))
        if (node.type.isTop)
          tree = node;
    }
    return tree;
  }
  function syntaxTree(state) {
    let field = state.field(Language.state, false);
    return field ? field.tree : Tree.empty;
  }
  var DocInput = class {
    /**
    Create an input object for the given document.
    */
    constructor(doc2) {
      this.doc = doc2;
      this.cursorPos = 0;
      this.string = "";
      this.cursor = doc2.iter();
    }
    get length() {
      return this.doc.length;
    }
    syncTo(pos) {
      this.string = this.cursor.next(pos - this.cursorPos).value;
      this.cursorPos = pos + this.string.length;
      return this.cursorPos - this.string.length;
    }
    chunk(pos) {
      this.syncTo(pos);
      return this.string;
    }
    get lineChunks() {
      return true;
    }
    read(from, to) {
      let stringStart = this.cursorPos - this.string.length;
      if (from < stringStart || to >= this.cursorPos)
        return this.doc.sliceString(from, to);
      else
        return this.string.slice(from - stringStart, to - stringStart);
    }
  };
  var currentContext = null;
  var ParseContext = class _ParseContext {
    constructor(parser, state, fragments = [], tree, treeLen, viewport, skipped, scheduleOn) {
      this.parser = parser;
      this.state = state;
      this.fragments = fragments;
      this.tree = tree;
      this.treeLen = treeLen;
      this.viewport = viewport;
      this.skipped = skipped;
      this.scheduleOn = scheduleOn;
      this.parse = null;
      this.tempSkipped = [];
    }
    /**
    @internal
    */
    static create(parser, state, viewport) {
      return new _ParseContext(parser, state, [], Tree.empty, 0, viewport, [], null);
    }
    startParse() {
      return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
    }
    /**
    @internal
    */
    work(until, upto) {
      if (upto != null && upto >= this.state.doc.length)
        upto = void 0;
      if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
        this.takeTree();
        return true;
      }
      return this.withContext(() => {
        var _a2;
        if (typeof until == "number") {
          let endTime = Date.now() + until;
          until = () => Date.now() > endTime;
        }
        if (!this.parse)
          this.parse = this.startParse();
        if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) && upto < this.state.doc.length)
          this.parse.stopAt(upto);
        for (; ; ) {
          let done = this.parse.advance();
          if (done) {
            this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
            this.treeLen = (_a2 = this.parse.stoppedAt) !== null && _a2 !== void 0 ? _a2 : this.state.doc.length;
            this.tree = done;
            this.parse = null;
            if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
              this.parse = this.startParse();
            else
              return true;
          }
          if (until())
            return false;
        }
      });
    }
    /**
    @internal
    */
    takeTree() {
      let pos, tree;
      if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
        if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
          this.parse.stopAt(pos);
        this.withContext(() => {
          while (!(tree = this.parse.advance())) {
          }
        });
        this.treeLen = pos;
        this.tree = tree;
        this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
        this.parse = null;
      }
    }
    withContext(f) {
      let prev = currentContext;
      currentContext = this;
      try {
        return f();
      } finally {
        currentContext = prev;
      }
    }
    withoutTempSkipped(fragments) {
      for (let r; r = this.tempSkipped.pop(); )
        fragments = cutFragments(fragments, r.from, r.to);
      return fragments;
    }
    /**
    @internal
    */
    changes(changes, newState) {
      let { fragments, tree, treeLen, viewport, skipped } = this;
      this.takeTree();
      if (!changes.empty) {
        let ranges = [];
        changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
        fragments = TreeFragment.applyChanges(fragments, ranges);
        tree = Tree.empty;
        treeLen = 0;
        viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
        if (this.skipped.length) {
          skipped = [];
          for (let r of this.skipped) {
            let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
            if (from < to)
              skipped.push({ from, to });
          }
        }
      }
      return new _ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
    }
    /**
    @internal
    */
    updateViewport(viewport) {
      if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
        return false;
      this.viewport = viewport;
      let startLen = this.skipped.length;
      for (let i = 0; i < this.skipped.length; i++) {
        let { from, to } = this.skipped[i];
        if (from < viewport.to && to > viewport.from) {
          this.fragments = cutFragments(this.fragments, from, to);
          this.skipped.splice(i--, 1);
        }
      }
      if (this.skipped.length >= startLen)
        return false;
      this.reset();
      return true;
    }
    /**
    @internal
    */
    reset() {
      if (this.parse) {
        this.takeTree();
        this.parse = null;
      }
    }
    /**
    Notify the parse scheduler that the given region was skipped
    because it wasn't in view, and the parse should be restarted
    when it comes into view.
    */
    skipUntilInView(from, to) {
      this.skipped.push({ from, to });
    }
    /**
    Returns a parser intended to be used as placeholder when
    asynchronously loading a nested parser. It'll skip its input and
    mark it as not-really-parsed, so that the next update will parse
    it again.
    
    When `until` is given, a reparse will be scheduled when that
    promise resolves.
    */
    static getSkippingParser(until) {
      return new class extends Parser {
        createParse(input, fragments, ranges) {
          let from = ranges[0].from, to = ranges[ranges.length - 1].to;
          let parser = {
            parsedPos: from,
            advance() {
              let cx = currentContext;
              if (cx) {
                for (let r of ranges)
                  cx.tempSkipped.push(r);
                if (until)
                  cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
              }
              this.parsedPos = to;
              return new Tree(NodeType.none, [], [], to - from);
            },
            stoppedAt: null,
            stopAt() {
            }
          };
          return parser;
        }
      }();
    }
    /**
    @internal
    */
    isDone(upto) {
      upto = Math.min(upto, this.state.doc.length);
      let frags = this.fragments;
      return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
    }
    /**
    Get the context for the current parse, or `null` if no editor
    parse is in progress.
    */
    static get() {
      return currentContext;
    }
  };
  function cutFragments(fragments, from, to) {
    return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
  }
  var LanguageState = class _LanguageState {
    constructor(context) {
      this.context = context;
      this.tree = context.tree;
    }
    apply(tr) {
      if (!tr.docChanged && this.tree == this.context.tree)
        return this;
      let newCx = this.context.changes(tr.changes, tr.state);
      let upto = this.context.treeLen == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
      if (!newCx.work(20, upto))
        newCx.takeTree();
      return new _LanguageState(newCx);
    }
    static init(state) {
      let vpTo = Math.min(3e3, state.doc.length);
      let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
      if (!parseState.work(20, vpTo))
        parseState.takeTree();
      return new _LanguageState(parseState);
    }
  };
  Language.state = /* @__PURE__ */ StateField.define({
    create: LanguageState.init,
    update(value, tr) {
      for (let e of tr.effects)
        if (e.is(Language.setState))
          return e.value;
      if (tr.startState.facet(language) != tr.state.facet(language))
        return LanguageState.init(tr.state);
      return value.apply(tr);
    }
  });
  var requestIdle = (callback) => {
    let timeout = setTimeout(
      () => callback(),
      500
      /* MaxPause */
    );
    return () => clearTimeout(timeout);
  };
  if (typeof requestIdleCallback != "undefined")
    requestIdle = (callback) => {
      let idle = -1, timeout = setTimeout(
        () => {
          idle = requestIdleCallback(callback, {
            timeout: 500 - 100
            /* MinPause */
          });
        },
        100
        /* MinPause */
      );
      return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
    };
  var isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending) ? () => navigator.scheduling.isInputPending() : null;
  var parseWorker = /* @__PURE__ */ ViewPlugin.fromClass(class ParseWorker {
    constructor(view) {
      this.view = view;
      this.working = null;
      this.workScheduled = 0;
      this.chunkEnd = -1;
      this.chunkBudget = -1;
      this.work = this.work.bind(this);
      this.scheduleWork();
    }
    update(update) {
      let cx = this.view.state.field(Language.state).context;
      if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
        this.scheduleWork();
      if (update.docChanged) {
        if (this.view.hasFocus)
          this.chunkBudget += 50;
        this.scheduleWork();
      }
      this.checkAsyncSchedule(cx);
    }
    scheduleWork() {
      if (this.working)
        return;
      let { state } = this.view, field = state.field(Language.state);
      if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
        this.working = requestIdle(this.work);
    }
    work(deadline) {
      this.working = null;
      let now = Date.now();
      if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) {
        this.chunkEnd = now + 3e4;
        this.chunkBudget = 3e3;
      }
      if (this.chunkBudget <= 0)
        return;
      let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
      if (field.tree == field.context.tree && field.context.isDone(
        vpTo + 1e5
        /* MaxParseAhead */
      ))
        return;
      let endTime = Date.now() + Math.min(this.chunkBudget, 100, deadline && !isInputPending ? Math.max(25, deadline.timeRemaining() - 5) : 1e9);
      let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1e3;
      let done = field.context.work(() => {
        return isInputPending && isInputPending() || Date.now() > endTime;
      }, vpTo + (viewportFirst ? 0 : 1e5));
      this.chunkBudget -= Date.now() - now;
      if (done || this.chunkBudget <= 0) {
        field.context.takeTree();
        this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
      }
      if (this.chunkBudget > 0 && !(done && !viewportFirst))
        this.scheduleWork();
      this.checkAsyncSchedule(field.context);
    }
    checkAsyncSchedule(cx) {
      if (cx.scheduleOn) {
        this.workScheduled++;
        cx.scheduleOn.then(() => this.scheduleWork()).catch((err) => logException(this.view.state, err)).then(() => this.workScheduled--);
        cx.scheduleOn = null;
      }
    }
    destroy() {
      if (this.working)
        this.working();
    }
    isWorking() {
      return !!(this.working || this.workScheduled > 0);
    }
  }, {
    eventHandlers: { focus() {
      this.scheduleWork();
    } }
  });
  var language = /* @__PURE__ */ Facet.define({
    combine(languages) {
      return languages.length ? languages[0] : null;
    },
    enables: (language2) => [
      Language.state,
      parseWorker,
      EditorView.contentAttributes.compute([language2], (state) => {
        let lang = state.facet(language2);
        return lang && lang.name ? { "data-language": lang.name } : {};
      })
    ]
  });
  var indentService = /* @__PURE__ */ Facet.define();
  var indentUnit = /* @__PURE__ */ Facet.define({
    combine: (values) => {
      if (!values.length)
        return "  ";
      let unit = values[0];
      if (!unit || /\S/.test(unit) || Array.from(unit).some((e) => e != unit[0]))
        throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
      return unit;
    }
  });
  function getIndentUnit(state) {
    let unit = state.facet(indentUnit);
    return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
  }
  function indentString(state, cols) {
    let result = "", ts = state.tabSize, ch = state.facet(indentUnit)[0];
    if (ch == "	") {
      while (cols >= ts) {
        result += "	";
        cols -= ts;
      }
      ch = " ";
    }
    for (let i = 0; i < cols; i++)
      result += ch;
    return result;
  }
  function getIndentation(context, pos) {
    if (context instanceof EditorState)
      context = new IndentContext(context);
    for (let service of context.state.facet(indentService)) {
      let result = service(context, pos);
      if (result !== void 0)
        return result;
    }
    let tree = syntaxTree(context.state);
    return tree.length >= pos ? syntaxIndentation(context, tree, pos) : null;
  }
  var IndentContext = class {
    /**
    Create an indent context.
    */
    constructor(state, options = {}) {
      this.state = state;
      this.options = options;
      this.unit = getIndentUnit(state);
    }
    /**
    Get a description of the line at the given position, taking
    [simulated line
    breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
    into account. If there is such a break at `pos`, the `bias`
    argument determines whether the part of the line line before or
    after the break is used.
    */
    lineAt(pos, bias = 1) {
      let line = this.state.doc.lineAt(pos);
      let { simulateBreak, simulateDoubleBreak } = this.options;
      if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
        if (simulateDoubleBreak && simulateBreak == pos)
          return { text: "", from: pos };
        else if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
          return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
        else
          return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
      }
      return line;
    }
    /**
    Get the text directly after `pos`, either the entire line
    or the next 100 characters, whichever is shorter.
    */
    textAfterPos(pos, bias = 1) {
      if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
        return "";
      let { text, from } = this.lineAt(pos, bias);
      return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
    }
    /**
    Find the column for the given position.
    */
    column(pos, bias = 1) {
      let { text, from } = this.lineAt(pos, bias);
      let result = this.countColumn(text, pos - from);
      let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
      if (override > -1)
        result += override - this.countColumn(text, text.search(/\S|$/));
      return result;
    }
    /**
    Find the column position (taking tabs into account) of the given
    position in the given string.
    */
    countColumn(line, pos = line.length) {
      return countColumn(line, this.state.tabSize, pos);
    }
    /**
    Find the indentation column of the line at the given point.
    */
    lineIndent(pos, bias = 1) {
      let { text, from } = this.lineAt(pos, bias);
      let override = this.options.overrideIndentation;
      if (override) {
        let overriden = override(from);
        if (overriden > -1)
          return overriden;
      }
      return this.countColumn(text, text.search(/\S|$/));
    }
    /**
    Returns the [simulated line
    break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
    for this context, if any.
    */
    get simulatedBreak() {
      return this.options.simulateBreak || null;
    }
  };
  var indentNodeProp = /* @__PURE__ */ new NodeProp();
  function syntaxIndentation(cx, ast2, pos) {
    return indentFrom(ast2.resolveInner(pos).enterUnfinishedNodesBefore(pos), pos, cx);
  }
  function ignoreClosed(cx) {
    return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
  }
  function indentStrategy(tree) {
    let strategy = tree.type.prop(indentNodeProp);
    if (strategy)
      return strategy;
    let first = tree.firstChild, close;
    if (first && (close = first.type.prop(NodeProp.closedBy))) {
      let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
      return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last.from : void 0);
    }
    return tree.parent == null ? topIndent : null;
  }
  function indentFrom(node, pos, base2) {
    for (; node; node = node.parent) {
      let strategy = indentStrategy(node);
      if (strategy)
        return strategy(TreeIndentContext.create(base2, pos, node));
    }
    return null;
  }
  function topIndent() {
    return 0;
  }
  var TreeIndentContext = class _TreeIndentContext extends IndentContext {
    constructor(base2, pos, node) {
      super(base2.state, base2.options);
      this.base = base2;
      this.pos = pos;
      this.node = node;
    }
    /**
    @internal
    */
    static create(base2, pos, node) {
      return new _TreeIndentContext(base2, pos, node);
    }
    /**
    Get the text directly after `this.pos`, either the entire line
    or the next 100 characters, whichever is shorter.
    */
    get textAfter() {
      return this.textAfterPos(this.pos);
    }
    /**
    Get the indentation at the reference line for `this.node`, which
    is the line on which it starts, unless there is a node that is
    _not_ a parent of this node covering the start of that line. If
    so, the line at the start of that node is tried, again skipping
    on if it is covered by another such node.
    */
    get baseIndent() {
      return this.baseIndentFor(this.node);
    }
    /**
    Get the indentation for the reference line of the given node
    (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
    */
    baseIndentFor(node) {
      let line = this.state.doc.lineAt(node.from);
      for (; ; ) {
        let atBreak = node.resolve(line.from);
        while (atBreak.parent && atBreak.parent.from == atBreak.from)
          atBreak = atBreak.parent;
        if (isParent(atBreak, node))
          break;
        line = this.state.doc.lineAt(atBreak.from);
      }
      return this.lineIndent(line.from);
    }
    /**
    Continue looking for indentations in the node's parent nodes,
    and return the result of that.
    */
    continue() {
      let parent = this.node.parent;
      return parent ? indentFrom(parent, this.pos, this.base) : 0;
    }
  };
  function isParent(parent, of) {
    for (let cur = of; cur; cur = cur.parent)
      if (parent == cur)
        return true;
    return false;
  }
  function bracketedAligned(context) {
    let tree = context.node;
    let openToken = tree.childAfter(tree.from), last = tree.lastChild;
    if (!openToken)
      return null;
    let sim = context.options.simulateBreak;
    let openLine = context.state.doc.lineAt(openToken.from);
    let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
    for (let pos = openToken.to; ; ) {
      let next = tree.childAfter(pos);
      if (!next || next == last)
        return null;
      if (!next.type.isSkipped)
        return next.from < lineEnd ? openToken : null;
      pos = next.to;
    }
  }
  function delimitedStrategy(context, align, units, closing, closedAt) {
    let after = context.textAfter, space = after.match(/^\s*/)[0].length;
    let closed = closing && after.slice(space, space + closing.length) == closing || closedAt == context.pos + space;
    let aligned = align ? bracketedAligned(context) : null;
    if (aligned)
      return closed ? context.column(aligned.from) : context.column(aligned.to);
    return context.baseIndent + (closed ? 0 : context.unit * units);
  }
  var HighlightStyle = class _HighlightStyle {
    constructor(specs, options) {
      this.specs = specs;
      let modSpec;
      function def(spec) {
        let cls = StyleModule.newName();
        (modSpec || (modSpec = /* @__PURE__ */ Object.create(null)))["." + cls] = spec;
        return cls;
      }
      const all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : void 0;
      const scopeOpt = options.scope;
      this.scope = scopeOpt instanceof Language ? (type) => type.prop(languageDataProp) == scopeOpt.data : scopeOpt ? (type) => type == scopeOpt : void 0;
      this.style = tagHighlighter(specs.map((style) => ({
        tag: style.tag,
        class: style.class || def(Object.assign({}, style, { tag: null }))
      })), {
        all
      }).style;
      this.module = modSpec ? new StyleModule(modSpec) : null;
      this.themeType = options.themeType;
    }
    /**
    Create a highlighter style that associates the given styles to
    the given tags. The specs must be objects that hold a style tag
    or array of tags in their `tag` property, and either a single
    `class` property providing a static CSS class (for highlighter
    that rely on external styling), or a
    [`style-mod`](https://github.com/marijnh/style-mod#documentation)-style
    set of CSS properties (which define the styling for those tags).
    
    The CSS rules created for a highlighter will be emitted in the
    order of the spec's properties. That means that for elements that
    have multiple tags associated with them, styles defined further
    down in the list will have a higher CSS precedence than styles
    defined earlier.
    */
    static define(specs, options) {
      return new _HighlightStyle(specs, options || {});
    }
  };
  var highlighterFacet = /* @__PURE__ */ Facet.define();
  var fallbackHighlighter = /* @__PURE__ */ Facet.define({
    combine(values) {
      return values.length ? [values[0]] : null;
    }
  });
  function getHighlighters(state) {
    let main = state.facet(highlighterFacet);
    return main.length ? main : state.facet(fallbackHighlighter);
  }
  function syntaxHighlighting(highlighter, options) {
    let ext = [treeHighlighter], themeType;
    if (highlighter instanceof HighlightStyle) {
      if (highlighter.module)
        ext.push(EditorView.styleModule.of(highlighter.module));
      themeType = highlighter.themeType;
    }
    if (options === null || options === void 0 ? void 0 : options.fallback)
      ext.push(fallbackHighlighter.of(highlighter));
    else if (themeType)
      ext.push(highlighterFacet.computeN([EditorView.darkTheme], (state) => {
        return state.facet(EditorView.darkTheme) == (themeType == "dark") ? [highlighter] : [];
      }));
    else
      ext.push(highlighterFacet.of(highlighter));
    return ext;
  }
  var TreeHighlighter = class {
    constructor(view) {
      this.markCache = /* @__PURE__ */ Object.create(null);
      this.tree = syntaxTree(view.state);
      this.decorations = this.buildDeco(view, getHighlighters(view.state));
    }
    update(update) {
      let tree = syntaxTree(update.state), highlighters = getHighlighters(update.state);
      let styleChange = highlighters != getHighlighters(update.startState);
      if (tree.length < update.view.viewport.to && !styleChange && tree.type == this.tree.type) {
        this.decorations = this.decorations.map(update.changes);
      } else if (tree != this.tree || update.viewportChanged || styleChange) {
        this.tree = tree;
        this.decorations = this.buildDeco(update.view, highlighters);
      }
    }
    buildDeco(view, highlighters) {
      if (!highlighters || !this.tree.length)
        return Decoration.none;
      let builder = new RangeSetBuilder();
      for (let { from, to } of view.visibleRanges) {
        highlightTree(this.tree, highlighters, (from2, to2, style) => {
          builder.add(from2, to2, this.markCache[style] || (this.markCache[style] = Decoration.mark({ class: style })));
        }, from, to);
      }
      return builder.finish();
    }
  };
  var treeHighlighter = /* @__PURE__ */ Prec.high(/* @__PURE__ */ ViewPlugin.fromClass(TreeHighlighter, {
    decorations: (v) => v.decorations
  }));
  var defaultHighlightStyle = /* @__PURE__ */ HighlightStyle.define([
    {
      tag: tags.meta,
      color: "#404740"
    },
    {
      tag: tags.link,
      textDecoration: "underline"
    },
    {
      tag: tags.heading,
      textDecoration: "underline",
      fontWeight: "bold"
    },
    {
      tag: tags.emphasis,
      fontStyle: "italic"
    },
    {
      tag: tags.strong,
      fontWeight: "bold"
    },
    {
      tag: tags.strikethrough,
      textDecoration: "line-through"
    },
    {
      tag: tags.keyword,
      color: "#708"
    },
    {
      tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
      color: "#219"
    },
    {
      tag: [tags.literal, tags.inserted],
      color: "#164"
    },
    {
      tag: [tags.string, tags.deleted],
      color: "#a11"
    },
    {
      tag: [tags.regexp, tags.escape, /* @__PURE__ */ tags.special(tags.string)],
      color: "#e40"
    },
    {
      tag: /* @__PURE__ */ tags.definition(tags.variableName),
      color: "#00f"
    },
    {
      tag: /* @__PURE__ */ tags.local(tags.variableName),
      color: "#30a"
    },
    {
      tag: [tags.typeName, tags.namespace],
      color: "#085"
    },
    {
      tag: tags.className,
      color: "#167"
    },
    {
      tag: [/* @__PURE__ */ tags.special(tags.variableName), tags.macroName],
      color: "#256"
    },
    {
      tag: /* @__PURE__ */ tags.definition(tags.propertyName),
      color: "#00c"
    },
    {
      tag: tags.comment,
      color: "#940"
    },
    {
      tag: tags.invalid,
      color: "#f00"
    }
  ]);
  var DefaultScanDist = 1e4;
  var DefaultBrackets = "()[]{}";
  var bracketMatchingHandle = /* @__PURE__ */ new NodeProp();
  function matchingNodes(node, dir, brackets) {
    let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
    if (byProp)
      return byProp;
    if (node.name.length == 1) {
      let index = brackets.indexOf(node.name);
      if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
        return [brackets[index + dir]];
    }
    return null;
  }
  function findHandle(node) {
    let hasHandle = node.type.prop(bracketMatchingHandle);
    return hasHandle ? hasHandle(node.node) : node;
  }
  function matchBrackets(state, pos, dir, config = {}) {
    let maxScanDistance = config.maxScanDistance || DefaultScanDist, brackets = config.brackets || DefaultBrackets;
    let tree = syntaxTree(state), node = tree.resolveInner(pos, dir);
    for (let cur = node; cur; cur = cur.parent) {
      let matches = matchingNodes(cur.type, dir, brackets);
      if (matches && cur.from < cur.to) {
        let handle = findHandle(cur);
        if (handle && (dir > 0 ? pos >= handle.from && pos < handle.to : pos > handle.from && pos <= handle.to))
          return matchMarkedBrackets(state, pos, dir, cur, handle, matches, brackets);
      }
    }
    return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
  }
  function matchMarkedBrackets(_state, _pos, dir, token2, handle, matching, brackets) {
    let parent = token2.parent, firstToken = { from: handle.from, to: handle.to };
    let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor();
    if (cursor && (dir < 0 ? cursor.childBefore(token2.from) : cursor.childAfter(token2.to)))
      do {
        if (dir < 0 ? cursor.to <= token2.from : cursor.from >= token2.to) {
          if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
            let endHandle = findHandle(cursor);
            return { start: firstToken, end: endHandle ? { from: endHandle.from, to: endHandle.to } : void 0, matched: true };
          } else if (matchingNodes(cursor.type, dir, brackets)) {
            depth++;
          } else if (matchingNodes(cursor.type, -dir, brackets)) {
            if (depth == 0) {
              let endHandle = findHandle(cursor);
              return {
                start: firstToken,
                end: endHandle && endHandle.from < endHandle.to ? { from: endHandle.from, to: endHandle.to } : void 0,
                matched: false
              };
            }
            depth--;
          }
        }
      } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
    return { start: firstToken, matched: false };
  }
  function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
    let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
    let bracket2 = brackets.indexOf(startCh);
    if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
      return null;
    let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
    let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
    for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
      let text = iter.value;
      if (dir < 0)
        distance += text.length;
      let basePos = pos + distance * dir;
      for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
        let found = brackets.indexOf(text[pos2]);
        if (found < 0 || tree.resolveInner(basePos + pos2, 1).type != tokenType)
          continue;
        if (found % 2 == 0 == dir > 0) {
          depth++;
        } else if (depth == 1) {
          return { start: startToken, end: { from: basePos + pos2, to: basePos + pos2 + 1 }, matched: found >> 1 == bracket2 >> 1 };
        } else {
          depth--;
        }
      }
      if (dir > 0)
        distance += text.length;
    }
    return iter.done ? { start: startToken, matched: false } : null;
  }
  var noTokens = /* @__PURE__ */ Object.create(null);
  var typeArray = [NodeType.none];
  var warned = [];
  var defaultTable = /* @__PURE__ */ Object.create(null);
  for (let [legacyName, name2] of [
    ["variable", "variableName"],
    ["variable-2", "variableName.special"],
    ["string-2", "string.special"],
    ["def", "variableName.definition"],
    ["tag", "tagName"],
    ["attribute", "attributeName"],
    ["type", "typeName"],
    ["builtin", "variableName.standard"],
    ["qualifier", "modifier"],
    ["error", "invalid"],
    ["header", "heading"],
    ["property", "propertyName"]
  ])
    defaultTable[legacyName] = /* @__PURE__ */ createTokenType(noTokens, name2);
  function warnForPart(part, msg) {
    if (warned.indexOf(part) > -1)
      return;
    warned.push(part);
    console.warn(msg);
  }
  function createTokenType(extra, tagStr) {
    let tag = null;
    for (let part of tagStr.split(".")) {
      let value = extra[part] || tags[part];
      if (!value) {
        warnForPart(part, `Unknown highlighting tag ${part}`);
      } else if (typeof value == "function") {
        if (!tag)
          warnForPart(part, `Modifier ${part} used at start of tag`);
        else
          tag = value(tag);
      } else {
        if (tag)
          warnForPart(part, `Tag ${part} used as modifier`);
        else
          tag = value;
      }
    }
    if (!tag)
      return 0;
    let name2 = tagStr.replace(/ /g, "_"), type = NodeType.define({
      id: typeArray.length,
      name: name2,
      props: [styleTags({ [name2]: tag })]
    });
    typeArray.push(type);
    return type.id;
  }

  // node_modules/@codemirror/commands/dist/index.js
  var toggleComment = (target) => {
    let { state } = target, line = state.doc.lineAt(state.selection.main.from), config = getConfig(target.state, line.from);
    return config.line ? toggleLineComment(target) : config.block ? toggleBlockCommentByLine(target) : false;
  };
  function command(f, option) {
    return ({ state, dispatch }) => {
      if (state.readOnly)
        return false;
      let tr = f(option, state);
      if (!tr)
        return false;
      dispatch(state.update(tr));
      return true;
    };
  }
  var toggleLineComment = /* @__PURE__ */ command(
    changeLineComment,
    0
    /* CommentOption.Toggle */
  );
  var toggleBlockComment = /* @__PURE__ */ command(
    changeBlockComment,
    0
    /* CommentOption.Toggle */
  );
  var toggleBlockCommentByLine = /* @__PURE__ */ command(
    (o, s) => changeBlockComment(o, s, selectedLineRanges(s)),
    0
    /* CommentOption.Toggle */
  );
  function getConfig(state, pos) {
    let data = state.languageDataAt("commentTokens", pos);
    return data.length ? data[0] : {};
  }
  var SearchMargin = 50;
  function findBlockComment(state, { open, close }, from, to) {
    let textBefore = state.sliceDoc(from - SearchMargin, from);
    let textAfter = state.sliceDoc(to, to + SearchMargin);
    let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
    let beforeOff = textBefore.length - spaceBefore;
    if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
      return {
        open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
        close: { pos: to + spaceAfter, margin: spaceAfter && 1 }
      };
    }
    let startText, endText;
    if (to - from <= 2 * SearchMargin) {
      startText = endText = state.sliceDoc(from, to);
    } else {
      startText = state.sliceDoc(from, from + SearchMargin);
      endText = state.sliceDoc(to - SearchMargin, to);
    }
    let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
    let endOff = endText.length - endSpace - close.length;
    if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
      return {
        open: {
          pos: from + startSpace + open.length,
          margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
        },
        close: {
          pos: to - endSpace - close.length,
          margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
        }
      };
    }
    return null;
  }
  function selectedLineRanges(state) {
    let ranges = [];
    for (let r of state.selection.ranges) {
      let fromLine = state.doc.lineAt(r.from);
      let toLine = r.to <= fromLine.to ? fromLine : state.doc.lineAt(r.to);
      let last = ranges.length - 1;
      if (last >= 0 && ranges[last].to > fromLine.from)
        ranges[last].to = toLine.to;
      else
        ranges.push({ from: fromLine.from + /^\s*/.exec(fromLine.text)[0].length, to: toLine.to });
    }
    return ranges;
  }
  function changeBlockComment(option, state, ranges = state.selection.ranges) {
    let tokens2 = ranges.map((r) => getConfig(state, r.from).block);
    if (!tokens2.every((c) => c))
      return null;
    let comments = ranges.map((r, i) => findBlockComment(state, tokens2[i], r.from, r.to));
    if (option != 2 && !comments.every((c) => c)) {
      return { changes: state.changes(ranges.map((range2, i) => {
        if (comments[i])
          return [];
        return [{ from: range2.from, insert: tokens2[i].open + " " }, { from: range2.to, insert: " " + tokens2[i].close }];
      })) };
    } else if (option != 1 && comments.some((c) => c)) {
      let changes = [];
      for (let i = 0, comment2; i < comments.length; i++)
        if (comment2 = comments[i]) {
          let token2 = tokens2[i], { open, close } = comment2;
          changes.push({ from: open.pos - token2.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token2.close.length });
        }
      return { changes };
    }
    return null;
  }
  function changeLineComment(option, state, ranges = state.selection.ranges) {
    let lines = [];
    let prevLine = -1;
    for (let { from, to } of ranges) {
      let startI = lines.length, minIndent = 1e9;
      let token2 = getConfig(state, from).line;
      if (!token2)
        continue;
      for (let pos = from; pos <= to; ) {
        let line = state.doc.lineAt(pos);
        if (line.from > prevLine && (from == to || to > line.from)) {
          prevLine = line.from;
          let indent = /^\s*/.exec(line.text)[0].length;
          let empty = indent == line.length;
          let comment2 = line.text.slice(indent, indent + token2.length) == token2 ? indent : -1;
          if (indent < line.text.length && indent < minIndent)
            minIndent = indent;
          lines.push({ line, comment: comment2, token: token2, indent, empty, single: false });
        }
        pos = line.to + 1;
      }
      if (minIndent < 1e9) {
        for (let i = startI; i < lines.length; i++)
          if (lines[i].indent < lines[i].line.text.length)
            lines[i].indent = minIndent;
      }
      if (lines.length == startI + 1)
        lines[startI].single = true;
    }
    if (option != 2 && lines.some((l) => l.comment < 0 && (!l.empty || l.single))) {
      let changes = [];
      for (let { line, token: token2, indent, empty, single } of lines)
        if (single || !empty)
          changes.push({ from: line.from + indent, insert: token2 + " " });
      let changeSet = state.changes(changes);
      return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
    } else if (option != 1 && lines.some((l) => l.comment >= 0)) {
      let changes = [];
      for (let { line, comment: comment2, token: token2 } of lines)
        if (comment2 >= 0) {
          let from = line.from + comment2, to = from + token2.length;
          if (line.text[to - line.from] == " ")
            to++;
          changes.push({ from, to });
        }
      return { changes };
    }
    return null;
  }
  var fromHistory = /* @__PURE__ */ Annotation.define();
  var invertedEffects = /* @__PURE__ */ Facet.define();
  var HistEvent = class _HistEvent {
    constructor(changes, effects, mapped, startSelection, selectionsAfter) {
      this.changes = changes;
      this.effects = effects;
      this.mapped = mapped;
      this.startSelection = startSelection;
      this.selectionsAfter = selectionsAfter;
    }
    setSelAfter(after) {
      return new _HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
    }
    toJSON() {
      var _a2, _b, _c;
      return {
        changes: (_a2 = this.changes) === null || _a2 === void 0 ? void 0 : _a2.toJSON(),
        mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
        startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
        selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
      };
    }
    static fromJSON(json) {
      return new _HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
    }
    // This does not check `addToHistory` and such, it assumes the
    // transaction needs to be converted to an item. Returns null when
    // there are no changes or effects in the transaction.
    static fromTransaction(tr, selection) {
      let effects = none2;
      for (let invert of tr.startState.facet(invertedEffects)) {
        let result = invert(tr);
        if (result.length)
          effects = effects.concat(result);
      }
      if (!effects.length && tr.changes.empty)
        return null;
      return new _HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, selection || tr.startState.selection, none2);
    }
    static selection(selections) {
      return new _HistEvent(void 0, none2, void 0, void 0, selections);
    }
  };
  function updateBranch(branch, to, maxLen, newEvent) {
    let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
    let newBranch = branch.slice(start, to);
    newBranch.push(newEvent);
    return newBranch;
  }
  function isAdjacent(a, b) {
    let ranges = [], isAdjacent2 = false;
    a.iterChangedRanges((f, t2) => ranges.push(f, t2));
    b.iterChangedRanges((_f, _t, f, t2) => {
      for (let i = 0; i < ranges.length; ) {
        let from = ranges[i++], to = ranges[i++];
        if (t2 >= from && f <= to)
          isAdjacent2 = true;
      }
    });
    return isAdjacent2;
  }
  function eqSelectionShape(a, b) {
    return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
  }
  function conc(a, b) {
    return !a.length ? b : !b.length ? a : a.concat(b);
  }
  var none2 = [];
  var MaxSelectionsPerEvent = 200;
  function addSelection(branch, selection) {
    if (!branch.length) {
      return [HistEvent.selection([selection])];
    } else {
      let lastEvent = branch[branch.length - 1];
      let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
      if (sels.length && sels[sels.length - 1].eq(selection))
        return branch;
      sels.push(selection);
      return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
    }
  }
  function popSelection(branch) {
    let last = branch[branch.length - 1];
    let newBranch = branch.slice();
    newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
    return newBranch;
  }
  function addMappingToBranch(branch, mapping) {
    if (!branch.length)
      return branch;
    let length = branch.length, selections = none2;
    while (length) {
      let event = mapEvent(branch[length - 1], mapping, selections);
      if (event.changes && !event.changes.empty || event.effects.length) {
        let result = branch.slice(0, length);
        result[length - 1] = event;
        return result;
      } else {
        mapping = event.mapped;
        length--;
        selections = event.selectionsAfter;
      }
    }
    return selections.length ? [HistEvent.selection(selections)] : none2;
  }
  function mapEvent(event, mapping, extraSelections) {
    let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none2, extraSelections);
    if (!event.changes)
      return HistEvent.selection(selections);
    let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
    let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
    return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
  }
  var joinableUserEvent = /^(input\.type|delete)($|\.)/;
  var HistoryState = class _HistoryState {
    constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
      this.done = done;
      this.undone = undone;
      this.prevTime = prevTime;
      this.prevUserEvent = prevUserEvent;
    }
    isolate() {
      return this.prevTime ? new _HistoryState(this.done, this.undone) : this;
    }
    addChanges(event, time, userEvent, config, tr) {
      let done = this.done, lastEvent = done[done.length - 1];
      if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes && (!userEvent || joinableUserEvent.test(userEvent)) && (!lastEvent.selectionsAfter.length && time - this.prevTime < config.newGroupDelay && config.joinToEvent(tr, isAdjacent(lastEvent.changes, event.changes)) || // For compose (but not compose.start) events, always join with previous event
      userEvent == "input.type.compose")) {
        done = updateBranch(done, done.length - 1, config.minDepth, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none2));
      } else {
        done = updateBranch(done, done.length, config.minDepth, event);
      }
      return new _HistoryState(done, none2, time, userEvent);
    }
    addSelection(selection, time, userEvent, newGroupDelay) {
      let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none2;
      if (last.length > 0 && time - this.prevTime < newGroupDelay && userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) && eqSelectionShape(last[last.length - 1], selection))
        return this;
      return new _HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
    }
    addMapping(mapping) {
      return new _HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
    }
    pop(side, state, selection) {
      let branch = side == 0 ? this.done : this.undone;
      if (branch.length == 0)
        return null;
      let event = branch[branch.length - 1];
      if (selection && event.selectionsAfter.length) {
        return state.update({
          selection: event.selectionsAfter[event.selectionsAfter.length - 1],
          annotations: fromHistory.of({ side, rest: popSelection(branch) }),
          userEvent: side == 0 ? "select.undo" : "select.redo",
          scrollIntoView: true
        });
      } else if (!event.changes) {
        return null;
      } else {
        let rest = branch.length == 1 ? none2 : branch.slice(0, branch.length - 1);
        if (event.mapped)
          rest = addMappingToBranch(rest, event.mapped);
        return state.update({
          changes: event.changes,
          selection: event.startSelection,
          effects: event.effects,
          annotations: fromHistory.of({ side, rest }),
          filter: false,
          userEvent: side == 0 ? "undo" : "redo",
          scrollIntoView: true
        });
      }
    }
  };
  HistoryState.empty = /* @__PURE__ */ new HistoryState(none2, none2);
  function updateSel(sel, by) {
    return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
  }
  function setSel(state, selection) {
    return state.update({ selection, scrollIntoView: true, userEvent: "select" });
  }
  function moveSel({ state, dispatch }, how) {
    let selection = updateSel(state.selection, how);
    if (selection.eq(state.selection))
      return false;
    dispatch(setSel(state, selection));
    return true;
  }
  function rangeEnd(range2, forward) {
    return EditorSelection.cursor(forward ? range2.to : range2.from);
  }
  function cursorByChar(view, forward) {
    return moveSel(view, (range2) => range2.empty ? view.moveByChar(range2, forward) : rangeEnd(range2, forward));
  }
  function ltrAtCursor(view) {
    return view.textDirectionAt(view.state.selection.main.head) == Direction.LTR;
  }
  var cursorCharLeft = (view) => cursorByChar(view, !ltrAtCursor(view));
  var cursorCharRight = (view) => cursorByChar(view, ltrAtCursor(view));
  function cursorByGroup(view, forward) {
    return moveSel(view, (range2) => range2.empty ? view.moveByGroup(range2, forward) : rangeEnd(range2, forward));
  }
  var cursorGroupLeft = (view) => cursorByGroup(view, !ltrAtCursor(view));
  var cursorGroupRight = (view) => cursorByGroup(view, ltrAtCursor(view));
  var segmenter = typeof Intl != "undefined" && Intl.Segmenter ? /* @__PURE__ */ new Intl.Segmenter(void 0, { granularity: "word" }) : null;
  function interestingNode(state, node, bracketProp) {
    if (node.type.prop(bracketProp))
      return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
  }
  function moveBySyntax(state, start, forward) {
    let pos = syntaxTree(state).resolveInner(start.head);
    let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
    for (let at = start.head; ; ) {
      let next = forward ? pos.childAfter(at) : pos.childBefore(at);
      if (!next)
        break;
      if (interestingNode(state, next, bracketProp))
        pos = next;
      else
        at = forward ? next.to : next.from;
    }
    let bracket2 = pos.type.prop(bracketProp), match2, newPos;
    if (bracket2 && (match2 = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match2.matched)
      newPos = forward ? match2.end.to : match2.end.from;
    else
      newPos = forward ? pos.to : pos.from;
    return EditorSelection.cursor(newPos, forward ? -1 : 1);
  }
  var cursorSyntaxLeft = (view) => moveSel(view, (range2) => moveBySyntax(view.state, range2, !ltrAtCursor(view)));
  var cursorSyntaxRight = (view) => moveSel(view, (range2) => moveBySyntax(view.state, range2, ltrAtCursor(view)));
  function cursorByLine(view, forward) {
    return moveSel(view, (range2) => {
      if (!range2.empty)
        return rangeEnd(range2, forward);
      let moved = view.moveVertically(range2, forward);
      return moved.head != range2.head ? moved : view.moveToLineBoundary(range2, forward);
    });
  }
  var cursorLineUp = (view) => cursorByLine(view, false);
  var cursorLineDown = (view) => cursorByLine(view, true);
  function pageInfo(view) {
    let selfScroll = view.scrollDOM.clientHeight < view.scrollDOM.scrollHeight - 2;
    let marginTop = 0, marginBottom = 0, height;
    if (selfScroll) {
      for (let source of view.state.facet(EditorView.scrollMargins)) {
        let margins = source(view);
        if (margins === null || margins === void 0 ? void 0 : margins.top)
          marginTop = Math.max(margins === null || margins === void 0 ? void 0 : margins.top, marginTop);
        if (margins === null || margins === void 0 ? void 0 : margins.bottom)
          marginBottom = Math.max(margins === null || margins === void 0 ? void 0 : margins.bottom, marginBottom);
      }
      height = view.scrollDOM.clientHeight - marginTop - marginBottom;
    } else {
      height = (view.dom.ownerDocument.defaultView || window).innerHeight;
    }
    return {
      marginTop,
      marginBottom,
      selfScroll,
      height: Math.max(view.defaultLineHeight, height - 5)
    };
  }
  function cursorByPage(view, forward) {
    let page = pageInfo(view);
    let { state } = view, selection = updateSel(state.selection, (range2) => {
      return range2.empty ? view.moveVertically(range2, forward, page.height) : rangeEnd(range2, forward);
    });
    if (selection.eq(state.selection))
      return false;
    let effect;
    if (page.selfScroll) {
      let startPos = view.coordsAtPos(state.selection.main.head);
      let scrollRect = view.scrollDOM.getBoundingClientRect();
      let scrollTop = scrollRect.top + page.marginTop, scrollBottom = scrollRect.bottom - page.marginBottom;
      if (startPos && startPos.top > scrollTop && startPos.bottom < scrollBottom)
        effect = EditorView.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollTop });
    }
    view.dispatch(setSel(state, selection), { effects: effect });
    return true;
  }
  var cursorPageUp = (view) => cursorByPage(view, false);
  var cursorPageDown = (view) => cursorByPage(view, true);
  function moveByLineBoundary(view, start, forward) {
    let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
      moved = view.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
      let space = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
      if (space && start.head != line.from + space)
        moved = EditorSelection.cursor(line.from + space);
    }
    return moved;
  }
  var cursorLineBoundaryForward = (view) => moveSel(view, (range2) => moveByLineBoundary(view, range2, true));
  var cursorLineBoundaryBackward = (view) => moveSel(view, (range2) => moveByLineBoundary(view, range2, false));
  var cursorLineBoundaryLeft = (view) => moveSel(view, (range2) => moveByLineBoundary(view, range2, !ltrAtCursor(view)));
  var cursorLineBoundaryRight = (view) => moveSel(view, (range2) => moveByLineBoundary(view, range2, ltrAtCursor(view)));
  var cursorLineStart = (view) => moveSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).from, 1));
  var cursorLineEnd = (view) => moveSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).to, -1));
  function toMatchingBracket(state, dispatch, extend2) {
    let found = false, selection = updateSel(state.selection, (range2) => {
      let matching = matchBrackets(state, range2.head, -1) || matchBrackets(state, range2.head, 1) || range2.head > 0 && matchBrackets(state, range2.head - 1, 1) || range2.head < state.doc.length && matchBrackets(state, range2.head + 1, -1);
      if (!matching || !matching.end)
        return range2;
      found = true;
      let head = matching.start.from == range2.head ? matching.end.to : matching.end.from;
      return extend2 ? EditorSelection.range(range2.anchor, head) : EditorSelection.cursor(head);
    });
    if (!found)
      return false;
    dispatch(setSel(state, selection));
    return true;
  }
  var cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
  function extendSel(view, how) {
    let selection = updateSel(view.state.selection, (range2) => {
      let head = how(range2);
      return EditorSelection.range(range2.anchor, head.head, head.goalColumn, head.bidiLevel || void 0);
    });
    if (selection.eq(view.state.selection))
      return false;
    view.dispatch(setSel(view.state, selection));
    return true;
  }
  function selectByChar(view, forward) {
    return extendSel(view, (range2) => view.moveByChar(range2, forward));
  }
  var selectCharLeft = (view) => selectByChar(view, !ltrAtCursor(view));
  var selectCharRight = (view) => selectByChar(view, ltrAtCursor(view));
  function selectByGroup(view, forward) {
    return extendSel(view, (range2) => view.moveByGroup(range2, forward));
  }
  var selectGroupLeft = (view) => selectByGroup(view, !ltrAtCursor(view));
  var selectGroupRight = (view) => selectByGroup(view, ltrAtCursor(view));
  var selectSyntaxLeft = (view) => extendSel(view, (range2) => moveBySyntax(view.state, range2, !ltrAtCursor(view)));
  var selectSyntaxRight = (view) => extendSel(view, (range2) => moveBySyntax(view.state, range2, ltrAtCursor(view)));
  function selectByLine(view, forward) {
    return extendSel(view, (range2) => view.moveVertically(range2, forward));
  }
  var selectLineUp = (view) => selectByLine(view, false);
  var selectLineDown = (view) => selectByLine(view, true);
  function selectByPage(view, forward) {
    return extendSel(view, (range2) => view.moveVertically(range2, forward, pageInfo(view).height));
  }
  var selectPageUp = (view) => selectByPage(view, false);
  var selectPageDown = (view) => selectByPage(view, true);
  var selectLineBoundaryForward = (view) => extendSel(view, (range2) => moveByLineBoundary(view, range2, true));
  var selectLineBoundaryBackward = (view) => extendSel(view, (range2) => moveByLineBoundary(view, range2, false));
  var selectLineBoundaryLeft = (view) => extendSel(view, (range2) => moveByLineBoundary(view, range2, !ltrAtCursor(view)));
  var selectLineBoundaryRight = (view) => extendSel(view, (range2) => moveByLineBoundary(view, range2, ltrAtCursor(view)));
  var selectLineStart = (view) => extendSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).from));
  var selectLineEnd = (view) => extendSel(view, (range2) => EditorSelection.cursor(view.lineBlockAt(range2.head).to));
  var cursorDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: 0 }));
    return true;
  };
  var cursorDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.doc.length }));
    return true;
  };
  var selectDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
    return true;
  };
  var selectDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
    return true;
  };
  var selectAll = ({ state, dispatch }) => {
    dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
    return true;
  };
  var selectLine = ({ state, dispatch }) => {
    let ranges = selectedLineBlocks(state).map(({ from, to }) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
    dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
    return true;
  };
  var selectParentSyntax = ({ state, dispatch }) => {
    let selection = updateSel(state.selection, (range2) => {
      var _a2;
      let context = syntaxTree(state).resolveInner(range2.head, 1);
      while (!(context.from < range2.from && context.to >= range2.to || context.to > range2.to && context.from <= range2.from || !((_a2 = context.parent) === null || _a2 === void 0 ? void 0 : _a2.parent)))
        context = context.parent;
      return EditorSelection.range(context.to, context.from);
    });
    dispatch(setSel(state, selection));
    return true;
  };
  var simplifySelection = ({ state, dispatch }) => {
    let cur = state.selection, selection = null;
    if (cur.ranges.length > 1)
      selection = EditorSelection.create([cur.main]);
    else if (!cur.main.empty)
      selection = EditorSelection.create([EditorSelection.cursor(cur.main.head)]);
    if (!selection)
      return false;
    dispatch(setSel(state, selection));
    return true;
  };
  function deleteBy(target, by) {
    if (target.state.readOnly)
      return false;
    let event = "delete.selection", { state } = target;
    let changes = state.changeByRange((range2) => {
      let { from, to } = range2;
      if (from == to) {
        let towards = by(from);
        if (towards < from) {
          event = "delete.backward";
          towards = skipAtomic(target, towards, false);
        } else if (towards > from) {
          event = "delete.forward";
          towards = skipAtomic(target, towards, true);
        }
        from = Math.min(from, towards);
        to = Math.max(to, towards);
      } else {
        from = skipAtomic(target, from, false);
        to = skipAtomic(target, to, true);
      }
      return from == to ? { range: range2 } : { changes: { from, to }, range: EditorSelection.cursor(from) };
    });
    if (changes.changes.empty)
      return false;
    target.dispatch(state.update(changes, {
      scrollIntoView: true,
      userEvent: event,
      effects: event == "delete.selection" ? EditorView.announce.of(state.phrase("Selection deleted")) : void 0
    }));
    return true;
  }
  function skipAtomic(target, pos, forward) {
    if (target instanceof EditorView)
      for (let ranges of target.state.facet(EditorView.atomicRanges).map((f) => f(target)))
        ranges.between(pos, pos, (from, to) => {
          if (from < pos && to > pos)
            pos = forward ? to : from;
        });
    return pos;
  }
  var deleteByChar = (target, forward) => deleteBy(target, (pos) => {
    let { state } = target, line = state.doc.lineAt(pos), before, targetPos;
    if (!forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
      if (before[before.length - 1] == "	")
        return pos - 1;
      let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
      for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
        pos--;
      targetPos = pos;
    } else {
      targetPos = findClusterBreak(line.text, pos - line.from, forward, forward) + line.from;
      if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
        targetPos += forward ? 1 : -1;
    }
    return targetPos;
  });
  var deleteCharBackward = (view) => deleteByChar(view, false);
  var deleteCharForward = (view) => deleteByChar(view, true);
  var deleteByGroup = (target, forward) => deleteBy(target, (start) => {
    let pos = start, { state } = target, line = state.doc.lineAt(pos);
    let categorize = state.charCategorizer(pos);
    for (let cat = null; ; ) {
      if (pos == (forward ? line.to : line.from)) {
        if (pos == start && line.number != (forward ? state.doc.lines : 1))
          pos += forward ? 1 : -1;
        break;
      }
      let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
      let nextChar = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
      let nextCat = categorize(nextChar);
      if (cat != null && nextCat != cat)
        break;
      if (nextChar != " " || pos != start)
        cat = nextCat;
      pos = next;
    }
    return pos;
  });
  var deleteGroupBackward = (target) => deleteByGroup(target, false);
  var deleteGroupForward = (target) => deleteByGroup(target, true);
  var deleteToLineEnd = (view) => deleteBy(view, (pos) => {
    let lineEnd = view.lineBlockAt(pos).to;
    return pos < lineEnd ? lineEnd : Math.min(view.state.doc.length, pos + 1);
  });
  var deleteToLineStart = (view) => deleteBy(view, (pos) => {
    let lineStart = view.lineBlockAt(pos).from;
    return pos > lineStart ? lineStart : Math.max(0, pos - 1);
  });
  var splitLine = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range2) => {
      return {
        changes: { from: range2.from, to: range2.to, insert: Text.of(["", ""]) },
        range: EditorSelection.cursor(range2.from)
      };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
  };
  var transposeChars = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range2) => {
      if (!range2.empty || range2.from == 0 || range2.from == state.doc.length)
        return { range: range2 };
      let pos = range2.from, line = state.doc.lineAt(pos);
      let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
      let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
      return {
        changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
        range: EditorSelection.cursor(to)
      };
    });
    if (changes.changes.empty)
      return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
    return true;
  };
  function selectedLineBlocks(state) {
    let blocks = [], upto = -1;
    for (let range2 of state.selection.ranges) {
      let startLine = state.doc.lineAt(range2.from), endLine = state.doc.lineAt(range2.to);
      if (!range2.empty && range2.to == endLine.from)
        endLine = state.doc.lineAt(range2.to - 1);
      if (upto >= startLine.number) {
        let prev = blocks[blocks.length - 1];
        prev.to = endLine.to;
        prev.ranges.push(range2);
      } else {
        blocks.push({ from: startLine.from, to: endLine.to, ranges: [range2] });
      }
      upto = endLine.number + 1;
    }
    return blocks;
  }
  function moveLine(state, dispatch, forward) {
    if (state.readOnly)
      return false;
    let changes = [], ranges = [];
    for (let block of selectedLineBlocks(state)) {
      if (forward ? block.to == state.doc.length : block.from == 0)
        continue;
      let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
      let size = nextLine.length + 1;
      if (forward) {
        changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
        for (let r of block.ranges)
          ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
      } else {
        changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
        for (let r of block.ranges)
          ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
      }
    }
    if (!changes.length)
      return false;
    dispatch(state.update({
      changes,
      scrollIntoView: true,
      selection: EditorSelection.create(ranges, state.selection.mainIndex),
      userEvent: "move.line"
    }));
    return true;
  }
  var moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
  var moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
  function copyLine(state, dispatch, forward) {
    if (state.readOnly)
      return false;
    let changes = [];
    for (let block of selectedLineBlocks(state)) {
      if (forward)
        changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
      else
        changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
    }
    dispatch(state.update({ changes, scrollIntoView: true, userEvent: "input.copyline" }));
    return true;
  }
  var copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
  var copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
  var deleteLine = (view) => {
    if (view.state.readOnly)
      return false;
    let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
      if (from > 0)
        from--;
      else if (to < state.doc.length)
        to++;
      return { from, to };
    }));
    let selection = updateSel(state.selection, (range2) => view.moveVertically(range2, true)).map(changes);
    view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
    return true;
  };
  function isBetweenBrackets(state, pos) {
    if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
      return { from: pos, to: pos };
    let context = syntaxTree(state).resolveInner(pos);
    let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from && !/\S/.test(state.sliceDoc(before.to, after.from)))
      return { from: before.to, to: after.from };
    return null;
  }
  var insertNewlineAndIndent = /* @__PURE__ */ newlineAndIndent(false);
  var insertBlankLine = /* @__PURE__ */ newlineAndIndent(true);
  function newlineAndIndent(atEof) {
    return ({ state, dispatch }) => {
      if (state.readOnly)
        return false;
      let changes = state.changeByRange((range2) => {
        let { from, to } = range2, line = state.doc.lineAt(from);
        let explode = !atEof && from == to && isBetweenBrackets(state, from);
        if (atEof)
          from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
        let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
        let indent = getIndentation(cx, from);
        if (indent == null)
          indent = countColumn(/^\s*/.exec(state.doc.lineAt(from).text)[0], state.tabSize);
        while (to < line.to && /\s/.test(line.text[to - line.from]))
          to++;
        if (explode)
          ({ from, to } = explode);
        else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
          from = line.from;
        let insert3 = ["", indentString(state, indent)];
        if (explode)
          insert3.push(indentString(state, cx.lineIndent(line.from, -1)));
        return {
          changes: { from, to, insert: Text.of(insert3) },
          range: EditorSelection.cursor(from + 1 + insert3[1].length)
        };
      });
      dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
      return true;
    };
  }
  function changeBySelectedLine(state, f) {
    let atLine = -1;
    return state.changeByRange((range2) => {
      let changes = [];
      for (let pos = range2.from; pos <= range2.to; ) {
        let line = state.doc.lineAt(pos);
        if (line.number > atLine && (range2.empty || range2.to > line.from)) {
          f(line, changes, range2);
          atLine = line.number;
        }
        pos = line.to + 1;
      }
      let changeSet = state.changes(changes);
      return {
        changes,
        range: EditorSelection.range(changeSet.mapPos(range2.anchor, 1), changeSet.mapPos(range2.head, 1))
      };
    });
  }
  var indentSelection = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let updated = /* @__PURE__ */ Object.create(null);
    let context = new IndentContext(state, { overrideIndentation: (start) => {
      let found = updated[start];
      return found == null ? -1 : found;
    } });
    let changes = changeBySelectedLine(state, (line, changes2, range2) => {
      let indent = getIndentation(context, line.from);
      if (indent == null)
        return;
      if (!/\S/.test(line.text))
        indent = 0;
      let cur = /^\s*/.exec(line.text)[0];
      let norm = indentString(state, indent);
      if (cur != norm || range2.from < line.from + cur.length) {
        updated[line.from] = indent;
        changes2.push({ from: line.from, to: line.from + cur.length, insert: norm });
      }
    });
    if (!changes.changes.empty)
      dispatch(state.update(changes, { userEvent: "indent" }));
    return true;
  };
  var indentMore = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
      changes.push({ from: line.from, insert: state.facet(indentUnit) });
    }), { userEvent: "input.indent" }));
    return true;
  };
  var indentLess = ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
      let space = /^\s*/.exec(line.text)[0];
      if (!space)
        return;
      let col = countColumn(space, state.tabSize), keep = 0;
      let insert3 = indentString(state, Math.max(0, col - getIndentUnit(state)));
      while (keep < space.length && keep < insert3.length && space.charCodeAt(keep) == insert3.charCodeAt(keep))
        keep++;
      changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert3.slice(keep) });
    }), { userEvent: "delete.dedent" }));
    return true;
  };
  var emacsStyleKeymap = [
    { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
    { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
    { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
    { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
    { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
    { key: "Ctrl-d", run: deleteCharForward },
    { key: "Ctrl-h", run: deleteCharBackward },
    { key: "Ctrl-k", run: deleteToLineEnd },
    { key: "Ctrl-Alt-h", run: deleteGroupBackward },
    { key: "Ctrl-o", run: splitLine },
    { key: "Ctrl-t", run: transposeChars },
    { key: "Ctrl-v", run: cursorPageDown }
  ];
  var standardKeymap = /* @__PURE__ */ [
    { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft, preventDefault: true },
    { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryLeft, shift: selectLineBoundaryLeft, preventDefault: true },
    { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
    { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight, preventDefault: true },
    { mac: "Cmd-ArrowRight", run: cursorLineBoundaryRight, shift: selectLineBoundaryRight, preventDefault: true },
    { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
    { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
    { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
    { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
    { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
    { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
    { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
    { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
    { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
    { key: "Enter", run: insertNewlineAndIndent },
    { key: "Mod-a", run: selectAll },
    { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
    { key: "Delete", run: deleteCharForward },
    { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
    { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
    { mac: "Mod-Backspace", run: deleteToLineStart },
    { mac: "Mod-Delete", run: deleteToLineEnd }
  ].concat(/* @__PURE__ */ emacsStyleKeymap.map((b) => ({ mac: b.key, run: b.run, shift: b.shift })));
  var defaultKeymap = /* @__PURE__ */ [
    { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
    { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
    { key: "Alt-ArrowUp", run: moveLineUp },
    { key: "Shift-Alt-ArrowUp", run: copyLineUp },
    { key: "Alt-ArrowDown", run: moveLineDown },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown },
    { key: "Escape", run: simplifySelection },
    { key: "Mod-Enter", run: insertBlankLine },
    { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
    { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
    { key: "Mod-[", run: indentLess },
    { key: "Mod-]", run: indentMore },
    { key: "Mod-Alt-\\", run: indentSelection },
    { key: "Shift-Mod-k", run: deleteLine },
    { key: "Shift-Mod-\\", run: cursorMatchingBracket },
    { key: "Mod-/", run: toggleComment },
    { key: "Alt-A", run: toggleBlockComment }
  ].concat(standardKeymap);

  // node_modules/crelt/index.js
  function crelt() {
    var elt = arguments[0];
    if (typeof elt == "string")
      elt = document.createElement(elt);
    var i = 1, next = arguments[1];
    if (next && typeof next == "object" && next.nodeType == null && !Array.isArray(next)) {
      for (var name2 in next)
        if (Object.prototype.hasOwnProperty.call(next, name2)) {
          var value = next[name2];
          if (typeof value == "string")
            elt.setAttribute(name2, value);
          else if (value != null)
            elt[name2] = value;
        }
      i++;
    }
    for (; i < arguments.length; i++)
      add(elt, arguments[i]);
    return elt;
  }
  function add(elt, child) {
    if (typeof child == "string") {
      elt.appendChild(document.createTextNode(child));
    } else if (child == null) {
    } else if (child.nodeType != null) {
      elt.appendChild(child);
    } else if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++)
        add(elt, child[i]);
    } else {
      throw new RangeError("Unsupported child node: " + child);
    }
  }

  // node_modules/@codemirror/lint/dist/index.js
  var SelectedDiagnostic = class {
    constructor(from, to, diagnostic) {
      this.from = from;
      this.to = to;
      this.diagnostic = diagnostic;
    }
  };
  var LintState = class _LintState {
    constructor(diagnostics, panel, selected) {
      this.diagnostics = diagnostics;
      this.panel = panel;
      this.selected = selected;
    }
    static init(diagnostics, panel, state) {
      let markedDiagnostics = diagnostics;
      let diagnosticFilter = state.facet(lintConfig).markerFilter;
      if (diagnosticFilter)
        markedDiagnostics = diagnosticFilter(markedDiagnostics);
      let ranges = Decoration.set(markedDiagnostics.map((d) => {
        return d.from == d.to || d.from == d.to - 1 && state.doc.lineAt(d.from).to == d.from ? Decoration.widget({
          widget: new DiagnosticWidget(d),
          diagnostic: d
        }).range(d.from) : Decoration.mark({
          attributes: { class: "cm-lintRange cm-lintRange-" + d.severity + (d.markClass ? " " + d.markClass : "") },
          diagnostic: d
        }).range(d.from, d.to);
      }), true);
      return new _LintState(ranges, panel, findDiagnostic(ranges));
    }
  };
  function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
    let found = null;
    diagnostics.between(after, 1e9, (from, to, { spec }) => {
      if (diagnostic && spec.diagnostic != diagnostic)
        return;
      found = new SelectedDiagnostic(from, to, spec.diagnostic);
      return false;
    });
    return found;
  }
  function hideTooltip(tr, tooltip) {
    let line = tr.startState.doc.lineAt(tooltip.pos);
    return !!(tr.effects.some((e) => e.is(setDiagnosticsEffect)) || tr.changes.touchesRange(line.from, line.to));
  }
  function maybeEnableLint(state, effects) {
    return state.field(lintState, false) ? effects : effects.concat(StateEffect.appendConfig.of(lintExtensions));
  }
  function setDiagnostics(state, diagnostics) {
    return {
      effects: maybeEnableLint(state, [setDiagnosticsEffect.of(diagnostics)])
    };
  }
  var setDiagnosticsEffect = /* @__PURE__ */ StateEffect.define();
  var togglePanel = /* @__PURE__ */ StateEffect.define();
  var movePanelSelection = /* @__PURE__ */ StateEffect.define();
  var lintState = /* @__PURE__ */ StateField.define({
    create() {
      return new LintState(Decoration.none, null, null);
    },
    update(value, tr) {
      if (tr.docChanged) {
        let mapped = value.diagnostics.map(tr.changes), selected = null;
        if (value.selected) {
          let selPos = tr.changes.mapPos(value.selected.from, 1);
          selected = findDiagnostic(mapped, value.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
        }
        value = new LintState(mapped, value.panel, selected);
      }
      for (let effect of tr.effects) {
        if (effect.is(setDiagnosticsEffect)) {
          value = LintState.init(effect.value, value.panel, tr.state);
        } else if (effect.is(togglePanel)) {
          value = new LintState(value.diagnostics, effect.value ? LintPanel.open : null, value.selected);
        } else if (effect.is(movePanelSelection)) {
          value = new LintState(value.diagnostics, value.panel, effect.value);
        }
      }
      return value;
    },
    provide: (f) => [
      showPanel.from(f, (val) => val.panel),
      EditorView.decorations.from(f, (s) => s.diagnostics)
    ]
  });
  var activeMark = /* @__PURE__ */ Decoration.mark({ class: "cm-lintRange cm-lintRange-active" });
  function lintTooltip(view, pos, side) {
    let { diagnostics } = view.state.field(lintState);
    let found = [], stackStart = 2e8, stackEnd = 0;
    diagnostics.between(pos - (side < 0 ? 1 : 0), pos + (side > 0 ? 1 : 0), (from, to, { spec }) => {
      if (pos >= from && pos <= to && (from == to || (pos > from || side > 0) && (pos < to || side < 0))) {
        found.push(spec.diagnostic);
        stackStart = Math.min(from, stackStart);
        stackEnd = Math.max(to, stackEnd);
      }
    });
    let diagnosticFilter = view.state.facet(lintConfig).tooltipFilter;
    if (diagnosticFilter)
      found = diagnosticFilter(found);
    if (!found.length)
      return null;
    return {
      pos: stackStart,
      end: stackEnd,
      above: view.state.doc.lineAt(stackStart).to < stackEnd,
      create() {
        return { dom: diagnosticsTooltip(view, found) };
      }
    };
  }
  function diagnosticsTooltip(view, diagnostics) {
    return crelt("ul", { class: "cm-tooltip-lint" }, diagnostics.map((d) => renderDiagnostic(view, d, false)));
  }
  var closeLintPanel = (view) => {
    let field = view.state.field(lintState, false);
    if (!field || !field.panel)
      return false;
    view.dispatch({ effects: togglePanel.of(false) });
    return true;
  };
  var lintPlugin = /* @__PURE__ */ ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.timeout = -1;
      this.set = true;
      let { delay } = view.state.facet(lintConfig);
      this.lintTime = Date.now() + delay;
      this.run = this.run.bind(this);
      this.timeout = setTimeout(this.run, delay);
    }
    run() {
      let now = Date.now();
      if (now < this.lintTime - 10) {
        this.timeout = setTimeout(this.run, this.lintTime - now);
      } else {
        this.set = false;
        let { state } = this.view, { sources } = state.facet(lintConfig);
        Promise.all(sources.map((source) => Promise.resolve(source(this.view)))).then((annotations) => {
          let all = annotations.reduce((a, b) => a.concat(b));
          if (this.view.state.doc == state.doc)
            this.view.dispatch(setDiagnostics(this.view.state, all));
        }, (error) => {
          logException(this.view.state, error);
        });
      }
    }
    update(update) {
      let config = update.state.facet(lintConfig);
      if (update.docChanged || config != update.startState.facet(lintConfig) || config.needsRefresh && config.needsRefresh(update)) {
        this.lintTime = Date.now() + config.delay;
        if (!this.set) {
          this.set = true;
          this.timeout = setTimeout(this.run, config.delay);
        }
      }
    }
    force() {
      if (this.set) {
        this.lintTime = Date.now();
        this.run();
      }
    }
    destroy() {
      clearTimeout(this.timeout);
    }
  });
  var lintConfig = /* @__PURE__ */ Facet.define({
    combine(input) {
      return Object.assign({ sources: input.map((i) => i.source) }, combineConfig(input.map((i) => i.config), {
        delay: 750,
        markerFilter: null,
        tooltipFilter: null,
        needsRefresh: null
      }, {
        needsRefresh: (a, b) => !a ? b : !b ? a : (u) => a(u) || b(u)
      }));
    }
  });
  function linter(source, config = {}) {
    return [
      lintConfig.of({ source, config }),
      lintPlugin,
      lintExtensions
    ];
  }
  function assignKeys(actions) {
    let assigned = [];
    if (actions)
      actions:
        for (let { name: name2 } of actions) {
          for (let i = 0; i < name2.length; i++) {
            let ch = name2[i];
            if (/[a-zA-Z]/.test(ch) && !assigned.some((c) => c.toLowerCase() == ch.toLowerCase())) {
              assigned.push(ch);
              continue actions;
            }
          }
          assigned.push("");
        }
    return assigned;
  }
  function renderDiagnostic(view, diagnostic, inPanel) {
    var _a2;
    let keys = inPanel ? assignKeys(diagnostic.actions) : [];
    return crelt("li", { class: "cm-diagnostic cm-diagnostic-" + diagnostic.severity }, crelt("span", { class: "cm-diagnosticText" }, diagnostic.renderMessage ? diagnostic.renderMessage() : diagnostic.message), (_a2 = diagnostic.actions) === null || _a2 === void 0 ? void 0 : _a2.map((action, i) => {
      let fired = false, click = (e) => {
        e.preventDefault();
        if (fired)
          return;
        fired = true;
        let found = findDiagnostic(view.state.field(lintState).diagnostics, diagnostic);
        if (found)
          action.apply(view, found.from, found.to);
      };
      let { name: name2 } = action, keyIndex = keys[i] ? name2.indexOf(keys[i]) : -1;
      let nameElt = keyIndex < 0 ? name2 : [
        name2.slice(0, keyIndex),
        crelt("u", name2.slice(keyIndex, keyIndex + 1)),
        name2.slice(keyIndex + 1)
      ];
      return crelt("button", {
        type: "button",
        class: "cm-diagnosticAction",
        onclick: click,
        onmousedown: click,
        "aria-label": ` Action: ${name2}${keyIndex < 0 ? "" : ` (access key "${keys[i]})"`}.`
      }, nameElt);
    }), diagnostic.source && crelt("div", { class: "cm-diagnosticSource" }, diagnostic.source));
  }
  var DiagnosticWidget = class extends WidgetType {
    constructor(diagnostic) {
      super();
      this.diagnostic = diagnostic;
    }
    eq(other) {
      return other.diagnostic == this.diagnostic;
    }
    toDOM() {
      return crelt("span", { class: "cm-lintPoint cm-lintPoint-" + this.diagnostic.severity });
    }
  };
  var PanelItem = class {
    constructor(view, diagnostic) {
      this.diagnostic = diagnostic;
      this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16);
      this.dom = renderDiagnostic(view, diagnostic, true);
      this.dom.id = this.id;
      this.dom.setAttribute("role", "option");
    }
  };
  var LintPanel = class _LintPanel {
    constructor(view) {
      this.view = view;
      this.items = [];
      let onkeydown = (event) => {
        if (event.keyCode == 27) {
          closeLintPanel(this.view);
          this.view.focus();
        } else if (event.keyCode == 38 || event.keyCode == 33) {
          this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
        } else if (event.keyCode == 40 || event.keyCode == 34) {
          this.moveSelection((this.selectedIndex + 1) % this.items.length);
        } else if (event.keyCode == 36) {
          this.moveSelection(0);
        } else if (event.keyCode == 35) {
          this.moveSelection(this.items.length - 1);
        } else if (event.keyCode == 13) {
          this.view.focus();
        } else if (event.keyCode >= 65 && event.keyCode <= 90 && this.selectedIndex >= 0) {
          let { diagnostic } = this.items[this.selectedIndex], keys = assignKeys(diagnostic.actions);
          for (let i = 0; i < keys.length; i++)
            if (keys[i].toUpperCase().charCodeAt(0) == event.keyCode) {
              let found = findDiagnostic(this.view.state.field(lintState).diagnostics, diagnostic);
              if (found)
                diagnostic.actions[i].apply(view, found.from, found.to);
            }
        } else {
          return;
        }
        event.preventDefault();
      };
      let onclick = (event) => {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].dom.contains(event.target))
            this.moveSelection(i);
        }
      };
      this.list = crelt("ul", {
        tabIndex: 0,
        role: "listbox",
        "aria-label": this.view.state.phrase("Diagnostics"),
        onkeydown,
        onclick
      });
      this.dom = crelt("div", { class: "cm-panel-lint" }, this.list, crelt("button", {
        type: "button",
        name: "close",
        "aria-label": this.view.state.phrase("close"),
        onclick: () => closeLintPanel(this.view)
      }, "\xD7"));
      this.update();
    }
    get selectedIndex() {
      let selected = this.view.state.field(lintState).selected;
      if (!selected)
        return -1;
      for (let i = 0; i < this.items.length; i++)
        if (this.items[i].diagnostic == selected.diagnostic)
          return i;
      return -1;
    }
    update() {
      let { diagnostics, selected } = this.view.state.field(lintState);
      let i = 0, needsSync = false, newSelectedItem = null;
      diagnostics.between(0, this.view.state.doc.length, (_start, _end, { spec }) => {
        let found = -1, item;
        for (let j = i; j < this.items.length; j++)
          if (this.items[j].diagnostic == spec.diagnostic) {
            found = j;
            break;
          }
        if (found < 0) {
          item = new PanelItem(this.view, spec.diagnostic);
          this.items.splice(i, 0, item);
          needsSync = true;
        } else {
          item = this.items[found];
          if (found > i) {
            this.items.splice(i, found - i);
            needsSync = true;
          }
        }
        if (selected && item.diagnostic == selected.diagnostic) {
          if (!item.dom.hasAttribute("aria-selected")) {
            item.dom.setAttribute("aria-selected", "true");
            newSelectedItem = item;
          }
        } else if (item.dom.hasAttribute("aria-selected")) {
          item.dom.removeAttribute("aria-selected");
        }
        i++;
      });
      while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
        needsSync = true;
        this.items.pop();
      }
      if (this.items.length == 0) {
        this.items.push(new PanelItem(this.view, {
          from: -1,
          to: -1,
          severity: "info",
          message: this.view.state.phrase("No diagnostics")
        }));
        needsSync = true;
      }
      if (newSelectedItem) {
        this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
        this.view.requestMeasure({
          key: this,
          read: () => ({ sel: newSelectedItem.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect() }),
          write: ({ sel, panel }) => {
            if (sel.top < panel.top)
              this.list.scrollTop -= panel.top - sel.top;
            else if (sel.bottom > panel.bottom)
              this.list.scrollTop += sel.bottom - panel.bottom;
          }
        });
      } else if (this.selectedIndex < 0) {
        this.list.removeAttribute("aria-activedescendant");
      }
      if (needsSync)
        this.sync();
    }
    sync() {
      let domPos = this.list.firstChild;
      function rm2() {
        let prev = domPos;
        domPos = prev.nextSibling;
        prev.remove();
      }
      for (let item of this.items) {
        if (item.dom.parentNode == this.list) {
          while (domPos != item.dom)
            rm2();
          domPos = item.dom.nextSibling;
        } else {
          this.list.insertBefore(item.dom, domPos);
        }
      }
      while (domPos)
        rm2();
    }
    moveSelection(selectedIndex) {
      if (this.selectedIndex < 0)
        return;
      let field = this.view.state.field(lintState);
      let selection = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
      if (!selection)
        return;
      this.view.dispatch({
        selection: { anchor: selection.from, head: selection.to },
        scrollIntoView: true,
        effects: movePanelSelection.of(selection)
      });
    }
    static open(view) {
      return new _LintPanel(view);
    }
  };
  function svg(content2, attrs = `viewBox="0 0 40 40"`) {
    return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${encodeURIComponent(content2)}</svg>')`;
  }
  function underline(color) {
    return svg(`<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>`, `width="6" height="3"`);
  }
  var baseTheme2 = /* @__PURE__ */ EditorView.baseTheme({
    ".cm-diagnostic": {
      padding: "3px 6px 3px 8px",
      marginLeft: "-1px",
      display: "block",
      whiteSpace: "pre-wrap"
    },
    ".cm-diagnostic-error": { borderLeft: "5px solid #d11" },
    ".cm-diagnostic-warning": { borderLeft: "5px solid orange" },
    ".cm-diagnostic-info": { borderLeft: "5px solid #999" },
    ".cm-diagnostic-hint": { borderLeft: "5px solid #66d" },
    ".cm-diagnosticAction": {
      font: "inherit",
      border: "none",
      padding: "2px 4px",
      backgroundColor: "#444",
      color: "white",
      borderRadius: "3px",
      marginLeft: "8px",
      cursor: "pointer"
    },
    ".cm-diagnosticSource": {
      fontSize: "70%",
      opacity: 0.7
    },
    ".cm-lintRange": {
      backgroundPosition: "left bottom",
      backgroundRepeat: "repeat-x",
      paddingBottom: "0.7px"
    },
    ".cm-lintRange-error": { backgroundImage: /* @__PURE__ */ underline("#d11") },
    ".cm-lintRange-warning": { backgroundImage: /* @__PURE__ */ underline("orange") },
    ".cm-lintRange-info": { backgroundImage: /* @__PURE__ */ underline("#999") },
    ".cm-lintRange-hint": { backgroundImage: /* @__PURE__ */ underline("#66d") },
    ".cm-lintRange-active": { backgroundColor: "#ffdd9980" },
    ".cm-tooltip-lint": {
      padding: 0,
      margin: 0
    },
    ".cm-lintPoint": {
      position: "relative",
      "&:after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: "-2px",
        borderLeft: "3px solid transparent",
        borderRight: "3px solid transparent",
        borderBottom: "4px solid #d11"
      }
    },
    ".cm-lintPoint-warning": {
      "&:after": { borderBottomColor: "orange" }
    },
    ".cm-lintPoint-info": {
      "&:after": { borderBottomColor: "#999" }
    },
    ".cm-lintPoint-hint": {
      "&:after": { borderBottomColor: "#66d" }
    },
    ".cm-panel.cm-panel-lint": {
      position: "relative",
      "& ul": {
        maxHeight: "100px",
        overflowY: "auto",
        "& [aria-selected]": {
          backgroundColor: "#ddd",
          "& u": { textDecoration: "underline" }
        },
        "&:focus [aria-selected]": {
          background_fallback: "#bdf",
          backgroundColor: "Highlight",
          color_fallback: "white",
          color: "HighlightText"
        },
        "& u": { textDecoration: "none" },
        padding: 0,
        margin: 0
      },
      "& [name=close]": {
        position: "absolute",
        top: "0",
        right: "2px",
        background: "inherit",
        border: "none",
        font: "inherit",
        padding: 0,
        margin: 0
      }
    }
  });
  var lintExtensions = [
    lintState,
    /* @__PURE__ */ EditorView.decorations.compute([lintState], (state) => {
      let { selected, panel } = state.field(lintState);
      return !selected || !panel || selected.from == selected.to ? Decoration.none : Decoration.set([
        activeMark.range(selected.from, selected.to)
      ]);
    }),
    /* @__PURE__ */ hoverTooltip(lintTooltip, { hideOn: hideTooltip }),
    baseTheme2
  ];

  // src/repl/code-input.tsx
  var _tmpl$11 = /* @__PURE__ */ template(`<div class="horizontal"><div class="repl-input"></div><button class="run-button">Roll`);
  function getDiceRollerSyntaxHighlightingFromAST(ast2) {
    const decorations2 = [];
    function map(node) {
      const markNode = (tags2, count) => {
        const startIndex = node[position].start.index();
        decorations2.push(Decoration.mark({
          class: defaultHighlightStyle.style([tags2]) ?? void 0
        }).range(startIndex, startIndex + (count ?? node[position].length)));
      };
      if (node.type === "Number") {
        markNode(tags.number);
      }
      if (node.type === "FunctionCall") {
        markNode(tags.keyword, node.functionName.length);
      }
      mapOverASTChildren(node, map);
    }
    map(ast2);
    return RangeSet.of(decorations2, true);
  }
  function getDiceRollerSyntaxHighlightingFromString(src) {
    return getDiceRollerSyntaxHighlightingFromAST(parseDiceRoller(src));
  }
  function diceRollerSyntaxHighlighterPlugin() {
    let decorations2 = RangeSet.of([]);
    return ViewPlugin.define((view) => {
      return {
        update(update) {
          decorations2 = getDiceRollerSyntaxHighlightingFromString(update.view.state.doc.toString());
          return decorations2;
        }
      };
    }, {
      decorations(update) {
        console.log("DECORATIONS", decorations2);
        return decorations2;
      }
    });
  }
  function diceRollerDiagnosticPlugin() {
    return linter((view) => {
      const diagnostics = [];
      function map(node) {
        if (node.type === "Error") {
          const from = node[position].start.index();
          diagnostics.push({
            from,
            to: from + node[position].length,
            severity: "error",
            message: node.reason
          });
        }
        mapOverASTChildren(node, map);
      }
      map(parseDiceRoller(view.state.doc.toString()));
      return diagnostics;
    });
  }
  function CodeInput(props) {
    return (() => {
      const _el$ = _tmpl$11(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
      use((el) => {
        const extensions = () => [syntaxHighlighting(defaultHighlightStyle, {
          fallback: true
        }), keymap.of([{
          key: "Enter",
          run() {
            props.run();
            return true;
          }
        }]), keymap.of(defaultKeymap), EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            const docstring = v.state.doc.toString();
            props.setCode(docstring);
          }
        }), diceRollerSyntaxHighlighterPlugin(), diceRollerDiagnosticPlugin()];
        const state = EditorState.create({
          doc: props.code(),
          extensions: extensions()
        });
        createEffect(() => {
          untrack(() => {
            view.setState(EditorState.create({
              doc: props.code(),
              extensions: extensions()
            }));
          });
        });
        const view = new EditorView({
          state,
          parent: el
        });
      }, _el$2);
      _el$3.$$click = () => {
        props.run();
      };
      return _el$;
    })();
  }
  delegateEvents(["click"]);

  // src/repl/info.tsx
  var _tmpl$12 = /* @__PURE__ */ template(`<div class="info"><h1>Dice Roller</h1><h2>Development</h2><p>Suggestions? Questions? Bug reports? Anything else of the sort? <a href="https://github.com/radian628/dice-roller">I'd love to see your feedback on GitHub here!</a></p><h2>Examples</h2><ul><li>Roll 2d6 and add 3: <br><code>2d6 + 3</code></li><li>Roll 2d6 and subtract 3: <br><code>2d6 - 3</code></li><li>Roll 1d4 + 5 8 times and add them together: <br><code>1d4 + 5 x8</code></li><li>Roll 1d4 and multiply it by 5: <br><code>1d4 * 5</code></li><li>Roll 1d8 and divide it by 2 (rounded down): <br><code>1d8 / 2</code></li><li>Roll 1d100: <br><code>1d100</code></li><li>Damage types: <br><code>1d12 slashing + 2d6 fire</code></li><li>Attack with a +5 modifier against an enemy with 13 AC, dealing 1d8+5 slashing damage: <br><code>attack(1d20+5, 13, 1d8+5 slashing)</code></li><li>Roll a d20 with advantage: <br><code>adv(1d20)</code></li><li>Did I roll higher than a 3 on a d6 and less than or equal to a 4 on a d8?: <br><code>1d6 &gt; 3 and 1d8 &lt;= 4</code></li><li>If I fail my +7 DEX save on the fireball, deal 8d6 fire damage. Instead, deal half that.<br><code>1d20 + 7 &lt; 17 ? 8d6 fire : 8d6/2 fire`);
  function Info() {
    return _tmpl$12();
  }

  // src/utils/platform.tsx
  var import_is_mobile = __toESM(require_is_mobile(), 1);
  function DesktopOnly(props) {
    return createComponent(Show, {
      get when() {
        return !(0, import_is_mobile.isMobile)();
      },
      get children() {
        return props.children;
      }
    });
  }

  // src/repl/repl.tsx
  var _tmpl$13 = /* @__PURE__ */ template(`<div class="repl"><div class="horizontal repl-evaluations-container"><div class="repl-evaluations">`);
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
      const _el$ = _tmpl$13(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
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
      insert(_el$2, createComponent(DesktopOnly, {
        get children() {
          return createComponent(Info, {});
        }
      }), null);
      insert(_el$, createComponent(CodeInput, {
        code,
        setCode,
        run: handleSubmit
      }), null);
      return _el$;
    })();
  }

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
