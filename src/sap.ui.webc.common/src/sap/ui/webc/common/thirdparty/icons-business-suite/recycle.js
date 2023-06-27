sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/recycle", "./v2/recycle"], function (_exports, _Theme, _recycle, _recycle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _recycle.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _recycle.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _recycle.pathData : _recycle2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/recycle";
  _exports.default = _default;
});