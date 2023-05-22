sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/no-time-change", "./v2/no-time-change"], function (_exports, _Theme, _noTimeChange, _noTimeChange2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _noTimeChange.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _noTimeChange.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _noTimeChange.pathData : _noTimeChange2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/no-time-change";
  _exports.default = _default;
});