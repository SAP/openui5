sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-Tent", "./sapIllus-Scene-Tent", "./sapIllus-Spot-Tent", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogTent, _sapIllusSceneTent, _sapIllusSpotTent, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogTent.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneTent.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotTent.default;
    }
  });
  _sapIllusDialogTent = _interopRequireDefault(_sapIllusDialogTent);
  _sapIllusSceneTent = _interopRequireDefault(_sapIllusSceneTent);
  _sapIllusSpotTent = _interopRequireDefault(_sapIllusSpotTent);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Tent";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NODATA;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NODATA;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogTent.default,
    sceneSvg: _sapIllusSceneTent.default,
    spotSvg: _sapIllusSpotTent.default,
    title,
    subtitle,
    set,
    collection
  });
});