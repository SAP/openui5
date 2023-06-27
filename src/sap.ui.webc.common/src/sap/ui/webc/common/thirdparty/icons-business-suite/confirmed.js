sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/confirmed", "./v2/confirmed"], function (_exports, _Theme, _confirmed, _confirmed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _confirmed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _confirmed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _confirmed.pathData : _confirmed2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/confirmed";
  _exports.default = _default;
});