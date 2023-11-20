sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/realization", "./v3/realization"], function (_exports, _Theme, _realization, _realization2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _realization.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _realization.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _realization.pathData : _realization2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/realization";
  _exports.default = _default;
});