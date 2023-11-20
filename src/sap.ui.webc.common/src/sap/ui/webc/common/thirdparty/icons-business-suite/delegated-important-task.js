sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/delegated-important-task", "./v2/delegated-important-task"], function (_exports, _Theme, _delegatedImportantTask, _delegatedImportantTask2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _delegatedImportantTask.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _delegatedImportantTask.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _delegatedImportantTask.pathData : _delegatedImportantTask2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/delegated-important-task";
  _exports.default = _default;
});