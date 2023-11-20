sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartArea", "./tnt-Scene-ChartArea", "./tnt-Spot-ChartArea"], function (_exports, _Illustrations, _tntDialogChartArea, _tntSceneChartArea, _tntSpotChartArea) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartArea.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartArea.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartArea.default;
    }
  });
  _tntDialogChartArea = _interopRequireDefault(_tntDialogChartArea);
  _tntSceneChartArea = _interopRequireDefault(_tntSceneChartArea);
  _tntSpotChartArea = _interopRequireDefault(_tntSpotChartArea);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartArea";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartArea.default,
    sceneSvg: _tntSceneChartArea.default,
    spotSvg: _tntSpotChartArea.default,
    set,
    collection
  });
});