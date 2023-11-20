sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Radar", "./tnt-Scene-Radar", "./tnt-Spot-Radar"], function (_exports, _Illustrations, _tntDialogRadar, _tntSceneRadar, _tntSpotRadar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogRadar.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneRadar.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotRadar.default;
    }
  });
  _tntDialogRadar = _interopRequireDefault(_tntDialogRadar);
  _tntSceneRadar = _interopRequireDefault(_tntSceneRadar);
  _tntSpotRadar = _interopRequireDefault(_tntSpotRadar);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Radar";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogRadar.default,
    sceneSvg: _tntSceneRadar.default,
    spotSvg: _tntSpotRadar.default,
    set,
    collection
  });
});