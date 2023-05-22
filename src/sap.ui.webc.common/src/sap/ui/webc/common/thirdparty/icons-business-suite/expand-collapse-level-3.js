sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/expand-collapse-level-3", "./v2/expand-collapse-level-3"], function (_exports, _Theme, _expandCollapseLevel, _expandCollapseLevel2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _expandCollapseLevel.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _expandCollapseLevel.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _expandCollapseLevel.pathData : _expandCollapseLevel2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/expand-collapse-level-3";
  _exports.default = _default;
});