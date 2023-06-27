sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/download", "./v5/download"], function (_exports, _Theme, _download, _download2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _download.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _download.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _download.pathData : _download2.pathData;
  _exports.pathData = pathData;
  var _default = "download";
  _exports.default = _default;
});