sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/cancel", "./v5/cancel"], function (_exports, _Theme, _cancel, _cancel2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cancel.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cancel.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cancel.pathData : _cancel2.pathData;
  _exports.pathData = pathData;
  var _default = "cancel";
  _exports.default = _default;
});