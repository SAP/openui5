sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Lock", "./tnt-Scene-Lock", "./tnt-Spot-Lock"], function (_exports, _Illustrations, _tntDialogLock, _tntSceneLock, _tntSpotLock) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogLock.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneLock.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotLock.default;
    }
  });
  _tntDialogLock = _interopRequireDefault(_tntDialogLock);
  _tntSceneLock = _interopRequireDefault(_tntSceneLock);
  _tntSpotLock = _interopRequireDefault(_tntSpotLock);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Lock";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogLock.default,
    sceneSvg: _tntSceneLock.default,
    spotSvg: _tntSpotLock.default,
    set,
    collection
  });
});