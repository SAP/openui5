sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/escalation-boundary-interrupting", "./v3/escalation-boundary-interrupting"], function (_exports, _Theme, _escalationBoundaryInterrupting, _escalationBoundaryInterrupting2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _escalationBoundaryInterrupting.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _escalationBoundaryInterrupting.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _escalationBoundaryInterrupting.pathData : _escalationBoundaryInterrupting2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/escalation-boundary-interrupting";
  _exports.default = _default;
});