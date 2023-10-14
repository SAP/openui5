sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleCalendar", "./sapIllus-Scene-SimpleCalendar", "./sapIllus-Spot-SimpleCalendar", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleCalendar, _sapIllusSceneSimpleCalendar, _sapIllusSpotSimpleCalendar, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleCalendar.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleCalendar.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleCalendar.default;
    }
  });
  _sapIllusDialogSimpleCalendar = _interopRequireDefault(_sapIllusDialogSimpleCalendar);
  _sapIllusSceneSimpleCalendar = _interopRequireDefault(_sapIllusSceneSimpleCalendar);
  _sapIllusSpotSimpleCalendar = _interopRequireDefault(_sapIllusSpotSimpleCalendar);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleCalendar";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOACTIVITIES;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOACTIVITIES;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleCalendar.default,
    sceneSvg: _sapIllusSceneSimpleCalendar.default,
    spotSvg: _sapIllusSpotSimpleCalendar.default,
    title,
    subtitle,
    set,
    collection
  });
});