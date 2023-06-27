sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/blocked", "./v2/blocked"], function (_exports, _Theme, _blocked, _blocked2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _blocked.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _blocked.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _blocked.pathData : _blocked2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/blocked";
  _exports.default = _default;
});