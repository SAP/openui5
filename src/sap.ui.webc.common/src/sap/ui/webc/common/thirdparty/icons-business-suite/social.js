sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/social", "./v2/social"], function (_exports, _Theme, _social, _social2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _social.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _social.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _social.pathData : _social2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/social";
  _exports.default = _default;
});