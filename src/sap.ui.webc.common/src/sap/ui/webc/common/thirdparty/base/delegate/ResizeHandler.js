sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setResizeHandlerUnobserveFn = _exports.setResizeHandlerObserveFn = _exports.default = void 0;
  let resizeObserver;
  const observedElements = new Map();
  const getResizeObserver = () => {
    if (!resizeObserver) {
      resizeObserver = new window.ResizeObserver(entries => {
        entries.forEach(entry => {
          const callbacks = observedElements.get(entry.target);
          callbacks.forEach(callback => callback());
        });
      });
    }
    return resizeObserver;
  };
  let observe = (element, callback) => {
    const callbacks = observedElements.get(element) || [];

    // if no callbacks have been added for this element - start observing it
    if (!callbacks.length) {
      getResizeObserver().observe(element);
    }

    // save the callbacks in an array
    observedElements.set(element, [...callbacks, callback]);
  };
  let unobserve = (element, callback) => {
    const callbacks = observedElements.get(element) || [];
    if (callbacks.length === 0) {
      return;
    }
    const filteredCallbacks = callbacks.filter(fn => fn !== callback);
    if (filteredCallbacks.length === 0) {
      getResizeObserver().unobserve(element);
      observedElements.delete(element);
    } else {
      observedElements.set(element, filteredCallbacks);
    }
  };

  /**
   * Allows to register/deregister resize observers for a DOM element
   *
   * @public
   * @class
    */
  class ResizeHandler {
    /**
     * @static
     * @public
     * @param {*} element UI5 Web Component or DOM Element to be observed
     * @param {*} callback Callback to be executed
     */
    static register(element, callback) {
      if (element.isUI5Element) {
        element = element.getDomRef();
      }
      if (element instanceof HTMLElement) {
        observe(element, callback);
      } else {
        console.warn("Cannot register ResizeHandler for element", element); // eslint-disable-line
      }
    }

    /**
     * @static
     * @public
     * @param {*} element UI5 Web Component or DOM Element to be unobserved
     * @param {*} callback Callback to be removed
     */
    static deregister(element, callback) {
      if (element.isUI5Element) {
        element = element.getDomRef();
      }
      if (element instanceof HTMLElement) {
        unobserve(element, callback);
      } else {
        console.warn("Cannot deregister ResizeHandler for element", element); // eslint-disable-line
      }
    }
  }

  /**
   * Set a function to be executed whenever a DOM node needs to be observed for size change.
   * @public
   * @param fn
   */
  const setResizeHandlerObserveFn = fn => {
    observe = fn;
  };

  /**
   * Set a function to be executed whenever a DOM node needs to no longer be observed for size changes
   * @public
   * @param fn
   */
  _exports.setResizeHandlerObserveFn = setResizeHandlerObserveFn;
  const setResizeHandlerUnobserveFn = fn => {
    unobserve = fn;
  };
  _exports.setResizeHandlerUnobserveFn = setResizeHandlerUnobserveFn;
  var _default = ResizeHandler;
  _exports.default = _default;
});