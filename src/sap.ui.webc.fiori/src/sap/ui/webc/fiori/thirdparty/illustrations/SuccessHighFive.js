sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SuccessHighFive", "./sapIllus-Scene-SuccessHighFive", "./sapIllus-Spot-SuccessHighFive", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSuccessHighFive, _sapIllusSceneSuccessHighFive, _sapIllusSpotSuccessHighFive, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSuccessHighFive.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSuccessHighFive.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSuccessHighFive.default;
    }
  });
  _sapIllusDialogSuccessHighFive = _interopRequireDefault(_sapIllusDialogSuccessHighFive);
  _sapIllusSceneSuccessHighFive = _interopRequireDefault(_sapIllusSceneSuccessHighFive);
  _sapIllusSpotSuccessHighFive = _interopRequireDefault(_sapIllusSpotSuccessHighFive);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SuccessHighFive";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_BALLOONSKY;
  const subtitle = _i18nDefaults.IM_SUBTITLE_BALLOONSKY;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSuccessHighFive.default,
    sceneSvg: _sapIllusSceneSuccessHighFive.default,
    spotSvg: _sapIllusSpotSuccessHighFive.default,
    title,
    subtitle,
    set,
    collection
  });
});