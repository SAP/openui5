sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/visits", "./v5/visits"], function (_exports, _Theme, _visits, _visits2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _visits.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _visits.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _visits.pathData : _visits2.pathData;
  _exports.pathData = pathData;
  var _default = "visits";
  _exports.default = _default;
});