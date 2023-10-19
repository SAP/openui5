sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-AddDimensions", "./sapIllus-Scene-AddDimensions", "./sapIllus-Spot-AddDimensions", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogAddDimensions, _sapIllusSceneAddDimensions, _sapIllusSpotAddDimensions, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogAddDimensions.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneAddDimensions.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotAddDimensions.default;
    }
  });
  _sapIllusDialogAddDimensions = _interopRequireDefault(_sapIllusDialogAddDimensions);
  _sapIllusSceneAddDimensions = _interopRequireDefault(_sapIllusSceneAddDimensions);
  _sapIllusSpotAddDimensions = _interopRequireDefault(_sapIllusSpotAddDimensions);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "AddDimensions";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_ADDDIMENSIONS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_ADDDIMENSIONS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogAddDimensions.default,
    sceneSvg: _sapIllusSceneAddDimensions.default,
    spotSvg: _sapIllusSpotAddDimensions.default,
    title,
    subtitle,
    set,
    collection
  });
});