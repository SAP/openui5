sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/fax-machine", "./v5/fax-machine"], function (_exports, _Theme, _faxMachine, _faxMachine2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _faxMachine.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _faxMachine.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _faxMachine.pathData : _faxMachine2.pathData;
  _exports.pathData = pathData;
  var _default = "fax-machine";
  _exports.default = _default;
});