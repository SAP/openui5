sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Components", "./tnt-Scene-Components", "./tnt-Spot-Components"], function (_exports, _Illustrations, _tntDialogComponents, _tntSceneComponents, _tntSpotComponents) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogComponents.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneComponents.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotComponents.default;
    }
  });
  _tntDialogComponents = _interopRequireDefault(_tntDialogComponents);
  _tntSceneComponents = _interopRequireDefault(_tntSceneComponents);
  _tntSpotComponents = _interopRequireDefault(_tntSpotComponents);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Components";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogComponents.default,
    sceneSvg: _tntSceneComponents.default,
    spotSvg: _tntSpotComponents.default,
    set,
    collection
  });
});