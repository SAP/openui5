sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-EmptyList", "./sapIllus-Scene-EmptyList", "./sapIllus-Spot-EmptyList", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogEmptyList, _sapIllusSceneEmptyList, _sapIllusSpotEmptyList, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogEmptyList.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneEmptyList.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotEmptyList.default;
    }
  });
  _sapIllusDialogEmptyList = _interopRequireDefault(_sapIllusDialogEmptyList);
  _sapIllusSceneEmptyList = _interopRequireDefault(_sapIllusSceneEmptyList);
  _sapIllusSpotEmptyList = _interopRequireDefault(_sapIllusSpotEmptyList);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "EmptyList";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOENTRIES;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOENTRIES;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogEmptyList.default,
    sceneSvg: _sapIllusSceneEmptyList.default,
    spotSvg: _sapIllusSpotEmptyList.default,
    title,
    subtitle,
    set,
    collection
  });
});