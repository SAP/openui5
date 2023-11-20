sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/fridge", "./v5/fridge"], function (_exports, _Theme, _fridge, _fridge2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fridge.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fridge.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fridge.pathData : _fridge2.pathData;
  _exports.pathData = pathData;
  var _default = "fridge";
  _exports.default = _default;
});