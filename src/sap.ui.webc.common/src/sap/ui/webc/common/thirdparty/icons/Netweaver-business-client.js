sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/Netweaver-business-client", "./v5/Netweaver-business-client"], function (_exports, _Theme, _NetweaverBusinessClient, _NetweaverBusinessClient2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _NetweaverBusinessClient.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _NetweaverBusinessClient.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _NetweaverBusinessClient.pathData : _NetweaverBusinessClient2.pathData;
  _exports.pathData = pathData;
  var _default = "Netweaver-business-client";
  _exports.default = _default;
});