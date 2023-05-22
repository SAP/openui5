sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/thumb-sideway-filled", "./v2/thumb-sideway-filled"], function (_exports, _Theme, _thumbSidewayFilled, _thumbSidewayFilled2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _thumbSidewayFilled.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _thumbSidewayFilled.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _thumbSidewayFilled.pathData : _thumbSidewayFilled2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/thumb-sideway-filled";
  _exports.default = _default;
});