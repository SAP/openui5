sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/present", "./v5/present"], function (_exports, _Theme, _present, _present2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _present.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _present.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _present.pathData : _present2.pathData;
  _exports.pathData = pathData;
  var _default = "present";
  _exports.default = _default;
});