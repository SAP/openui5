sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/plain-grid-layout", "./v2/plain-grid-layout"], function (_exports, _Theme, _plainGridLayout, _plainGridLayout2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _plainGridLayout.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _plainGridLayout.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _plainGridLayout.pathData : _plainGridLayout2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/plain-grid-layout";
  _exports.default = _default;
});