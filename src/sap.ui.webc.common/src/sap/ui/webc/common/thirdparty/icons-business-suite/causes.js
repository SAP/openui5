sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/causes", "./v2/causes"], function (_exports, _Theme, _causes, _causes2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _causes.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _causes.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _causes.pathData : _causes2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/causes";
  _exports.default = _default;
});