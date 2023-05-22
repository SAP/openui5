sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/command-line-interfaces", "./v5/command-line-interfaces"], function (_exports, _Theme, _commandLineInterfaces, _commandLineInterfaces2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _commandLineInterfaces.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _commandLineInterfaces.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _commandLineInterfaces.pathData : _commandLineInterfaces2.pathData;
  _exports.pathData = pathData;
  var _default = "command-line-interfaces";
  _exports.default = _default;
});