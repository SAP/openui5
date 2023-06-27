sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/dispatched-deallocate", "./v2/dispatched-deallocate"], function (_exports, _Theme, _dispatchedDeallocate, _dispatchedDeallocate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dispatchedDeallocate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dispatchedDeallocate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dispatchedDeallocate.pathData : _dispatchedDeallocate2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/dispatched-deallocate";
  _exports.default = _default;
});