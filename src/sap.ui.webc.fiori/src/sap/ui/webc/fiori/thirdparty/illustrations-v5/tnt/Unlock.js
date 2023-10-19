sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Unlock", "./tnt-Scene-Unlock", "./tnt-Spot-Unlock"], function (_exports, _Illustrations, _tntDialogUnlock, _tntSceneUnlock, _tntSpotUnlock) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogUnlock.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneUnlock.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotUnlock.default;
    }
  });
  _tntDialogUnlock = _interopRequireDefault(_tntDialogUnlock);
  _tntSceneUnlock = _interopRequireDefault(_tntSceneUnlock);
  _tntSpotUnlock = _interopRequireDefault(_tntSpotUnlock);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Unlock";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogUnlock.default,
    sceneSvg: _tntSceneUnlock.default,
    spotSvg: _tntSpotUnlock.default,
    set,
    collection
  });
});