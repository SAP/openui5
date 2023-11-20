sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/upload", "./v5/upload"], function (_exports, _Theme, _upload, _upload2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _upload.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _upload.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _upload.pathData : _upload2.pathData;
  _exports.pathData = pathData;
  var _default = "upload";
  _exports.default = _default;
});