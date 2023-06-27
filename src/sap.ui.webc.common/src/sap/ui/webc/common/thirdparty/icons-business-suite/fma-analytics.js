sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/fma-analytics", "./v2/fma-analytics"], function (_exports, _Theme, _fmaAnalytics, _fmaAnalytics2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fmaAnalytics.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fmaAnalytics.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fmaAnalytics.pathData : _fmaAnalytics2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/fma-analytics";
  _exports.default = _default;
});