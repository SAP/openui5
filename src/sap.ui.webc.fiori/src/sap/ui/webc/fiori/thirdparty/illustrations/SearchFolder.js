sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SearchFolder", "./sapIllus-Scene-SearchFolder", "./sapIllus-Spot-SearchFolder", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSearchFolder, _sapIllusSceneSearchFolder, _sapIllusSpotSearchFolder, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSearchFolder.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSearchFolder.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSearchFolder.default;
    }
  });
  _sapIllusDialogSearchFolder = _interopRequireDefault(_sapIllusDialogSearchFolder);
  _sapIllusSceneSearchFolder = _interopRequireDefault(_sapIllusSceneSearchFolder);
  _sapIllusSpotSearchFolder = _interopRequireDefault(_sapIllusSpotSearchFolder);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SearchFolder";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOSEARCHRESULTS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOSEARCHRESULTS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSearchFolder.default,
    sceneSvg: _sapIllusSceneSearchFolder.default,
    spotSvg: _sapIllusSpotSearchFolder.default,
    title,
    subtitle,
    set,
    collection
  });
});