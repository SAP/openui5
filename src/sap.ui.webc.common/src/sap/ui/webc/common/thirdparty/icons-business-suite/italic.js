sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/italic", "./v2/italic"], function (_exports, _Theme, _italic, _italic2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _italic.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _italic.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _italic.pathData : _italic2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/italic";
  _exports.default = _default;
});