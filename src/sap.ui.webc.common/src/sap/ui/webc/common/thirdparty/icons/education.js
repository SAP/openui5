sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/education", "./v4/education"], function (_exports, _Theme, _education, _education2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _education.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _education.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _education.pathData : _education2.pathData;
  _exports.pathData = pathData;
  var _default = "education";
  _exports.default = _default;
});