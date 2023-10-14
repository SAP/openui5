sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-UnSuccessfulAuth", "./tnt-Scene-UnSuccessfulAuth", "./tnt-Spot-UnSuccessfulAuth"], function (_exports, _Illustrations, _tntDialogUnSuccessfulAuth, _tntSceneUnSuccessfulAuth, _tntSpotUnSuccessfulAuth) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogUnSuccessfulAuth.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneUnSuccessfulAuth.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotUnSuccessfulAuth.default;
    }
  });
  _tntDialogUnSuccessfulAuth = _interopRequireDefault(_tntDialogUnSuccessfulAuth);
  _tntSceneUnSuccessfulAuth = _interopRequireDefault(_tntSceneUnSuccessfulAuth);
  _tntSpotUnSuccessfulAuth = _interopRequireDefault(_tntSpotUnSuccessfulAuth);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UnSuccessfulAuth";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogUnSuccessfulAuth.default,
    sceneSvg: _tntSceneUnSuccessfulAuth.default,
    spotSvg: _tntSpotUnSuccessfulAuth.default,
    set,
    collection
  });
});