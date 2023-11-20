sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoSavedItems", "./sapIllus-Scene-NoSavedItems", "./sapIllus-Spot-NoSavedItems", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoSavedItems, _sapIllusSceneNoSavedItems, _sapIllusSpotNoSavedItems, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoSavedItems.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoSavedItems.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoSavedItems.default;
    }
  });
  _sapIllusDialogNoSavedItems = _interopRequireDefault(_sapIllusDialogNoSavedItems);
  _sapIllusSceneNoSavedItems = _interopRequireDefault(_sapIllusSceneNoSavedItems);
  _sapIllusSpotNoSavedItems = _interopRequireDefault(_sapIllusSpotNoSavedItems);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoSavedItems";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOSAVEDITEMS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOSAVEDITEMS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoSavedItems.default,
    sceneSvg: _sapIllusSceneNoSavedItems.default,
    spotSvg: _sapIllusSpotNoSavedItems.default,
    title,
    subtitle,
    set,
    collection
  });
});