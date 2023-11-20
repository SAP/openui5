sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/start-timer-event", "./v3/start-timer-event"], function (_exports, _Theme, _startTimerEvent, _startTimerEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _startTimerEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _startTimerEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _startTimerEvent.pathData : _startTimerEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/start-timer-event";
  _exports.default = _default;
});