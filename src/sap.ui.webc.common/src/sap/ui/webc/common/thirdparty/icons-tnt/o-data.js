sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/o-data", "./v3/o-data"], function (_exports, _Theme, _oData, _oData2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _oData.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _oData.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _oData.pathData : _oData2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/o-data";
  _exports.default = _default;
});