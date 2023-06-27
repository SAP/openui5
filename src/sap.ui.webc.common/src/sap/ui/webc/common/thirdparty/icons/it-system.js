sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/it-system", "./v5/it-system"], function (_exports, _Theme, _itSystem, _itSystem2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _itSystem.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _itSystem.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _itSystem.pathData : _itSystem2.pathData;
  _exports.pathData = pathData;
  var _default = "it-system";
  _exports.default = _default;
});