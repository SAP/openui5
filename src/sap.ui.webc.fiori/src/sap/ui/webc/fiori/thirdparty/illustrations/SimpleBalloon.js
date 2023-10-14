sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleBalloon", "./sapIllus-Scene-SimpleBalloon", "./sapIllus-Spot-SimpleBalloon", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleBalloon, _sapIllusSceneSimpleBalloon, _sapIllusSpotSimpleBalloon, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleBalloon.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleBalloon.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleBalloon.default;
    }
  });
  _sapIllusDialogSimpleBalloon = _interopRequireDefault(_sapIllusDialogSimpleBalloon);
  _sapIllusSceneSimpleBalloon = _interopRequireDefault(_sapIllusSceneSimpleBalloon);
  _sapIllusSpotSimpleBalloon = _interopRequireDefault(_sapIllusSpotSimpleBalloon);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleBalloon";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_BALLOONSKY;
  const subtitle = _i18nDefaults.IM_SUBTITLE_BALLOONSKY;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleBalloon.default,
    sceneSvg: _sapIllusSceneSimpleBalloon.default,
    spotSvg: _sapIllusSpotSimpleBalloon.default,
    title,
    subtitle,
    set,
    collection
  });
});