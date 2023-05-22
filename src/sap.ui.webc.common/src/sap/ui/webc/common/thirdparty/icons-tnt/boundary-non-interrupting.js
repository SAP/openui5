sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/boundary-non-interrupting", "./v3/boundary-non-interrupting"], function (_exports, _Theme, _boundaryNonInterrupting, _boundaryNonInterrupting2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _boundaryNonInterrupting.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _boundaryNonInterrupting.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _boundaryNonInterrupting.pathData : _boundaryNonInterrupting2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/boundary-non-interrupting";
  _exports.default = _default;
});