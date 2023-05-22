sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/data-input-arrow", "./v3/data-input-arrow"], function (_exports, _Theme, _dataInputArrow, _dataInputArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dataInputArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dataInputArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dataInputArrow.pathData : _dataInputArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/data-input-arrow";
  _exports.default = _default;
});