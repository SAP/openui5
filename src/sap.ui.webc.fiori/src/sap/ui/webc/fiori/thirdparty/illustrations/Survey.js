sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-Survey", "./sapIllus-Scene-Survey", "./sapIllus-Spot-Survey", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSurvey, _sapIllusSceneSurvey, _sapIllusSpotSurvey, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSurvey.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSurvey.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSurvey.default;
    }
  });
  _sapIllusDialogSurvey = _interopRequireDefault(_sapIllusDialogSurvey);
  _sapIllusSceneSurvey = _interopRequireDefault(_sapIllusSceneSurvey);
  _sapIllusSpotSurvey = _interopRequireDefault(_sapIllusSpotSurvey);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Survey";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_SURVEY;
  const subtitle = _i18nDefaults.IM_SUBTITLE_SURVEY;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSurvey.default,
    sceneSvg: _sapIllusSceneSurvey.default,
    spotSvg: _sapIllusSpotSurvey.default,
    title,
    subtitle,
    set,
    collection
  });
});