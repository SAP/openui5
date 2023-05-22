sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/meter-chained", "./v2/meter-chained"], function (_exports, _Theme, _meterChained, _meterChained2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _meterChained.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _meterChained.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _meterChained.pathData : _meterChained2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/meter-chained";
  _exports.default = _default;
});