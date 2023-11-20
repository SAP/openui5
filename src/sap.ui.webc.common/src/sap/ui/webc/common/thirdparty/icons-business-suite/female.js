sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/female", "./v2/female"], function (_exports, _Theme, _female, _female2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _female.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _female.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _female.pathData : _female2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/female";
  _exports.default = _default;
});