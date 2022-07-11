sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/play", "./v4/play"], function (_exports, _Theme, _play, _play2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _play.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _play.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _play.pathData : _play2.pathData;
  _exports.pathData = pathData;
  var _default = "play";
  _exports.default = _default;
});