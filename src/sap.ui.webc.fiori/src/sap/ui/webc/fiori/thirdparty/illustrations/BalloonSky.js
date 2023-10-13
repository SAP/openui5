sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-BalloonSky", "./sapIllus-Scene-BalloonSky", "./sapIllus-Spot-BalloonSky", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogBalloonSky, _sapIllusSceneBalloonSky, _sapIllusSpotBalloonSky, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogBalloonSky.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneBalloonSky.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotBalloonSky.default;
    }
  });
  _sapIllusDialogBalloonSky = _interopRequireDefault(_sapIllusDialogBalloonSky);
  _sapIllusSceneBalloonSky = _interopRequireDefault(_sapIllusSceneBalloonSky);
  _sapIllusSpotBalloonSky = _interopRequireDefault(_sapIllusSpotBalloonSky);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "BalloonSky";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_BALLOONSKY;
  const subtitle = _i18nDefaults.IM_SUBTITLE_BALLOONSKY;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogBalloonSky.default,
    sceneSvg: _sapIllusSceneBalloonSky.default,
    spotSvg: _sapIllusSpotBalloonSky.default,
    title,
    subtitle,
    set,
    collection
  });
});