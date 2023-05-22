sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/gantt-bars", "./v5/gantt-bars"], function (_exports, _Theme, _ganttBars, _ganttBars2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _ganttBars.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _ganttBars.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _ganttBars.pathData : _ganttBars2.pathData;
  _exports.pathData = pathData;
  var _default = "gantt-bars";
  _exports.default = _default;
});