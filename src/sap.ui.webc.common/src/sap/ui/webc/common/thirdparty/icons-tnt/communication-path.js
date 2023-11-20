sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/communication-path", "./v3/communication-path"], function (_exports, _Theme, _communicationPath, _communicationPath2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _communicationPath.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _communicationPath.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _communicationPath.pathData : _communicationPath2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/communication-path";
  _exports.default = _default;
});