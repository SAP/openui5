sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-NoUsers", "./tnt-Scene-NoUsers", "./tnt-Spot-NoUsers"], function (_exports, _Illustrations, _tntDialogNoUsers, _tntSceneNoUsers, _tntSpotNoUsers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogNoUsers.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneNoUsers.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotNoUsers.default;
    }
  });
  _tntDialogNoUsers = _interopRequireDefault(_tntDialogNoUsers);
  _tntSceneNoUsers = _interopRequireDefault(_tntSceneNoUsers);
  _tntSpotNoUsers = _interopRequireDefault(_tntSpotNoUsers);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoUsers";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogNoUsers.default,
    sceneSvg: _tntSceneNoUsers.default,
    spotSvg: _tntSpotNoUsers.default,
    set,
    collection
  });
});