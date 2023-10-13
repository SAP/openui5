sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-EmptyPlanningCalendar", "./sapIllus-Scene-EmptyPlanningCalendar", "./sapIllus-Spot-EmptyPlanningCalendar", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogEmptyPlanningCalendar, _sapIllusSceneEmptyPlanningCalendar, _sapIllusSpotEmptyPlanningCalendar, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogEmptyPlanningCalendar.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneEmptyPlanningCalendar.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotEmptyPlanningCalendar.default;
    }
  });
  _sapIllusDialogEmptyPlanningCalendar = _interopRequireDefault(_sapIllusDialogEmptyPlanningCalendar);
  _sapIllusSceneEmptyPlanningCalendar = _interopRequireDefault(_sapIllusSceneEmptyPlanningCalendar);
  _sapIllusSpotEmptyPlanningCalendar = _interopRequireDefault(_sapIllusSpotEmptyPlanningCalendar);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "EmptyPlanningCalendar";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_EMPTYPLANNINGCALENDAR;
  const subtitle = _i18nDefaults.IM_SUBTITLE_EMPTYPLANNINGCALENDAR;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogEmptyPlanningCalendar.default,
    sceneSvg: _sapIllusSceneEmptyPlanningCalendar.default,
    spotSvg: _sapIllusSpotEmptyPlanningCalendar.default,
    title,
    subtitle,
    set,
    collection
  });
});