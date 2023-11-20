sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ChartBullet", "./tnt-Scene-ChartBullet", "./tnt-Spot-ChartBullet"], function (_exports, _Illustrations, _tntDialogChartBullet, _tntSceneChartBullet, _tntSpotChartBullet) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogChartBullet.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneChartBullet.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotChartBullet.default;
    }
  });
  _tntDialogChartBullet = _interopRequireDefault(_tntDialogChartBullet);
  _tntSceneChartBullet = _interopRequireDefault(_tntSceneChartBullet);
  _tntSpotChartBullet = _interopRequireDefault(_tntSpotChartBullet);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ChartBullet";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogChartBullet.default,
    sceneSvg: _tntSceneChartBullet.default,
    spotSvg: _tntSpotChartBullet.default,
    set,
    collection
  });
});