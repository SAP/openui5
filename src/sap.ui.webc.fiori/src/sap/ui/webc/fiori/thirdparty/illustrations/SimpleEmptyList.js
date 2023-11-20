sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleEmptyList", "./sapIllus-Scene-SimpleEmptyList", "./sapIllus-Spot-SimpleEmptyList", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleEmptyList, _sapIllusSceneSimpleEmptyList, _sapIllusSpotSimpleEmptyList, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleEmptyList.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleEmptyList.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleEmptyList.default;
    }
  });
  _sapIllusDialogSimpleEmptyList = _interopRequireDefault(_sapIllusDialogSimpleEmptyList);
  _sapIllusSceneSimpleEmptyList = _interopRequireDefault(_sapIllusSceneSimpleEmptyList);
  _sapIllusSpotSimpleEmptyList = _interopRequireDefault(_sapIllusSpotSimpleEmptyList);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleEmptyList";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOENTRIES;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOENTRIES;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleEmptyList.default,
    sceneSvg: _sapIllusSceneSimpleEmptyList.default,
    spotSvg: _sapIllusSpotSimpleEmptyList.default,
    title,
    subtitle,
    set,
    collection
  });
});