sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/target-filter", "./v2/target-filter"], function (_exports, _Theme, _targetFilter, _targetFilter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _targetFilter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _targetFilter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _targetFilter.pathData : _targetFilter2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/target-filter";
  _exports.default = _default;
});