sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-UnsuccessfulAuth", "./tnt-Scene-UnsuccessfulAuth", "./tnt-Spot-UnsuccessfulAuth"], function (_exports, _Illustrations, _tntDialogUnsuccessfulAuth, _tntSceneUnsuccessfulAuth, _tntSpotUnsuccessfulAuth) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogUnsuccessfulAuth.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneUnsuccessfulAuth.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotUnsuccessfulAuth.default;
    }
  });
  _tntDialogUnsuccessfulAuth = _interopRequireDefault(_tntDialogUnsuccessfulAuth);
  _tntSceneUnsuccessfulAuth = _interopRequireDefault(_tntSceneUnsuccessfulAuth);
  _tntSpotUnsuccessfulAuth = _interopRequireDefault(_tntSpotUnsuccessfulAuth);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UnsuccessfulAuth";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogUnsuccessfulAuth.default,
    sceneSvg: _tntSceneUnsuccessfulAuth.default,
    spotSvg: _tntSpotUnsuccessfulAuth.default,
    set,
    collection
  });
});