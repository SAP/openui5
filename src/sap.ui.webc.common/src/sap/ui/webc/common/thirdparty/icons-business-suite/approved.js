sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/approved", "./v2/approved"], function (_exports, _Theme, _approved, _approved2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _approved.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _approved.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _approved.pathData : _approved2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/approved";
  _exports.default = _default;
});