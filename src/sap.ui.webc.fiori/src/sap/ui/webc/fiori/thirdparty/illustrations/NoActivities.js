sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoActivities", "./sapIllus-Scene-NoActivities", "./sapIllus-Spot-NoActivities", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoActivities, _sapIllusSceneNoActivities, _sapIllusSpotNoActivities, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoActivities.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoActivities.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoActivities.default;
    }
  });
  _sapIllusDialogNoActivities = _interopRequireDefault(_sapIllusDialogNoActivities);
  _sapIllusSceneNoActivities = _interopRequireDefault(_sapIllusSceneNoActivities);
  _sapIllusSpotNoActivities = _interopRequireDefault(_sapIllusSpotNoActivities);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoActivities";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOACTIVITIES;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOACTIVITIES;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoActivities.default,
    sceneSvg: _sapIllusSceneNoActivities.default,
    spotSvg: _sapIllusSpotNoActivities.default,
    title,
    subtitle,
    set,
    collection
  });
});