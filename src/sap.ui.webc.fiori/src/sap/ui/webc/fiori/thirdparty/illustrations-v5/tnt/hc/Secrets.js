sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Secrets", "./tnt-Scene-Secrets", "./tnt-Spot-Secrets"], function (_exports, _Illustrations, _tntDialogSecrets, _tntSceneSecrets, _tntSpotSecrets) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogSecrets.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneSecrets.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotSecrets.default;
    }
  });
  _tntDialogSecrets = _interopRequireDefault(_tntDialogSecrets);
  _tntSceneSecrets = _interopRequireDefault(_tntSceneSecrets);
  _tntSpotSecrets = _interopRequireDefault(_tntSpotSecrets);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Secrets";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogSecrets.default,
    sceneSvg: _tntSceneSecrets.default,
    spotSvg: _tntSpotSecrets.default,
    set,
    collection
  });
});