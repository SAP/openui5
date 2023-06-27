sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/manual-task", "./v3/manual-task"], function (_exports, _Theme, _manualTask, _manualTask2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _manualTask.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _manualTask.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _manualTask.pathData : _manualTask2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/manual-task";
  _exports.default = _default;
});