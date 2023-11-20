sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/multi-container", "./v2/multi-container"], function (_exports, _Theme, _multiContainer, _multiContainer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multiContainer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multiContainer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multiContainer.pathData : _multiContainer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/multi-container";
  _exports.default = _default;
});