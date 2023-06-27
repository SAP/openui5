sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/per-diem", "./v5/per-diem"], function (_exports, _Theme, _perDiem, _perDiem2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _perDiem.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _perDiem.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _perDiem.pathData : _perDiem2.pathData;
  _exports.pathData = pathData;
  var _default = "per-diem";
  _exports.default = _default;
});