sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/future", "./v5/future"], function (_exports, _Theme, _future, _future2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _future.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _future.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _future.pathData : _future2.pathData;
  _exports.pathData = pathData;
  var _default = "future";
  _exports.default = _default;
});