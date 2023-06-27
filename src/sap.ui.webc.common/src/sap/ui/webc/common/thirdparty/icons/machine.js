sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/machine", "./v5/machine"], function (_exports, _Theme, _machine, _machine2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _machine.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _machine.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _machine.pathData : _machine2.pathData;
  _exports.pathData = pathData;
  var _default = "machine";
  _exports.default = _default;
});