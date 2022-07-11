sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/pause", "./v4/pause"], function (_exports, _Theme, _pause, _pause2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pause.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pause.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _pause.pathData : _pause2.pathData;
  _exports.pathData = pathData;
  var _default = "pause";
  _exports.default = _default;
});