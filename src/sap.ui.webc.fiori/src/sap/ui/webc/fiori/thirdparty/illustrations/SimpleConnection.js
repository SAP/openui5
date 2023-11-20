sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleConnection", "./sapIllus-Scene-SimpleConnection", "./sapIllus-Spot-SimpleConnection", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleConnection, _sapIllusSceneSimpleConnection, _sapIllusSpotSimpleConnection, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleConnection.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleConnection.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleConnection.default;
    }
  });
  _sapIllusDialogSimpleConnection = _interopRequireDefault(_sapIllusDialogSimpleConnection);
  _sapIllusSceneSimpleConnection = _interopRequireDefault(_sapIllusSceneSimpleConnection);
  _sapIllusSpotSimpleConnection = _interopRequireDefault(_sapIllusSpotSimpleConnection);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleConnection";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOLOAD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleConnection.default,
    sceneSvg: _sapIllusSceneSimpleConnection.default,
    spotSvg: _sapIllusSpotSimpleConnection.default,
    title,
    subtitle,
    set,
    collection
  });
});