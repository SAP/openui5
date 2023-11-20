sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/opportunity", "./v5/opportunity"], function (_exports, _Theme, _opportunity, _opportunity2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _opportunity.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _opportunity.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _opportunity.pathData : _opportunity2.pathData;
  _exports.pathData = pathData;
  var _default = "opportunity";
  _exports.default = _default;
});