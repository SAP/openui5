sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/disconnected", "./v5/disconnected"], function (_exports, _Theme, _disconnected, _disconnected2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _disconnected.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _disconnected.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _disconnected.pathData : _disconnected2.pathData;
  _exports.pathData = pathData;
  var _default = "disconnected";
  _exports.default = _default;
});