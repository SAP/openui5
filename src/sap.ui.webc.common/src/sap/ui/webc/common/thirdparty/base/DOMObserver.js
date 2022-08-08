sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.unobserveDOMNode = _exports.setDestroyObserverCallback = _exports.setCreateObserverCallback = _exports.observeDOMNode = void 0;
  const observers = new WeakMap(); // We want just one observer per node, store them here -> DOM nodes are keys

  /**
   * Default implementation with MutationObserver for browsers with native support
   */

  let _createObserver = (node, callback, options) => {
    const observer = new MutationObserver(callback);
    observer.observe(node, options);
    return observer;
  };
  /**
   * Default implementation with MutationObserver for browsers with native support
   */


  let _destroyObserver = observer => {
    observer.disconnect();
  };
  /**
   * Allows to create an alternative DOM observer implementation
   * @param createFn
   */


  const setCreateObserverCallback = createFn => {
    if (typeof createFn === "function") {
      _createObserver = createFn;
    }
  };
  /**
   * Allows to create an alternative DOM observer implementation
   * @param destroyFn
   */


  _exports.setCreateObserverCallback = setCreateObserverCallback;

  const setDestroyObserverCallback = destroyFn => {
    if (typeof destroyFn === "function") {
      _destroyObserver = destroyFn;
    }
  };
  /**
   * @param node
   * @param callback
   * @param options
   */


  _exports.setDestroyObserverCallback = setDestroyObserverCallback;

  const observeDOMNode = (node, callback, options) => {
    const observer = _createObserver(node, callback, options);

    observers.set(node, observer);
  };
  /**
   * @param node
   */


  _exports.observeDOMNode = observeDOMNode;

  const unobserveDOMNode = node => {
    const observer = observers.get(node);

    if (observer) {
      _destroyObserver(observer);

      observers.delete(node);
    }
  };

  _exports.unobserveDOMNode = unobserveDOMNode;
});