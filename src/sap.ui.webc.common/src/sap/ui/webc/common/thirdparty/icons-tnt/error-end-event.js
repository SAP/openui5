sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/error-end-event", "./v3/error-end-event"], function (_exports, _Theme, _errorEndEvent, _errorEndEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _errorEndEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _errorEndEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _errorEndEvent.pathData : _errorEndEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/error-end-event";
  _exports.default = _default;
});