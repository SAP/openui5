sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/open-folder", "./v4/open-folder"], function (_exports, _Theme, _openFolder, _openFolder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _openFolder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _openFolder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _openFolder.pathData : _openFolder2.pathData;
  _exports.pathData = pathData;
  var _default = "open-folder";
  _exports.default = _default;
});