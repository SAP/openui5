sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/accept", "./v5/accept"], function (_exports, _Theme, _accept, _accept2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _accept.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _accept.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _accept.pathData : _accept2.pathData;
  _exports.pathData = pathData;
  var _default = "accept";
  _exports.default = _default;
});