sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/decline", "./v5/decline"], function (_exports, _Theme, _decline, _decline2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _decline.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _decline.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _decline.pathData : _decline2.pathData;
  _exports.pathData = pathData;
  var _default = "decline";
  _exports.default = _default;
});