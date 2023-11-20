sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/answered-change-request", "./v2/answered-change-request"], function (_exports, _Theme, _answeredChangeRequest, _answeredChangeRequest2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _answeredChangeRequest.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _answeredChangeRequest.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _answeredChangeRequest.pathData : _answeredChangeRequest2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/answered-change-request";
  _exports.default = _default;
});