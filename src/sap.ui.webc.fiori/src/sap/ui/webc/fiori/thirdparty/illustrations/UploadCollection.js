sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-UploadCollection", "./sapIllus-Scene-UploadCollection", "./sapIllus-Spot-UploadCollection", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogUploadCollection, _sapIllusSceneUploadCollection, _sapIllusSpotUploadCollection, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogUploadCollection.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneUploadCollection.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotUploadCollection.default;
    }
  });
  _sapIllusDialogUploadCollection = _interopRequireDefault(_sapIllusDialogUploadCollection);
  _sapIllusSceneUploadCollection = _interopRequireDefault(_sapIllusSceneUploadCollection);
  _sapIllusSpotUploadCollection = _interopRequireDefault(_sapIllusSpotUploadCollection);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UploadCollection";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UPLOADCOLLECTION;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UPLOADCOLLECTION;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogUploadCollection.default,
    sceneSvg: _sapIllusSceneUploadCollection.default,
    spotSvg: _sapIllusSpotUploadCollection.default,
    title,
    subtitle,
    set,
    collection
  });
});