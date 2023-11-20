sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/blood-pressure", "./v2/blood-pressure"], function (_exports, _Theme, _bloodPressure, _bloodPressure2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bloodPressure.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bloodPressure.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bloodPressure.pathData : _bloodPressure2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/blood-pressure";
  _exports.default = _default;
});