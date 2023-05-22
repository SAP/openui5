sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/save-as", "./v2/save-as"], function (_exports, _Theme, _saveAs, _saveAs2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _saveAs.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _saveAs.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _saveAs.pathData : _saveAs2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/save-as";
  _exports.default = _default;
});