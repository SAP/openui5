sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SuccessCheckMark", "./sapIllus-Scene-SuccessCheckMark", "./sapIllus-Spot-SuccessCheckMark", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSuccessCheckMark, _sapIllusSceneSuccessCheckMark, _sapIllusSpotSuccessCheckMark, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSuccessCheckMark.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSuccessCheckMark.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSuccessCheckMark.default;
    }
  });
  _sapIllusDialogSuccessCheckMark = _interopRequireDefault(_sapIllusDialogSuccessCheckMark);
  _sapIllusSceneSuccessCheckMark = _interopRequireDefault(_sapIllusSceneSuccessCheckMark);
  _sapIllusSpotSuccessCheckMark = _interopRequireDefault(_sapIllusSpotSuccessCheckMark);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SuccessCheckMark";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_SUCCESSSCREEN;
  const subtitle = _i18nDefaults.IM_SUBTITLE_SUCCESSSCREEN;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSuccessCheckMark.default,
    sceneSvg: _sapIllusSceneSuccessCheckMark.default,
    spotSvg: _sapIllusSpotSuccessCheckMark.default,
    title,
    subtitle,
    set,
    collection
  });
});