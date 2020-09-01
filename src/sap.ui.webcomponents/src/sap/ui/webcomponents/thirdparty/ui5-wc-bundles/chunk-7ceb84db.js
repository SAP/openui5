sap.ui.define(['exports'], function (exports) { 'use strict';

  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  !(function(global) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    var inModule = typeof module === "object";
    var runtime = global.regeneratorRuntime;
    if (runtime) {
      if (inModule) {
        // If regeneratorRuntime is defined globally and we're in a module,
        // make the exports object identical to regeneratorRuntime.
        module.exports = runtime;
      }
      // Don't bother evaluating the rest of this file if the runtime was
      // already defined globally.
      return;
    }

    // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.
    runtime = global.regeneratorRuntime = inModule ? module.exports : {};

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    runtime.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    runtime.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    runtime.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    runtime.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    runtime.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    runtime.async = function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );

      return runtime.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          if (delegate.iterator.return) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    runtime.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    runtime.values = values;

    function doneResult() {
      return { value: undefined, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined;
        }

        return ContinueSentinel;
      }
    };
  })(
    // In sloppy mode, unbound `this` refers to the global object, fallback to
    // Function constructor if we're in global strict mode. That is sadly a form
    // of indirect eval which violates Content Security Policy.
    (function() {
      return this || (typeof self === "object" && self);
    })() || Function("return this")()
  );

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _taggedTemplateLiteral(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var features = new Map();

  var registerFeature = function registerFeature(name, feature) {
    features.set(name, feature);
  };

  var getFeature = function getFeature(name) {
    return features.get(name);
  };

  var class2type = {};
  var hasOwn = class2type.hasOwnProperty;
  var toString = class2type.toString;
  var fnToString = hasOwn.toString;
  var ObjectFunctionString = fnToString.call(Object);

  var fnIsPlainObject = function fnIsPlainObject(obj) {
    var proto, Ctor;

    if (!obj || toString.call(obj) !== "[object Object]") {
      return false;
    }

    proto = Object.getPrototypeOf(obj);

    if (!proto) {
      return true;
    }

    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
  };

  var oToken = Object.create(null);

  var fnMerge = function fnMerge() {
    var src,
        copyIsArray,
        copy,
        name,
        options,
        clone,
        target = arguments[2] || {},
        i = 3,
        length = arguments.length,
        deep = arguments[0] || false,
        skipToken = arguments[1] ? undefined : oToken;

    if (_typeof(target) !== 'object' && typeof target !== 'function') {
      target = {};
    }

    for (; i < length; i++) {
      if ((options = arguments[i]) != null) {
        for (name in options) {
          src = target[name];
          copy = options[name];

          if (name === '__proto__' || target === copy) {
            continue;
          }

          if (deep && copy && (fnIsPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src && fnIsPlainObject(src) ? src : {};
            }

            target[name] = fnMerge(deep, arguments[1], clone, copy);
          } else if (copy !== skipToken) {
            target[name] = copy;
          }
        }
      }
    }

    return target;
  };

  var fnMerge$1 = function fnMerge$$1() {
    var args = [true, false];
    args.push.apply(args, arguments);
    return fnMerge.apply(null, args);
  };

  var assetParameters = {
    "themes": {
      "default": "sap_fiori_3",
      "all": ["sap_fiori_3", "sap_fiori_3_dark", "sap_belize", "sap_belize_hcb", "sap_belize_hcw", "sap_fiori_3_hcb", "sap_fiori_3_hcw"]
    },
    "languages": {
      "default": "en",
      "all": ["ar", "bg", "ca", "cs", "da", "de", "el", "en", "es", "et", "fi", "fr", "hi", "hr", "hu", "it", "iw", "ja", "kk", "ko", "lt", "lv", "ms", "nl", "no", "pl", "pt", "ro", "ru", "sh", "sk", "sl", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_TW"]
    },
    "locales": {
      "default": "en",
      "all": ["ar", "ar_EG", "ar_SA", "bg", "ca", "cs", "da", "de", "de_AT", "de_CH", "el", "el_CY", "en", "en_AU", "en_GB", "en_HK", "en_IE", "en_IN", "en_NZ", "en_PG", "en_SG", "en_ZA", "es", "es_AR", "es_BO", "es_CL", "es_CO", "es_MX", "es_PE", "es_UY", "es_VE", "et", "fa", "fi", "fr", "fr_BE", "fr_CA", "fr_CH", "fr_LU", "he", "hi", "hr", "hu", "id", "it", "it_CH", "ja", "kk", "ko", "lt", "lv", "ms", "nb", "nl", "nl_BE", "pl", "pt", "pt_PT", "ro", "ru", "ru_UA", "sk", "sl", "sr", "sv", "th", "tr", "uk", "vi", "zh_CN", "zh_HK", "zh_SG", "zh_TW"]
    }
  };
  var DEFAULT_THEME = assetParameters.themes["default"];
  var DEFAULT_LANGUAGE = assetParameters.languages["default"];
  var DEFAULT_LOCALE = assetParameters.locales["default"];
  var SUPPORTED_LOCALES = assetParameters.locales.all;

  var initialized = false;
  var initialConfig = {
    animationMode: "full",
    theme: DEFAULT_THEME,
    rtl: null,
    language: null,
    calendarType: null,
    noConflict: false,
    // no URL
    formatSettings: {},
    useDefaultLanguage: false,
    assetsPath: ""
  };
  /* General settings */

  var getAnimationMode = function getAnimationMode() {
    initConfiguration();
    return initialConfig.animationMode;
  };

  var getTheme = function getTheme() {
    initConfiguration();
    return initialConfig.theme;
  };

  var getRTL = function getRTL() {
    initConfiguration();
    return initialConfig.rtl;
  };

  var getLanguage = function getLanguage() {
    initConfiguration();
    return initialConfig.language;
  };
  /**
   * Returns if the default language, that is inlined build time,
   * should be used, instead of trying fetching the language over the network.
   * @returns {Boolean}
   */


  var getUseDefaultLanguage = function getUseDefaultLanguage() {
    initConfiguration();
    return initialConfig.useDefaultLanguage;
  };

  var getNoConflict = function getNoConflict() {
    initConfiguration();
    return initialConfig.noConflict;
  };

  var getCalendarType = function getCalendarType() {
    initConfiguration();
    return initialConfig.calendarType;
  };

  var getFormatSettings = function getFormatSettings() {
    initConfiguration();
    return initialConfig.formatSettings;
  };

  var getAssetsPath = function getAssetsPath() {
    initConfiguration();
    return initialConfig.assetsPath;
  };

  var booleanMapping = new Map();
  booleanMapping.set("true", true);
  booleanMapping.set("false", false);

  var parseConfigurationScript = function parseConfigurationScript() {
    var configScript = document.querySelector("[data-ui5-config]") || document.querySelector("[data-id='sap-ui-config']"); // for backward compatibility

    var configJSON;

    if (configScript) {
      try {
        configJSON = JSON.parse(configScript.innerHTML);
      } catch (err) {
        console.warn("Incorrect data-sap-ui-config format. Please use JSON");
        /* eslint-disable-line */
      }

      if (configJSON) {
        initialConfig = fnMerge$1(initialConfig, configJSON);
      }
    }
  };

  var parseURLParameters = function parseURLParameters() {
    var params = new URLSearchParams(window.location.search);
    params.forEach(function (value, key) {
      if (!key.startsWith("sap-ui")) {
        return;
      }

      var lowerCaseValue = value.toLowerCase();
      var param = key.split("sap-ui-")[1];

      if (booleanMapping.has(value)) {
        value = booleanMapping.get(lowerCaseValue);
      }

      initialConfig[param] = value;
    });
  };

  var applyOpenUI5Configuration = function applyOpenUI5Configuration() {
    var OpenUI5Support = getFeature("OpenUI5Support");

    if (!OpenUI5Support || !OpenUI5Support.isLoaded()) {
      return;
    }

    var OpenUI5Config = OpenUI5Support.getConfigurationSettingsObject();
    initialConfig = fnMerge$1(initialConfig, OpenUI5Config);
  };

  var initConfiguration = function initConfiguration() {
    if (initialized) {
      return;
    } // 1. Lowest priority - configuration script


    parseConfigurationScript(); // 2. URL parameters overwrite configuration script parameters

    parseURLParameters(); // 3. If OpenUI5 is detected, it has the highest priority

    applyOpenUI5Configuration();
    initialized = true;
  };

  var fetchPromises = new Map();
  var jsonPromises = new Map();
  var textPromises = new Map();

  var fetchTextOnce =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(url) {
      var response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!fetchPromises.get(url)) {
                fetchPromises.set(url, fetch(url));
              }

              _context.next = 3;
              return fetchPromises.get(url);

            case 3:
              response = _context.sent;

              if (!textPromises.get(url)) {
                textPromises.set(url, response.text());
              }

              return _context.abrupt("return", textPromises.get(url));

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function fetchTextOnce(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var fetchJsonOnce =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(url) {
      var response;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!fetchPromises.get(url)) {
                fetchPromises.set(url, fetch(url));
              }

              _context2.next = 3;
              return fetchPromises.get(url);

            case 3:
              response = _context2.sent;

              if (!jsonPromises.get(url)) {
                jsonPromises.set(url, response.json());
              }

              return _context2.abrupt("return", jsonPromises.get(url));

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function fetchJsonOnce(_x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  /**
   * ""                        -> ""
   * "noExtension"             -> ""
   * "file.txt"                -> ".txt"
   * "file.with.many.dots.doc" -> ".doc"
   * ".gitignore"              -> ""
   *
   * @param fileName - the file name
   * @returns {string}
   */
  var getFileExtension = function getFileExtension(fileName) {
    var dotPos = fileName.lastIndexOf(".");

    if (dotPos < 1) {
      return "";
    }

    return fileName.slice(dotPos);
  };

  var assetsPath;

  var getAssetsPath$1 = function getAssetsPath$$1() {
    if (assetsPath === undefined) {
      assetsPath = getAssetsPath();
    }

    return assetsPath;
  };
   // eslint-disable-line

  var getEffectiveAssetPath = function getEffectiveAssetPath(asset) {
    var assetsPath = getAssetsPath$1();

    if (assetsPath && typeof asset === "string") {
      return "".concat(assetsPath).concat(asset);
    }

    return asset;
  };

  var themeURLs = new Map();
  var themeStyles = new Map();
  var registeredPackages = new Set();
  var registeredThemes = new Set();
  /**
   * Used to provide CSS Vars for a specific theme for a specific package.
   * The CSS Vars can be passed directly as a string (containing them), as an object with a "_" property(containing them in the "_" property), or as a URL.
   * This URL must point to a JSON file, containing a "_" property.
   *
   * Example usage:
   *  1) Pass the CSS Vars as a string directly.
   *  registerThemeProperties("my-package", "my_theme", ":root{--var1: red;}");
   *  2) Pass the CSS Vars as an object directly
   *  registerThemeProperties("my-package", "my_theme", {"_": ":root{--var1: red;}"});
   *  3) Pass a URL to a CSS file, containing the CSS Vars. Will be fetched on demand, not upon registration.
   *  registerThemeProperties("my-package", "my_theme", "http://url/to/my/theme.css");
   *  4) Pass a URL to a JSON file, containing the CSS Vars in its "_" property. Will be fetched on demand, not upon registration.
   *  registerThemeProperties("my-package", "my_theme", "http://url/to/my/theme.json");
   *
   * @public
   * @param packageName - the NPM package for which CSS Vars are registered
   * @param themeName - the theme which the CSS Vars implement
   * @param style - can be one of four options: a string, an object with a "_" property, URL to a CSS file, or URL to a JSON file with a "_" property
   */

  var registerThemeProperties = function registerThemeProperties(packageName, themeName, style) {
    if (style._) {
      // JSON object like ({"_": ":root"})
      themeStyles.set("".concat(packageName, "_").concat(themeName), style._);
    } else if (style.includes(":root") || style === "") {
      // pure string, including empty string
      themeStyles.set("".concat(packageName, "_").concat(themeName), style);
    } else {
      // url for fetching
      themeURLs.set("".concat(packageName, "_").concat(themeName), style);
    }

    registeredPackages.add(packageName);
    registeredThemes.add(themeName);
  };

  var getThemeProperties =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(packageName, themeName) {
      var style, regThemesStr, data, themeProps;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              style = themeStyles.get("".concat(packageName, "_").concat(themeName));

              if (!(style !== undefined)) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", style);

            case 3:
              if (registeredThemes.has(themeName)) {
                _context.next = 7;
                break;
              }

              regThemesStr = _toConsumableArray(registeredThemes.values()).join(", ");
              console.warn("You have requested a non-registered theme - falling back to ".concat(DEFAULT_THEME, ". Registered themes are: ").concat(regThemesStr));
              /* eslint-disable-line */

              return _context.abrupt("return", themeStyles.get("".concat(packageName, "_").concat(DEFAULT_THEME)));

            case 7:
              _context.next = 9;
              return fetchThemeProperties(packageName, themeName);

            case 9:
              data = _context.sent;
              themeProps = data._ || data;
              themeStyles.set("".concat(packageName, "_").concat(themeName), themeProps);
              return _context.abrupt("return", themeProps);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function getThemeProperties(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  var fetchThemeProperties =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(packageName, themeName) {
      var url;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              url = themeURLs.get("".concat(packageName, "_").concat(themeName));

              if (url) {
                _context2.next = 3;
                break;
              }

              throw new Error("You have to import the ".concat(packageName, "/dist/Assets.js module to switch to additional themes"));

            case 3:
              return _context2.abrupt("return", getFileExtension(url) === ".css" ? fetchTextOnce(url) : fetchJsonOnce(getEffectiveAssetPath(url)));

            case 4:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function fetchThemeProperties(_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  var getRegisteredPackages = function getRegisteredPackages() {
    return registeredPackages;
  };

  var isThemeRegistered = function isThemeRegistered(theme) {
    return registeredThemes.has(theme);
  };

  /**
   * Creates a <style> tag in the <head> tag
   * @param cssText - the CSS
   * @param attributes - optional attributes to add to the tag
   * @returns {HTMLElement}
   */
  var createStyleInHead = function createStyleInHead(cssText) {
    var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var style = document.createElement("style");
    style.type = "text/css";
    Object.entries(attributes).forEach(function (pair) {
      return style.setAttribute.apply(style, _toConsumableArray(pair));
    });
    style.textContent = cssText;
    document.head.appendChild(style);
    return style;
  };

  /**
   * Creates/updates a style element holding all CSS Custom Properties
   * @param cssText
   * @param packageName
   */

  var createThemePropertiesStyleTag = function createThemePropertiesStyleTag(cssText, packageName) {
    var styleElement = document.head.querySelector("style[data-ui5-theme-properties=\"".concat(packageName, "\"]"));

    if (styleElement) {
      styleElement.textContent = cssText || ""; // in case of undefined
    } else {
      var attributes = {
        "data-ui5-theme-properties": packageName
      };
      createStyleInHead(cssText, attributes);
    }
  };

  var getThemeMetadata = function getThemeMetadata() {
    // Check if the class was already applied, most commonly to the link/style tag with the CSS Variables
    var el = document.querySelector(".sapThemeMetaData-Base-baseLib");

    if (el) {
      return getComputedStyle(el).backgroundImage;
    }

    el = document.createElement("span");
    el.style.display = "none";
    el.classList.add("sapThemeMetaData-Base-baseLib");
    document.body.appendChild(el);
    var metadata = getComputedStyle(el).backgroundImage;
    document.body.removeChild(el);
    return metadata;
  };

  var parseThemeMetadata = function parseThemeMetadata(metadataString) {
    var params = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(metadataString);

    if (params && params.length >= 2) {
      var paramsString = params[1];
      paramsString = paramsString.replace(/\\"/g, "\"");

      if (paramsString.charAt(0) !== "{" && paramsString.charAt(paramsString.length - 1) !== "}") {
        try {
          paramsString = decodeURIComponent(paramsString);
        } catch (ex) {
          console.warn("Malformed theme metadata string, unable to decodeURIComponent"); // eslint-disable-line

          return;
        }
      }

      try {
        return JSON.parse(paramsString);
      } catch (ex) {
        console.warn("Malformed theme metadata string, unable to parse JSON"); // eslint-disable-line
      }
    }
  };

  var processThemeMetadata = function processThemeMetadata(metadata) {
    var themeName;
    var baseThemeName;

    try {
      themeName = metadata.Path.match(/\.([^.]+)\.css_variables$/)[1];
      baseThemeName = metadata.Extends[0];
    } catch (ex) {
      console.warn("Malformed theme metadata Object", metadata); // eslint-disable-line

      return;
    }

    return {
      themeName: themeName,
      baseThemeName: baseThemeName
    };
  };

  var getThemeDesignerTheme = function getThemeDesignerTheme() {
    var metadataString = getThemeMetadata();

    if (!metadataString || metadataString === "none") {
      return;
    }

    var metadata = parseThemeMetadata(metadataString);
    return processThemeMetadata(metadata);
  };

  var ponyfillTimer;

  var ponyfillNeeded = function ponyfillNeeded() {
    return !!window.CSSVarsPonyfill;
  };

  var runPonyfill = function runPonyfill() {
    ponyfillTimer = undefined;
    window.CSSVarsPonyfill.cssVars({
      rootElement: document.head,
      silent: true
    });
  };

  var schedulePonyfill = function schedulePonyfill() {
    if (!ponyfillTimer) {
      ponyfillTimer = window.setTimeout(runPonyfill, 0);
    }
  };

  var BASE_THEME_PACKAGE = "@ui5/webcomponents-theme-base";

  var isThemeBaseRegistered = function isThemeBaseRegistered() {
    var registeredPackages = getRegisteredPackages();
    return registeredPackages.has(BASE_THEME_PACKAGE);
  };

  var loadThemeBase =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(theme) {
      var cssText;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (isThemeBaseRegistered()) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return");

            case 2:
              _context.next = 4;
              return getThemeProperties(BASE_THEME_PACKAGE, theme);

            case 4:
              cssText = _context.sent;
              createThemePropertiesStyleTag(cssText, BASE_THEME_PACKAGE);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function loadThemeBase(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var deleteThemeBase = function deleteThemeBase() {
    var styleElement = document.head.querySelector("style[data-ui5-theme-properties=\"".concat(BASE_THEME_PACKAGE, "\"]"));

    if (styleElement) {
      styleElement.parentElement.removeChild(styleElement);
    }
  };

  var loadComponentPackages =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(theme) {
      var registeredPackages;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              registeredPackages = getRegisteredPackages();
              registeredPackages.forEach(
              /*#__PURE__*/
              function () {
                var _ref3 = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee2(packageName) {
                  var cssText;
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          if (!(packageName === BASE_THEME_PACKAGE)) {
                            _context2.next = 2;
                            break;
                          }

                          return _context2.abrupt("return");

                        case 2:
                          _context2.next = 4;
                          return getThemeProperties(packageName, theme);

                        case 4:
                          cssText = _context2.sent;
                          createThemePropertiesStyleTag(cssText, packageName);

                        case 6:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                return function (_x3) {
                  return _ref3.apply(this, arguments);
                };
              }());

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function loadComponentPackages(_x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  var detectExternalTheme = function detectExternalTheme() {
    // If theme designer theme is detected, use this
    var extTheme = getThemeDesignerTheme();

    if (extTheme) {
      return extTheme;
    } // If OpenUI5Support is enabled, try to find out if it loaded variables


    var OpenUI5Support = getFeature("OpenUI5Support");

    if (OpenUI5Support) {
      var varsLoaded = OpenUI5Support.cssVariablesLoaded();

      if (varsLoaded) {
        return {
          themeName: OpenUI5Support.getConfigurationSettingsObject().theme // just themeName, baseThemeName is only relevant for custom themes

        };
      }
    }
  };

  var applyTheme =
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4(theme) {
      var extTheme, packagesTheme;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              extTheme = detectExternalTheme(); // Only load theme_base properties if there is no externally loaded theme, or there is, but it is not being loaded

              if (!(!extTheme || theme !== extTheme.themeName)) {
                _context4.next = 6;
                break;
              }

              _context4.next = 4;
              return loadThemeBase(theme);

            case 4:
              _context4.next = 7;
              break;

            case 6:
              deleteThemeBase();

            case 7:
              // Always load component packages properties. For non-registered themes, try with the base theme, if any
              packagesTheme = isThemeRegistered(theme) ? theme : extTheme && extTheme.baseThemeName;
              _context4.next = 10;
              return loadComponentPackages(packagesTheme);

            case 10:
              // When changing the theme, run the ponyfill immediately
              if (ponyfillNeeded()) {
                runPonyfill();
              }

            case 11:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function applyTheme(_x4) {
      return _ref4.apply(this, arguments);
    };
  }();

  var theme;

  var getTheme$1 = function getTheme$$1() {
    if (theme === undefined) {
      theme = getTheme();
    }

    return theme;
  };

  var setTheme =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(newTheme) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(theme === newTheme)) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return");

            case 2:
              theme = newTheme; // Update CSS Custom Properties

              _context.next = 5;
              return applyTheme(theme);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function setTheme(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var sap$1 = window.sap;
  var core = sap$1 && sap$1.ui && typeof sap$1.ui.getCore === "function" && sap$1.ui.getCore();

  var isLoaded = function isLoaded() {
    return !!core;
  };

  var init = function init() {
    if (!core) {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      core.attachInit(function () {
        sap$1.ui.require(["sap/ui/core/LocaleData"], resolve);
      });
    });
  };

  var getConfigurationSettingsObject = function getConfigurationSettingsObject() {
    if (!core) {
      return;
    }

    var config = core.getConfiguration();

    var LocaleData = sap$1.ui.require("sap/ui/core/LocaleData");

    return {
      animationMode: config.getAnimationMode(),
      language: config.getLanguage(),
      theme: config.getTheme(),
      rtl: config.getRTL(),
      calendarType: config.getCalendarType(),
      formatSettings: {
        firstDayOfWeek: LocaleData ? LocaleData.getInstance(config.getLocale()).getFirstDayOfWeek() : undefined
      }
    };
  };

  var getLocaleDataObject = function getLocaleDataObject() {
    if (!core) {
      return;
    }

    var config = core.getConfiguration();

    var LocaleData = sap$1.ui.require("sap/ui/core/LocaleData");

    return LocaleData.getInstance(config.getLocale())._get();
  };

  var listenForThemeChange = function listenForThemeChange() {
    var config = core.getConfiguration();
    core.attachThemeChanged(
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return setTheme(config.getTheme());

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));
  };

  var attachListeners = function attachListeners() {
    if (!core) {
      return;
    }

    listenForThemeChange();
  };

  var cssVariablesLoaded = function cssVariablesLoaded() {
    if (!core) {
      return;
    }

    var link = _toConsumableArray(document.head.children).find(function (el) {
      return el.id === "sap-ui-theme-sap.ui.core";
    }); // more reliable than querySelector early


    if (!link) {
      return;
    }

    return !!link.href.match(/\/css(-|_)variables\.css/);
  };

  var OpenUI5Support = {
    isLoaded: isLoaded,
    init: init,
    getConfigurationSettingsObject: getConfigurationSettingsObject,
    getLocaleDataObject: getLocaleDataObject,
    attachListeners: attachListeners,
    cssVariablesLoaded: cssVariablesLoaded
  };
  registerFeature("OpenUI5Support", OpenUI5Support);

  var resources = new Map();
  var cldrData = {};
  var cldrUrls = {}; // externally configurable mapping function for resolving (localeId -> URL)
  // default implementation - ui5 CDN

  var cldrMappingFn = function cldrMappingFn(locale) {
    return "https://ui5.sap.com/1.60.2/resources/sap/ui/core/cldr/".concat(locale, ".json");
  };

  var M_ISO639_OLD_TO_NEW = {
    "iw": "he",
    "ji": "yi",
    "in": "id",
    "sh": "sr"
  };

  var calcLocale = function calcLocale(language, region, script) {
    // normalize language and handle special cases
    language = language && M_ISO639_OLD_TO_NEW[language] || language; // Special case 1: in an SAP context, the inclusive language code "no" always means Norwegian Bokmal ("nb")

    if (language === "no") {
      language = "nb";
    } // Special case 2: for Chinese, derive a default region from the script (this behavior is inherited from Java)


    if (language === "zh" && !region) {
      if (script === "Hans") {
        region = "CN";
      } else if (script === "Hant") {
        region = "TW";
      }
    } // try language + region


    var localeId = "".concat(language, "_").concat(region);

    if (!SUPPORTED_LOCALES.includes(localeId)) {
      // fallback to language only
      localeId = language;
    }

    if (!SUPPORTED_LOCALES.includes(localeId)) {
      // fallback to english
      localeId = DEFAULT_LOCALE;
    }

    return localeId;
  };

  var resolveMissingMappings = function resolveMissingMappings() {
    if (!cldrMappingFn) {
      return;
    }

    var missingLocales = SUPPORTED_LOCALES.filter(function (locale) {
      return !cldrData[locale] && !cldrUrls[locale];
    });
    missingLocales.forEach(function (locale) {
      cldrUrls[locale] = cldrMappingFn(locale);
    });
  };

  var registerModuleContent = function registerModuleContent(moduleName, content) {
    resources.set(moduleName, content);
  };

  var getModuleContent = function getModuleContent(moduleName) {
    var moduleContent = resources.get(moduleName);

    if (moduleContent) {
      return moduleContent;
    }

    var missingModule = moduleName.match(/sap\/ui\/core\/cldr\/(\w+)\.json/);

    if (missingModule) {
      throw new Error("CLDR data for locale ".concat(missingModule[1], " is not loaded!"));
    }

    throw new Error("Unknown module ".concat(moduleName));
  };

  var fetchCldr =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(language, region, script) {
      var localeId, cldrObj, url, OpenUI5Support, cldrContent;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              resolveMissingMappings();
              localeId = calcLocale(language, region, script);
              cldrObj = cldrData[localeId];
              url = cldrUrls[localeId];
              OpenUI5Support = getFeature("OpenUI5Support");

              if (!cldrObj && OpenUI5Support) {
                cldrObj = OpenUI5Support.getLocaleDataObject();
              }

              if (!cldrObj) {
                _context.next = 10;
                break;
              }

              // inlined from build or fetched independently
              registerModuleContent("sap/ui/core/cldr/".concat(localeId, ".json"), cldrObj);
              _context.next = 15;
              break;

            case 10:
              if (!url) {
                _context.next = 15;
                break;
              }

              _context.next = 13;
              return fetchJsonOnce(getEffectiveAssetPath(url));

            case 13:
              cldrContent = _context.sent;
              registerModuleContent("sap/ui/core/cldr/".concat(localeId, ".json"), cldrContent);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function fetchCldr(_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();

  var registerCldr = function registerCldr(locale, url) {
    cldrUrls[locale] = url;
  };

  var setCldrData = function setCldrData(locale, data) {
    cldrData[locale] = data;
  };

  var ar = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ar.43441c1da168c24d.json";

  var ar_EG = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ar_EG.2c9d7bc8c6cc480e.json";

  var ar_SA = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ar_SA.5a58dac7851f3491.json";

  var bg = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/bg.ed8d32010cf321a6.json";

  var ca = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ca.e7ad42298985cd11.json";

  var cs = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/cs.9c679acdc4b03e38.json";

  var da = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/da.ba9951ef39b201a6.json";

  var de = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/de.6caccc36abcd1ecf.json";

  var de_AT = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/de_AT.0f4ffe37737725a0.json";

  var de_CH = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/de_CH.c148cbc7ceb1a7a5.json";

  var el = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/el.11c4c67dcb9fadcc.json";

  var el_CY = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/el_CY.ed3bddd6e79dc343.json";

  var en = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en.c4465af466100b5b.json";

  var en_AU = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_AU.5cb9fccc9ce24663.json";

  var en_GB = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_GB.e31daeeb57c2f1d1.json";

  var en_HK = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_HK.0a22405bb092bec2.json";

  var en_IE = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_IE.6a062df10dabdb1c.json";

  var en_IN = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_IN.bfd20b07e9079267.json";

  var en_NZ = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_NZ.18303e8298e4752a.json";

  var en_PG = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_PG.9f604c968f3ab77e.json";

  var en_SG = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_SG.cc59a6a409e1617e.json";

  var en_ZA = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/en_ZA.198f9641a502d660.json";

  var es = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es.c10bf80f473caf30.json";

  var es_AR = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_AR.7708d7dd7a6d2a15.json";

  var es_BO = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_BO.4a1616d9f3425fba.json";

  var es_CL = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_CL.5637126713317a15.json";

  var es_CO = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_CO.c9436572ca8f4da8.json";

  var es_MX = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_MX.b4bce7dc951eb8f4.json";

  var es_PE = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_PE.65f448fde1f0de13.json";

  var es_UY = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_UY.9ec44031491e9b95.json";

  var es_VE = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/es_VE.152233c7f57ecdab.json";

  var et = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/et.bbc93e8a17832e8f.json";

  var fa = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/fa.083b927b3586b3a3.json";

  var fi = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/fi.1b4c89f38783556e.json";

  var fr = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/fr.ddbb9df1e0bdb6ac.json";

  var fr_BE = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/fr_BE.bf3609280b7b93ee.json";

  var fr_CA = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/fr_CA.b64d0bcd23a5cd3e.json";

  var fr_CH = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/fr_CH.349b221a02887244.json";

  var fr_LU = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/fr_LU.ef7d7c8bb3328d28.json";

  var he = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/he.d628e8bf13a8a2c8.json";

  var hi = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/hi.cc34df8229f656f5.json";

  var hr = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/hr.c920290f50173516.json";

  var hu = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/hu.2d9fa4a9163cd7c0.json";

  var id$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/id.163fdd2a7dbd1dd3.json";

  var it = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/it.b5acbefdd6794dfc.json";

  var it_CH = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/it_CH.ade4cbfb2e49424a.json";

  var ja = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ja.d882fade5c3e04b5.json";

  var kk = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/kk.ab96b18c66676a99.json";

  var ko = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ko.a0d63a1580dcbefd.json";

  var lt = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/lt.93bb00f91a74d613.json";

  var lv = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/lv.3c272216d7d4d61c.json";

  var ms = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ms.e26b54937e5d1516.json";

  var nb = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/nb.a6e9993590a73989.json";

  var nl = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/nl.cac914c3529b7b01.json";

  var nl_BE = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/nl_BE.a3ac6f9f99feba7b.json";

  var pl = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/pl.2cc1c94da23f8c37.json";

  var pt = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/pt.fc8dd9656bc363a4.json";

  var pt_PT = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/pt_PT.be31b641eedfdb48.json";

  var ro = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ro.fc6a48bc63cf435e.json";

  var ru = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ru.77f0de46b3b490b1.json";

  var ru_UA = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/ru_UA.4c4e0034fbd799c6.json";

  var sk = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/sk.0d62a8cca83c1dec.json";

  var sl = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/sl.7b303551cc238560.json";

  var sr = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/sr.7fb9ac6ed054ff7d.json";

  var sv = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/sv.6ea04dfd8d1c331b.json";

  var th = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/th.8e8d734a66ed1c51.json";

  var tr = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/tr.dbb9aa836fc4e3f5.json";

  var uk = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/uk.4854089f0c12f77c.json";

  var vi = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/vi.e6ffbde0643d7d75.json";

  var zh_CN = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/zh_CN.6607a3e9e0901e53.json";

  var zh_HK = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/zh_HK.1c2563d3e4dad56e.json";

  var zh_SG = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/zh_SG.db7f1334eecf894d.json";

  var zh_TW = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/zh_TW.a1d00dd87c58d8f0.json";

  var cldrData$1 = {
    ar: ar,
    ar_EG: ar_EG,
    ar_SA: ar_SA,
    bg: bg,
    ca: ca,
    cs: cs,
    da: da,
    de: de,
    de_AT: de_AT,
    de_CH: de_CH,
    el: el,
    el_CY: el_CY,
    en: en,
    en_AU: en_AU,
    en_GB: en_GB,
    en_HK: en_HK,
    en_IE: en_IE,
    en_IN: en_IN,
    en_NZ: en_NZ,
    en_PG: en_PG,
    en_SG: en_SG,
    en_ZA: en_ZA,
    es: es,
    es_AR: es_AR,
    es_BO: es_BO,
    es_CL: es_CL,
    es_CO: es_CO,
    es_MX: es_MX,
    es_PE: es_PE,
    es_UY: es_UY,
    es_VE: es_VE,
    et: et,
    fa: fa,
    fi: fi,
    fr: fr,
    fr_BE: fr_BE,
    fr_CA: fr_CA,
    fr_CH: fr_CH,
    fr_LU: fr_LU,
    he: he,
    hi: hi,
    hr: hr,
    hu: hu,
    id: id$1,
    it: it,
    it_CH: it_CH,
    ja: ja,
    kk: kk,
    ko: ko,
    lt: lt,
    lv: lv,
    ms: ms,
    nb: nb,
    nl: nl,
    nl_BE: nl_BE,
    pl: pl,
    pt: pt,
    pt_PT: pt_PT,
    ro: ro,
    ru: ru,
    ru_UA: ru_UA,
    sk: sk,
    sl: sl,
    sr: sr,
    sv: sv,
    th: th,
    tr: tr,
    uk: uk,
    vi: vi,
    zh_CN: zh_CN,
    zh_HK: zh_HK,
    zh_SG: zh_SG,
    zh_TW: zh_TW
  };
  var allEntriesInlined = Object.entries(cldrData$1).every(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        _key = _ref2[0],
        value = _ref2[1];

    return _typeof(value) === "object";
  });

  if (allEntriesInlined) {
    console.warn("Inefficient bundling detected: consider bundling CLDR imports as URLs instead of inlining them.\nSee rollup-plugin-url or webpack file-loader for more information.\nSuggested pattern: \"assets\\/.*\\.json\"");
  }

  Object.entries(cldrData$1).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];

    if (_typeof(value) === "object") {
      setCldrData(key, value);
    } else {
      registerCldr(key, value);
    }
  });

  // Currently the base package provides CLDR assets only

  var sap_belize = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.6c6e759e0d3534d0.json";

  var sap_belize_hcb = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.dfd19a1252497415.json";

  var sap_belize_hcw = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.e2ac94de83159e1e.json";

  var sap_fiori_3_dark = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.e19065174fdd4592.json";

  var sap_fiori_3_hcb = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.966b2e43c0966351.json";

  var sap_fiori_3_hcw = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.8cc66e917327b7a4.json";

  var isInlined = function isInlined(obj) {
    return _typeof(obj) === "object";
  };

  if (isInlined(sap_belize) || isInlined(sap_belize_hcb) || isInlined(sap_belize_hcw) || isInlined(sap_fiori_3_dark) || isInlined(sap_fiori_3_hcb) || isInlined(sap_fiori_3_hcw)) {
    console.warn("Inefficient bundling detected: consider bundling theme properties imports as URLs instead of inlining them.\nSee rollup-plugin-url or webpack file-loader for more information.\nSuggested pattern: \"assets\\/.*\\.json\"");
  }

  registerThemeProperties("@ui5/webcomponents-theme-base", "sap_belize", sap_belize);
  registerThemeProperties("@ui5/webcomponents-theme-base", "sap_belize_hcb", sap_belize_hcb);
  registerThemeProperties("@ui5/webcomponents-theme-base", "sap_belize_hcw", sap_belize_hcw);
  registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3_dark", sap_fiori_3_dark);
  registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3_hcb", sap_fiori_3_hcb);
  registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3_hcw", sap_fiori_3_hcw);

  // The theme-base package provides theming assets only

  var sap_belize$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.ab15196019d56481.json";

  var sap_belize_hcb$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.71af4dc5ff5c801a.json";

  var sap_belize_hcw$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.a9adb2bbdfc8e82b.json";

  var sap_fiori_3_dark$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.5a0727d1718c7584.json";

  var sap_fiori_3_hcb$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.eceb41df1123c370.json";

  var sap_fiori_3_hcw$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/parameters-bundle.css.fe40bb7988823daf.json";

  var isInlined$1 = function isInlined(obj) {
    return _typeof(obj) === "object";
  };

  if (isInlined$1(sap_belize$1) || isInlined$1(sap_belize_hcb$1) || isInlined$1(sap_belize_hcw$1) || isInlined$1(sap_fiori_3_dark$1) || isInlined$1(sap_fiori_3_hcb$1) || isInlined$1(sap_fiori_3_hcw$1)) {
    console.warn("Inefficient bundling detected: consider bundling theme properties imports as URLs instead of inlining them.\nSee rollup-plugin-url or webpack file-loader for more information.\nSuggested pattern: \"assets\\/.*\\.json\"");
  }

  registerThemeProperties("@ui5/webcomponents", "sap_belize", sap_belize$1);
  registerThemeProperties("@ui5/webcomponents", "sap_belize_hcb", sap_belize_hcb$1);
  registerThemeProperties("@ui5/webcomponents", "sap_belize_hcw", sap_belize_hcw$1);
  registerThemeProperties("@ui5/webcomponents", "sap_fiori_3_dark", sap_fiori_3_dark$1);
  registerThemeProperties("@ui5/webcomponents", "sap_fiori_3_hcb", sap_fiori_3_hcb$1);
  registerThemeProperties("@ui5/webcomponents", "sap_fiori_3_hcw", sap_fiori_3_hcw$1);

  var detectNavigatorLanguage = (function () {
    var browserLanguages = navigator.languages;

    var navigatorLanguage = function navigatorLanguage() {
      return navigator.language;
    };

    var rawLocale = browserLanguages && browserLanguages[0] || navigatorLanguage() || navigator.userLanguage || navigator.browserLanguage;
    return rawLocale || DEFAULT_LANGUAGE;
  });

  var EventProvider =
  /*#__PURE__*/
  function () {
    function EventProvider() {
      _classCallCheck(this, EventProvider);

      this._eventRegistry = {};
    }

    _createClass(EventProvider, [{
      key: "attachEvent",
      value: function attachEvent(eventName, fnFunction) {
        var eventRegistry = this._eventRegistry;
        var eventListeners = eventRegistry[eventName];

        if (!Array.isArray(eventListeners)) {
          eventRegistry[eventName] = [];
          eventListeners = eventRegistry[eventName];
        }

        eventListeners.push({
          "function": fnFunction
        });
      }
    }, {
      key: "detachEvent",
      value: function detachEvent(eventName, fnFunction) {
        var eventRegistry = this._eventRegistry;
        var eventListeners = eventRegistry[eventName];

        if (!eventListeners) {
          return;
        }

        eventListeners = eventListeners.filter(function (event) {
          return event["function"] !== fnFunction; // eslint-disable-line
        });

        if (eventListeners.length === 0) {
          delete eventRegistry[eventName];
        }
      }
      /**
       * Fires an event and returns the results of all event listeners as an array.
       * Example: If listeners return promises, you can: await fireEvent("myEvent") to know when all listeners have finished.
       *
       * @param eventName the event to fire
       * @param data optional data to pass to each event listener
       * @returns {Array} an array with the results of all event listeners
       */

    }, {
      key: "fireEvent",
      value: function fireEvent(eventName, data) {
        var _this = this;

        var eventRegistry = this._eventRegistry;
        var eventListeners = eventRegistry[eventName];

        if (!eventListeners) {
          return [];
        }

        return eventListeners.map(function (event) {
          return event["function"].call(_this, data); // eslint-disable-line
        });
      }
    }, {
      key: "isHandlerAttached",
      value: function isHandlerAttached(eventName, fnFunction) {
        var eventRegistry = this._eventRegistry;
        var eventListeners = eventRegistry[eventName];

        if (!eventListeners) {
          return false;
        }

        for (var i = 0; i < eventListeners.length; i++) {
          var event = eventListeners[i];

          if (event["function"] === fnFunction) {
            // eslint-disable-line
            return true;
          }
        }

        return false;
      }
    }, {
      key: "hasListeners",
      value: function hasListeners(eventName) {
        return !!this._eventRegistry[eventName];
      }
    }]);

    return EventProvider;
  }();

  var eventProvider = new EventProvider();
  var LANG_CHANGE = "languageChange";

  var attachLanguageChange = function attachLanguageChange(listener) {
    eventProvider.attachEvent(LANG_CHANGE, listener);
  };

  var fireLanguageChange = function fireLanguageChange(lang) {
    return eventProvider.fireEvent(LANG_CHANGE, lang);
  };

  var MAX_PROCESS_COUNT = 10;

  var RenderQueue =
  /*#__PURE__*/
  function () {
    function RenderQueue() {
      _classCallCheck(this, RenderQueue);

      this.list = []; // Used to store the web components in order

      this.lookup = new Set(); // Used for faster search
    }

    _createClass(RenderQueue, [{
      key: "add",
      value: function add(webComponent) {
        if (this.lookup.has(webComponent)) {
          return;
        }

        this.list.push(webComponent);
        this.lookup.add(webComponent);
      }
    }, {
      key: "remove",
      value: function remove(webComponent) {
        if (!this.lookup.has(webComponent)) {
          return;
        }

        this.list = this.list.filter(function (item) {
          return item !== webComponent;
        });
        this.lookup["delete"](webComponent);
      }
    }, {
      key: "shift",
      value: function shift() {
        var webComponent = this.list.shift();

        if (webComponent) {
          this.lookup["delete"](webComponent);
          return webComponent;
        }
      }
    }, {
      key: "isEmpty",
      value: function isEmpty() {
        return this.list.length === 0;
      }
    }, {
      key: "isAdded",
      value: function isAdded(webComponent) {
        return this.lookup.has(webComponent);
      }
      /**
       * Processes the whole queue by executing the callback on each component,
       * while also imposing restrictions on how many times a component may be processed.
       *
       * @param callback - function with one argument (the web component to be processed)
       */

    }, {
      key: "process",
      value: function process(callback) {
        var webComponent;
        var stats = new Map();
        webComponent = this.shift();

        while (webComponent) {
          var timesProcessed = stats.get(webComponent) || 0;

          if (timesProcessed > MAX_PROCESS_COUNT) {
            throw new Error("Web component processed too many times this task, max allowed is: ".concat(MAX_PROCESS_COUNT));
          }

          callback(webComponent);
          stats.set(webComponent, timesProcessed + 1);
          webComponent = this.shift();
        }
      }
    }]);

    return RenderQueue;
  }();

  // This is needed as IE11 doesn't have Set.prototype.keys/values/entries, so [...mySet.values()] is not an option
  var setToArray = function setToArray(s) {
    var arr = [];
    s.forEach(function (item) {
      arr.push(item);
    });
    return arr;
  };

  var Definitions = new Set();
  var Failures = new Set();
  var failureTimeout;

  var registerTag = function registerTag(tag) {
    Definitions.add(tag);
  };

  var isTagRegistered = function isTagRegistered(tag) {
    return Definitions.has(tag);
  };

  var getAllRegisteredTags = function getAllRegisteredTags() {
    return setToArray(Definitions);
  };

  var recordTagRegistrationFailure = function recordTagRegistrationFailure(tag) {
    Failures.add(tag);

    if (!failureTimeout) {
      failureTimeout = setTimeout(function () {
        displayFailedRegistrations();
        failureTimeout = undefined;
      }, 1000);
    }
  };

  var displayFailedRegistrations = function displayFailedRegistrations() {
    console.warn("The following tags have already been defined by a different UI5 Web Components version: ".concat(setToArray(Failures).join(", "))); // eslint-disable-line

    Failures.clear();
  };

  var rtlAwareSet = new Set();

  var markAsRtlAware = function markAsRtlAware(klass) {
    rtlAwareSet.add(klass);
  };

  var isRtlAware = function isRtlAware(klass) {
    return rtlAwareSet.has(klass);
  };

  var registeredElements = new Set(); // Queue for invalidated web components

  var invalidatedWebComponents = new RenderQueue();
  var renderTaskPromise, renderTaskPromiseResolve;
  var mutationObserverTimer;
  var queuePromise;
  /**
   * Class that manages the rendering/re-rendering of web components
   * This is always asynchronous
   */

  var RenderScheduler =
  /*#__PURE__*/
  function () {
    function RenderScheduler() {
      _classCallCheck(this, RenderScheduler);

      throw new Error("Static class");
    }
    /**
     * Schedules a render task (if not already scheduled) to render the component
     *
     * @param webComponent
     * @returns {Promise}
     */


    _createClass(RenderScheduler, null, [{
      key: "renderDeferred",
      value: function () {
        var _renderDeferred = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(webComponent) {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  // Enqueue the web component
                  invalidatedWebComponents.add(webComponent); // Schedule a rendering task

                  _context.next = 3;
                  return RenderScheduler.scheduleRenderTask();

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function renderDeferred(_x) {
          return _renderDeferred.apply(this, arguments);
        }

        return renderDeferred;
      }()
      /**
       * Renders a component synchronously
       *
       * @param webComponent
       */

    }, {
      key: "renderImmediately",
      value: function renderImmediately(webComponent) {
        webComponent._render();
      }
      /**
       * Cancels the rendering of a component, added to the queue with renderDeferred
       *
       * @param webComponent
       */

    }, {
      key: "cancelRender",
      value: function cancelRender(webComponent) {
        invalidatedWebComponents.remove(webComponent);
      }
      /**
       * Schedules a rendering task, if not scheduled already
       */

    }, {
      key: "scheduleRenderTask",
      value: function () {
        var _scheduleRenderTask = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!queuePromise) {
                    queuePromise = new Promise(function (resolve) {
                      window.requestAnimationFrame(function () {
                        // Render all components in the queue
                        invalidatedWebComponents.process(function (component) {
                          return component._render();
                        }); // Resolve the promise so that callers of renderDeferred can continue

                        queuePromise = null;
                        resolve(); // Wait for Mutation observer before the render task is considered finished

                        if (!mutationObserverTimer) {
                          mutationObserverTimer = setTimeout(function () {
                            mutationObserverTimer = undefined;

                            if (invalidatedWebComponents.isEmpty()) {
                              RenderScheduler._resolveTaskPromise();
                            }
                          }, 200);
                        }
                      });
                    });
                  }

                  _context2.next = 3;
                  return queuePromise;

                case 3:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function scheduleRenderTask() {
          return _scheduleRenderTask.apply(this, arguments);
        }

        return scheduleRenderTask;
      }()
      /**
       * return a promise that will be resolved once all invalidated web components are rendered
       */

    }, {
      key: "whenDOMUpdated",
      value: function whenDOMUpdated() {
        if (renderTaskPromise) {
          return renderTaskPromise;
        }

        renderTaskPromise = new Promise(function (resolve) {
          renderTaskPromiseResolve = resolve;
          window.requestAnimationFrame(function () {
            if (invalidatedWebComponents.isEmpty()) {
              renderTaskPromise = undefined;
              resolve();
            }
          });
        });
        return renderTaskPromise;
      }
    }, {
      key: "whenAllCustomElementsAreDefined",
      value: function whenAllCustomElementsAreDefined() {
        var definedPromises = getAllRegisteredTags().map(function (tag) {
          return customElements.whenDefined(tag);
        });
        return Promise.all(definedPromises);
      }
    }, {
      key: "whenFinished",
      value: function () {
        var _whenFinished = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return RenderScheduler.whenAllCustomElementsAreDefined();

                case 2:
                  _context3.next = 4;
                  return RenderScheduler.whenDOMUpdated();

                case 4:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));

        function whenFinished() {
          return _whenFinished.apply(this, arguments);
        }

        return whenFinished;
      }()
    }, {
      key: "_resolveTaskPromise",
      value: function _resolveTaskPromise() {
        if (!invalidatedWebComponents.isEmpty()) {
          // More updates are pending. Resolve will be called again
          return;
        }

        if (renderTaskPromiseResolve) {
          renderTaskPromiseResolve.call(this);
          renderTaskPromiseResolve = undefined;
          renderTaskPromise = undefined;
        }
      }
    }, {
      key: "register",
      value: function register(element) {
        registeredElements.add(element);
      }
    }, {
      key: "deregister",
      value: function deregister(element) {
        registeredElements["delete"](element);
      }
      /**
       * Re-renders all UI5 Elements on the page, with the option to specify filters to rerender only some components.
       *
       * Usage:
       * reRenderAllUI5Elements() -> rerenders all components
       * reRenderAllUI5Elements({tag: "ui5-button"}) -> re-renders only instances of ui5-button
       * reRenderAllUI5Elements({rtlAware: true}) -> re-renders only rtlAware components
       * reRenderAllUI5Elements({languageAware: true}) -> re-renders only languageAware components
       * reRenderAllUI5Elements({rtlAware: true, languageAware: true}) -> re-renders components that are rtlAware or languageAware
       * etc...
       *
       * @public
       * @param {Object|undefined} filters - Object with keys that can be "rtlAware" or "languageAware"
       */

    }, {
      key: "reRenderAllUI5Elements",
      value: function reRenderAllUI5Elements(filters) {
        registeredElements.forEach(function (element) {
          var tag = element.constructor.getMetadata().getTag();
          var rtlAware = isRtlAware(element.constructor);
          var languageAware = element.constructor.getMetadata().isLanguageAware();

          if (!filters || filters.tag === tag || filters.rtlAware && rtlAware || filters.languageAware && languageAware) {
            RenderScheduler.renderDeferred(element);
          }
        });
      }
    }]);

    return RenderScheduler;
  }();

  var language;
  var useDefaultLanguage;
  /**
   * Returns the currently configured language, or the browser language as a fallback
   * @returns {String}
   */

  var getLanguage$1 = function getLanguage$$1() {
    if (language === undefined) {
      language = getLanguage();
    }

    return language;
  };
  /**
   * Changes the current language, re-fetches all message bundles, updates all language-aware components
   * and returns a promise that resolves when all rendering is done
   *
   * @param newLanguage
   * @returns {Promise<void>}
   */


  var setLanguage =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(newLanguage) {
      var listenersResults;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(language === newLanguage)) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return");

            case 2:
              language = newLanguage;
              listenersResults = fireLanguageChange(newLanguage);
              _context.next = 6;
              return Promise.all(listenersResults);

            case 6:
              RenderScheduler.reRenderAllUI5Elements({
                languageAware: true
              });
              return _context.abrupt("return", RenderScheduler.whenFinished());

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function setLanguage(_x) {
      return _ref.apply(this, arguments);
    };
  }();
  /**
   * Defines if the default language, that is inlined, should be used,
   * instead of fetching the language over the network.
   * <b>Note:</b> By default the language will be fetched.
   *
   * @param {Boolean} useDefaultLanguage
   */


  var setUseDefaultLanguage = function setUseDefaultLanguage(useDefaultLang) {
    useDefaultLanguage = useDefaultLang;
  };
  /**
   * Returns if the default language, that is inlined, should be used.
   * @returns {Boolean}
   */


  var getUseDefaultLanguage$1 = function getUseDefaultLanguage$$1() {
    if (useDefaultLanguage === undefined) {
      setUseDefaultLanguage(getUseDefaultLanguage());
    }

    return useDefaultLanguage;
  };

  var rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;

  var Locale =
  /*#__PURE__*/
  function () {
    function Locale(sLocaleId) {
      _classCallCheck(this, Locale);

      var aResult = rLocale.exec(sLocaleId.replace(/_/g, "-"));

      if (aResult === null) {
        throw new Error("The given language ".concat(sLocaleId, " does not adhere to BCP-47."));
      }

      this.sLocaleId = sLocaleId;
      this.sLanguage = aResult[1] || null;
      this.sScript = aResult[2] || null;
      this.sRegion = aResult[3] || null;
      this.sVariant = aResult[4] && aResult[4].slice(1) || null;
      this.sExtension = aResult[5] && aResult[5].slice(1) || null;
      this.sPrivateUse = aResult[6] || null;

      if (this.sLanguage) {
        this.sLanguage = this.sLanguage.toLowerCase();
      }

      if (this.sScript) {
        this.sScript = this.sScript.toLowerCase().replace(/^[a-z]/, function (s) {
          return s.toUpperCase();
        });
      }

      if (this.sRegion) {
        this.sRegion = this.sRegion.toUpperCase();
      }
    }

    _createClass(Locale, [{
      key: "getLanguage",
      value: function getLanguage() {
        return this.sLanguage;
      }
    }, {
      key: "getScript",
      value: function getScript() {
        return this.sScript;
      }
    }, {
      key: "getRegion",
      value: function getRegion() {
        return this.sRegion;
      }
    }, {
      key: "getVariant",
      value: function getVariant() {
        return this.sVariant;
      }
    }, {
      key: "getVariantSubtags",
      value: function getVariantSubtags() {
        return this.sVariant ? this.sVariant.split("-") : [];
      }
    }, {
      key: "getExtension",
      value: function getExtension() {
        return this.sExtension;
      }
    }, {
      key: "getExtensionSubtags",
      value: function getExtensionSubtags() {
        return this.sExtension ? this.sExtension.slice(2).split("-") : [];
      }
    }, {
      key: "getPrivateUse",
      value: function getPrivateUse() {
        return this.sPrivateUse;
      }
    }, {
      key: "getPrivateUseSubtags",
      value: function getPrivateUseSubtags() {
        return this.sPrivateUse ? this.sPrivateUse.slice(2).split("-") : [];
      }
    }, {
      key: "hasPrivateUseSubtag",
      value: function hasPrivateUseSubtag(sSubtag) {
        return this.getPrivateUseSubtags().indexOf(sSubtag) >= 0;
      }
    }, {
      key: "toString",
      value: function toString() {
        var r = [this.sLanguage];

        if (this.sScript) {
          r.push(this.sScript);
        }

        if (this.sRegion) {
          r.push(this.sRegion);
        }

        if (this.sVariant) {
          r.push(this.sVariant);
        }

        if (this.sExtension) {
          r.push(this.sExtension);
        }

        if (this.sPrivateUse) {
          r.push(this.sPrivateUse);
        }

        return r.join("-");
      }
    }]);

    return Locale;
  }();

  var convertToLocaleOrNull = function convertToLocaleOrNull(lang) {
    try {
      if (lang && typeof lang === "string") {
        return new Locale(lang);
      }
    } catch (e) {// ignore
    }
  };
  /**
   * Returns the locale based on the parameter or configured language Configuration#getLanguage
   * If no language has been configured - a new locale based on browser language is returned
   */


  var getLocale = function getLocale(lang) {
    if (lang) {
      return convertToLocaleOrNull(lang);
    }

    if (getLanguage$1()) {
      return new Locale(getLanguage$1());
    }

    return convertToLocaleOrNull(detectNavigatorLanguage());
  };

  var localeRegEX = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
  var SAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd)(?:-|$)/i;
  /* Map for old language names for a few ISO639 codes. */

  var M_ISO639_NEW_TO_OLD = {
    "he": "iw",
    "yi": "ji",
    "id": "in",
    "sr": "sh"
  };
  /**
   * Normalizes the given locale in BCP-47 syntax.
   * @param {string} locale locale to normalize
   * @returns {string} Normalized locale, "undefined" if the locale can't be normalized or the default locale, if no locale provided.
   */

  var normalizeLocale = function normalizeLocale(locale) {
    var m;

    if (!locale) {
      return DEFAULT_LOCALE;
    }

    if (typeof locale === "string" && (m = localeRegEX.exec(locale.replace(/_/g, "-")))) {
      /* eslint-disable-line */
      var language = m[1].toLowerCase();
      var region = m[3] ? m[3].toUpperCase() : undefined;
      var script = m[2] ? m[2].toLowerCase() : undefined;
      var variants = m[4] ? m[4].slice(1) : undefined;
      var isPrivate = m[6];
      language = M_ISO639_NEW_TO_OLD[language] || language; // recognize and convert special SAP supportability locales (overwrites m[]!)

      if (isPrivate && (m = SAPSupportabilityLocales.exec(isPrivate)) ||
      /* eslint-disable-line */
      variants && (m = SAPSupportabilityLocales.exec(variants))) {
        /* eslint-disable-line */
        return "en_US_".concat(m[1].toLowerCase()); // for now enforce en_US (agreed with SAP SLS)
      } // Chinese: when no region but a script is specified, use default region for each script


      if (language === "zh" && !region) {
        if (script === "hans") {
          region = "CN";
        } else if (script === "hant") {
          region = "TW";
        }
      }

      return language + (region ? "_" + region + (variants ? "_" + variants.replace("-", "_") : "") : "");
      /* eslint-disable-line */
    }
  };

  /**
   * Calculates the next fallback locale for the given locale.
   *
   * @param {string} locale Locale string in Java format (underscores) or null
   * @returns {string} Next fallback Locale or "en" if no fallbacks found.
   */

  var nextFallbackLocale = function nextFallbackLocale(locale) {
    if (!locale) {
      return DEFAULT_LOCALE;
    }

    if (locale === "zh_HK") {
      return "zh_TW";
    } // if there are multiple segments (separated by underscores), remove the last one


    var p = locale.lastIndexOf("_");

    if (p >= 0) {
      return locale.slice(0, p);
    } // for any language but the default, fallback to the default first before falling back to the 'raw' language (empty string)


    return locale !== DEFAULT_LOCALE ? DEFAULT_LOCALE : "";
  };

  var bundleData = new Map();
  var bundleURLs = new Map();
  /**
   * Sets a map with texts and ID the are related to.
   * @param {string} packageName package ID that the i18n bundle will be related to
   * @param {Object} data an object with string locales as keys and text translataions as values
   * @public
   */

  var setI18nBundleData = function setI18nBundleData(packageName, data) {
    bundleData.set(packageName, data);
  };

  var getI18nBundleData = function getI18nBundleData(packageName) {
    return bundleData.get(packageName);
  };
  /**
   * Registers a map of locale/url information, to be used by the <code>fetchI18nBundle</code> method.
   * Note: In order to be able to register ".properties" files, you must import the following module:
   * import "@ui5/webcomponents-base/dist/features/PropertiesFormatSupport.js";
   *
   * @param {string} packageName package ID that the i18n bundle will be related to
   * @param {Object} bundle an object with string locales as keys and the URLs (in .json or .properties format - see the note above) where the corresponding locale can be fetched from, f.e {"en": "path/en.json", ...}
   *
   * @public
   */


  var registerI18nBundle = function registerI18nBundle(packageName, bundle) {
    var oldBundle = bundleURLs.get(packageName) || {};
    bundleURLs.set(packageName, Object.assign({}, oldBundle, bundle));
  };
  /**
   * This method preforms the asynchronous task of fetching the actual text resources. It will fetch
   * each text resource over the network once (even for multiple calls to the same method).
   * It should be fully finished before the i18nBundle class is created in the webcomponents.
   * This method uses the bundle URLs that are populated by the <code>registerI18nBundle</code> method.
   * To simplify the usage, the synchronization of both methods happens internally for the same <code>bundleId</code>
   * @param {packageName} packageName the NPM package name
   * @public
   */


  var fetchI18nBundle =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(packageName) {
      var bundlesForPackage, language, region, useDefaultLanguage, localeId, bundleURL, content, parser, PropertiesFormatSupport, data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              bundlesForPackage = bundleURLs.get(packageName);

              if (bundlesForPackage) {
                _context.next = 4;
                break;
              }

              console.warn("Message bundle assets are not configured. Falling back to English texts.",
              /* eslint-disable-line */
              " You need to import ".concat(packageName, "/dist/Assets.js with a build tool that supports JSON imports."));
              /* eslint-disable-line */

              return _context.abrupt("return");

            case 4:
              language = getLocale().getLanguage();
              region = getLocale().getRegion();
              useDefaultLanguage = getUseDefaultLanguage$1();
              localeId = normalizeLocale(language + (region ? "-".concat(region) : ""));

              while (localeId !== DEFAULT_LANGUAGE && !bundlesForPackage[localeId]) {
                localeId = nextFallbackLocale(localeId);
              }

              if (!(useDefaultLanguage && localeId === DEFAULT_LANGUAGE)) {
                _context.next = 12;
                break;
              }

              setI18nBundleData(packageName, null); // reset for the default language (if data was set for a previous language)

              return _context.abrupt("return");

            case 12:
              bundleURL = bundlesForPackage[localeId];

              if (!(_typeof(bundleURL) === "object")) {
                _context.next = 16;
                break;
              }

              // inlined from build
              setI18nBundleData(packageName, bundleURL);
              return _context.abrupt("return");

            case 16:
              _context.next = 18;
              return fetchTextOnce(getEffectiveAssetPath(bundleURL));

            case 18:
              content = _context.sent;

              if (!content.startsWith("{")) {
                _context.next = 23;
                break;
              }

              parser = JSON.parse;
              _context.next = 27;
              break;

            case 23:
              PropertiesFormatSupport = getFeature("PropertiesFormatSupport");

              if (PropertiesFormatSupport) {
                _context.next = 26;
                break;
              }

              throw new Error("In order to support .properties files, please: import \"@ui5/webcomponents-base/dist/features/PropertiesFormatSupport.js\";");

            case 26:
              parser = PropertiesFormatSupport.parser;

            case 27:
              data = parser(content);
              setI18nBundleData(packageName, data);

            case 29:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function fetchI18nBundle(_x) {
      return _ref.apply(this, arguments);
    };
  }(); // When the language changes dynamically (the user calls setLanguage), re-fetch all previously fetched bundles


  attachLanguageChange(function () {
    var allPackages = _toConsumableArray(bundleData.keys());

    return Promise.all(allPackages.map(fetchI18nBundle));
  });

  var ar$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ar.d20c665dc46a6f9b.json";

  var bg$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_bg.38428028ff3b1869.json";

  var ca$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ca.c46423cc94896604.json";

  var cs$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_cs.d9d68b2690954b4e.json";

  var da$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_da.1189e997523b89f6.json";

  var de$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_de.1edf86f620dd657a.json";

  var el$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_el.b0d02877b9366e9a.json";

  var en$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_en.523661a217059d99.json";

  var es$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_es.43fc364a8be37449.json";

  var et$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_et.8f9abcfab5eb10c2.json";

  var fi$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_fi.6fc14fd0d16cc223.json";

  var fr$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_fr.c686ab9036b91d78.json";

  var hi$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_hi.8b8cbc4fb282adf6.json";

  var hr$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_hr.bb811aa76359724a.json";

  var hu$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_hu.18417ced7dce8cf7.json";

  var it$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_it.554f904c106ab069.json";

  var iw = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_iw.487febe0c5c504ff.json";

  var ja$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ja.68cf1fa9f03cd6c3.json";

  var kk$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_kk.36e63b8f9e1fd98f.json";

  var ko$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ko.fb000c7a35009d21.json";

  var lt$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_lt.6acd357e3eb3f54e.json";

  var lv$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_lv.3ffdda1a20bc15ec.json";

  var ms$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ms.218aa30a3e8f58fa.json";

  var nl$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_nl.f753744c7e08b3a5.json";

  var no = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_no.385f0fc9f2e49ab5.json";

  var pl$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_pl.6c42672479ad9687.json";

  var pt$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_pt.ede162cbf79f7fca.json";

  var ro$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ro.d3f32654c57588ea.json";

  var ru$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ru.0ec083b64484a12d.json";

  var sh = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sh.98cd3e4299919a30.json";

  var sk$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sk.fddb8b9e7b70fc1d.json";

  var sl$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sl.c55d5f817482ea06.json";

  var sv$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sv.6d855a11d20b4335.json";

  var th$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_th.e791b9a81f16120c.json";

  var tr$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_tr.ce83741e39606b55.json";

  var uk$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_uk.e1ea822764025a5a.json";

  var vi$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_vi.7ee7339211750379.json";

  var zh_CN$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_zh_CN.0cfd71faba640211.json";

  var zh_TW$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_zh_TW.bc718e0187728a16.json";

  var bundleMap = {
    ar: ar$1,
    bg: bg$1,
    ca: ca$1,
    cs: cs$1,
    da: da$1,
    de: de$1,
    el: el$1,
    en: en$1,
    es: es$1,
    et: et$1,
    fi: fi$1,
    fr: fr$1,
    hi: hi$1,
    hr: hr$1,
    hu: hu$1,
    it: it$1,
    iw: iw,
    ja: ja$1,
    kk: kk$1,
    ko: ko$1,
    lt: lt$1,
    lv: lv$1,
    ms: ms$1,
    nl: nl$1,
    no: no,
    pl: pl$1,
    pt: pt$1,
    ro: ro$1,
    ru: ru$1,
    sh: sh,
    sk: sk$1,
    sl: sl$1,
    sv: sv$1,
    th: th$1,
    tr: tr$1,
    uk: uk$1,
    vi: vi$1,
    zh_CN: zh_CN$1,
    zh_TW: zh_TW$1
  };
  var allEntriesInlined$1 = Object.entries(bundleMap).every(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        _key = _ref2[0],
        value = _ref2[1];

    return _typeof(value) === "object";
  });

  if (allEntriesInlined$1) {
    console.warn("Inefficient bundling detected: consider bundling i18n imports as URLs instead of inlining them.\nSee rollup-plugin-url or webpack file-loader for more information.\nSuggested pattern: \"assets\\/.*\\.json\"");
  }

  registerI18nBundle("@ui5/webcomponents", bundleMap);

  var ar$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ar.3cb0c9150a0d3b65.json";

  var bg$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_bg.c5b5f09d4cdc05c2.json";

  var ca$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ca.21eddad79e57b196.json";

  var cs$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_cs.254cf5a554d6c3cf.json";

  var da$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_da.292202a074417518.json";

  var de$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_de.8a37d0d12d5f3fdb.json";

  var el$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_el.20e733cf13266e95.json";

  var en$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_en.2116c2eb907f4239.json";

  var es$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_es.4b7a0782bf89db91.json";

  var et$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_et.32a3ecb2ab90d7e1.json";

  var fi$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_fi.59f4c565254f8bd7.json";

  var fr$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_fr.4823ab3f68b56fff.json";

  var hi$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_hi.169377676442a6c3.json";

  var hr$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_hr.7b0f01264adee46e.json";

  var hu$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_hu.b7073837581b601d.json";

  var it$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_it.7aa517f8f41868e7.json";

  var iw$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_iw.f8e9297bda991f89.json";

  var ja$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ja.94a03c1b60503735.json";

  var kk$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_kk.8108317e69a7b684.json";

  var ko$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ko.30d4f96289f472cb.json";

  var lt$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_lt.3132c6a3e0a20741.json";

  var lv$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_lv.6d37db7bca572e88.json";

  var ms$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ms.96b31d30dbb8df67.json";

  var nl$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_nl.55a55c21aa99f942.json";

  var no$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_no.b9dc8ffcbe8a355c.json";

  var pl$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_pl.6cd59d32e72c298e.json";

  var pt$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_pt.2c1d8ef6246adb51.json";

  var ro$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ro.fb81096a3806a008.json";

  var ru$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_ru.d749fe9a4410804b.json";

  var sh$1 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sh.916eebfe6e3f1a59.json";

  var sk$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sk.8974857bc54ff0cd.json";

  var sl$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sl.641196e022a3f742.json";

  var sv$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_sv.80f494abf30df0c1.json";

  var th$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_th.379bcb24bcfc7df4.json";

  var tr$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_tr.afe04d29d9dba0d7.json";

  var uk$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_uk.4afab4a3f061d588.json";

  var vi$2 = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_vi.2c80623c96bff00a.json";

  var zhCN = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_zh_CN.aacf4602bca2861e.json";

  var zhTW = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/messagebundle_zh_TW.e049f5a95536f343.json";

  var bundleMap$1 = {
    ar: ar$2,
    bg: bg$2,
    ca: ca$2,
    cs: cs$2,
    da: da$2,
    de: de$2,
    el: el$2,
    en: en$2,
    es: es$2,
    et: et$2,
    fi: fi$2,
    fr: fr$2,
    hi: hi$2,
    hr: hr$2,
    hu: hu$2,
    it: it$2,
    iw: iw$1,
    ja: ja$2,
    kk: kk$2,
    ko: ko$2,
    lt: lt$2,
    lv: lv$2,
    ms: ms$2,
    nl: nl$2,
    no: no$1,
    pl: pl$2,
    pt: pt$2,
    ro: ro$2,
    ru: ru$2,
    sh: sh$1,
    sk: sk$2,
    sl: sl$2,
    sv: sv$2,
    th: th$2,
    tr: tr$2,
    uk: uk$2,
    vi: vi$2,
    zh_CN: zhCN,
    zh_TW: zhTW
  };
  var allEntriesInlined$2 = Object.entries(bundleMap$1).every(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        _key = _ref2[0],
        value = _ref2[1];

    return _typeof(value) === "object";
  });
  /* eslint-disable */

  if (allEntriesInlined$2) {
    console.warn("Inefficient bundling detected: consider bundling i18n imports as URLs instead of inlining them.\nSee rollup-plugin-url or webpack file-loader for more information.\nSuggested pattern: \"assets\\/.*\\.json\"");
  }
  /* eslint-enable */


  registerI18nBundle("@ui5/webcomponents-icons", bundleMap$1);

  var getSingletonElementInstance = function getSingletonElementInstance(tag) {
    var parentElement = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
    var el = document.querySelector(tag);

    if (el) {
      return el;
    }

    el = document.createElement(tag);
    return parentElement.insertBefore(el, parentElement.firstChild);
  };

  var getSharedResourcesInstance = function getSharedResourcesInstance() {
    return getSingletonElementInstance("ui5-shared-resources", document.head);
  };
  /**
   * Use this method to initialize/get resources that you would like to be shared among UI5 Web Components runtime instances.
   * The data will be accessed via a singleton "ui5-shared-resources" HTML element in the "head" element of the page.
   *
   * @public
   * @param namespace Unique ID of the resource, may contain "." to denote hierarchy
   * @param initialValue Object or primitive that will be used as an initial value if the resource does not exist
   * @returns {*}
   */


  var getSharedResource = function getSharedResource(namespace, initialValue) {
    var parts = namespace.split(".");
    var current = getSharedResourcesInstance();

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      var lastPart = i === parts.length - 1;

      if (!Object.prototype.hasOwnProperty.call(current, part)) {
        current[part] = lastPart ? initialValue : {};
      }

      current = current[part];
    }

    return current;
  };

  var registry = getSharedResource("SVGIcons.registry", new Map());
  var iconCollectionPromises = getSharedResource("SVGIcons.promises", new Map());
  var ICON_NOT_FOUND = "ICON_NOT_FOUND";
  var DEFAULT_COLLECTION = "SAP-icons";

  var calcKey = function calcKey(name, collection) {
    // silently support ui5-compatible URIs
    if (name.startsWith("sap-icon://")) {
      name = name.replace("sap-icon://", "");

      var _name$split$reverse = name.split("/").reverse();

      var _name$split$reverse2 = _slicedToArray(_name$split$reverse, 2);

      name = _name$split$reverse2[0];
      collection = _name$split$reverse2[1];
    }

    collection = collection || DEFAULT_COLLECTION;
    return "".concat(collection, ":").concat(name);
  };

  var registerIcon = function registerIcon(name) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        pathData = _ref.pathData,
        ltr = _ref.ltr,
        accData = _ref.accData,
        collection = _ref.collection;

    // eslint-disable-line
    var key = calcKey(name, collection);
    registry.set(key, {
      pathData: pathData,
      ltr: ltr,
      accData: accData
    });
  };

  var getIconDataSync = function getIconDataSync(name) {
    var collection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_COLLECTION;
    var key = calcKey(name, collection);
    return registry.get(key);
  };

  var getIconData =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(name) {
      var collection,
          key,
          iconData,
          _args = arguments;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              collection = _args.length > 1 && _args[1] !== undefined ? _args[1] : DEFAULT_COLLECTION;
              key = calcKey(name, collection);

              if (!iconCollectionPromises.has(collection)) {
                iconCollectionPromises.set(collection, Promise.resolve(ICON_NOT_FOUND));
              }

              _context.next = 5;
              return iconCollectionPromises.get(collection);

            case 5:
              iconData = _context.sent;

              if (!(iconData === ICON_NOT_FOUND)) {
                _context.next = 8;
                break;
              }

              return _context.abrupt("return", iconData);

            case 8:
              return _context.abrupt("return", registry.get(key));

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function getIconData(_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  var getRegisteredNames =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!iconCollectionPromises.has(DEFAULT_COLLECTION)) {
                _context2.next = 3;
                break;
              }

              _context2.next = 3;
              return iconCollectionPromises.get(DEFAULT_COLLECTION);

            case 3:
              return _context2.abrupt("return", Array.from(registry.keys()).map(function (k) {
                return k.split(":")[1];
              }));

            case 4:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function getRegisteredNames() {
      return _ref3.apply(this, arguments);
    };
  }();

  var registerCollectionPromise = function registerCollectionPromise(collection, promise) {
    iconCollectionPromises.set(collection, promise);
  };

  var registerIconBundle =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(collectionName, bundleData) {
      var resolveFn, collectionFetched;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              collectionFetched = new Promise(function (resolve) {
                resolveFn = resolve;
              });
              registerCollectionPromise(collectionName, collectionFetched);

              if (!(_typeof(bundleData) !== "object")) {
                _context.next = 6;
                break;
              }

              _context.next = 5;
              return fetchJsonOnce(getEffectiveAssetPath(bundleData));

            case 5:
              bundleData = _context.sent;

            case 6:
              fillRegistry(bundleData);
              resolveFn();

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function registerIconBundle(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  var fillRegistry = function fillRegistry(bundleData) {
    Object.keys(bundleData.data).forEach(function (iconName) {
      var iconData = bundleData.data[iconName];
      registerIcon(iconName, {
        pathData: iconData.path,
        ltr: iconData.ltr,
        accData: iconData.acc,
        collection: bundleData.collection
      });
    });
  };
   // eslint-disable-line

  var SAPIcons = "/resources/sap/ui/webcomponents/thirdparty/ui5-wc-bundles/SAP-icons.33a03c68298d0449.json";

  registerIconBundle("SAP-icons", SAPIcons);

  var whenDOMReady = function whenDOMReady() {
    return new Promise(function (resolve) {
      if (document.body) {
        resolve();
      } else {
        document.addEventListener("DOMContentLoaded", function () {
          resolve();
        });
      }
    });
  };

  /**
   * CSS font face used for the texts provided by SAP.
   */
  /* CDN Locations */

  var font72RegularWoff = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular.woff?ui5-webcomponents";
  var font72RegularWoff2 = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular.woff2?ui5-webcomponents";
  var font72RegularFullWoff = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular-full.woff?ui5-webcomponents";
  var font72RegularFullWoff2 = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular-full.woff2?ui5-webcomponents";
  var font72BoldWoff = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold.woff?ui5-webcomponents";
  var font72BoldWoff2 = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold.woff2?ui5-webcomponents";
  var font72BoldFullWoff = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold-full.woff?ui5-webcomponents";
  var font72BoldFullWoff2 = "https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold-full.woff2?ui5-webcomponents";
  var fontFaceCSS = "\n\t@font-face {\n\t\tfont-family: \"72\";\n\t\tfont-style: normal;\n\t\tfont-weight: 400;\n\t\tsrc: local(\"72\"),\n\t\t\turl(".concat(font72RegularWoff2, ") format(\"woff2\"),\n\t\t\turl(").concat(font72RegularWoff, ") format(\"woff\");\n\t}\n\t\n\t@font-face {\n\t\tfont-family: \"72full\";\n\t\tfont-style: normal;\n\t\tfont-weight: 400;\n\t\tsrc: local('72-full'),\n\t\t\turl(").concat(font72RegularFullWoff2, ") format(\"woff2\"),\n\t\t\turl(").concat(font72RegularFullWoff, ") format(\"woff\");\n\t\t\n\t}\n\t\n\t@font-face {\n\t\tfont-family: \"72\";\n\t\tfont-style: normal;\n\t\tfont-weight: 700;\n\t\tsrc: local('72-Bold'),\n\t\t\turl(").concat(font72BoldWoff2, ") format(\"woff2\"),\n\t\t\turl(").concat(font72BoldWoff, ") format(\"woff\");\n\t}\n\t\n\t@font-face {\n\t\tfont-family: \"72full\";\n\t\tfont-style: normal;\n\t\tfont-weight: 700;\n\t\tsrc: local('72-Bold-full'),\n\t\t\turl(").concat(font72BoldFullWoff2, ") format(\"woff2\"),\n\t\t\turl(").concat(font72BoldFullWoff, ") format(\"woff\");\n\t}\n");

  var insertFontFace = function insertFontFace() {
    if (document.querySelector("head>style[data-ui5-font-face]")) {
      return;
    } // If OpenUI5 is found, let it set the font


    var OpenUI5Support = getFeature("OpenUI5Support");

    if (OpenUI5Support && OpenUI5Support.isLoaded()) {
      return;
    }

    createStyleInHead(fontFaceCSS, {
      "data-ui5-font-face": ""
    });
  };

  var systemCSSVars = "\n\t:root {\n\t\t--_ui5_content_density:cozy;\n\t}\n\t\n\t[data-ui5-compact-size],\n\t.ui5-content-density-compact,\n\t.sapUiSizeCompact {\n\t\t--_ui5_content_density:compact;\n\t}\n\t\n\t[dir=\"rtl\"] {\n\t\t--_ui5_dir:rtl;\n\t}\n\t\n\t[dir=\"ltr\"] {\n\t\t--_ui5_dir:ltr;\n\t}\n";

  var insertSystemCSSVars = function insertSystemCSSVars() {
    if (document.querySelector("head>style[data-ui5-system-css-vars]")) {
      return;
    }

    createStyleInHead(systemCSSVars, {
      "data-ui5-system-css-vars": ""
    });
  };

  var polyfillLoadedPromise;

  var whenPolyfillLoaded = function whenPolyfillLoaded() {
    if (polyfillLoadedPromise) {
      return polyfillLoadedPromise;
    }

    polyfillLoadedPromise = new Promise(function (resolve) {
      if (window.WebComponents && !window.WebComponents.ready && window.WebComponents.waitFor) {
        // the polyfill loader is present
        window.WebComponents.waitFor(function () {
          // the polyfills are loaded, safe to execute code depending on their APIs
          resolve();
        });
      } else {
        // polyfill loader missing, modern browsers only
        resolve();
      }
    });
    return polyfillLoadedPromise;
  };

  var bootPromise;

  var boot = function boot() {
    if (bootPromise) {
      return bootPromise;
    }

    bootPromise = new Promise(
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(resolve) {
        var OpenUI5Support;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                OpenUI5Support = getFeature("OpenUI5Support");

                if (!OpenUI5Support) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return OpenUI5Support.init();

              case 4:
                _context.next = 6;
                return whenDOMReady();

              case 6:
                _context.next = 8;
                return applyTheme(getTheme$1());

              case 8:
                OpenUI5Support && OpenUI5Support.attachListeners();
                insertFontFace();
                insertSystemCSSVars();
                _context.next = 13;
                return whenPolyfillLoaded();

              case 13:
                resolve();

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
    return bootPromise;
  };

  /**
   * Base class for all data types.
   *
   * @class
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.base.types.DataType
   * @public
   */
  var DataType =
  /*#__PURE__*/
  function () {
    function DataType() {
      _classCallCheck(this, DataType);
    }

    _createClass(DataType, null, [{
      key: "isValid",
      value: function isValid(value) {}
    }, {
      key: "generataTypeAcessors",
      value: function generataTypeAcessors(types) {
        var _this = this;

        Object.keys(types).forEach(function (type) {
          Object.defineProperty(_this, type, {
            get: function get() {
              return types[type];
            }
          });
        });
      }
    }]);

    return DataType;
  }();

  var isDescendantOf = function isDescendantOf(klass, baseKlass) {
    var inclusive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (typeof klass !== "function" || typeof baseKlass !== "function") {
      return false;
    }

    if (inclusive && klass === baseKlass) {
      return true;
    }

    var parent = klass;

    do {
      parent = Object.getPrototypeOf(parent);
    } while (parent !== null && parent !== baseKlass);

    return parent === baseKlass;
  };

  var kebabToCamelMap = new Map();
  var camelToKebabMap = new Map();

  var kebabToCamelCase = function kebabToCamelCase(string) {
    if (!kebabToCamelMap.has(string)) {
      var result = toCamelCase(string.split("-"));
      kebabToCamelMap.set(string, result);
    }

    return kebabToCamelMap.get(string);
  };

  var camelToKebabCase = function camelToKebabCase(string) {
    if (!camelToKebabMap.has(string)) {
      var result = string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      camelToKebabMap.set(string, result);
    }

    return camelToKebabMap.get(string);
  };

  var toCamelCase = function toCamelCase(parts) {
    return parts.map(function (string, index) {
      return index === 0 ? string.toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }).join("");
  };

  var isSlot = function isSlot(el) {
    return el && el instanceof HTMLElement && el.localName === "slot";
  };

  var suf;
  var rulesObj = {
    include: [/^ui5-/],
    exclude: []
  };
  var tagsCache = new Map(); // true/false means the tag should/should not be cached, undefined means not known yet.
  /**
   * Returns the currently set scoping suffix, or undefined if not set.
   *
   * @public
   * @returns {String|undefined}
   */


  var getCustomElementsScopingSuffix = function getCustomElementsScopingSuffix() {
    return suf;
  };
  /**
   * Determines whether custom elements with the given tag should be scoped or not.
   * The tag is first matched against the "include" rules and then against the "exclude" rules and the
   * result is cached until new rules are set.
   *
   * @public
   * @param tag
   */


  var shouldScopeCustomElement = function shouldScopeCustomElement(tag) {
    if (!tagsCache.has(tag)) {
      var result = rulesObj.include.some(function (rule) {
        return tag.match(rule);
      }) && !rulesObj.exclude.some(function (rule) {
        return tag.match(rule);
      });
      tagsCache.set(tag, result);
    }

    return tagsCache.get(tag);
  };
  /**
   * Returns the currently set scoping suffix, if any and if the tag should be scoped, or undefined otherwise.
   *
   * @public
   * @param tag
   * @returns {String}
   */


  var getEffectiveScopingSuffixForTag = function getEffectiveScopingSuffixForTag(tag) {
    if (shouldScopeCustomElement(tag)) {
      return getCustomElementsScopingSuffix();
    }
  };

  /**
   *
   * @class
   * @public
   */

  var UI5ElementMetadata =
  /*#__PURE__*/
  function () {
    function UI5ElementMetadata(metadata) {
      _classCallCheck(this, UI5ElementMetadata);

      this.metadata = metadata;
    }
    /**
     * Only intended for use by UI5Element.js
     * @protected
     */


    _createClass(UI5ElementMetadata, [{
      key: "getPureTag",

      /**
       * Returns the tag of the UI5 Element without the scope
       * @public
       */
      value: function getPureTag() {
        return this.metadata.tag;
      }
      /**
       * Returns the tag of the UI5 Element
       * @public
       */

    }, {
      key: "getTag",
      value: function getTag() {
        var pureTag = this.metadata.tag;
        var suffix = getEffectiveScopingSuffixForTag(pureTag);

        if (!suffix) {
          return pureTag;
        }

        return "".concat(pureTag, "-").concat(suffix);
      }
      /**
       * Used to get the tag we need to register for backwards compatibility
       * @public
       */

    }, {
      key: "getAltTag",
      value: function getAltTag() {
        var pureAltTag = this.metadata.altTag;

        if (!pureAltTag) {
          return;
        }

        var suffix = getEffectiveScopingSuffixForTag(pureAltTag);

        if (!suffix) {
          return pureAltTag;
        }

        return "".concat(pureAltTag, "-").concat(suffix);
      }
      /**
       * Determines whether a property should have an attribute counterpart
       * @public
       * @param propName
       * @returns {boolean}
       */

    }, {
      key: "hasAttribute",
      value: function hasAttribute(propName) {
        var propData = this.getProperties()[propName];
        return propData.type !== Object && !propData.noAttribute;
      }
      /**
       * Returns an array with the properties of the UI5 Element (in camelCase)
       * @public
       * @returns {string[]}
       */

    }, {
      key: "getPropertiesList",
      value: function getPropertiesList() {
        return Object.keys(this.getProperties());
      }
      /**
       * Returns an array with the attributes of the UI5 Element (in kebab-case)
       * @public
       * @returns {string[]}
       */

    }, {
      key: "getAttributesList",
      value: function getAttributesList() {
        return this.getPropertiesList().filter(this.hasAttribute, this).map(camelToKebabCase);
      }
      /**
       * Returns an object with key-value pairs of slots and their metadata definitions
       * @public
       */

    }, {
      key: "getSlots",
      value: function getSlots() {
        return this.metadata.slots || {};
      }
      /**
       * Determines whether this UI5 Element has a default slot of type Node, therefore can slot text
       * @returns {boolean}
       */

    }, {
      key: "canSlotText",
      value: function canSlotText() {
        var defaultSlot = this.getSlots()["default"];
        return defaultSlot && defaultSlot.type === Node;
      }
      /**
       * Determines whether this UI5 Element supports any slots
       * @public
       */

    }, {
      key: "hasSlots",
      value: function hasSlots() {
        return !!Object.entries(this.getSlots()).length;
      }
      /**
       * Determines whether this UI5 Element supports any slots with "individualSlots: true"
       * @public
       */

    }, {
      key: "hasIndividualSlots",
      value: function hasIndividualSlots() {
        return this.slotsAreManaged() && Object.entries(this.getSlots()).some(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              _slotName = _ref2[0],
              slotData = _ref2[1];

          return slotData.individualSlots;
        });
      }
      /**
       * Determines whether this UI5 Element needs to invalidate if children are added/removed/changed
       * @public
       */

    }, {
      key: "slotsAreManaged",
      value: function slotsAreManaged() {
        return !!this.metadata.managedSlots;
      }
      /**
       * Returns an object with key-value pairs of properties and their metadata definitions
       * @public
       */

    }, {
      key: "getProperties",
      value: function getProperties() {
        return this.metadata.properties || {};
      }
      /**
       * Returns an object with key-value pairs of events and their metadata definitions
       * @public
       */

    }, {
      key: "getEvents",
      value: function getEvents() {
        return this.metadata.events || {};
      }
      /**
       * Determines whether this UI5 Element has any translatable texts (needs to be invalidated upon language change)
       * @returns {boolean}
       */

    }, {
      key: "isLanguageAware",
      value: function isLanguageAware() {
        return !!this.metadata.languageAware;
      }
    }], [{
      key: "validatePropertyValue",
      value: function validatePropertyValue(value, propData) {
        var isMultiple = propData.multiple;

        if (isMultiple) {
          return value.map(function (propValue) {
            return validateSingleProperty(propValue, propData);
          });
        }

        return validateSingleProperty(value, propData);
      }
      /**
       * Only intended for use by UI5Element.js
       * @protected
       */

    }, {
      key: "validateSlotValue",
      value: function validateSlotValue(value, slotData) {
        return validateSingleSlot(value, slotData);
      }
    }]);

    return UI5ElementMetadata;
  }();

  var validateSingleProperty = function validateSingleProperty(value, propData) {
    var propertyType = propData.type;

    if (propertyType === Boolean) {
      return typeof value === "boolean" ? value : false;
    }

    if (propertyType === String) {
      return typeof value === "string" || typeof value === "undefined" || value === null ? value : value.toString();
    }

    if (propertyType === Object) {
      return _typeof(value) === "object" ? value : propData.defaultValue;
    }

    if (isDescendantOf(propertyType, DataType)) {
      return propertyType.isValid(value) ? value : propData.defaultValue;
    }
  };

  var validateSingleSlot = function validateSingleSlot(value, slotData) {
    if (value === null) {
      return value;
    }

    var getSlottedNodes = function getSlottedNodes(el) {
      if (isSlot(el)) {
        return el.assignedNodes({
          flatten: true
        }).filter(function (item) {
          return item instanceof HTMLElement;
        });
      }

      return [el];
    };

    var slottedNodes = getSlottedNodes(value);
    slottedNodes.forEach(function (el) {
      if (!(el instanceof slotData.type)) {
        throw new Error("".concat(el, " is not of type ").concat(slotData.type));
      }
    });
    return value;
  };

  /**
   * Runs a component's template with the component's current state, while also scoping HTML
   *
   * @param template - the template to execute
   * @param component - the component
   * @public
   * @returns {*}
   */

  var executeTemplate = function executeTemplate(template, component) {
    var tagsToScope = component.constructor.getUniqueDependencies().map(function (dep) {
      return dep.getMetadata().getPureTag();
    }).filter(shouldScopeCustomElement);
    var scope = getCustomElementsScopingSuffix();
    return template(component, tagsToScope, scope);
  };

  var getStaticAreaInstance = function getStaticAreaInstance() {
    return getSingletonElementInstance("ui5-static-area");
  };

  var removeStaticArea = function removeStaticArea() {
    getStaticAreaInstance().destroy();
  };

  var StaticAreaElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(StaticAreaElement, _HTMLElement);

    function StaticAreaElement() {
      _classCallCheck(this, StaticAreaElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(StaticAreaElement).call(this));
    }

    _createClass(StaticAreaElement, [{
      key: "destroy",
      value: function destroy() {
        var staticAreaDomRef = document.querySelector(this.tagName.toLowerCase());
        staticAreaDomRef.parentElement.removeChild(staticAreaDomRef);
      }
    }, {
      key: "isUI5Element",
      get: function get() {
        return true;
      }
    }]);

    return StaticAreaElement;
  }(_wrapNativeSuper(HTMLElement));

  if (!customElements.get("ui5-static-area")) {
    customElements.define("ui5-static-area", StaticAreaElement);
  }

  var getStylesString = function getStylesString(styles) {
    if (Array.isArray(styles)) {
      return flatten(styles).join(" ");
    }

    return styles;
  };

  var flatten = function flatten(arr) {
    return arr.reduce(function (acc, val) {
      return acc.concat(Array.isArray(val) ? flatten(val) : val);
    }, []);
  };

  /**
   * @class
   * @author SAP SE
   * @private
   * Defines and takes care of ui5-static-are-item items
   */

  var StaticAreaItem =
  /*#__PURE__*/
  function () {
    function StaticAreaItem(_ui5ElementContext) {
      _classCallCheck(this, StaticAreaItem);

      this.ui5ElementContext = _ui5ElementContext;
      this._rendered = false;
    }

    _createClass(StaticAreaItem, [{
      key: "isRendered",
      value: function isRendered() {
        return this._rendered;
      }
      /**
       * @protected
       */

    }, {
      key: "_updateFragment",
      value: function _updateFragment() {
        var renderResult = executeTemplate(this.ui5ElementContext.constructor.staticAreaTemplate, this.ui5ElementContext),
            stylesToAdd = window.ShadyDOM ? false : getStylesString(this.ui5ElementContext.constructor.staticAreaStyles);

        if (!this.staticAreaItemDomRef) {
          // Initial rendering of fragment
          this.staticAreaItemDomRef = document.createElement("ui5-static-area-item");
          this.staticAreaItemDomRef.attachShadow({
            mode: "open"
          });
          this.staticAreaItemDomRef.classList.add(this.ui5ElementContext._id); // used for getting the popover in the tests

          getStaticAreaInstance().appendChild(this.staticAreaItemDomRef);
          this._rendered = true;
        }

        this._updateContentDensity(this.ui5ElementContext.isCompact);

        this.ui5ElementContext.constructor.render(renderResult, this.staticAreaItemDomRef.shadowRoot, stylesToAdd, {
          eventContext: this.ui5ElementContext
        });
      }
      /**
       * @protected
       */

    }, {
      key: "_removeFragmentFromStaticArea",
      value: function _removeFragmentFromStaticArea() {
        if (!this.staticAreaItemDomRef) {
          return;
        }

        var staticArea = getStaticAreaInstance();
        staticArea.removeChild(this.staticAreaItemDomRef);
        this.staticAreaItemDomRef = null; // remove static area

        if (staticArea.childElementCount < 1) {
          removeStaticArea();
        }
      }
      /**
       * @protected
       */

    }, {
      key: "_updateContentDensity",
      value: function _updateContentDensity(isCompact) {
        if (!this.staticAreaItemDomRef) {
          return;
        }

        if (isCompact) {
          this.staticAreaItemDomRef.classList.add("sapUiSizeCompact");
          this.staticAreaItemDomRef.classList.add("ui5-content-density-compact");
        } else {
          this.staticAreaItemDomRef.classList.remove("sapUiSizeCompact");
          this.staticAreaItemDomRef.classList.remove("ui5-content-density-compact");
        }
      }
      /**
       * @protected
       * Returns reference to the DOM element where the current fragment is added.
       */

    }, {
      key: "getDomRef",
      value: function () {
        var _getDomRef = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!this._rendered || !this.staticAreaItemDomRef) {
                    this._updateFragment();
                  }

                  _context.next = 3;
                  return RenderScheduler.whenDOMUpdated();

                case 3:
                  return _context.abrupt("return", this.staticAreaItemDomRef.shadowRoot);

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function getDomRef() {
          return _getDomRef.apply(this, arguments);
        }

        return getDomRef;
      }()
    }]);

    return StaticAreaItem;
  }();

  var StaticAreaItemElement =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(StaticAreaItemElement, _HTMLElement);

    function StaticAreaItemElement() {
      _classCallCheck(this, StaticAreaItemElement);

      return _possibleConstructorReturn(this, _getPrototypeOf(StaticAreaItemElement).call(this));
    }

    _createClass(StaticAreaItemElement, [{
      key: "isUI5Element",
      get: function get() {
        return true;
      }
    }]);

    return StaticAreaItemElement;
  }(_wrapNativeSuper(HTMLElement));

  if (!customElements.get("ui5-static-area-item")) {
    customElements.define("ui5-static-area-item", StaticAreaItemElement);
  }

  // Shorthands
  var w = window; // Map of observer objects per dom node

  var observers = new WeakMap();
  /**
   * Implements universal DOM node observation methods.
   */

  var DOMObserver =
  /*#__PURE__*/
  function () {
    function DOMObserver() {
      _classCallCheck(this, DOMObserver);

      throw new Error("Static class");
    }
    /**
     * This function abstracts out mutation observer usage inside shadow DOM.
     * For native shadow DOM the native mutation observer is used.
     * When the polyfill is used, the observeChildren ShadyDOM method is used instead.
     *
     * @throws Exception
     * Note: does not allow several mutation observers per node. If there is a valid use-case, this behavior can be changed.
     *
     * @param node
     * @param callback
     * @param options - Only used for the native mutation observer
     */


    _createClass(DOMObserver, null, [{
      key: "observeDOMNode",
      value: function observeDOMNode(node, callback, options) {
        var observerObject = observers.get(node);

        if (observerObject) {
          throw new Error("A mutation/ShadyDOM observer is already assigned to this node.");
        }

        if (w.ShadyDOM) {
          observerObject = w.ShadyDOM.observeChildren(node, callback);
        } else {
          observerObject = new MutationObserver(callback);
          observerObject.observe(node, options);
        }

        observers.set(node, observerObject);
      }
      /**
       * De-registers the mutation observer, depending on its type
       * @param node
       */

    }, {
      key: "unobserveDOMNode",
      value: function unobserveDOMNode(node) {
        var observerObject = observers.get(node);

        if (!observerObject) {
          return;
        }

        if (observerObject instanceof MutationObserver) {
          observerObject.disconnect();
        } else {
          w.ShadyDOM.unobserveChildren(observerObject);
        }

        observers["delete"](node);
      }
    }]);

    return DOMObserver;
  }();

  var excludeList = ["value-changed"];

  var shouldFireOriginalEvent = function shouldFireOriginalEvent(eventName) {
    return excludeList.includes(eventName);
  };

  var noConflict;

  var shouldNotFireOriginalEvent = function shouldNotFireOriginalEvent(eventName) {
    var nc = getNoConflict$1();
    return !(nc.events && nc.events.includes && nc.events.includes(eventName));
  };

  var getNoConflict$1 = function getNoConflict$$1() {
    if (noConflict === undefined) {
      noConflict = getNoConflict();
    }

    return noConflict;
  };

  var skipOriginalEvent = function skipOriginalEvent(eventName) {
    var nc = getNoConflict$1(); // Always fire these events

    if (shouldFireOriginalEvent(eventName)) {
      return false;
    } // Read from the configuration


    if (nc === true) {
      return true;
    }

    return !shouldNotFireOriginalEvent(eventName);
  };

  var getDesigntimePropertyAsArray = (function (value) {
    var m = /\$([-a-z0-9A-Z._]+)(?::([^$]*))?\$/.exec(value);
    return m && m[2] ? m[2].split(/,/) : null;
  });

  var M_ISO639_OLD_TO_NEW$1 = {
    "iw": "he",
    "ji": "yi",
    "in": "id",
    "sh": "sr"
  };
  var A_RTL_LOCALES = getDesigntimePropertyAsArray("$cldr-rtl-locales:ar,fa,he$") || [];

  var impliesRTL = function impliesRTL(language) {
    language = language && M_ISO639_OLD_TO_NEW$1[language] || language;
    return A_RTL_LOCALES.indexOf(language) >= 0;
  };

  var getRTL$1 = function getRTL$$1() {
    var configurationRTL = getRTL();

    if (configurationRTL !== null) {
      return !!configurationRTL;
    }

    return impliesRTL(getLanguage$1() || detectNavigatorLanguage());
  };
   // eslint-disable-line

  var eventProvider$1 = new EventProvider();
  var CUSTOM_CSS_CHANGE = "CustomCSSChange";

  var attachCustomCSSChange = function attachCustomCSSChange(listener) {
    eventProvider$1.attachEvent(CUSTOM_CSS_CHANGE, listener);
  };

  var customCSSFor = {};

  var getCustomCSS = function getCustomCSS(tag) {
    return customCSSFor[tag] ? customCSSFor[tag].join("") : "";
  };

  var effectiveStyleMap = new Map();
  attachCustomCSSChange(function (tag) {
    effectiveStyleMap["delete"](tag);
  });

  var getEffectiveStyle = function getEffectiveStyle(ElementClass) {
    var tag = ElementClass.getMetadata().getTag();

    if (!effectiveStyleMap.has(tag)) {
      var customStyle = getCustomCSS(tag) || "";
      var builtInStyles = getStylesString(ElementClass.styles);
      var effectiveStyle = "".concat(builtInStyles, " ").concat(customStyle);
      effectiveStyleMap.set(tag, effectiveStyle);
    }

    return effectiveStyleMap.get(tag);
  };

  var constructableStyleMap = new Map();
  attachCustomCSSChange(function (tag) {
    constructableStyleMap["delete"](tag);
  });
  /**
   * Returns (and caches) a constructable style sheet for a web component class
   * Note: Chrome
   * @param ElementClass
   * @returns {*}
   */

  var getConstructableStyle = function getConstructableStyle(ElementClass) {
    var tag = ElementClass.getMetadata().getTag();

    if (!constructableStyleMap.has(tag)) {
      var styleContent = getEffectiveStyle(ElementClass);
      var style = new CSSStyleSheet();
      style.replaceSync(styleContent);
      constructableStyleMap.set(tag, [style]);
    }

    return constructableStyleMap.get(tag);
  };

  var findClosingParenthesisPos = function findClosingParenthesisPos(str, openingParenthesisPos) {
    var opened = 1;

    for (var pos = openingParenthesisPos + 1; pos < str.length; pos++) {
      var _char = str.charAt(pos);

      if (_char === "(") {
        opened++;
      } else if (_char === ")") {
        opened--;
      }

      if (opened === 0) {
        return pos;
      }
    }
  };

  var replaceSelector = function replaceSelector(str, selector, selectorStartPos, replacement) {
    var charAfterSelectorPos = selectorStartPos + selector.length;
    var charAfterSelector = str.charAt(charAfterSelectorPos);
    var upToSelector = str.substring(0, selectorStartPos) + replacement;

    if (charAfterSelector === "(") {
      var closingParenthesisPos = findClosingParenthesisPos(str, charAfterSelectorPos);
      return upToSelector + str.substring(charAfterSelectorPos + 1, closingParenthesisPos) + str.substring(closingParenthesisPos + 1);
    }

    return upToSelector + str.substring(charAfterSelectorPos);
  };
  /**
   * :host => ui5-button
   * :host([expr]) => ui5-button[expr]
   * ::slotted(expr) => expr
   * @param str - source string
   * @param selector - :host or ::slotted
   * @param replacement - normally tag name
   * @returns {*}
   */


  var replaceSelectors = function replaceSelectors(str, selector, replacement) {
    var selectorStartPos = str.indexOf(selector);

    while (selectorStartPos !== -1) {
      str = replaceSelector(str, selector, selectorStartPos, replacement);
      selectorStartPos = str.indexOf(selector);
    }

    return str;
  };

  var adaptLinePart = function adaptLinePart(line, tag, pureTag) {
    line = line.trim();
    line = replaceSelectors(line, "::slotted", ""); // first remove all ::slotted() occurrences
    // Host selector - replace it

    if (line.startsWith(":host")) {
      return replaceSelector(line, ":host", 0, tag);
    } // Leave out @keyframes and keyframe values (0%, 100%, etc...)
    // csso shortens '100%' -> 'to', make sure to leave it untouched


    if (line.match(/^[@0-9]/) || line === "to" || line === "to{") {
      return line;
    } // IE specific selector (directly written with the tag, f.e. ui5-button {}) - keep it


    if (line.match(new RegExp("^".concat(tag, "[^a-zA-Z0-9-]")))) {
      return line;
    } // IE specific selector (directly written with the tag attribute, f.e. [ui5-button] {}) - keep it


    if (pureTag && line.startsWith("[".concat(pureTag, "]"))) {
      return line;
    } // No host and no tag in the beginning of the selector - prepend the tag


    return "".concat(tag, " ").concat(line);
  };

  var adaptCSSForIE = function adaptCSSForIE(str, tag, pureTag) {
    str = str.replace(/\n/g, " ");
    str = str.replace(/([{}])/g, "$1\n");
    var result = "";
    var lines = str.split("\n");
    lines.forEach(function (line) {
      var mustProcess = line.match(/{$/); // Only work on lines that end on {, otherwise just append to result

      if (mustProcess) {
        var lineParts = line.split(",");
        var processedLineParts = lineParts.map(function (linePart) {
          return adaptLinePart(linePart, tag, pureTag);
        });
        line = processedLineParts.join(",");
      }

      result = "".concat(result).concat(line);
    });
    return result;
  };

  var IEStyleSet = new Set();
  attachCustomCSSChange(function (tag) {
    IEStyleSet["delete"](tag);
  });

  var getStaticStyle = function getStaticStyle(ElementClass) {
    var componentStaticStyles = ElementClass.staticAreaStyles;

    if (Array.isArray(componentStaticStyles)) {
      componentStaticStyles = componentStaticStyles.join(" ");
    }

    return componentStaticStyles;
  };
  /**
   * Creates the needed CSS for a web component class in the head tag
   * Note: IE11, Edge
   * @param ElementClass
   */


  var createComponentStyleTag = function createComponentStyleTag(ElementClass) {
    var tag = ElementClass.getMetadata().getTag();
    var pureTag = ElementClass.getMetadata().getPureTag();

    if (IEStyleSet.has(tag)) {
      return;
    }

    var cssContent = getEffectiveStyle(ElementClass);
    cssContent = adaptCSSForIE(cssContent, tag, pureTag); // Append static CSS, if any, for IE

    var staticCssContent = getStaticStyle(ElementClass);

    if (staticCssContent) {
      staticCssContent = adaptCSSForIE(staticCssContent, "ui5-static-area-item");
      cssContent = "".concat(cssContent, " ").concat(staticCssContent);
    }

    createStyleInHead(cssContent, {
      "data-ui5-element-styles": tag,
      "disabled": "disabled"
    });

    if (ponyfillNeeded()) {
      schedulePonyfill();
    }

    IEStyleSet.add(tag);
  };

  var Integer =
  /*#__PURE__*/
  function (_DataType) {
    _inherits(Integer, _DataType);

    function Integer() {
      _classCallCheck(this, Integer);

      return _possibleConstructorReturn(this, _getPrototypeOf(Integer).apply(this, arguments));
    }

    _createClass(Integer, null, [{
      key: "isValid",
      value: function isValid(value) {
        return Number.isInteger(value);
      }
    }]);

    return Integer;
  }(DataType);

  var Float =
  /*#__PURE__*/
  function (_DataType) {
    _inherits(Float, _DataType);

    function Float() {
      _classCallCheck(this, Float);

      return _possibleConstructorReturn(this, _getPrototypeOf(Float).apply(this, arguments));
    }

    _createClass(Float, null, [{
      key: "isValid",
      value: function isValid(value) {
        // Assuming that integers are floats as well!
        return Number(value) === value;
      }
    }]);

    return Float;
  }(DataType);

  // Note: disabled is present in IE so we explicitly allow it here.
  // Others, such as title/hidden, we explicitly override, so valid too
  var whitelist = ["disabled", "title", "hidden"];
  /**
   * Checks whether a property name is valid (does not collide with existing DOM API properties)
   *
   * @param name
   * @returns {boolean}
   */

  var isValidPropertyName = function isValidPropertyName(name) {
    if (whitelist.includes(name) || name.startsWith("aria")) {
      return true;
    }

    var classes = [HTMLElement, Element, Node];
    return !classes.some(function (klass) {
      return klass.prototype.hasOwnProperty(name);
    }); // eslint-disable-line
  };

  var metadata = {
    events: {
      "_property-change": {}
    }
  };
  var autoId = 0;
  var elementTimeouts = new Map();
  var uniqueDependenciesCache = new Map();
  var GLOBAL_CONTENT_DENSITY_CSS_VAR = "--_ui5_content_density";
  var GLOBAL_DIR_CSS_VAR = "--_ui5_dir";
  /**
   * Base class for all UI5 Web Components
   *
   * @class
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.base.UI5Element
   * @extends HTMLElement
   * @public
   */

  var UI5Element =
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(UI5Element, _HTMLElement);

    function UI5Element() {
      var _this;

      _classCallCheck(this, UI5Element);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(UI5Element).call(this));

      _this._initializeState();

      _this._upgradeAllProperties();

      _this._initializeContainers();

      _this._upToDate = false;
      _this._inDOM = false;
      _this._fullyConnected = false;
      var deferredResolve;
      _this._domRefReadyPromise = new Promise(function (resolve) {
        deferredResolve = resolve;
      });
      _this._domRefReadyPromise._deferredResolve = deferredResolve;
      _this._monitoredChildProps = new Map();
      _this._firePropertyChange = false;
      _this._shouldInvalidateParent = false;
      return _this;
    }
    /**
     * Returns a unique ID for this UI5 Element
     *
     * @deprecated - This property is not guaranteed in future releases
     * @protected
     */


    _createClass(UI5Element, [{
      key: "_initializeContainers",

      /**
       * @private
       */
      value: function _initializeContainers() {
        var needsShadowDOM = this.constructor._needsShadowDOM();

        var needsStaticArea = this.constructor._needsStaticArea(); // Init Shadow Root


        if (needsShadowDOM) {
          this.attachShadow({
            mode: "open"
          });
        } // Init StaticAreaItem only if needed


        if (needsStaticArea) {
          this.staticAreaItem = new StaticAreaItem(this);
        }
      }
      /**
       * Do not call this method from derivatives of UI5Element, use "onEnterDOM" only
       * @private
       */

    }, {
      key: "connectedCallback",
      value: function () {
        var _connectedCallback = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee() {
          var needsShadowDOM, slotsAreManaged;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  this.setAttribute(this.constructor.getMetadata().getPureTag(), "");
                  needsShadowDOM = this.constructor._needsShadowDOM();
                  slotsAreManaged = this.constructor.getMetadata().slotsAreManaged();
                  this._inDOM = true;

                  if (!slotsAreManaged) {
                    _context.next = 8;
                    break;
                  }

                  // always register the observer before yielding control to the main thread (await)
                  this._startObservingDOMChildren();

                  _context.next = 8;
                  return this._processChildren();

                case 8:
                  if (!needsShadowDOM) {
                    _context.next = 19;
                    break;
                  }

                  if (this.shadowRoot) {
                    _context.next = 12;
                    break;
                  }

                  _context.next = 12;
                  return Promise.resolve();

                case 12:
                  if (this._inDOM) {
                    _context.next = 14;
                    break;
                  }

                  return _context.abrupt("return");

                case 14:
                  RenderScheduler.register(this);
                  RenderScheduler.renderImmediately(this);

                  this._domRefReadyPromise._deferredResolve();

                  this._fullyConnected = true;

                  if (typeof this.onEnterDOM === "function") {
                    this.onEnterDOM();
                  }

                case 19:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function connectedCallback() {
          return _connectedCallback.apply(this, arguments);
        }

        return connectedCallback;
      }()
      /**
       * Do not call this method from derivatives of UI5Element, use "onExitDOM" only
       * @private
       */

    }, {
      key: "disconnectedCallback",
      value: function disconnectedCallback() {
        var needsShadowDOM = this.constructor._needsShadowDOM();

        var needsStaticArea = this.constructor._needsStaticArea();

        var slotsAreManaged = this.constructor.getMetadata().slotsAreManaged();
        this._inDOM = false;

        if (slotsAreManaged) {
          this._stopObservingDOMChildren();
        }

        if (needsShadowDOM) {
          RenderScheduler.deregister(this);

          if (this._fullyConnected) {
            if (typeof this.onExitDOM === "function") {
              this.onExitDOM();
            }

            this._fullyConnected = false;
          }
        }

        if (needsStaticArea) {
          this.staticAreaItem._removeFragmentFromStaticArea();
        }

        RenderScheduler.cancelRender(this);
      }
      /**
       * @private
       */

    }, {
      key: "_startObservingDOMChildren",
      value: function _startObservingDOMChildren() {
        var shouldObserveChildren = this.constructor.getMetadata().hasSlots();

        if (!shouldObserveChildren) {
          return;
        }

        var canSlotText = this.constructor.getMetadata().canSlotText();
        var mutationObserverOptions = {
          childList: true,
          subtree: canSlotText,
          characterData: true
        };
        DOMObserver.observeDOMNode(this, this._processChildren.bind(this), mutationObserverOptions);
      }
      /**
       * @private
       */

    }, {
      key: "_stopObservingDOMChildren",
      value: function _stopObservingDOMChildren() {
        DOMObserver.unobserveDOMNode(this);
      }
      /**
       * Note: this method is also manually called by "compatibility/patchNodeValue.js"
       * @private
       */

    }, {
      key: "_processChildren",
      value: function () {
        var _processChildren2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2() {
          var hasSlots;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  hasSlots = this.constructor.getMetadata().hasSlots();

                  if (!hasSlots) {
                    _context2.next = 4;
                    break;
                  }

                  _context2.next = 4;
                  return this._updateSlots();

                case 4:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function _processChildren() {
          return _processChildren2.apply(this, arguments);
        }

        return _processChildren;
      }()
      /**
       * @private
       */

    }, {
      key: "_updateSlots",
      value: function () {
        var _updateSlots2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee4() {
          var _this2 = this;

          var slotsMap, canSlotText, domChildren, _i, _Object$entries, _Object$entries$_i, slotName, slotData, autoIncrementMap, slottedChildrenMap, allChildrenUpgraded;

          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  slotsMap = this.constructor.getMetadata().getSlots();
                  canSlotText = this.constructor.getMetadata().canSlotText();
                  domChildren = Array.from(canSlotText ? this.childNodes : this.children); // Init the _state object based on the supported slots

                  for (_i = 0, _Object$entries = Object.entries(slotsMap); _i < _Object$entries.length; _i++) {
                    _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), slotName = _Object$entries$_i[0], slotData = _Object$entries$_i[1];

                    // eslint-disable-line
                    this._clearSlot(slotName, slotData);
                  }

                  autoIncrementMap = new Map();
                  slottedChildrenMap = new Map();
                  allChildrenUpgraded = domChildren.map(
                  /*#__PURE__*/
                  function () {
                    var _ref = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee3(child, idx) {
                      var slotName, slotData, validValues, nextIndex, localName, isCustomElement, isDefined, whenDefinedPromise, timeoutPromise, propertyName;
                      return regeneratorRuntime.wrap(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              // Determine the type of the child (mainly by the slot attribute)
                              slotName = _this2.constructor._getSlotName(child);
                              slotData = slotsMap[slotName]; // Check if the slotName is supported

                              if (!(slotData === undefined)) {
                                _context3.next = 6;
                                break;
                              }

                              validValues = Object.keys(slotsMap).join(", ");
                              console.warn("Unknown slotName: ".concat(slotName, ", ignoring"), child, "Valid values are: ".concat(validValues)); // eslint-disable-line

                              return _context3.abrupt("return");

                            case 6:
                              // For children that need individual slots, calculate them
                              if (slotData.individualSlots) {
                                nextIndex = (autoIncrementMap.get(slotName) || 0) + 1;
                                autoIncrementMap.set(slotName, nextIndex);
                                child._individualSlot = "".concat(slotName, "-").concat(nextIndex);
                              } // Await for not-yet-defined custom elements


                              if (!(child instanceof HTMLElement)) {
                                _context3.next = 19;
                                break;
                              }

                              localName = child.localName;
                              isCustomElement = localName.includes("-");

                              if (!isCustomElement) {
                                _context3.next = 19;
                                break;
                              }

                              isDefined = window.customElements.get(localName);

                              if (isDefined) {
                                _context3.next = 18;
                                break;
                              }

                              whenDefinedPromise = window.customElements.whenDefined(localName); // Class registered, but instances not upgraded yet

                              timeoutPromise = elementTimeouts.get(localName);

                              if (!timeoutPromise) {
                                timeoutPromise = new Promise(function (resolve) {
                                  return setTimeout(resolve, 1000);
                                });
                                elementTimeouts.set(localName, timeoutPromise);
                              }

                              _context3.next = 18;
                              return Promise.race([whenDefinedPromise, timeoutPromise]);

                            case 18:
                              window.customElements.upgrade(child);

                            case 19:
                              child = _this2.constructor.getMetadata().constructor.validateSlotValue(child, slotData);

                              if (child.isUI5Element && slotData.listenFor) {
                                _this2._attachChildPropertyUpdated(child, slotData.listenFor);
                              }

                              if (child.isUI5Element && slotData.invalidateParent) {
                                child._shouldInvalidateParent = true;
                              }

                              if (isSlot(child)) {
                                _this2._attachSlotChange(child);
                              }

                              propertyName = slotData.propertyName || slotName;

                              if (slottedChildrenMap.has(propertyName)) {
                                slottedChildrenMap.get(propertyName).push({
                                  child: child,
                                  idx: idx
                                });
                              } else {
                                slottedChildrenMap.set(propertyName, [{
                                  child: child,
                                  idx: idx
                                }]);
                              }

                            case 25:
                            case "end":
                              return _context3.stop();
                          }
                        }
                      }, _callee3);
                    }));

                    return function (_x, _x2) {
                      return _ref.apply(this, arguments);
                    };
                  }());
                  _context4.next = 9;
                  return Promise.all(allChildrenUpgraded);

                case 9:
                  // Distribute the child in the _state object, keeping the Light DOM order,
                  // not the order elements are defined.
                  slottedChildrenMap.forEach(function (children, slot) {
                    _this2._state[slot] = children.sort(function (a, b) {
                      return a.idx - b.idx;
                    }).map(function (_) {
                      return _.child;
                    });
                  });

                  this._invalidate("slots");

                case 11:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function _updateSlots() {
          return _updateSlots2.apply(this, arguments);
        }

        return _updateSlots;
      }()
      /**
       * Removes all children from the slot and detaches listeners, if any
       * @private
       */

    }, {
      key: "_clearSlot",
      value: function _clearSlot(slotName, slotData) {
        var _this3 = this;

        var propertyName = slotData.propertyName || slotName;
        var children = this._state[propertyName];

        if (!Array.isArray(children)) {
          children = [children];
        }

        children.forEach(function (child) {
          if (child && child.isUI5Element) {
            _this3._detachChildPropertyUpdated(child);

            child._shouldInvalidateParent = false;
          }

          if (isSlot(child)) {
            _this3._detachSlotChange(child);
          }
        });
        this._state[propertyName] = [];

        this._invalidate(propertyName, []);
      }
      /**
       * Do not override this method in derivatives of UI5Element
       * @private
       */

    }, {
      key: "attributeChangedCallback",
      value: function attributeChangedCallback(name, oldValue, newValue) {
        var properties = this.constructor.getMetadata().getProperties();
        var realName = name.replace(/^ui5-/, "");
        var nameInCamelCase = kebabToCamelCase(realName);

        if (properties.hasOwnProperty(nameInCamelCase)) {
          // eslint-disable-line
          var propertyTypeClass = properties[nameInCamelCase].type;

          if (propertyTypeClass === Boolean) {
            newValue = newValue !== null;
          }

          if (propertyTypeClass === Integer) {
            newValue = parseInt(newValue);
          }

          if (propertyTypeClass === Float) {
            newValue = parseFloat(newValue);
          }

          this[nameInCamelCase] = newValue;
        }
      }
      /**
       * @private
       */

    }, {
      key: "_updateAttribute",
      value: function _updateAttribute(name, newValue) {
        if (!this.constructor.getMetadata().hasAttribute(name)) {
          return;
        }

        if (_typeof(newValue) === "object") {
          return;
        }

        var attrName = camelToKebabCase(name);
        var attrValue = this.getAttribute(attrName);

        if (typeof newValue === "boolean") {
          if (newValue === true && attrValue === null) {
            this.setAttribute(attrName, "");
          } else if (newValue === false && attrValue !== null) {
            this.removeAttribute(attrName);
          }
        } else if (attrValue !== newValue) {
          this.setAttribute(attrName, newValue);
        }
      }
      /**
       * @private
       */

    }, {
      key: "_upgradeProperty",
      value: function _upgradeProperty(prop) {
        if (this.hasOwnProperty(prop)) {
          // eslint-disable-line
          var value = this[prop];
          delete this[prop];
          this[prop] = value;
        }
      }
      /**
       * @private
       */

    }, {
      key: "_upgradeAllProperties",
      value: function _upgradeAllProperties() {
        var allProps = this.constructor.getMetadata().getPropertiesList();
        allProps.forEach(this._upgradeProperty, this);
      }
      /**
       * @private
       */

    }, {
      key: "_initializeState",
      value: function _initializeState() {
        var defaultState = this.constructor._getDefaultState();

        this._state = Object.assign({}, defaultState);
      }
      /**
       * @private
       */

    }, {
      key: "_attachChildPropertyUpdated",
      value: function _attachChildPropertyUpdated(child, listenFor) {
        var childMetadata = child.constructor.getMetadata(),
            slotName = this.constructor._getSlotName(child),
            // all slotted children have the same configuration
        childProperties = childMetadata.getProperties();

        var observedProps = [],
            notObservedProps = [];

        if (Array.isArray(listenFor)) {
          observedProps = listenFor;
        } else {
          observedProps = Array.isArray(listenFor.props) ? listenFor.props : Object.keys(childProperties);
          notObservedProps = Array.isArray(listenFor.exclude) ? listenFor.exclude : [];
        }

        if (!this._monitoredChildProps.has(slotName)) {
          this._monitoredChildProps.set(slotName, {
            observedProps: observedProps,
            notObservedProps: notObservedProps
          });
        }

        child.addEventListener("_property-change", this._invalidateParentOnPropertyUpdate);
        child._firePropertyChange = true;
      }
      /**
       * @private
       */

    }, {
      key: "_detachChildPropertyUpdated",
      value: function _detachChildPropertyUpdated(child) {
        child.removeEventListener("_property-change", this._invalidateParentOnPropertyUpdate);
        child._firePropertyChange = false;
      }
      /**
       * @private
       */

    }, {
      key: "_propertyChange",
      value: function _propertyChange(name, value) {
        this._updateAttribute(name, value);

        if (this._firePropertyChange) {
          this.dispatchEvent(new CustomEvent("_property-change", {
            detail: {
              name: name,
              newValue: value
            },
            composed: false,
            bubbles: true
          }));
        }
      }
      /**
       * @private
       */

    }, {
      key: "_invalidateParentOnPropertyUpdate",
      value: function _invalidateParentOnPropertyUpdate(prop) {
        // The web component to be invalidated
        var parentNode = this.parentNode;

        if (!parentNode) {
          return;
        }

        var slotName = parentNode.constructor._getSlotName(this);

        var propsMetadata = parentNode._monitoredChildProps.get(slotName);

        if (!propsMetadata) {
          return;
        }

        var observedProps = propsMetadata.observedProps,
            notObservedProps = propsMetadata.notObservedProps;

        if (observedProps.includes(prop.detail.name) && !notObservedProps.includes(prop.detail.name)) {
          parentNode._invalidate("_parent_", this);
        }
      }
      /**
       * @private
       */

    }, {
      key: "_attachSlotChange",
      value: function _attachSlotChange(child) {
        var _this4 = this;

        if (!this._invalidateOnSlotChange) {
          this._invalidateOnSlotChange = function () {
            _this4._invalidate("slotchange");
          };
        }

        child.addEventListener("slotchange", this._invalidateOnSlotChange);
      }
      /**
       * @private
       */

    }, {
      key: "_detachSlotChange",
      value: function _detachSlotChange(child) {
        child.removeEventListener("slotchange", this._invalidateOnSlotChange);
      }
      /**
       * Asynchronously re-renders an already rendered web component
       * @private
       */

    }, {
      key: "_invalidate",
      value: function _invalidate() {
        if (this._shouldInvalidateParent) {
          this.parentNode._invalidate();
        }

        if (!this._upToDate) {
          // console.log("already invalidated", this, ...arguments);
          return;
        }

        if (this.getDomRef() && !this._suppressInvalidation) {
          this._upToDate = false; // console.log("INVAL", this, ...arguments);

          RenderScheduler.renderDeferred(this);
        }
      }
      /**
       * Do not call this method directly, only intended to be called by RenderScheduler.js
       * @protected
       */

    }, {
      key: "_render",
      value: function _render() {
        var hasIndividualSlots = this.constructor.getMetadata().hasIndividualSlots(); // suppress invalidation to prevent state changes scheduling another rendering

        this._suppressInvalidation = true;

        if (typeof this.onBeforeRendering === "function") {
          this.onBeforeRendering();
        } // Intended for framework usage only. Currently ItemNavigation updates tab indexes after the component has updated its state but before the template is rendered


        if (this._onComponentStateFinalized) {
          this._onComponentStateFinalized();
        } // resume normal invalidation handling


        delete this._suppressInvalidation; // Update the shadow root with the render result
        // console.log(this.getDomRef() ? "RE-RENDER" : "FIRST RENDER", this);

        this._upToDate = true;

        this._updateShadowRoot();

        if (this._shouldUpdateFragment()) {
          this.staticAreaItem._updateFragment(this);
        } // Safari requires that children get the slot attribute only after the slot tags have been rendered in the shadow DOM


        if (hasIndividualSlots) {
          this._assignIndividualSlotsToChildren();
        } // Call the onAfterRendering hook


        if (typeof this.onAfterRendering === "function") {
          this.onAfterRendering();
        }
      }
      /**
       * @private
       */

    }, {
      key: "_updateShadowRoot",
      value: function _updateShadowRoot() {
        if (!this.constructor._needsShadowDOM()) {
          return;
        }

        var styleToPrepend;
        var renderResult = executeTemplate(this.constructor.template, this); // IE11, Edge

        if (window.ShadyDOM) {
          createComponentStyleTag(this.constructor);
        } // Chrome


        if (document.adoptedStyleSheets) {
          this.shadowRoot.adoptedStyleSheets = getConstructableStyle(this.constructor);
        } // FF, Safari


        if (!document.adoptedStyleSheets && !window.ShadyDOM) {
          styleToPrepend = getEffectiveStyle(this.constructor);
        }

        this.constructor.render(renderResult, this.shadowRoot, styleToPrepend, {
          eventContext: this
        });
      }
      /**
       * @private
       */

    }, {
      key: "_assignIndividualSlotsToChildren",
      value: function _assignIndividualSlotsToChildren() {
        var domChildren = Array.from(this.children);
        domChildren.forEach(function (child) {
          if (child._individualSlot) {
            child.setAttribute("slot", child._individualSlot);
          }
        });
      }
      /**
       * @private
       */

    }, {
      key: "_waitForDomRef",
      value: function _waitForDomRef() {
        return this._domRefReadyPromise;
      }
      /**
       * Returns the DOM Element inside the Shadow Root that corresponds to the opening tag in the UI5 Web Component's template
       * Use this method instead of "this.shadowRoot" to read the Shadow DOM, if ever necessary
       * @public
       */

    }, {
      key: "getDomRef",
      value: function getDomRef() {
        if (!this.shadowRoot || this.shadowRoot.children.length === 0) {
          return;
        }

        return this.shadowRoot.children.length === 1 ? this.shadowRoot.children[0] : this.shadowRoot.children[1];
      }
      /**
       * Returns the DOM Element marked with "data-sap-focus-ref" inside the template.
       * This is the element that will receive the focus by default.
       * @public
       */

    }, {
      key: "getFocusDomRef",
      value: function getFocusDomRef() {
        var domRef = this.getDomRef();

        if (domRef) {
          var focusRef = domRef.querySelector("[data-sap-focus-ref]");
          return focusRef || domRef;
        }
      }
      /**
       * Use this method in order to get a reference to element in the shadow root of a web component
       * @public
       * @param {String} refName Defines the name of the stable DOM ref
       */

    }, {
      key: "getStableDomRef",
      value: function getStableDomRef(refName) {
        return this.getDomRef().querySelector("[data-ui5-stable=".concat(refName, "]"));
      }
      /**
       * Set the focus to the element, returned by "getFocusDomRef()" (marked by "data-sap-focus-ref")
       * @public
       */

    }, {
      key: "focus",
      value: function () {
        var _focus = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee5() {
          var focusDomRef;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return this._waitForDomRef();

                case 2:
                  focusDomRef = this.getFocusDomRef();

                  if (focusDomRef && typeof focusDomRef.focus === "function") {
                    focusDomRef.focus();
                  }

                case 4:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        function focus() {
          return _focus.apply(this, arguments);
        }

        return focus;
      }()
      /**
       *
       * @public
       * @param name - name of the event
       * @param data - additional data for the event
       * @param cancelable - true, if the user can call preventDefault on the event object
       * @param bubbles - true, if the event bubbles
       * @returns {boolean} false, if the event was cancelled (preventDefault called), true otherwise
       */

    }, {
      key: "fireEvent",
      value: function fireEvent(name, data) {
        var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var bubbles = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        var eventResult = this._fireEvent(name, data, cancelable, bubbles);

        var camelCaseEventName = kebabToCamelCase(name);

        if (camelCaseEventName !== name) {
          return eventResult && this._fireEvent(camelCaseEventName, data, cancelable);
        }

        return eventResult;
      }
    }, {
      key: "_fireEvent",
      value: function _fireEvent(name, data) {
        var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var bubbles = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        var compatEventResult = true; // Initialized to true, because if the event is not fired at all, it should be considered "not-prevented"

        var noConflictEvent = new CustomEvent("ui5-".concat(name), {
          detail: data,
          composed: false,
          bubbles: bubbles,
          cancelable: cancelable
        }); // This will be false if the compat event is prevented

        compatEventResult = this.dispatchEvent(noConflictEvent);

        if (skipOriginalEvent(name)) {
          return compatEventResult;
        }

        var customEvent = new CustomEvent(name, {
          detail: data,
          composed: false,
          bubbles: bubbles,
          cancelable: cancelable
        }); // This will be false if the normal event is prevented

        var normalEventResult = this.dispatchEvent(customEvent); // Return false if any of the two events was prevented (its result was false).

        return normalEventResult && compatEventResult;
      }
      /**
       * Returns the actual children, associated with a slot.
       * Useful when there are transitive slots in nested component scenarios and you don't want to get a list of the slots, but rather of their content.
       * @public
       */

    }, {
      key: "getSlottedNodes",
      value: function getSlottedNodes(slotName) {
        var reducer = function reducer(acc, curr) {
          if (!isSlot(curr)) {
            return acc.concat([curr]);
          }

          return acc.concat(curr.assignedNodes({
            flatten: true
          }).filter(function (item) {
            return item instanceof HTMLElement;
          }));
        };

        return this[slotName].reduce(reducer, []);
      }
    }, {
      key: "updateStaticAreaItemContentDensity",
      value: function updateStaticAreaItemContentDensity() {
        if (this.staticAreaItem) {
          this.staticAreaItem._updateContentDensity(this.isCompact);
        }
      }
      /**
       * Used to duck-type UI5 elements without using instanceof
       * @returns {boolean}
       * @public
       */

    }, {
      key: "_shouldUpdateFragment",
      value: function _shouldUpdateFragment() {
        return this.constructor._needsStaticArea() && this.staticAreaItem.isRendered();
      }
      /**
       * @private
       */

    }, {
      key: "getStaticAreaItemDomRef",

      /**
       * @public
       */
      value: function getStaticAreaItemDomRef() {
        return this.staticAreaItem.getDomRef();
      }
      /**
       * @private
       */

    }, {
      key: "_id",
      get: function get() {
        if (!this.__id) {
          this.__id = "ui5wc_".concat(++autoId);
        }

        return this.__id;
      }
    }, {
      key: "isCompact",
      get: function get() {
        return getComputedStyle(this).getPropertyValue(GLOBAL_CONTENT_DENSITY_CSS_VAR) === "compact";
      }
      /**
       * Determines whether the component should be rendered in RTL mode or not.
       * Returns: "rtl", "ltr" or undefined
       *
       * @public
       * @returns {String|undefined}
       */

    }, {
      key: "effectiveDir",
      get: function get() {
        markAsRtlAware(this.constructor); // if a UI5 Element calls this method, it's considered to be rtl-aware

        var doc = window.document;
        var dirValues = ["ltr", "rtl"]; // exclude "auto" and "" from all calculations

        var locallyAppliedDir = getComputedStyle(this).getPropertyValue(GLOBAL_DIR_CSS_VAR); // In that order, inspect the CSS Var (for modern browsers), the element itself, html and body (for IE fallback)

        if (dirValues.includes(locallyAppliedDir)) {
          return locallyAppliedDir;
        }

        if (dirValues.includes(this.dir)) {
          return this.dir;
        }

        if (dirValues.includes(doc.documentElement.dir)) {
          return doc.documentElement.dir;
        }

        if (dirValues.includes(doc.body.dir)) {
          return doc.body.dir;
        } // Finally, check the configuration for explicitly set RTL or language-implied RTL


        return getRTL$1() ? "rtl" : undefined;
      }
    }, {
      key: "isUI5Element",
      get: function get() {
        return true;
      }
      /**
       * Do not override this method in derivatives of UI5Element, use metadata properties instead
       * @private
       */

    }], [{
      key: "_getSlotName",

      /**
       * @private
       */
      value: function _getSlotName(child) {
        // Text nodes can only go to the default slot
        if (!(child instanceof HTMLElement)) {
          return "default";
        } // Discover the slot based on the real slot name (f.e. footer => footer, or content-32 => content)


        var slot = child.getAttribute("slot");

        if (slot) {
          var match = slot.match(/^(.+?)-\d+$/);
          return match ? match[1] : slot;
        } // Use default slot as a fallback


        return "default";
      }
      /**
       * @private
       */

    }, {
      key: "_needsShadowDOM",
      value: function _needsShadowDOM() {
        return !!this.template;
      }
    }, {
      key: "_needsStaticArea",
      value: function _needsStaticArea() {
        return typeof this.staticAreaTemplate === "function";
      }
    }, {
      key: "_getDefaultState",
      value: function _getDefaultState() {
        if (this._defaultState) {
          return this._defaultState;
        }

        var MetadataClass = this.getMetadata();
        var defaultState = {};
        var slotsAreManaged = MetadataClass.slotsAreManaged(); // Initialize properties

        var props = MetadataClass.getProperties();

        for (var propName in props) {
          // eslint-disable-line
          var propType = props[propName].type;
          var propDefaultValue = props[propName].defaultValue;

          if (propType === Boolean) {
            defaultState[propName] = false;

            if (propDefaultValue !== undefined) {
              console.warn("The 'defaultValue' metadata key is ignored for all booleans properties, they would be initialized with 'false' by default"); // eslint-disable-line
            }
          } else if (props[propName].multiple) {
            defaultState[propName] = [];
          } else if (propType === Object) {
            defaultState[propName] = "defaultValue" in props[propName] ? props[propName].defaultValue : {};
          } else if (propType === String) {
            defaultState[propName] = "defaultValue" in props[propName] ? props[propName].defaultValue : "";
          } else {
            defaultState[propName] = propDefaultValue;
          }
        } // Initialize slots


        if (slotsAreManaged) {
          var slots = MetadataClass.getSlots();

          for (var _i2 = 0, _Object$entries2 = Object.entries(slots); _i2 < _Object$entries2.length; _i2++) {
            var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
                slotName = _Object$entries2$_i[0],
                slotData = _Object$entries2$_i[1];

            // eslint-disable-line
            var propertyName = slotData.propertyName || slotName;
            defaultState[propertyName] = [];
          }
        }

        this._defaultState = defaultState;
        return defaultState;
      }
      /**
       * @private
       */

    }, {
      key: "_generateAccessors",
      value: function _generateAccessors() {
        var proto = this.prototype;
        var slotsAreManaged = this.getMetadata().slotsAreManaged(); // Properties

        var properties = this.getMetadata().getProperties();

        var _loop2 = function _loop2() {
          var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
              prop = _Object$entries3$_i[0],
              propData = _Object$entries3$_i[1];

          // eslint-disable-line
          if (!isValidPropertyName(prop)) {
            throw new Error("\"".concat(prop, "\" is not a valid property name. Use a name that does not collide with DOM APIs"));
          }

          if (propData.type === Boolean && propData.defaultValue) {
            throw new Error("Cannot set a default value for property \"".concat(prop, "\". All booleans are false by default."));
          }

          if (propData.type === Array) {
            throw new Error("Wrong type for property \"".concat(prop, "\". Properties cannot be of type Array - use \"multiple: true\" and set \"type\" to the single value type, such as \"String\", \"Object\", etc..."));
          }

          if (propData.type === Object && propData.defaultValue) {
            throw new Error("Cannot set a default value for property \"".concat(prop, "\". All properties of type \"Object\" are empty objects by default."));
          }

          if (propData.multiple && propData.defaultValue) {
            throw new Error("Cannot set a default value for property \"".concat(prop, "\". All multiple properties are empty arrays by default."));
          }

          Object.defineProperty(proto, prop, {
            get: function get() {
              if (this._state[prop] !== undefined) {
                return this._state[prop];
              }

              var propDefaultValue = propData.defaultValue;

              if (propData.type === Boolean) {
                return false;
              } else if (propData.type === String) {
                // eslint-disable-line
                return propDefaultValue;
              } else if (propData.multiple) {
                // eslint-disable-line
                return [];
              } else {
                return propDefaultValue;
              }
            },
            set: function set(value) {
              value = this.constructor.getMetadata().constructor.validatePropertyValue(value, propData);
              var oldState = this._state[prop];

              if (oldState !== value) {
                this._state[prop] = value;

                this._invalidate(prop, value);

                this._propertyChange(prop, value);
              }
            }
          });
        };

        for (var _i3 = 0, _Object$entries3 = Object.entries(properties); _i3 < _Object$entries3.length; _i3++) {
          _loop2();
        } // Slots


        if (slotsAreManaged) {
          var slots = this.getMetadata().getSlots();

          var _loop = function _loop() {
            var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
                slotName = _Object$entries4$_i[0],
                slotData = _Object$entries4$_i[1];

            // eslint-disable-line
            if (!isValidPropertyName(slotName)) {
              throw new Error("\"".concat(slotName, "\" is not a valid property name. Use a name that does not collide with DOM APIs"));
            }

            var propertyName = slotData.propertyName || slotName;
            Object.defineProperty(proto, propertyName, {
              get: function get() {
                if (this._state[propertyName] !== undefined) {
                  return this._state[propertyName];
                }

                return [];
              },
              set: function set() {
                throw new Error("Cannot set slots directly, use the DOM APIs");
              }
            });
          };

          for (var _i4 = 0, _Object$entries4 = Object.entries(slots); _i4 < _Object$entries4.length; _i4++) {
            _loop();
          }
        }
      }
      /**
       * Returns the metadata object for this UI5 Web Component Class
       * @protected
       */

    }, {
      key: "getUniqueDependencies",

      /**
       * Returns a list of the unique dependencies for this UI5 Web Component
       *
       * @public
       */
      value: function getUniqueDependencies() {
        if (!uniqueDependenciesCache.has(this)) {
          var filtered = this.dependencies.filter(function (dep, index, deps) {
            return deps.indexOf(dep) === index;
          });
          uniqueDependenciesCache.set(this, filtered);
        }

        return uniqueDependenciesCache.get(this);
      }
      /**
       * Returns a promise that resolves whenever all dependencies for this UI5 Web Component have resolved
       *
       * @returns {Promise<any[]>}
       */

    }, {
      key: "whenDependenciesDefined",
      value: function whenDependenciesDefined() {
        return Promise.all(this.getUniqueDependencies().map(function (dep) {
          return dep.define();
        }));
      }
      /**
       * Hook that will be called upon custom element definition
       *
       * @protected
       * @returns {Promise<void>}
       */

    }, {
      key: "onDefine",
      value: function () {
        var _onDefine = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee6() {
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  return _context6.abrupt("return", Promise.resolve());

                case 1:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
        }));

        function onDefine() {
          return _onDefine.apply(this, arguments);
        }

        return onDefine;
      }()
      /**
       * Registers a UI5 Web Component in the browser window object
       * @public
       * @returns {Promise<UI5Element>}
       */

    }, {
      key: "define",
      value: function () {
        var _define = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee7() {
          var tag, altTag, definedLocally, definedGlobally, oldClassName;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  _context7.next = 2;
                  return boot();

                case 2:
                  _context7.next = 4;
                  return Promise.all([this.whenDependenciesDefined(), this.onDefine()]);

                case 4:
                  tag = this.getMetadata().getTag();
                  altTag = this.getMetadata().getAltTag();
                  definedLocally = isTagRegistered(tag);
                  definedGlobally = customElements.get(tag);

                  if (definedGlobally && !definedLocally) {
                    recordTagRegistrationFailure(tag);
                  } else if (!definedGlobally) {
                    this._generateAccessors();

                    registerTag(tag);
                    window.customElements.define(tag, this);

                    if (altTag && !customElements.get(altTag)) {
                      oldClassName =
                      /*#__PURE__*/
                      function (_this5) {
                        _inherits(oldClassName, _this5);

                        function oldClassName() {
                          _classCallCheck(this, oldClassName);

                          return _possibleConstructorReturn(this, _getPrototypeOf(oldClassName).apply(this, arguments));
                        }

                        return oldClassName;
                      }(this);

                      registerTag(altTag);
                      window.customElements.define(altTag, oldClassName);
                    }
                  }

                  return _context7.abrupt("return", this);

                case 10:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));

        function define() {
          return _define.apply(this, arguments);
        }

        return define;
      }()
      /**
       * Returns an instance of UI5ElementMetadata.js representing this UI5 Web Component's full metadata (its and its parents')
       * Note: not to be confused with the "get metadata()" method, which returns an object for this class's metadata only
       * @public
       * @returns {UI5ElementMetadata}
       */

    }, {
      key: "getMetadata",
      value: function getMetadata() {
        if (this.hasOwnProperty("_metadata")) {
          // eslint-disable-line
          return this._metadata;
        }

        var metadataObjects = [this.metadata];
        var klass = this; // eslint-disable-line

        while (klass !== UI5Element) {
          klass = Object.getPrototypeOf(klass);
          metadataObjects.unshift(klass.metadata);
        }

        var mergedMetadata = fnMerge$1.apply(void 0, [{}].concat(metadataObjects));
        this._metadata = new UI5ElementMetadata(mergedMetadata);
        return this._metadata;
      }
    }, {
      key: "observedAttributes",
      get: function get() {
        return this.getMetadata().getAttributesList();
      }
    }, {
      key: "metadata",
      get: function get() {
        return metadata;
      }
      /**
       * Returns the CSS for this UI5 Web Component Class
       * @protected
       */

    }, {
      key: "styles",
      get: function get() {
        return "";
      }
      /**
       * Returns the Static Area CSS for this UI5 Web Component Class
       * @protected
       */

    }, {
      key: "staticAreaStyles",
      get: function get() {
        return "";
      }
      /**
       * Returns an array with the dependencies for this UI5 Web Component, which could be:
       *  - composed components (used in its shadow root or static area item)
       *  - slotted components that the component may need to communicate with
       *
       * @protected
       */

    }, {
      key: "dependencies",
      get: function get() {
        return [];
      }
    }]);

    return UI5Element;
  }(_wrapNativeSuper(HTMLElement));

  exports._classCallCheck = _classCallCheck;
  exports._createClass = _createClass;
  exports._toConsumableArray = _toConsumableArray;
  exports._inherits = _inherits;
  exports._possibleConstructorReturn = _possibleConstructorReturn;
  exports._getPrototypeOf = _getPrototypeOf;
  exports._get = _get;
  exports._typeof = _typeof;
  exports._taggedTemplateLiteral = _taggedTemplateLiteral;
  exports.getI18nBundleData = getI18nBundleData;
  exports.registerThemeProperties = registerThemeProperties;
  exports.DataType = DataType;
  exports._asyncToGenerator = _asyncToGenerator;
  exports.fetchI18nBundle = fetchI18nBundle;
  exports.UI5Element = UI5Element;
  exports.getIconDataSync = getIconDataSync;
  exports.getIconData = getIconData;
  exports.createStyleInHead = createStyleInHead;
  exports._assertThisInitialized = _assertThisInitialized;
  exports.getFeature = getFeature;
  exports.registerIcon = registerIcon;
  exports.getCalendarType = getCalendarType;
  exports.getLocale = getLocale;
  exports.getLanguage = getLanguage$1;
  exports.getDesigntimePropertyAsArray = getDesigntimePropertyAsArray;
  exports.getModuleContent = getModuleContent;
  exports.getFormatSettings = getFormatSettings;
  exports.fetchCldr = fetchCldr;
  exports.Integer = Integer;
  exports._objectSpread2 = _objectSpread2;
  exports.RenderScheduler = RenderScheduler;
  exports.EventProvider = EventProvider;
  exports.registerFeature = registerFeature;
  exports.getAnimationMode = getAnimationMode;
  exports._slicedToArray = _slicedToArray;
  exports.registerI18nBundle = registerI18nBundle;
  exports.executeTemplate = executeTemplate;

});
//# sourceMappingURL=chunk-7ceb84db.js.map
