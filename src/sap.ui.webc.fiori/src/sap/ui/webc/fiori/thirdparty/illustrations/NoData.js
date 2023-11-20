sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoData", "./sapIllus-Scene-NoData", "./sapIllus-Spot-NoData", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoData, _sapIllusSceneNoData, _sapIllusSpotNoData, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoData.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoData.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoData.default;
    }
  });
  _sapIllusDialogNoData = _interopRequireDefault(_sapIllusDialogNoData);
  _sapIllusSceneNoData = _interopRequireDefault(_sapIllusSceneNoData);
  _sapIllusSpotNoData = _interopRequireDefault(_sapIllusSpotNoData);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoData";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NODATA;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NODATA;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoData.default,
    sceneSvg: _sapIllusSceneNoData.default,
    spotSvg: _sapIllusSpotNoData.default,
    title,
    subtitle,
    set,
    collection
  });
});