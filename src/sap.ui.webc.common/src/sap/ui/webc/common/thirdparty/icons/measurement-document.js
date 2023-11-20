sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/measurement-document", "./v5/measurement-document"], function (_exports, _Theme, _measurementDocument, _measurementDocument2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _measurementDocument.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _measurementDocument.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _measurementDocument.pathData : _measurementDocument2.pathData;
  _exports.pathData = pathData;
  var _default = "measurement-document";
  _exports.default = _default;
});