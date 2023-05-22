sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/answered", "./v2/answered"], function (_exports, _Theme, _answered, _answered2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _answered.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _answered.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _answered.pathData : _answered2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/answered";
  _exports.default = _default;
});