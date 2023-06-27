sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/etl-job", "./v3/etl-job"], function (_exports, _Theme, _etlJob, _etlJob2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _etlJob.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _etlJob.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _etlJob.pathData : _etlJob2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/etl-job";
  _exports.default = _default;
});