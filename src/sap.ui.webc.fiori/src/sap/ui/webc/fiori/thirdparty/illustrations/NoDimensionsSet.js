sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoDimensionsSet", "./sapIllus-Scene-NoDimensionsSet", "./sapIllus-Spot-NoDimensionsSet", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoDimensionsSet, _sapIllusSceneNoDimensionsSet, _sapIllusSpotNoDimensionsSet, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoDimensionsSet.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoDimensionsSet.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoDimensionsSet.default;
    }
  });
  _sapIllusDialogNoDimensionsSet = _interopRequireDefault(_sapIllusDialogNoDimensionsSet);
  _sapIllusSceneNoDimensionsSet = _interopRequireDefault(_sapIllusSceneNoDimensionsSet);
  _sapIllusSpotNoDimensionsSet = _interopRequireDefault(_sapIllusSpotNoDimensionsSet);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoDimensionsSet";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NODIMENSIONSSET;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NODIMENSIONSSET;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoDimensionsSet.default,
    sceneSvg: _sapIllusSceneNoDimensionsSet.default,
    spotSvg: _sapIllusSpotNoDimensionsSet.default,
    title,
    subtitle,
    set,
    collection
  });
});