sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/business-objects-explorer", "./v5/business-objects-explorer"], function (_exports, _Theme, _businessObjectsExplorer, _businessObjectsExplorer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessObjectsExplorer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessObjectsExplorer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessObjectsExplorer.pathData : _businessObjectsExplorer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-objects-explorer";
  _exports.default = _default;
});