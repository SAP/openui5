sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/vds-file", "./v5/vds-file"], function (_exports, _Theme, _vdsFile, _vdsFile2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _vdsFile.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _vdsFile.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _vdsFile.pathData : _vdsFile2.pathData;
  _exports.pathData = pathData;
  var _default = "vds-file";
  _exports.default = _default;
});