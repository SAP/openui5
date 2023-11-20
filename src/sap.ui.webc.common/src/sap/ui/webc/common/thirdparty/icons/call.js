sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/call", "./v5/call"], function (_exports, _Theme, _call, _call2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _call.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _call.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _call.pathData : _call2.pathData;
  _exports.pathData = pathData;
  var _default = "call";
  _exports.default = _default;
});