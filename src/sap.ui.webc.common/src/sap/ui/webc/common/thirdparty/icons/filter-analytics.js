sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/filter-analytics", "./v5/filter-analytics"], function (_exports, _Theme, _filterAnalytics, _filterAnalytics2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _filterAnalytics.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _filterAnalytics.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _filterAnalytics.pathData : _filterAnalytics2.pathData;
  _exports.pathData = pathData;
  var _default = "filter-analytics";
  _exports.default = _default;
});