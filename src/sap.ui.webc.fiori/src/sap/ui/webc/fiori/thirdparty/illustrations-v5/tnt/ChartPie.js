sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartPie", "./tnt-Scene-ChartPie", "./tnt-Spot-ChartPie"], function (_exports, _Illustrations, _tntDialogChartPie, _tntSceneChartPie, _tntSpotChartPie) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartPie.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartPie.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartPie.default;
    }
  });
  _tntDialogChartPie = _interopRequireDefault(_tntDialogChartPie);
  _tntSceneChartPie = _interopRequireDefault(_tntSceneChartPie);
  _tntSpotChartPie = _interopRequireDefault(_tntSpotChartPie);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartPie";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartPie.default,
    sceneSvg: _tntSceneChartPie.default,
    spotSvg: _tntSpotChartPie.default,
    set,
    collection
  });
});