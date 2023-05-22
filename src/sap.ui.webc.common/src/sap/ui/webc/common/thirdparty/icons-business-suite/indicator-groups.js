sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/indicator-groups", "./v2/indicator-groups"], function (_exports, _Theme, _indicatorGroups, _indicatorGroups2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _indicatorGroups.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _indicatorGroups.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _indicatorGroups.pathData : _indicatorGroups2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/indicator-groups";
  _exports.default = _default;
});