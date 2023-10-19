sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SuccessScreen", "./sapIllus-Scene-SuccessScreen", "./sapIllus-Spot-SuccessScreen", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSuccessScreen, _sapIllusSceneSuccessScreen, _sapIllusSpotSuccessScreen, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSuccessScreen.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSuccessScreen.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSuccessScreen.default;
    }
  });
  _sapIllusDialogSuccessScreen = _interopRequireDefault(_sapIllusDialogSuccessScreen);
  _sapIllusSceneSuccessScreen = _interopRequireDefault(_sapIllusSceneSuccessScreen);
  _sapIllusSpotSuccessScreen = _interopRequireDefault(_sapIllusSpotSuccessScreen);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SuccessScreen";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_SUCCESSSCREEN;
  const subtitle = _i18nDefaults.IM_SUBTITLE_SUCCESSSCREEN;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSuccessScreen.default,
    sceneSvg: _sapIllusSceneSuccessScreen.default,
    spotSvg: _sapIllusSpotSuccessScreen.default,
    title,
    subtitle,
    set,
    collection
  });
});