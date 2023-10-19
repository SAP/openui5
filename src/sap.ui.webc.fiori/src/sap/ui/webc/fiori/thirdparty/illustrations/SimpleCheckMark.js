sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleCheckMark", "./sapIllus-Scene-SimpleCheckMark", "./sapIllus-Spot-SimpleCheckMark", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleCheckMark, _sapIllusSceneSimpleCheckMark, _sapIllusSpotSimpleCheckMark, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleCheckMark.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleCheckMark.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleCheckMark.default;
    }
  });
  _sapIllusDialogSimpleCheckMark = _interopRequireDefault(_sapIllusDialogSimpleCheckMark);
  _sapIllusSceneSimpleCheckMark = _interopRequireDefault(_sapIllusSceneSimpleCheckMark);
  _sapIllusSpotSimpleCheckMark = _interopRequireDefault(_sapIllusSpotSimpleCheckMark);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleCheckMark";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_SUCCESSSCREEN;
  const subtitle = _i18nDefaults.IM_SUBTITLE_SUCCESSSCREEN;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleCheckMark.default,
    sceneSvg: _sapIllusSceneSimpleCheckMark.default,
    spotSvg: _sapIllusSpotSimpleCheckMark.default,
    title,
    subtitle,
    set,
    collection
  });
});