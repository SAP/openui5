sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/email-not-opened", "./v2/email-not-opened"], function (_exports, _Theme, _emailNotOpened, _emailNotOpened2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _emailNotOpened.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _emailNotOpened.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _emailNotOpened.pathData : _emailNotOpened2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/email-not-opened";
  _exports.default = _default;
});