sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/intranet", "./v3/intranet"], function (_exports, _Theme, _intranet, _intranet2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _intranet.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _intranet.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _intranet.pathData : _intranet2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/intranet";
  _exports.default = _default;
});