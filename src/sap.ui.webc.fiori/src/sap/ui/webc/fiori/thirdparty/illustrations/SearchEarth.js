sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SearchEarth", "./sapIllus-Scene-SearchEarth", "./sapIllus-Spot-SearchEarth", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSearchEarth, _sapIllusSceneSearchEarth, _sapIllusSpotSearchEarth, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSearchEarth.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSearchEarth.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSearchEarth.default;
    }
  });
  _sapIllusDialogSearchEarth = _interopRequireDefault(_sapIllusDialogSearchEarth);
  _sapIllusSceneSearchEarth = _interopRequireDefault(_sapIllusSceneSearchEarth);
  _sapIllusSpotSearchEarth = _interopRequireDefault(_sapIllusSpotSearchEarth);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SearchEarth";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_BEFORESEARCH;
  const subtitle = _i18nDefaults.IM_SUBTITLE_BEFORESEARCH;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSearchEarth.default,
    sceneSvg: _sapIllusSceneSearchEarth.default,
    spotSvg: _sapIllusSpotSearchEarth.default,
    title,
    subtitle,
    set,
    collection
  });
});