sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/create-entry-time", "./v5/create-entry-time"], function (_exports, _Theme, _createEntryTime, _createEntryTime2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _createEntryTime.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _createEntryTime.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _createEntryTime.pathData : _createEntryTime2.pathData;
  _exports.pathData = pathData;
  var _default = "create-entry-time";
  _exports.default = _default;
});