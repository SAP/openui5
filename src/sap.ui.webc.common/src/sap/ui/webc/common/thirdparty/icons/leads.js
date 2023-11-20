sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/leads", "./v5/leads"], function (_exports, _Theme, _leads, _leads2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _leads.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _leads.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _leads.pathData : _leads2.pathData;
  _exports.pathData = pathData;
  var _default = "leads";
  _exports.default = _default;
});