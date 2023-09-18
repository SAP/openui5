sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-ReloadScreen", "./sapIllus-Scene-ReloadScreen", "./sapIllus-Spot-ReloadScreen", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogReloadScreen, _sapIllusSceneReloadScreen, _sapIllusSpotReloadScreen, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogReloadScreen.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneReloadScreen.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotReloadScreen.default;
    }
  });
  _sapIllusDialogReloadScreen = _interopRequireDefault(_sapIllusDialogReloadScreen);
  _sapIllusSceneReloadScreen = _interopRequireDefault(_sapIllusSceneReloadScreen);
  _sapIllusSpotReloadScreen = _interopRequireDefault(_sapIllusSpotReloadScreen);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ReloadScreen";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOLOAD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogReloadScreen.default,
    sceneSvg: _sapIllusSceneReloadScreen.default,
    spotSvg: _sapIllusSpotReloadScreen.default,
    title,
    subtitle,
    set,
    collection
  });
});