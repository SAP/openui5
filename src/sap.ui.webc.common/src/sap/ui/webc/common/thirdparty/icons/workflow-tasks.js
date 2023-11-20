sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/workflow-tasks", "./v5/workflow-tasks"], function (_exports, _Theme, _workflowTasks, _workflowTasks2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _workflowTasks.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _workflowTasks.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _workflowTasks.pathData : _workflowTasks2.pathData;
  _exports.pathData = pathData;
  var _default = "workflow-tasks";
  _exports.default = _default;
});