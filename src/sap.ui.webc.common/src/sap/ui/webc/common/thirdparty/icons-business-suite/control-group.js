sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/control-group", "./v2/control-group"], function (_exports, _Theme, _controlGroup, _controlGroup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _controlGroup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _controlGroup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _controlGroup.pathData : _controlGroup2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/control-group";
  _exports.default = _default;
});