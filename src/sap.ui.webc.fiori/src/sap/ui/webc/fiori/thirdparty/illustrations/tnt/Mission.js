sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Mission", "./tnt-Scene-Mission", "./tnt-Spot-Mission"], function (_exports, _Illustrations, _tntDialogMission, _tntSceneMission, _tntSpotMission) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogMission.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneMission.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotMission.default;
    }
  });
  _tntDialogMission = _interopRequireDefault(_tntDialogMission);
  _tntSceneMission = _interopRequireDefault(_tntSceneMission);
  _tntSpotMission = _interopRequireDefault(_tntSpotMission);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Mission";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogMission.default,
    sceneSvg: _tntSceneMission.default,
    spotSvg: _tntSpotMission.default,
    set,
    collection
  });
});