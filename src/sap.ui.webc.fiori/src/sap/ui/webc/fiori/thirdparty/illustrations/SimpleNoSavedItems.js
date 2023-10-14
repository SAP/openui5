sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleNoSavedItems", "./sapIllus-Scene-SimpleNoSavedItems", "./sapIllus-Spot-SimpleNoSavedItems", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleNoSavedItems, _sapIllusSceneSimpleNoSavedItems, _sapIllusSpotSimpleNoSavedItems, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleNoSavedItems.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleNoSavedItems.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleNoSavedItems.default;
    }
  });
  _sapIllusDialogSimpleNoSavedItems = _interopRequireDefault(_sapIllusDialogSimpleNoSavedItems);
  _sapIllusSceneSimpleNoSavedItems = _interopRequireDefault(_sapIllusSceneSimpleNoSavedItems);
  _sapIllusSpotSimpleNoSavedItems = _interopRequireDefault(_sapIllusSpotSimpleNoSavedItems);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleNoSavedItems";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOSAVEDITEMS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOSAVEDITEMS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleNoSavedItems.default,
    sceneSvg: _sapIllusSceneSimpleNoSavedItems.default,
    spotSvg: _sapIllusSpotSimpleNoSavedItems.default,
    title,
    subtitle,
    set,
    collection
  });
});