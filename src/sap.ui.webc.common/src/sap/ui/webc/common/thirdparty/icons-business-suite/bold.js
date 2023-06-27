sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/bold", "./v2/bold"], function (_exports, _Theme, _bold, _bold2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bold.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bold.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bold.pathData : _bold2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/bold";
  _exports.default = _default;
});