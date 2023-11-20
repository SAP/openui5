sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-SuccessfulAuth", "./tnt-Scene-SuccessfulAuth", "./tnt-Spot-SuccessfulAuth"], function (_exports, _Illustrations, _tntDialogSuccessfulAuth, _tntSceneSuccessfulAuth, _tntSpotSuccessfulAuth) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogSuccessfulAuth.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneSuccessfulAuth.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotSuccessfulAuth.default;
    }
  });
  _tntDialogSuccessfulAuth = _interopRequireDefault(_tntDialogSuccessfulAuth);
  _tntSceneSuccessfulAuth = _interopRequireDefault(_tntSceneSuccessfulAuth);
  _tntSpotSuccessfulAuth = _interopRequireDefault(_tntSpotSuccessfulAuth);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SuccessfulAuth";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogSuccessfulAuth.default,
    sceneSvg: _tntSceneSuccessfulAuth.default,
    spotSvg: _tntSpotSuccessfulAuth.default,
    set,
    collection
  });
});