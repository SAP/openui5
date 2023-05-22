sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/record", "./v5/record"], function (_exports, _Theme, _record, _record2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _record.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _record.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _record.pathData : _record2.pathData;
  _exports.pathData = pathData;
  var _default = "record";
  _exports.default = _default;
});