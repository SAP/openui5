sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/boundary-interrupting", "./v3/boundary-interrupting"], function (_exports, _Theme, _boundaryInterrupting, _boundaryInterrupting2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _boundaryInterrupting.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _boundaryInterrupting.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _boundaryInterrupting.pathData : _boundaryInterrupting2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/boundary-interrupting";
  _exports.default = _default;
});