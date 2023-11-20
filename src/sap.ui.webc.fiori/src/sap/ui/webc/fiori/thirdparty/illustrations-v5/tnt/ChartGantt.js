sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartGantt", "./tnt-Scene-ChartGantt", "./tnt-Spot-ChartGantt"], function (_exports, _Illustrations, _tntDialogChartGantt, _tntSceneChartGantt, _tntSpotChartGantt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartGantt.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartGantt.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartGantt.default;
    }
  });
  _tntDialogChartGantt = _interopRequireDefault(_tntDialogChartGantt);
  _tntSceneChartGantt = _interopRequireDefault(_tntSceneChartGantt);
  _tntSpotChartGantt = _interopRequireDefault(_tntSpotChartGantt);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartGantt";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartGantt.default,
    sceneSvg: _tntSceneChartGantt.default,
    spotSvg: _tntSpotChartGantt.default,
    set,
    collection
  });
});