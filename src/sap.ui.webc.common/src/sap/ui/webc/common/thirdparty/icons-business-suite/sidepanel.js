sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/sidepanel", "./v2/sidepanel"], function (_exports, _Theme, _sidepanel, _sidepanel2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _sidepanel.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _sidepanel.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _sidepanel.pathData : _sidepanel2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/sidepanel";
  _exports.default = _default;
});