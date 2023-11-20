sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/excel-attachment", "./v5/excel-attachment"], function (_exports, _Theme, _excelAttachment, _excelAttachment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _excelAttachment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _excelAttachment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _excelAttachment.pathData : _excelAttachment2.pathData;
  _exports.pathData = pathData;
  var _default = "excel-attachment";
  _exports.default = _default;
});