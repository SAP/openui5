sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/e-care", "./v5/e-care"], function (_exports, _Theme, _eCare, _eCare2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _eCare.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _eCare.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _eCare.pathData : _eCare2.pathData;
  _exports.pathData = pathData;
  var _default = "e-care";
  _exports.default = _default;
});