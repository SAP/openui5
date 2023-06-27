sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/enablement", "./v5/enablement"], function (_exports, _Theme, _enablement, _enablement2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _enablement.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _enablement.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _enablement.pathData : _enablement2.pathData;
  _exports.pathData = pathData;
  var _default = "enablement";
  _exports.default = _default;
});