sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/value-mapping", "./v3/value-mapping"], function (_exports, _Theme, _valueMapping, _valueMapping2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _valueMapping.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _valueMapping.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _valueMapping.pathData : _valueMapping2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/value-mapping";
  _exports.default = _default;
});