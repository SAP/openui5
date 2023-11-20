sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleMail", "./sapIllus-Scene-SimpleMail", "./sapIllus-Spot-SimpleMail", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleMail, _sapIllusSceneSimpleMail, _sapIllusSpotSimpleMail, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleMail.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleMail.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleMail.default;
    }
  });
  _sapIllusDialogSimpleMail = _interopRequireDefault(_sapIllusDialogSimpleMail);
  _sapIllusSceneSimpleMail = _interopRequireDefault(_sapIllusSceneSimpleMail);
  _sapIllusSpotSimpleMail = _interopRequireDefault(_sapIllusSpotSimpleMail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleMail";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOMAIL;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOMAIL;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleMail.default,
    sceneSvg: _sapIllusSceneSimpleMail.default,
    spotSvg: _sapIllusSpotSimpleMail.default,
    title,
    subtitle,
    set,
    collection
  });
});