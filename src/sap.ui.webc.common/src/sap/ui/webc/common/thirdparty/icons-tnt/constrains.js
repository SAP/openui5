sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/constrains", "./v3/constrains"], function (_exports, _Theme, _constrains, _constrains2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _constrains.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _constrains.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _constrains.pathData : _constrains2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/constrains";
  _exports.default = _default;
});