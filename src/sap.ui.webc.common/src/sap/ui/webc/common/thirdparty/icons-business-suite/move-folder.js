sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/move-folder", "./v2/move-folder"], function (_exports, _Theme, _moveFolder, _moveFolder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _moveFolder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _moveFolder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _moveFolder.pathData : _moveFolder2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/move-folder";
  _exports.default = _default;
});