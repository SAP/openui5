sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/network-node", "./v3/network-node"], function (_exports, _Theme, _networkNode, _networkNode2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _networkNode.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _networkNode.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _networkNode.pathData : _networkNode2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/network-node";
  _exports.default = _default;
});