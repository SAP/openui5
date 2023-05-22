sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/cloud-check", "./v5/cloud-check"], function (_exports, _Theme, _cloudCheck, _cloudCheck2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cloudCheck.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cloudCheck.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cloudCheck.pathData : _cloudCheck2.pathData;
  _exports.pathData = pathData;
  var _default = "cloud-check";
  _exports.default = _default;
});