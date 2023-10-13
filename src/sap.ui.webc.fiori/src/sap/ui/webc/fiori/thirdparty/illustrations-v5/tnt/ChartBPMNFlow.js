sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartBPMNFlow", "./tnt-Scene-ChartBPMNFlow", "./tnt-Spot-ChartBPMNFlow"], function (_exports, _Illustrations, _tntDialogChartBPMNFlow, _tntSceneChartBPMNFlow, _tntSpotChartBPMNFlow) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartBPMNFlow.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartBPMNFlow.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartBPMNFlow.default;
    }
  });
  _tntDialogChartBPMNFlow = _interopRequireDefault(_tntDialogChartBPMNFlow);
  _tntSceneChartBPMNFlow = _interopRequireDefault(_tntSceneChartBPMNFlow);
  _tntSpotChartBPMNFlow = _interopRequireDefault(_tntSpotChartBPMNFlow);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartBPMNFlow";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartBPMNFlow.default,
    sceneSvg: _tntSceneChartBPMNFlow.default,
    spotSvg: _tntSpotChartBPMNFlow.default,
    set,
    collection
  });
});