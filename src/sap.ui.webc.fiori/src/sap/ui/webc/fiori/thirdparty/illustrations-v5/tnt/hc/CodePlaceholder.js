sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-CodePlaceholder", "./tnt-Scene-CodePlaceholder", "./tnt-Spot-CodePlaceholder"], function (_exports, _Illustrations, _tntDialogCodePlaceholder, _tntSceneCodePlaceholder, _tntSpotCodePlaceholder) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogCodePlaceholder.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneCodePlaceholder.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotCodePlaceholder.default;
    }
  });
  _tntDialogCodePlaceholder = _interopRequireDefault(_tntDialogCodePlaceholder);
  _tntSceneCodePlaceholder = _interopRequireDefault(_tntSceneCodePlaceholder);
  _tntSpotCodePlaceholder = _interopRequireDefault(_tntSpotCodePlaceholder);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "CodePlaceholder";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogCodePlaceholder.default,
    sceneSvg: _tntSceneCodePlaceholder.default,
    spotSvg: _tntSpotCodePlaceholder.default,
    set,
    collection
  });
});