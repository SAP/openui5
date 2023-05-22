sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/responsible-area", "./v2/responsible-area"], function (_exports, _Theme, _responsibleArea, _responsibleArea2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _responsibleArea.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _responsibleArea.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _responsibleArea.pathData : _responsibleArea2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/responsible-area";
  _exports.default = _default;
});