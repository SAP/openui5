sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  class EventProvider {
    constructor() {
      this._eventRegistry = new Map();
    }
    attachEvent(eventName, fnFunction) {
      const eventRegistry = this._eventRegistry;
      const eventListeners = eventRegistry.get(eventName);
      if (!Array.isArray(eventListeners)) {
        eventRegistry.set(eventName, [fnFunction]);
        return;
      }
      if (!eventListeners.includes(fnFunction)) {
        eventListeners.push(fnFunction);
      }
    }
    detachEvent(eventName, fnFunction) {
      const eventRegistry = this._eventRegistry;
      const eventListeners = eventRegistry.get(eventName);
      if (!eventListeners) {
        return;
      }
      const indexOfFnToDetach = eventListeners.indexOf(fnFunction);
      if (indexOfFnToDetach !== -1) {
        eventListeners.splice(indexOfFnToDetach, 1);
      }
      if (eventListeners.length === 0) {
        eventRegistry.delete(eventName);
      }
    }
    /**
     * Fires an event and returns the results of all event listeners as an array.
     *
     * @param eventName the event to fire
     * @param data optional data to pass to each event listener
     * @returns {Array} an array with the results of all event listeners
     */
    fireEvent(eventName, data) {
      const eventRegistry = this._eventRegistry;
      const eventListeners = eventRegistry.get(eventName);
      if (!eventListeners) {
        return [];
      }
      return eventListeners.map(fn => {
        return fn.call(this, data);
      });
    }
    /**
     * Fires an event and returns a promise that will resolve once all listeners have resolved.
     *
     * @param eventName the event to fire
     * @param data optional data to pass to each event listener
     * @returns {Promise} a promise that will resolve when all listeners have resolved
     */
    fireEventAsync(eventName, data) {
      return Promise.all(this.fireEvent(eventName, data));
    }
    isHandlerAttached(eventName, fnFunction) {
      const eventRegistry = this._eventRegistry;
      const eventListeners = eventRegistry.get(eventName);
      if (!eventListeners) {
        return false;
      }
      return eventListeners.includes(fnFunction);
    }
    hasListeners(eventName) {
      return !!this._eventRegistry.get(eventName);
    }
  }
  var _default = EventProvider;
  _exports.default = _default;
});