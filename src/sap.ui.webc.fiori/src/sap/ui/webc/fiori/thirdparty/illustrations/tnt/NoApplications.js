sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-NoApplications", "./tnt-Scene-NoApplications", "./tnt-Spot-NoApplications"], function (_exports, _Illustrations, _tntDialogNoApplications, _tntSceneNoApplications, _tntSpotNoApplications) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogNoApplications.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneNoApplications.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotNoApplications.default;
    }
  });
  _tntDialogNoApplications = _interopRequireDefault(_tntDialogNoApplications);
  _tntSceneNoApplications = _interopRequireDefault(_tntSceneNoApplications);
  _tntSpotNoApplications = _interopRequireDefault(_tntSpotNoApplications);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoApplications";
  const set = "tnt";
  const collection = "V4";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogNoApplications.default,
    sceneSvg: _tntSceneNoApplications.default,
    spotSvg: _tntSpotNoApplications.default,
    set,
    collection
  });
});