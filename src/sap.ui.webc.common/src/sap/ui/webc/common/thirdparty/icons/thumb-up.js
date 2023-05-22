sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/thumb-up", "./v5/thumb-up"], function (_exports, _Theme, _thumbUp, _thumbUp2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _thumbUp.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _thumbUp.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _thumbUp.pathData : _thumbUp2.pathData;
  _exports.pathData = pathData;
  var _default = "thumb-up";
  _exports.default = _default;
});