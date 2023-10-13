sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-SessionExpiring", "./tnt-Scene-SessionExpiring", "./tnt-Spot-SessionExpiring"], function (_exports, _Illustrations, _tntDialogSessionExpiring, _tntSceneSessionExpiring, _tntSpotSessionExpiring) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogSessionExpiring.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneSessionExpiring.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotSessionExpiring.default;
    }
  });
  _tntDialogSessionExpiring = _interopRequireDefault(_tntDialogSessionExpiring);
  _tntSceneSessionExpiring = _interopRequireDefault(_tntSceneSessionExpiring);
  _tntSpotSessionExpiring = _interopRequireDefault(_tntSpotSessionExpiring);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SessionExpiring";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogSessionExpiring.default,
    sceneSvg: _tntSceneSessionExpiring.default,
    spotSvg: _tntSpotSessionExpiring.default,
    set,
    collection
  });
});