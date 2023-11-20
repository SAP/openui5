sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-BeforeSearch", "./sapIllus-Scene-BeforeSearch", "./sapIllus-Spot-BeforeSearch", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogBeforeSearch, _sapIllusSceneBeforeSearch, _sapIllusSpotBeforeSearch, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogBeforeSearch.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneBeforeSearch.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotBeforeSearch.default;
    }
  });
  _sapIllusDialogBeforeSearch = _interopRequireDefault(_sapIllusDialogBeforeSearch);
  _sapIllusSceneBeforeSearch = _interopRequireDefault(_sapIllusSceneBeforeSearch);
  _sapIllusSpotBeforeSearch = _interopRequireDefault(_sapIllusSpotBeforeSearch);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "BeforeSearch";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_BEFORESEARCH;
  const subtitle = _i18nDefaults.IM_SUBTITLE_BEFORESEARCH;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogBeforeSearch.default,
    sceneSvg: _sapIllusSceneBeforeSearch.default,
    spotSvg: _sapIllusSpotBeforeSearch.default,
    title,
    subtitle,
    set,
    collection
  });
});