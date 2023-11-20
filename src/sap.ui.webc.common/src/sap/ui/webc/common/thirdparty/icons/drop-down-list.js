sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/drop-down-list", "./v5/drop-down-list"], function (_exports, _Theme, _dropDownList, _dropDownList2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dropDownList.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dropDownList.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dropDownList.pathData : _dropDownList2.pathData;
  _exports.pathData = pathData;
  var _default = "drop-down-list";
  _exports.default = _default;
});