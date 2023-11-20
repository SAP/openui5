sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/request", "./v5/request"], function (_exports, _Theme, _request, _request2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _request.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _request.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _request.pathData : _request2.pathData;
  _exports.pathData = pathData;
  var _default = "request";
  _exports.default = _default;
});