sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoSavedItems_v1", "./sapIllus-Scene-NoSavedItems_v1", "./sapIllus-Spot-NoSavedItems_v1", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoSavedItems_v, _sapIllusSceneNoSavedItems_v, _sapIllusSpotNoSavedItems_v, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoSavedItems_v.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoSavedItems_v.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoSavedItems_v.default;
    }
  });
  _sapIllusDialogNoSavedItems_v = _interopRequireDefault(_sapIllusDialogNoSavedItems_v);
  _sapIllusSceneNoSavedItems_v = _interopRequireDefault(_sapIllusSceneNoSavedItems_v);
  _sapIllusSpotNoSavedItems_v = _interopRequireDefault(_sapIllusSpotNoSavedItems_v);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoSavedItems_v1";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOSAVEDITEMS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOSAVEDITEMS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoSavedItems_v.default,
    sceneSvg: _sapIllusSceneNoSavedItems_v.default,
    spotSvg: _sapIllusSpotNoSavedItems_v.default,
    title,
    subtitle,
    set,
    collection
  });
});