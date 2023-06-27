sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/container", "./v2/container"], function (_exports, _Theme, _container, _container2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _container.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _container.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _container.pathData : _container2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/container";
  _exports.default = _default;
});