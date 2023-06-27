sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/data-output-arrow", "./v3/data-output-arrow"], function (_exports, _Theme, _dataOutputArrow, _dataOutputArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dataOutputArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dataOutputArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dataOutputArrow.pathData : _dataOutputArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/data-output-arrow";
  _exports.default = _default;
});