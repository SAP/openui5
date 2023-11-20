sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/system-exit", "./v5/system-exit"], function (_exports, _Theme, _systemExit, _systemExit2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _systemExit.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _systemExit.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _systemExit.pathData : _systemExit2.pathData;
  _exports.pathData = pathData;
  var _default = "system-exit";
  _exports.default = _default;
});