sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoEntries", "./sapIllus-Scene-NoEntries", "./sapIllus-Spot-NoEntries", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoEntries, _sapIllusSceneNoEntries, _sapIllusSpotNoEntries, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoEntries.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoEntries.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoEntries.default;
    }
  });
  _sapIllusDialogNoEntries = _interopRequireDefault(_sapIllusDialogNoEntries);
  _sapIllusSceneNoEntries = _interopRequireDefault(_sapIllusSceneNoEntries);
  _sapIllusSpotNoEntries = _interopRequireDefault(_sapIllusSpotNoEntries);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoEntries";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOENTRIES;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOENTRIES;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoEntries.default,
    sceneSvg: _sapIllusSceneNoEntries.default,
    spotSvg: _sapIllusSpotNoEntries.default,
    title,
    subtitle,
    set,
    collection
  });
});