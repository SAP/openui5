sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/arrow-bottom", "./v5/arrow-bottom"], function (_exports, _Theme, _arrowBottom, _arrowBottom2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _arrowBottom.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _arrowBottom.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _arrowBottom.pathData : _arrowBottom2.pathData;
  _exports.pathData = pathData;
  var _default = "arrow-bottom";
  _exports.default = _default;
});