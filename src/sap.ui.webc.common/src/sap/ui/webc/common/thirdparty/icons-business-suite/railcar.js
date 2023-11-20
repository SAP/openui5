sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/railcar", "./v2/railcar"], function (_exports, _Theme, _railcar, _railcar2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _railcar.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _railcar.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _railcar.pathData : _railcar2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/railcar";
  _exports.default = _default;
});