sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/upload-to-cloud", "./v5/upload-to-cloud"], function (_exports, _Theme, _uploadToCloud, _uploadToCloud2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _uploadToCloud.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _uploadToCloud.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _uploadToCloud.pathData : _uploadToCloud2.pathData;
  _exports.pathData = pathData;
  var _default = "upload-to-cloud";
  _exports.default = _default;
});