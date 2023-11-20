sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/value-type", "./v3/value-type"], function (_exports, _Theme, _valueType, _valueType2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _valueType.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _valueType.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _valueType.pathData : _valueType2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/value-type";
  _exports.default = _default;
});