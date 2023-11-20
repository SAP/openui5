sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/throughput-backlog", "./v3/throughput-backlog"], function (_exports, _Theme, _throughputBacklog, _throughputBacklog2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _throughputBacklog.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _throughputBacklog.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _throughputBacklog.pathData : _throughputBacklog2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/throughput-backlog";
  _exports.default = _default;
});