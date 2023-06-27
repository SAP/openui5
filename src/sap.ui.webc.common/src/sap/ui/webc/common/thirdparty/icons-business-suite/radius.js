sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/radius", "./v2/radius"], function (_exports, _Theme, _radius, _radius2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _radius.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _radius.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _radius.pathData : _radius2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/radius";
  _exports.default = _default;
});