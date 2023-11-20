sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoSearchResults", "./sapIllus-Scene-NoSearchResults", "./sapIllus-Spot-NoSearchResults", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoSearchResults, _sapIllusSceneNoSearchResults, _sapIllusSpotNoSearchResults, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoSearchResults.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoSearchResults.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoSearchResults.default;
    }
  });
  _sapIllusDialogNoSearchResults = _interopRequireDefault(_sapIllusDialogNoSearchResults);
  _sapIllusSceneNoSearchResults = _interopRequireDefault(_sapIllusSceneNoSearchResults);
  _sapIllusSpotNoSearchResults = _interopRequireDefault(_sapIllusSpotNoSearchResults);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoSearchResults";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOSEARCHRESULTS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOSEARCHRESULTS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoSearchResults.default,
    sceneSvg: _sapIllusSceneNoSearchResults.default,
    spotSvg: _sapIllusSpotNoSearchResults.default,
    title,
    subtitle,
    set,
    collection
  });
});