sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/shelf", "./v5/shelf"], function (_exports, _Theme, _shelf, _shelf2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _shelf.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _shelf.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _shelf.pathData : _shelf2.pathData;
  _exports.pathData = pathData;
  var _default = "shelf";
  _exports.default = _default;
});