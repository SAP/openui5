sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/instance", "./v5/instance"], function (_exports, _Theme, _instance, _instance2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _instance.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _instance.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _instance.pathData : _instance2.pathData;
  _exports.pathData = pathData;
  var _default = "instance";
  _exports.default = _default;
});