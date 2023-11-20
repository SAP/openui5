sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/solution-not-licensed", "./v3/solution-not-licensed"], function (_exports, _Theme, _solutionNotLicensed, _solutionNotLicensed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _solutionNotLicensed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _solutionNotLicensed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _solutionNotLicensed.pathData : _solutionNotLicensed2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/solution-not-licensed";
  _exports.default = _default;
});