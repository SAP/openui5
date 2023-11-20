sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/phase", "./v2/phase"], function (_exports, _Theme, _phase, _phase2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _phase.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _phase.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _phase.pathData : _phase2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/phase";
  _exports.default = _default;
});