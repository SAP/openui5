sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/receptions", "./v3/receptions"], function (_exports, _Theme, _receptions, _receptions2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _receptions.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _receptions.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _receptions.pathData : _receptions2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/receptions";
  _exports.default = _default;
});