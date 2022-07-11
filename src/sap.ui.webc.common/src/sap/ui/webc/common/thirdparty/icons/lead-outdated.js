sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/lead-outdated", "./v4/lead-outdated"], function (_exports, _Theme, _leadOutdated, _leadOutdated2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _leadOutdated.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _leadOutdated.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _leadOutdated.pathData : _leadOutdated2.pathData;
  _exports.pathData = pathData;
  var _default = "lead-outdated";
  _exports.default = _default;
});