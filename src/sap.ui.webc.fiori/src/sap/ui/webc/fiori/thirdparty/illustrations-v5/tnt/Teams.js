sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Teams", "./tnt-Scene-Teams", "./tnt-Spot-Teams"], function (_exports, _Illustrations, _tntDialogTeams, _tntSceneTeams, _tntSpotTeams) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogTeams.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneTeams.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotTeams.default;
    }
  });
  _tntDialogTeams = _interopRequireDefault(_tntDialogTeams);
  _tntSceneTeams = _interopRequireDefault(_tntSceneTeams);
  _tntSpotTeams = _interopRequireDefault(_tntSpotTeams);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Teams";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogTeams.default,
    sceneSvg: _tntSceneTeams.default,
    spotSvg: _tntSpotTeams.default,
    set,
    collection
  });
});