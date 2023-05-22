sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/information", "./v5/information"], function (_exports, _Theme, _information, _information2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _information.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _information.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _information.pathData : _information2.pathData;
  _exports.pathData = pathData;
  var _default = "information";
  _exports.default = _default;
});