sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/system-hana", "./v3/system-hana"], function (_exports, _Theme, _systemHana, _systemHana2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _systemHana.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _systemHana.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _systemHana.pathData : _systemHana2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/system-hana";
  _exports.default = _default;
});