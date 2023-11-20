sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/t-layout", "./v2/t-layout"], function (_exports, _Theme, _tLayout, _tLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tLayout.pathData : _tLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/t-layout";
  _exports.default = _default;
});