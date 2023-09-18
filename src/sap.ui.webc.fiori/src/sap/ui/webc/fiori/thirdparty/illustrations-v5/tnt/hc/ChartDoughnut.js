sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartDoughnut", "./tnt-Scene-ChartDoughnut", "./tnt-Spot-ChartDoughnut"], function (_exports, _Illustrations, _tntDialogChartDoughnut, _tntSceneChartDoughnut, _tntSpotChartDoughnut) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartDoughnut.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartDoughnut.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartDoughnut.default;
    }
  });
  _tntDialogChartDoughnut = _interopRequireDefault(_tntDialogChartDoughnut);
  _tntSceneChartDoughnut = _interopRequireDefault(_tntSceneChartDoughnut);
  _tntSpotChartDoughnut = _interopRequireDefault(_tntSpotChartDoughnut);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartDoughnut";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartDoughnut.default,
    sceneSvg: _tntSceneChartDoughnut.default,
    spotSvg: _tntSpotChartDoughnut.default,
    set,
    collection
  });
});