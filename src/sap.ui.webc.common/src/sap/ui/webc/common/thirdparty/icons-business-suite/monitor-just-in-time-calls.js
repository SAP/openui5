sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/monitor-just-in-time-calls", "./v2/monitor-just-in-time-calls"], function (_exports, _Theme, _monitorJustInTimeCalls, _monitorJustInTimeCalls2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _monitorJustInTimeCalls.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _monitorJustInTimeCalls.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _monitorJustInTimeCalls.pathData : _monitorJustInTimeCalls2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/monitor-just-in-time-calls";
  _exports.default = _default;
});