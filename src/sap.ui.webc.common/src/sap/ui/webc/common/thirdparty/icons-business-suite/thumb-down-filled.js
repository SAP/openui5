sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/thumb-down-filled", "./v2/thumb-down-filled"], function (_exports, _Theme, _thumbDownFilled, _thumbDownFilled2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _thumbDownFilled.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _thumbDownFilled.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _thumbDownFilled.pathData : _thumbDownFilled2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/thumb-down-filled";
  _exports.default = _default;
});