sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SleepingBell", "./sapIllus-Scene-SleepingBell", "./sapIllus-Spot-SleepingBell", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSleepingBell, _sapIllusSceneSleepingBell, _sapIllusSpotSleepingBell, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSleepingBell.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSleepingBell.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSleepingBell.default;
    }
  });
  _sapIllusDialogSleepingBell = _interopRequireDefault(_sapIllusDialogSleepingBell);
  _sapIllusSceneSleepingBell = _interopRequireDefault(_sapIllusSceneSleepingBell);
  _sapIllusSpotSleepingBell = _interopRequireDefault(_sapIllusSpotSleepingBell);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SleepingBell";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NONOTIFICATIONS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NONOTIFICATIONS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSleepingBell.default,
    sceneSvg: _sapIllusSceneSleepingBell.default,
    spotSvg: _sapIllusSpotSleepingBell.default,
    title,
    subtitle,
    set,
    collection
  });
});