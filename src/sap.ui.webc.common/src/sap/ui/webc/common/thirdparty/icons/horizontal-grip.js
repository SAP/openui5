sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/horizontal-grip", "./v5/horizontal-grip"], function (_exports, _Theme, _horizontalGrip, _horizontalGrip2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _horizontalGrip.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _horizontalGrip.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _horizontalGrip.pathData : _horizontalGrip2.pathData;
  _exports.pathData = pathData;
  var _default = "horizontal-grip";
  _exports.default = _default;
});