sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-PageNotFound", "./sapIllus-Scene-PageNotFound", "./sapIllus-Spot-PageNotFound", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogPageNotFound, _sapIllusScenePageNotFound, _sapIllusSpotPageNotFound, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogPageNotFound.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusScenePageNotFound.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotPageNotFound.default;
    }
  });
  _sapIllusDialogPageNotFound = _interopRequireDefault(_sapIllusDialogPageNotFound);
  _sapIllusScenePageNotFound = _interopRequireDefault(_sapIllusScenePageNotFound);
  _sapIllusSpotPageNotFound = _interopRequireDefault(_sapIllusSpotPageNotFound);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "PageNotFound";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_PAGENOTFOUND;
  const subtitle = _i18nDefaults.IM_SUBTITLE_PAGENOTFOUND;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogPageNotFound.default,
    sceneSvg: _sapIllusScenePageNotFound.default,
    spotSvg: _sapIllusSpotPageNotFound.default,
    title,
    subtitle,
    set,
    collection
  });
});