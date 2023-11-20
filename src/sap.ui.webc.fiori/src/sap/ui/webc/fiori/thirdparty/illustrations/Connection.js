sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-Connection", "./sapIllus-Scene-Connection", "./sapIllus-Spot-Connection", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogConnection, _sapIllusSceneConnection, _sapIllusSpotConnection, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogConnection.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneConnection.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotConnection.default;
    }
  });
  _sapIllusDialogConnection = _interopRequireDefault(_sapIllusDialogConnection);
  _sapIllusSceneConnection = _interopRequireDefault(_sapIllusSceneConnection);
  _sapIllusSpotConnection = _interopRequireDefault(_sapIllusSpotConnection);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Connection";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOLOAD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogConnection.default,
    sceneSvg: _sapIllusSceneConnection.default,
    spotSvg: _sapIllusSpotConnection.default,
    title,
    subtitle,
    set,
    collection
  });
});