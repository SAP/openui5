sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/process", "./v5/process"], function (_exports, _Theme, _process, _process2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _process.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _process.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _process.pathData : _process2.pathData;
  _exports.pathData = pathData;
  var _default = "process";
  _exports.default = _default;
});