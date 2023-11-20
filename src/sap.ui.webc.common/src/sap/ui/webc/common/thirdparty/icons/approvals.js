sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/approvals", "./v5/approvals"], function (_exports, _Theme, _approvals, _approvals2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _approvals.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _approvals.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _approvals.pathData : _approvals2.pathData;
  _exports.pathData = pathData;
  var _default = "approvals";
  _exports.default = _default;
});