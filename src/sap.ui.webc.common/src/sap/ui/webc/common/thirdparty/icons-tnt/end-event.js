sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/end-event", "./v3/end-event"], function (_exports, _Theme, _endEvent, _endEvent2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _endEvent.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _endEvent.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _endEvent.pathData : _endEvent2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/end-event";
  _exports.default = _default;
});