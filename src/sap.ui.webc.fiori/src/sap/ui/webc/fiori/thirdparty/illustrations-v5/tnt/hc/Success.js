sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Success", "./tnt-Scene-Success", "./tnt-Spot-Success"], function (_exports, _Illustrations, _tntDialogSuccess, _tntSceneSuccess, _tntSpotSuccess) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogSuccess.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneSuccess.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotSuccess.default;
    }
  });
  _tntDialogSuccess = _interopRequireDefault(_tntDialogSuccess);
  _tntSceneSuccess = _interopRequireDefault(_tntSceneSuccess);
  _tntSpotSuccess = _interopRequireDefault(_tntSpotSuccess);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Success";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogSuccess.default,
    sceneSvg: _tntSceneSuccess.default,
    spotSvg: _tntSpotSuccess.default,
    set,
    collection
  });
});