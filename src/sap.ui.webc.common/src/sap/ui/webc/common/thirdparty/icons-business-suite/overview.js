sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/overview", "./v2/overview"], function (_exports, _Theme, _overview, _overview2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _overview.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _overview.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _overview.pathData : _overview2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/overview";
  _exports.default = _default;
});