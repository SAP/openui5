sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/system", "./v3/system"], function (_exports, _Theme, _system, _system2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _system.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _system.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _system.pathData : _system2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/system";
  _exports.default = _default;
});