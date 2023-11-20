sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/script-task", "./v3/script-task"], function (_exports, _Theme, _scriptTask, _scriptTask2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _scriptTask.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _scriptTask.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _scriptTask.pathData : _scriptTask2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/script-task";
  _exports.default = _default;
});