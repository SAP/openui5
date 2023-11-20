sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/response", "./v5/response"], function (_exports, _Theme, _response, _response2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _response.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _response.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _response.pathData : _response2.pathData;
  _exports.pathData = pathData;
  var _default = "response";
  _exports.default = _default;
});