sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/arrow-down", "./v5/arrow-down"], function (_exports, _Theme, _arrowDown, _arrowDown2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _arrowDown.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _arrowDown.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _arrowDown.pathData : _arrowDown2.pathData;
  _exports.pathData = pathData;
  var _default = "arrow-down";
  _exports.default = _default;
});