sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleEmptyDoc", "./sapIllus-Scene-SimpleEmptyDoc", "./sapIllus-Spot-SimpleEmptyDoc", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleEmptyDoc, _sapIllusSceneSimpleEmptyDoc, _sapIllusSpotSimpleEmptyDoc, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleEmptyDoc.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleEmptyDoc.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleEmptyDoc.default;
    }
  });
  _sapIllusDialogSimpleEmptyDoc = _interopRequireDefault(_sapIllusDialogSimpleEmptyDoc);
  _sapIllusSceneSimpleEmptyDoc = _interopRequireDefault(_sapIllusSceneSimpleEmptyDoc);
  _sapIllusSpotSimpleEmptyDoc = _interopRequireDefault(_sapIllusSpotSimpleEmptyDoc);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleEmptyDoc";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NODATA;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NODATA;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleEmptyDoc.default,
    sceneSvg: _sapIllusSceneSimpleEmptyDoc.default,
    spotSvg: _sapIllusSpotSimpleEmptyDoc.default,
    title,
    subtitle,
    set,
    collection
  });
});