sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/forward", "./v5/forward"], function (_exports, _Theme, _forward, _forward2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _forward.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _forward.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _forward.pathData : _forward2.pathData;
  _exports.pathData = pathData;
  var _default = "forward";
  _exports.default = _default;
});