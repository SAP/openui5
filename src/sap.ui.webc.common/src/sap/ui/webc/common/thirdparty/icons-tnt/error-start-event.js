sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/error-start-event", "./v3/error-start-event"], function (_exports, _Theme, _errorStartEvent, _errorStartEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _errorStartEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _errorStartEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _errorStartEvent.pathData : _errorStartEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/error-start-event";
  _exports.default = _default;
});