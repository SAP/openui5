sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/headset", "./v5/headset"], function (_exports, _Theme, _headset, _headset2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _headset.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _headset.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _headset.pathData : _headset2.pathData;
  _exports.pathData = pathData;
  var _default = "headset";
  _exports.default = _default;
});