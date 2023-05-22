sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/hr-approval", "./v5/hr-approval"], function (_exports, _Theme, _hrApproval, _hrApproval2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _hrApproval.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _hrApproval.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _hrApproval.pathData : _hrApproval2.pathData;
  _exports.pathData = pathData;
  var _default = "hr-approval";
  _exports.default = _default;
});