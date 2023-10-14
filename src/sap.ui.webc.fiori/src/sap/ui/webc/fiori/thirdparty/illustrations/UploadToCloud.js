sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-UploadToCloud", "./sapIllus-Scene-UploadToCloud", "./sapIllus-Spot-UploadToCloud", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogUploadToCloud, _sapIllusSceneUploadToCloud, _sapIllusSpotUploadToCloud, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogUploadToCloud.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneUploadToCloud.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotUploadToCloud.default;
    }
  });
  _sapIllusDialogUploadToCloud = _interopRequireDefault(_sapIllusDialogUploadToCloud);
  _sapIllusSceneUploadToCloud = _interopRequireDefault(_sapIllusSceneUploadToCloud);
  _sapIllusSpotUploadToCloud = _interopRequireDefault(_sapIllusSpotUploadToCloud);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UploadToCloud";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UPLOADTOCLOUD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UPLOADTOCLOUD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogUploadToCloud.default,
    sceneSvg: _sapIllusSceneUploadToCloud.default,
    spotSvg: _sapIllusSpotUploadToCloud.default,
    title,
    subtitle,
    set,
    collection
  });
});