sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/postpone", "./v2/postpone"], function (_exports, _Theme, _postpone, _postpone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _postpone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _postpone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _postpone.pathData : _postpone2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/postpone";
  _exports.default = _default;
});