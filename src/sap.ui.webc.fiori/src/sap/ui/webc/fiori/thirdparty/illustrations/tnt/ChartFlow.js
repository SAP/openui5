sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartFlow", "./tnt-Scene-ChartFlow", "./tnt-Spot-ChartFlow"], function (_exports, _Illustrations, _tntDialogChartFlow, _tntSceneChartFlow, _tntSpotChartFlow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartFlow.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartFlow.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartFlow.default;
    }
  });
  _tntDialogChartFlow = _interopRequireDefault(_tntDialogChartFlow);
  _tntSceneChartFlow = _interopRequireDefault(_tntSceneChartFlow);
  _tntSpotChartFlow = _interopRequireDefault(_tntSpotChartFlow);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartFlow";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartFlow.default,
    sceneSvg: _tntSceneChartFlow.default,
    spotSvg: _tntSpotChartFlow.default,
    set,
    collection
  });
});