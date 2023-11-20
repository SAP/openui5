sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoColumnsSet", "./sapIllus-Scene-NoColumnsSet", "./sapIllus-Spot-NoColumnsSet", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoColumnsSet, _sapIllusSceneNoColumnsSet, _sapIllusSpotNoColumnsSet, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoColumnsSet.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoColumnsSet.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoColumnsSet.default;
    }
  });
  _sapIllusDialogNoColumnsSet = _interopRequireDefault(_sapIllusDialogNoColumnsSet);
  _sapIllusSceneNoColumnsSet = _interopRequireDefault(_sapIllusSceneNoColumnsSet);
  _sapIllusSpotNoColumnsSet = _interopRequireDefault(_sapIllusSpotNoColumnsSet);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoColumnsSet";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOCOLUMNSSET;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOCOLUMNSSET;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoColumnsSet.default,
    sceneSvg: _sapIllusSceneNoColumnsSet.default,
    spotSvg: _sapIllusSpotNoColumnsSet.default,
    title,
    subtitle,
    set,
    collection
  });
});