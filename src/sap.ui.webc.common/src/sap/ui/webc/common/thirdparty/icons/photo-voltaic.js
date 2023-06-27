sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/photo-voltaic", "./v5/photo-voltaic"], function (_exports, _Theme, _photoVoltaic, _photoVoltaic2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _photoVoltaic.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _photoVoltaic.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _photoVoltaic.pathData : _photoVoltaic2.pathData;
  _exports.pathData = pathData;
  var _default = "photo-voltaic";
  _exports.default = _default;
});