sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/spill", "./v2/spill"], function (_exports, _Theme, _spill, _spill2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _spill.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _spill.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _spill.pathData : _spill2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/spill";
  _exports.default = _default;
});