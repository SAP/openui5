sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Tools", "./tnt-Scene-Tools", "./tnt-Spot-Tools"], function (_exports, _Illustrations, _tntDialogTools, _tntSceneTools, _tntSpotTools) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogTools.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneTools.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotTools.default;
    }
  });
  _tntDialogTools = _interopRequireDefault(_tntDialogTools);
  _tntSceneTools = _interopRequireDefault(_tntSceneTools);
  _tntSpotTools = _interopRequireDefault(_tntSpotTools);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Tools";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogTools.default,
    sceneSvg: _tntSceneTools.default,
    spotSvg: _tntSpotTools.default,
    set,
    collection
  });
});