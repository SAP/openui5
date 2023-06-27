sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.unobserveDOMNode = _exports.observeDOMNode = void 0;
  const observers = new WeakMap();
  /**
   * @param node
   * @param callback
   * @param options
   */
  const observeDOMNode = (node, callback, options) => {
    const observer = new MutationObserver(callback);
    observers.set(node, observer);
    observer.observe(node, options);
  };
  /**
   * @param node
   */
  _exports.observeDOMNode = observeDOMNode;
  const unobserveDOMNode = node => {
    const observer = observers.get(node);
    if (observer) {
      observer.disconnect();
      observers.delete(node);
    }
  };
  _exports.unobserveDOMNode = unobserveDOMNode;
});