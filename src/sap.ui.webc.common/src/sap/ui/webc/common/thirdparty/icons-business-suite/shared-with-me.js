sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/shared-with-me", "./v2/shared-with-me"], function (_exports, _Theme, _sharedWithMe, _sharedWithMe2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sharedWithMe.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sharedWithMe.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sharedWithMe.pathData : _sharedWithMe2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/shared-with-me";
  _exports.default = _default;
});