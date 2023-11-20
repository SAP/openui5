sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-EmptyContentPane", "./tnt-Scene-EmptyContentPane", "./tnt-Spot-EmptyContentPane"], function (_exports, _Illustrations, _tntDialogEmptyContentPane, _tntSceneEmptyContentPane, _tntSpotEmptyContentPane) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogEmptyContentPane.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneEmptyContentPane.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotEmptyContentPane.default;
    }
  });
  _tntDialogEmptyContentPane = _interopRequireDefault(_tntDialogEmptyContentPane);
  _tntSceneEmptyContentPane = _interopRequireDefault(_tntSceneEmptyContentPane);
  _tntSpotEmptyContentPane = _interopRequireDefault(_tntSpotEmptyContentPane);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "EmptyContentPane";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogEmptyContentPane.default,
    sceneSvg: _tntSceneEmptyContentPane.default,
    spotSvg: _tntSpotEmptyContentPane.default,
    set,
    collection
  });
});