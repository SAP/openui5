sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/thumb-up-filled", "./v2/thumb-up-filled"], function (_exports, _Theme, _thumbUpFilled, _thumbUpFilled2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _thumbUpFilled.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _thumbUpFilled.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _thumbUpFilled.pathData : _thumbUpFilled2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/thumb-up-filled";
  _exports.default = _default;
});