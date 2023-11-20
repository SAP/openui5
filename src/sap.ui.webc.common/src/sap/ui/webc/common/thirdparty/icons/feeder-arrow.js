sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/feeder-arrow", "./v5/feeder-arrow"], function (_exports, _Theme, _feederArrow, _feederArrow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _feederArrow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _feederArrow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _feederArrow.pathData : _feederArrow2.pathData;
  _exports.pathData = pathData;
  var _default = "feeder-arrow";
  _exports.default = _default;
});