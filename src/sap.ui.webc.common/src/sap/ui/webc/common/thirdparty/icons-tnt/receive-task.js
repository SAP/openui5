sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/receive-task", "./v3/receive-task"], function (_exports, _Theme, _receiveTask, _receiveTask2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _receiveTask.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _receiveTask.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _receiveTask.pathData : _receiveTask2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/receive-task";
  _exports.default = _default;
});