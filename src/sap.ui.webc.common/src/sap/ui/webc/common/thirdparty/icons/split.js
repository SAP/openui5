sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/split", "./v4/split"], function (_exports, _Theme, _split, _split2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _split.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _split.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _split.pathData : _split2.pathData;
  _exports.pathData = pathData;
  var _default = "split";
  _exports.default = _default;
});