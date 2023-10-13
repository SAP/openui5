sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartBar", "./tnt-Scene-ChartBar", "./tnt-Spot-ChartBar"], function (_exports, _Illustrations, _tntDialogChartBar, _tntSceneChartBar, _tntSpotChartBar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartBar.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartBar.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartBar.default;
    }
  });
  _tntDialogChartBar = _interopRequireDefault(_tntDialogChartBar);
  _tntSceneChartBar = _interopRequireDefault(_tntSceneChartBar);
  _tntSpotChartBar = _interopRequireDefault(_tntSpotChartBar);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartBar";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartBar.default,
    sceneSvg: _tntSceneChartBar.default,
    spotSvg: _tntSpotChartBar.default,
    set,
    collection
  });
});