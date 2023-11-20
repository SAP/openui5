sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/doctor", "./v5/doctor"], function (_exports, _Theme, _doctor, _doctor2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _doctor.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _doctor.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _doctor.pathData : _doctor2.pathData;
  _exports.pathData = pathData;
  var _default = "doctor";
  _exports.default = _default;
});