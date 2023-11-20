sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Returns an event class decorator.
   *
   * @param { string } name the event name
   * @param { EventData } data the event data
   * @returns { ClassDecorator }
   */
  const event = (name, data = {}) => {
    return target => {
      if (!Object.prototype.hasOwnProperty.call(target, "metadata")) {
        target.metadata = {};
      }
      const metadata = target.metadata;
      if (!metadata.events) {
        metadata.events = {};
      }
      const eventsMetadata = metadata.events;
      if (!eventsMetadata[name]) {
        eventsMetadata[name] = data;
      }
    };
  };
  var _default = event;
  _exports.default = _default;
});