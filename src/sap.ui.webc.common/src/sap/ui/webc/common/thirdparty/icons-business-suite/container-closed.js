sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/container-closed", "./v2/container-closed"], function (_exports, _Theme, _containerClosed, _containerClosed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _containerClosed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _containerClosed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _containerClosed.pathData : _containerClosed2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/container-closed";
  _exports.default = _default;
});