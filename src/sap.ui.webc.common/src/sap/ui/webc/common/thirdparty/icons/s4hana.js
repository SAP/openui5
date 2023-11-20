sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/s4hana", "./v5/s4hana"], function (_exports, _Theme, _s4hana, _s4hana2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _s4hana.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _s4hana.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _s4hana.pathData : _s4hana2.pathData;
  _exports.pathData = pathData;
  var _default = "s4hana";
  _exports.default = _default;
});