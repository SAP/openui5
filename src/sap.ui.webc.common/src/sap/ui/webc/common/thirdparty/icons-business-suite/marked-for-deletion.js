sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/marked-for-deletion", "./v2/marked-for-deletion"], function (_exports, _Theme, _markedForDeletion, _markedForDeletion2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _markedForDeletion.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _markedForDeletion.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _markedForDeletion.pathData : _markedForDeletion2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/marked-for-deletion";
  _exports.default = _default;
});