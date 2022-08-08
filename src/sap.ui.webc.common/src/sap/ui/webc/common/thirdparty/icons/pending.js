sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/pending", "./v4/pending"], function (_exports, _Theme, _pending, _pending2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pending.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pending.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _pending.pathData : _pending2.pathData;
  _exports.pathData = pathData;
  var _default = "pending";
  _exports.default = _default;
});