sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SuccessBalloon", "./sapIllus-Scene-SuccessBalloon", "./sapIllus-Spot-SuccessBalloon", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSuccessBalloon, _sapIllusSceneSuccessBalloon, _sapIllusSpotSuccessBalloon, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSuccessBalloon.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSuccessBalloon.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSuccessBalloon.default;
    }
  });
  _sapIllusDialogSuccessBalloon = _interopRequireDefault(_sapIllusDialogSuccessBalloon);
  _sapIllusSceneSuccessBalloon = _interopRequireDefault(_sapIllusSceneSuccessBalloon);
  _sapIllusSpotSuccessBalloon = _interopRequireDefault(_sapIllusSpotSuccessBalloon);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SuccessBalloon";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_BALLOONSKY;
  const subtitle = _i18nDefaults.IM_SUBTITLE_BALLOONSKY;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSuccessBalloon.default,
    sceneSvg: _sapIllusSceneSuccessBalloon.default,
    spotSvg: _sapIllusSpotSuccessBalloon.default,
    title,
    subtitle,
    set,
    collection
  });
});