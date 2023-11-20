sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-UnableToLoad", "./tnt-Scene-UnableToLoad", "./tnt-Spot-UnableToLoad"], function (_exports, _Illustrations, _tntDialogUnableToLoad, _tntSceneUnableToLoad, _tntSpotUnableToLoad) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogUnableToLoad.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneUnableToLoad.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotUnableToLoad.default;
    }
  });
  _tntDialogUnableToLoad = _interopRequireDefault(_tntDialogUnableToLoad);
  _tntSceneUnableToLoad = _interopRequireDefault(_tntSceneUnableToLoad);
  _tntSpotUnableToLoad = _interopRequireDefault(_tntSpotUnableToLoad);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UnableToLoad";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogUnableToLoad.default,
    sceneSvg: _tntSceneUnableToLoad.default,
    spotSvg: _tntSpotUnableToLoad.default,
    set,
    collection
  });
});