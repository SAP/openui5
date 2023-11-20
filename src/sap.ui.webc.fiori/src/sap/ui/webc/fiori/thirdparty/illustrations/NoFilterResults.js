sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoFilterResults", "./sapIllus-Scene-NoFilterResults", "./sapIllus-Spot-NoFilterResults", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoFilterResults, _sapIllusSceneNoFilterResults, _sapIllusSpotNoFilterResults, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoFilterResults.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoFilterResults.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoFilterResults.default;
    }
  });
  _sapIllusDialogNoFilterResults = _interopRequireDefault(_sapIllusDialogNoFilterResults);
  _sapIllusSceneNoFilterResults = _interopRequireDefault(_sapIllusSceneNoFilterResults);
  _sapIllusSpotNoFilterResults = _interopRequireDefault(_sapIllusSpotNoFilterResults);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoFilterResults";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOFILTERRESULTS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOFILTERRESULTS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoFilterResults.default,
    sceneSvg: _sapIllusSceneNoFilterResults.default,
    spotSvg: _sapIllusSpotNoFilterResults.default,
    title,
    subtitle,
    set,
    collection
  });
});