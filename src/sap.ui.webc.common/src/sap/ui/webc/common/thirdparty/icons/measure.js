sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/measure", "./v5/measure"], function (_exports, _Theme, _measure, _measure2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _measure.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _measure.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _measure.pathData : _measure2.pathData;
  _exports.pathData = pathData;
  var _default = "measure";
  _exports.default = _default;
});