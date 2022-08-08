sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/cursor-arrow", "./v4/cursor-arrow"], function (_exports, _Theme, _cursorArrow, _cursorArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cursorArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cursorArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _cursorArrow.pathData : _cursorArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "cursor-arrow";
  _exports.default = _default;
});