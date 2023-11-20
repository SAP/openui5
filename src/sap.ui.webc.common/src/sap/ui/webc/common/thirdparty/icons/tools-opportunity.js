sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/tools-opportunity", "./v5/tools-opportunity"], function (_exports, _Theme, _toolsOpportunity, _toolsOpportunity2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _toolsOpportunity.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _toolsOpportunity.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _toolsOpportunity.pathData : _toolsOpportunity2.pathData;
  _exports.pathData = pathData;
  var _default = "tools-opportunity";
  _exports.default = _default;
});