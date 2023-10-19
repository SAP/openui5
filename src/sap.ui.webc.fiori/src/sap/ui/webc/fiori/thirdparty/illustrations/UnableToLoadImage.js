sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-UnableToLoadImage", "./sapIllus-Scene-UnableToLoadImage", "./sapIllus-Spot-UnableToLoadImage", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogUnableToLoadImage, _sapIllusSceneUnableToLoadImage, _sapIllusSpotUnableToLoadImage, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogUnableToLoadImage.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneUnableToLoadImage.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotUnableToLoadImage.default;
    }
  });
  _sapIllusDialogUnableToLoadImage = _interopRequireDefault(_sapIllusDialogUnableToLoadImage);
  _sapIllusSceneUnableToLoadImage = _interopRequireDefault(_sapIllusSceneUnableToLoadImage);
  _sapIllusSpotUnableToLoadImage = _interopRequireDefault(_sapIllusSpotUnableToLoadImage);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UnableToLoadImage";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOLOADIMAGE;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOLOADIMAGE;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogUnableToLoadImage.default,
    sceneSvg: _sapIllusSceneUnableToLoadImage.default,
    spotSvg: _sapIllusSpotUnableToLoadImage.default,
    title,
    subtitle,
    set,
    collection
  });
});