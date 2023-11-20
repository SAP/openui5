sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/inverse-t-layout", "./v2/inverse-t-layout"], function (_exports, _Theme, _inverseTLayout, _inverseTLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _inverseTLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _inverseTLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _inverseTLayout.pathData : _inverseTLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/inverse-t-layout";
  _exports.default = _default;
});