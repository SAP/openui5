sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/empty-warning", "./v2/empty-warning"], function (_exports, _Theme, _emptyWarning, _emptyWarning2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _emptyWarning.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _emptyWarning.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _emptyWarning.pathData : _emptyWarning2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/empty-warning";
  _exports.default = _default;
});