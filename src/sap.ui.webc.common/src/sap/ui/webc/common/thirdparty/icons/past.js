sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/past", "./v5/past"], function (_exports, _Theme, _past, _past2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _past.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _past.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _past.pathData : _past2.pathData;
  _exports.pathData = pathData;
  var _default = "past";
  _exports.default = _default;
});