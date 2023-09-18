sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-ExternalLink", "./tnt-Scene-ExternalLink", "./tnt-Spot-ExternalLink"], function (_exports, _Illustrations, _tntDialogExternalLink, _tntSceneExternalLink, _tntSpotExternalLink) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogExternalLink.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneExternalLink.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotExternalLink.default;
    }
  });
  _tntDialogExternalLink = _interopRequireDefault(_tntDialogExternalLink);
  _tntSceneExternalLink = _interopRequireDefault(_tntSceneExternalLink);
  _tntSpotExternalLink = _interopRequireDefault(_tntSpotExternalLink);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ExternalLink";
  const set = "tnt";
  const collection = "V5/HC";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogExternalLink.default,
    sceneSvg: _tntSceneExternalLink.default,
    spotSvg: _tntSpotExternalLink.default,
    set,
    collection
  });
});