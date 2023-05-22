sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/equipment", "./v2/equipment"], function (_exports, _Theme, _equipment, _equipment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _equipment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _equipment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _equipment.pathData : _equipment2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/equipment";
  _exports.default = _default;
});