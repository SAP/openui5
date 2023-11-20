sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-SessionExpired", "./tnt-Scene-SessionExpired", "./tnt-Spot-SessionExpired"], function (_exports, _Illustrations, _tntDialogSessionExpired, _tntSceneSessionExpired, _tntSpotSessionExpired) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogSessionExpired.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneSessionExpired.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotSessionExpired.default;
    }
  });
  _tntDialogSessionExpired = _interopRequireDefault(_tntDialogSessionExpired);
  _tntSceneSessionExpired = _interopRequireDefault(_tntSceneSessionExpired);
  _tntSpotSessionExpired = _interopRequireDefault(_tntSpotSessionExpired);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SessionExpired";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogSessionExpired.default,
    sceneSvg: _tntSceneSessionExpired.default,
    spotSvg: _tntSpotSessionExpired.default,
    set,
    collection
  });
});