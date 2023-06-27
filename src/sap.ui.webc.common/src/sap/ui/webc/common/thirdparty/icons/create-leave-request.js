sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/create-leave-request", "./v5/create-leave-request"], function (_exports, _Theme, _createLeaveRequest, _createLeaveRequest2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _createLeaveRequest.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _createLeaveRequest.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _createLeaveRequest.pathData : _createLeaveRequest2.pathData;
  _exports.pathData = pathData;
  var _default = "create-leave-request";
  _exports.default = _default;
});