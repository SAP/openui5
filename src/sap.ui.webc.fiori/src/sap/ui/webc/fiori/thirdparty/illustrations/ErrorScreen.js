sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-ErrorScreen", "./sapIllus-Scene-ErrorScreen", "./sapIllus-Spot-ErrorScreen", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogErrorScreen, _sapIllusSceneErrorScreen, _sapIllusSpotErrorScreen, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogErrorScreen.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneErrorScreen.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotErrorScreen.default;
    }
  });
  _sapIllusDialogErrorScreen = _interopRequireDefault(_sapIllusDialogErrorScreen);
  _sapIllusSceneErrorScreen = _interopRequireDefault(_sapIllusSceneErrorScreen);
  _sapIllusSpotErrorScreen = _interopRequireDefault(_sapIllusSpotErrorScreen);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ErrorScreen";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOUPLOAD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOUPLOAD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogErrorScreen.default,
    sceneSvg: _sapIllusSceneErrorScreen.default,
    spotSvg: _sapIllusSpotErrorScreen.default,
    title,
    subtitle,
    set,
    collection
  });
});