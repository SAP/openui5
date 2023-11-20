sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/escalation-boundary-non-interrupting", "./v3/escalation-boundary-non-interrupting"], function (_exports, _Theme, _escalationBoundaryNonInterrupting, _escalationBoundaryNonInterrupting2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _escalationBoundaryNonInterrupting.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _escalationBoundaryNonInterrupting.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _escalationBoundaryNonInterrupting.pathData : _escalationBoundaryNonInterrupting2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/escalation-boundary-non-interrupting";
  _exports.default = _default;
});