sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/terminate-end-event", "./v3/terminate-end-event"], function (_exports, _Theme, _terminateEndEvent, _terminateEndEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _terminateEndEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _terminateEndEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _terminateEndEvent.pathData : _terminateEndEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/terminate-end-event";
  _exports.default = _default;
});