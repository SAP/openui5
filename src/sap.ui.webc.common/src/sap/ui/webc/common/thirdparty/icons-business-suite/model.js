sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/model", "./v2/model"], function (_exports, _Theme, _model, _model2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _model.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _model.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _model.pathData : _model2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/model";
  _exports.default = _default;
});