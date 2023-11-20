sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/citizen-connect", "./v5/citizen-connect"], function (_exports, _Theme, _citizenConnect, _citizenConnect2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _citizenConnect.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _citizenConnect.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _citizenConnect.pathData : _citizenConnect2.pathData;
  _exports.pathData = pathData;
  var _default = "citizen-connect";
  _exports.default = _default;
});