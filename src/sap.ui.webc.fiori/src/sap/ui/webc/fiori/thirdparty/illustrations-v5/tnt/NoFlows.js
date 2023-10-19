sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-NoFlows", "./tnt-Scene-NoFlows", "./tnt-Spot-NoFlows"], function (_exports, _Illustrations, _tntDialogNoFlows, _tntSceneNoFlows, _tntSpotNoFlows) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogNoFlows.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneNoFlows.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotNoFlows.default;
    }
  });
  _tntDialogNoFlows = _interopRequireDefault(_tntDialogNoFlows);
  _tntSceneNoFlows = _interopRequireDefault(_tntSceneNoFlows);
  _tntSpotNoFlows = _interopRequireDefault(_tntSpotNoFlows);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoFlows";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogNoFlows.default,
    sceneSvg: _tntSceneNoFlows.default,
    spotSvg: _tntSpotNoFlows.default,
    set,
    collection
  });
});