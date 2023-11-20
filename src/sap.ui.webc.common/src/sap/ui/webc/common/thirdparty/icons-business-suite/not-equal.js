sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/not-equal", "./v2/not-equal"], function (_exports, _Theme, _notEqual, _notEqual2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _notEqual.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _notEqual.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _notEqual.pathData : _notEqual2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/not-equal";
  _exports.default = _default;
});