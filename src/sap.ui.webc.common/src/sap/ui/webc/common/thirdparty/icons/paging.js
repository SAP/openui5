sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/paging", "./v5/paging"], function (_exports, _Theme, _paging, _paging2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _paging.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _paging.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _paging.pathData : _paging2.pathData;
  _exports.pathData = pathData;
  var _default = "paging";
  _exports.default = _default;
});