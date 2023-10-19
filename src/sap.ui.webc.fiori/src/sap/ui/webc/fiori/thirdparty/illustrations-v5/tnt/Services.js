sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Services", "./tnt-Scene-Services", "./tnt-Spot-Services"], function (_exports, _Illustrations, _tntDialogServices, _tntSceneServices, _tntSpotServices) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogServices.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneServices.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotServices.default;
    }
  });
  _tntDialogServices = _interopRequireDefault(_tntDialogServices);
  _tntSceneServices = _interopRequireDefault(_tntSceneServices);
  _tntSpotServices = _interopRequireDefault(_tntSpotServices);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Services";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogServices.default,
    sceneSvg: _tntSceneServices.default,
    spotSvg: _tntSpotServices.default,
    set,
    collection
  });
});