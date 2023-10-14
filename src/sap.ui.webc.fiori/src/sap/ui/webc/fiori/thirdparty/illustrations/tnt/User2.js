sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-User2", "./tnt-Scene-User2", "./tnt-Spot-User2"], function (_exports, _Illustrations, _tntDialogUser, _tntSceneUser, _tntSpotUser) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogUser.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneUser.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotUser.default;
    }
  });
  _tntDialogUser = _interopRequireDefault(_tntDialogUser);
  _tntSceneUser = _interopRequireDefault(_tntSceneUser);
  _tntSpotUser = _interopRequireDefault(_tntSpotUser);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "User2";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogUser.default,
    sceneSvg: _tntSceneUser.default,
    spotSvg: _tntSpotUser.default,
    set,
    collection
  });
});