sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/clinical-order", "./v5/clinical-order"], function (_exports, _Theme, _clinicalOrder, _clinicalOrder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _clinicalOrder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _clinicalOrder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _clinicalOrder.pathData : _clinicalOrder2.pathData;
  _exports.pathData = pathData;
  var _default = "clinical-order";
  _exports.default = _default;
});