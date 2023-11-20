sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/hide", "./v5/hide"], function (_exports, _Theme, _hide, _hide2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _hide.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _hide.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _hide.pathData : _hide2.pathData;
  _exports.pathData = pathData;
  var _default = "hide";
  _exports.default = _default;
});