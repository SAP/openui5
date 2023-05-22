sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/dehydrator", "./v2/dehydrator"], function (_exports, _Theme, _dehydrator, _dehydrator2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dehydrator.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dehydrator.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dehydrator.pathData : _dehydrator2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/dehydrator";
  _exports.default = _default;
});