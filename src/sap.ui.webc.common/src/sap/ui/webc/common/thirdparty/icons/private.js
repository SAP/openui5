sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/private", "./v4/private"], function (_exports, _Theme, _private, _private2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _private.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _private.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _private.pathData : _private2.pathData;
  _exports.pathData = pathData;
  var _default = "private";
  _exports.default = _default;
});