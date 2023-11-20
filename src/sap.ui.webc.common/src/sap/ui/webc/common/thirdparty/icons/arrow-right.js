sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/arrow-right", "./v5/arrow-right"], function (_exports, _Theme, _arrowRight, _arrowRight2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _arrowRight.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _arrowRight.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _arrowRight.pathData : _arrowRight2.pathData;
  _exports.pathData = pathData;
  var _default = "arrow-right";
  _exports.default = _default;
});