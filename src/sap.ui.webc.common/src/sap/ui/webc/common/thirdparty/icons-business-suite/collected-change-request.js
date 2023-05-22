sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/collected-change-request", "./v2/collected-change-request"], function (_exports, _Theme, _collectedChangeRequest, _collectedChangeRequest2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collectedChangeRequest.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collectedChangeRequest.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collectedChangeRequest.pathData : _collectedChangeRequest2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/collected-change-request";
  _exports.default = _default;
});