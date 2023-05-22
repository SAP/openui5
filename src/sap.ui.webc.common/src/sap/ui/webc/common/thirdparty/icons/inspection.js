sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/inspection", "./v5/inspection"], function (_exports, _Theme, _inspection, _inspection2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _inspection.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _inspection.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _inspection.pathData : _inspection2.pathData;
  _exports.pathData = pathData;
  var _default = "inspection";
  _exports.default = _default;
});