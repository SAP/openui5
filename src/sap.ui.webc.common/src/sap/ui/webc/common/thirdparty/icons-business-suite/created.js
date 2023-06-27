sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/created", "./v2/created"], function (_exports, _Theme, _created, _created2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _created.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _created.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _created.pathData : _created2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/created";
  _exports.default = _default;
});