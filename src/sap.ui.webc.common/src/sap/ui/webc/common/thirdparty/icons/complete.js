sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/complete", "./v5/complete"], function (_exports, _Theme, _complete, _complete2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _complete.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _complete.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _complete.pathData : _complete2.pathData;
  _exports.pathData = pathData;
  var _default = "complete";
  _exports.default = _default;
});