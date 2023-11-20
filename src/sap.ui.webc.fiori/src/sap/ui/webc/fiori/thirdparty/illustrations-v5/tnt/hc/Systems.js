sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Systems", "./tnt-Scene-Systems", "./tnt-Spot-Systems"], function (_exports, _Illustrations, _tntDialogSystems, _tntSceneSystems, _tntSpotSystems) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogSystems.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneSystems.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotSystems.default;
    }
  });
  _tntDialogSystems = _interopRequireDefault(_tntDialogSystems);
  _tntSceneSystems = _interopRequireDefault(_tntSceneSystems);
  _tntSpotSystems = _interopRequireDefault(_tntSpotSystems);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Systems";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogSystems.default,
    sceneSvg: _tntSceneSystems.default,
    spotSvg: _tntSpotSystems.default,
    set,
    collection
  });
});