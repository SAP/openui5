sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/collapse", "./v5/collapse"], function (_exports, _Theme, _collapse, _collapse2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collapse.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collapse.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collapse.pathData : _collapse2.pathData;
  _exports.pathData = pathData;
  var _default = "collapse";
  _exports.default = _default;
});