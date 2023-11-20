sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Fingerprint", "./tnt-Scene-Fingerprint", "./tnt-Spot-Fingerprint"], function (_exports, _Illustrations, _tntDialogFingerprint, _tntSceneFingerprint, _tntSpotFingerprint) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogFingerprint.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneFingerprint.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotFingerprint.default;
    }
  });
  _tntDialogFingerprint = _interopRequireDefault(_tntDialogFingerprint);
  _tntSceneFingerprint = _interopRequireDefault(_tntSceneFingerprint);
  _tntSpotFingerprint = _interopRequireDefault(_tntSpotFingerprint);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Fingerprint";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogFingerprint.default,
    sceneSvg: _tntSceneFingerprint.default,
    spotSvg: _tntSpotFingerprint.default,
    set,
    collection
  });
});