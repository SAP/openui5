sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/initiative", "./v5/initiative"], function (_exports, _Theme, _initiative, _initiative2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _initiative.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _initiative.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _initiative.pathData : _initiative2.pathData;
  _exports.pathData = pathData;
  var _default = "initiative";
  _exports.default = _default;
});