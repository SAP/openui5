sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/write-new", "./v5/write-new"], function (_exports, _Theme, _writeNew, _writeNew2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _writeNew.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _writeNew.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _writeNew.pathData : _writeNew2.pathData;
  _exports.pathData = pathData;
  var _default = "write-new";
  _exports.default = _default;
});