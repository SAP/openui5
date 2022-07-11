sap.ui.define(["exports", "../InitialConfiguration"], function (_exports, _InitialConfiguration) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.skipOriginalEvent = _exports.setNoConflict = _exports.getNoConflict = void 0;
  // Fire these events even with noConflict: true
  const excludeList = ["value-changed"];

  const shouldFireOriginalEvent = eventName => {
    return excludeList.includes(eventName);
  };

  let noConflict;

  const shouldNotFireOriginalEvent = eventName => {
    const nc = getNoConflict();
    return !(nc.events && nc.events.includes && nc.events.includes(eventName));
  };

  const getNoConflict = () => {
    if (noConflict === undefined) {
      noConflict = (0, _InitialConfiguration.getNoConflict)();
    }

    return noConflict;
  };

  _exports.getNoConflict = getNoConflict;

  const skipOriginalEvent = eventName => {
    const nc = getNoConflict(); // Always fire these events

    if (shouldFireOriginalEvent(eventName)) {
      return false;
    } // Read from the configuration


    if (nc === true) {
      return true;
    }

    return !shouldNotFireOriginalEvent(eventName);
  };

  _exports.skipOriginalEvent = skipOriginalEvent;

  const setNoConflict = noConflictData => {
    noConflict = noConflictData;
  };

  _exports.setNoConflict = setNoConflict;
});