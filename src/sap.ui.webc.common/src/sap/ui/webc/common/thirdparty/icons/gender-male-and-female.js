sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/gender-male-and-female", "./v5/gender-male-and-female"], function (_exports, _Theme, _genderMaleAndFemale, _genderMaleAndFemale2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _genderMaleAndFemale.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _genderMaleAndFemale.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _genderMaleAndFemale.pathData : _genderMaleAndFemale2.pathData;
  _exports.pathData = pathData;
  var _default = "gender-male-and-female";
  _exports.default = _default;
});