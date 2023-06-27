sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/multi-select", "./v5/multi-select"], function (_exports, _Theme, _multiSelect, _multiSelect2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _multiSelect.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _multiSelect.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _multiSelect.pathData : _multiSelect2.pathData;
  _exports.pathData = pathData;
  var _default = "multi-select";
  _exports.default = _default;
});