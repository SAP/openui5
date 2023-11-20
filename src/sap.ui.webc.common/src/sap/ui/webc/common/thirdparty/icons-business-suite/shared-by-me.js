sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/shared-by-me", "./v2/shared-by-me"], function (_exports, _Theme, _sharedByMe, _sharedByMe2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sharedByMe.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sharedByMe.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sharedByMe.pathData : _sharedByMe2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/shared-by-me";
  _exports.default = _default;
});