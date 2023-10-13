sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleMagnifier", "./sapIllus-Scene-SimpleMagnifier", "./sapIllus-Spot-SimpleMagnifier", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleMagnifier, _sapIllusSceneSimpleMagnifier, _sapIllusSpotSimpleMagnifier, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleMagnifier.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleMagnifier.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleMagnifier.default;
    }
  });
  _sapIllusDialogSimpleMagnifier = _interopRequireDefault(_sapIllusDialogSimpleMagnifier);
  _sapIllusSceneSimpleMagnifier = _interopRequireDefault(_sapIllusSceneSimpleMagnifier);
  _sapIllusSpotSimpleMagnifier = _interopRequireDefault(_sapIllusSpotSimpleMagnifier);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleMagnifier";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_BEFORESEARCH;
  const subtitle = _i18nDefaults.IM_SUBTITLE_BEFORESEARCH;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleMagnifier.default,
    sceneSvg: _sapIllusSceneSimpleMagnifier.default,
    spotSvg: _sapIllusSpotSimpleMagnifier.default,
    title,
    subtitle,
    set,
    collection
  });
});