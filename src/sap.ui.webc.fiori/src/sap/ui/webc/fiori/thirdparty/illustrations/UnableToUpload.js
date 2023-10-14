sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-UnableToUpload", "./sapIllus-Scene-UnableToUpload", "./sapIllus-Spot-UnableToUpload", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogUnableToUpload, _sapIllusSceneUnableToUpload, _sapIllusSpotUnableToUpload, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogUnableToUpload.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneUnableToUpload.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotUnableToUpload.default;
    }
  });
  _sapIllusDialogUnableToUpload = _interopRequireDefault(_sapIllusDialogUnableToUpload);
  _sapIllusSceneUnableToUpload = _interopRequireDefault(_sapIllusSceneUnableToUpload);
  _sapIllusSpotUnableToUpload = _interopRequireDefault(_sapIllusSpotUnableToUpload);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UnableToUpload";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOUPLOAD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOUPLOAD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogUnableToUpload.default,
    sceneSvg: _sapIllusSceneUnableToUpload.default,
    spotSvg: _sapIllusSpotUnableToUpload.default,
    title,
    subtitle,
    set,
    collection
  });
});