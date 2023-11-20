sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/begin", "./v5/begin"], function (_exports, _Theme, _begin, _begin2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _begin.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _begin.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _begin.pathData : _begin2.pathData;
  _exports.pathData = pathData;
  var _default = "begin";
  _exports.default = _default;
});