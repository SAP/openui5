sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartOrg", "./tnt-Scene-ChartOrg", "./tnt-Spot-ChartOrg"], function (_exports, _Illustrations, _tntDialogChartOrg, _tntSceneChartOrg, _tntSpotChartOrg) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartOrg.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartOrg.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartOrg.default;
    }
  });
  _tntDialogChartOrg = _interopRequireDefault(_tntDialogChartOrg);
  _tntSceneChartOrg = _interopRequireDefault(_tntSceneChartOrg);
  _tntSpotChartOrg = _interopRequireDefault(_tntSpotChartOrg);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartOrg";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartOrg.default,
    sceneSvg: _tntSceneChartOrg.default,
    spotSvg: _tntSpotChartOrg.default,
    set,
    collection
  });
});