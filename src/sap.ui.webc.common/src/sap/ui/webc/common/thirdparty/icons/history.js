sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/history", "./v5/history"], function (_exports, _Theme, _history, _history2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _history.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _history.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _history.pathData : _history2.pathData;
  _exports.pathData = pathData;
  var _default = "history";
  _exports.default = _default;
});