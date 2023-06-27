sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/download-from-cloud", "./v5/download-from-cloud"], function (_exports, _Theme, _downloadFromCloud, _downloadFromCloud2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _downloadFromCloud.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _downloadFromCloud.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _downloadFromCloud.pathData : _downloadFromCloud2.pathData;
  _exports.pathData = pathData;
  var _default = "download-from-cloud";
  _exports.default = _default;
});