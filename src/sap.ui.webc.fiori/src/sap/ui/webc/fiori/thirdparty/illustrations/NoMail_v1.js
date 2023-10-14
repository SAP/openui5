sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoMail_v1", "./sapIllus-Scene-NoMail_v1", "./sapIllus-Spot-NoMail_v1", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoMail_v, _sapIllusSceneNoMail_v, _sapIllusSpotNoMail_v, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoMail_v.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoMail_v.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoMail_v.default;
    }
  });
  _sapIllusDialogNoMail_v = _interopRequireDefault(_sapIllusDialogNoMail_v);
  _sapIllusSceneNoMail_v = _interopRequireDefault(_sapIllusSceneNoMail_v);
  _sapIllusSpotNoMail_v = _interopRequireDefault(_sapIllusSpotNoMail_v);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoMail_v1";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOMAIL;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOMAIL;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoMail_v.default,
    sceneSvg: _sapIllusSceneNoMail_v.default,
    spotSvg: _sapIllusSpotNoMail_v.default,
    title,
    subtitle,
    set,
    collection
  });
});