sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.markEvent = _exports.getEventMark = void 0;
  const markedEvents = new WeakMap();
  /**
   * Marks the given event with random marker.
   */
  const markEvent = (event, value) => {
    markedEvents.set(event, value);
  };
  /**
   * Returns the marker for the given event.
   */
  _exports.markEvent = markEvent;
  const getEventMark = event => {
    return markedEvents.get(event);
  };
  _exports.getEventMark = getEventMark;
});