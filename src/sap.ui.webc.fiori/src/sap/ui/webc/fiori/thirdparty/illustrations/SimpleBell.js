sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleBell", "./sapIllus-Scene-SimpleBell", "./sapIllus-Spot-SimpleBell", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleBell, _sapIllusSceneSimpleBell, _sapIllusSpotSimpleBell, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleBell.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleBell.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleBell.default;
    }
  });
  _sapIllusDialogSimpleBell = _interopRequireDefault(_sapIllusDialogSimpleBell);
  _sapIllusSceneSimpleBell = _interopRequireDefault(_sapIllusSceneSimpleBell);
  _sapIllusSpotSimpleBell = _interopRequireDefault(_sapIllusSpotSimpleBell);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleBell";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NONOTIFICATIONS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NONOTIFICATIONS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleBell.default,
    sceneSvg: _sapIllusSceneSimpleBell.default,
    spotSvg: _sapIllusSpotSimpleBell.default,
    title,
    subtitle,
    set,
    collection
  });
});