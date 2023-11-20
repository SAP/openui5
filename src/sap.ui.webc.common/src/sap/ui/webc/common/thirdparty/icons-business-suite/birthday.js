sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/birthday", "./v2/birthday"], function (_exports, _Theme, _birthday, _birthday2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _birthday.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _birthday.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _birthday.pathData : _birthday2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/birthday";
  _exports.default = _default;
});