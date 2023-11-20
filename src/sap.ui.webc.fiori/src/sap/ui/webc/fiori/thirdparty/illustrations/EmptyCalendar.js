sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-EmptyCalendar", "./sapIllus-Scene-EmptyCalendar", "./sapIllus-Spot-EmptyCalendar", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogEmptyCalendar, _sapIllusSceneEmptyCalendar, _sapIllusSpotEmptyCalendar, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogEmptyCalendar.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneEmptyCalendar.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotEmptyCalendar.default;
    }
  });
  _sapIllusDialogEmptyCalendar = _interopRequireDefault(_sapIllusDialogEmptyCalendar);
  _sapIllusSceneEmptyCalendar = _interopRequireDefault(_sapIllusSceneEmptyCalendar);
  _sapIllusSpotEmptyCalendar = _interopRequireDefault(_sapIllusSpotEmptyCalendar);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "EmptyCalendar";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOACTIVITIES;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOACTIVITIES;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogEmptyCalendar.default,
    sceneSvg: _sapIllusSceneEmptyCalendar.default,
    spotSvg: _sapIllusSpotEmptyCalendar.default,
    title,
    subtitle,
    set,
    collection
  });
});