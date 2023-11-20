sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoMail", "./sapIllus-Scene-NoMail", "./sapIllus-Spot-NoMail", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoMail, _sapIllusSceneNoMail, _sapIllusSpotNoMail, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoMail.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoMail.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoMail.default;
    }
  });
  _sapIllusDialogNoMail = _interopRequireDefault(_sapIllusDialogNoMail);
  _sapIllusSceneNoMail = _interopRequireDefault(_sapIllusSceneNoMail);
  _sapIllusSpotNoMail = _interopRequireDefault(_sapIllusSpotNoMail);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoMail";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOMAIL;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOMAIL;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoMail.default,
    sceneSvg: _sapIllusSceneNoMail.default,
    spotSvg: _sapIllusSpotNoMail.default,
    title,
    subtitle,
    set,
    collection
  });
});