sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/projector", "./v5/projector"], function (_exports, _Theme, _projector, _projector2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _projector.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _projector.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _projector.pathData : _projector2.pathData;
  _exports.pathData = pathData;
  var _default = "projector";
  _exports.default = _default;
});