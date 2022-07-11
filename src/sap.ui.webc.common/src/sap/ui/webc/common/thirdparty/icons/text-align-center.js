sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/text-align-center", "./v4/text-align-center"], function (_exports, _Theme, _textAlignCenter, _textAlignCenter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _textAlignCenter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _textAlignCenter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _textAlignCenter.pathData : _textAlignCenter2.pathData;
  _exports.pathData = pathData;
  var _default = "text-align-center";
  _exports.default = _default;
});