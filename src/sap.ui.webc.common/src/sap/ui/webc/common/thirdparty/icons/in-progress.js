sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/in-progress", "./v5/in-progress"], function (_exports, _Theme, _inProgress, _inProgress2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _inProgress.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _inProgress.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _inProgress.pathData : _inProgress2.pathData;
  _exports.pathData = pathData;
  var _default = "in-progress";
  _exports.default = _default;
});