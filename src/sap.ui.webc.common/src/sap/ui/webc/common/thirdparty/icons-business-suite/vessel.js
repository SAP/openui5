sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/vessel", "./v2/vessel"], function (_exports, _Theme, _vessel, _vessel2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _vessel.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _vessel.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _vessel.pathData : _vessel2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/vessel";
  _exports.default = _default;
});