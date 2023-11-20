sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/general-leave-request", "./v5/general-leave-request"], function (_exports, _Theme, _generalLeaveRequest, _generalLeaveRequest2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _generalLeaveRequest.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _generalLeaveRequest.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _generalLeaveRequest.pathData : _generalLeaveRequest2.pathData;
  _exports.pathData = pathData;
  var _default = "general-leave-request";
  _exports.default = _default;
});