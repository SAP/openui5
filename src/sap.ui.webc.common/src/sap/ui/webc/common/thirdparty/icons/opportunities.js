sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/opportunities", "./v5/opportunities"], function (_exports, _Theme, _opportunities, _opportunities2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _opportunities.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _opportunities.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _opportunities.pathData : _opportunities2.pathData;
  _exports.pathData = pathData;
  var _default = "opportunities";
  _exports.default = _default;
});