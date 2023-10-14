sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleNotFoundMagnifier", "./sapIllus-Scene-SimpleNotFoundMagnifier", "./sapIllus-Spot-SimpleNotFoundMagnifier", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleNotFoundMagnifier, _sapIllusSceneSimpleNotFoundMagnifier, _sapIllusSpotSimpleNotFoundMagnifier, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleNotFoundMagnifier.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleNotFoundMagnifier.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleNotFoundMagnifier.default;
    }
  });
  _sapIllusDialogSimpleNotFoundMagnifier = _interopRequireDefault(_sapIllusDialogSimpleNotFoundMagnifier);
  _sapIllusSceneSimpleNotFoundMagnifier = _interopRequireDefault(_sapIllusSceneSimpleNotFoundMagnifier);
  _sapIllusSpotSimpleNotFoundMagnifier = _interopRequireDefault(_sapIllusSpotSimpleNotFoundMagnifier);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleNotFoundMagnifier";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOSEARCHRESULTS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOSEARCHRESULTS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleNotFoundMagnifier.default,
    sceneSvg: _sapIllusSceneSimpleNotFoundMagnifier.default,
    spotSvg: _sapIllusSpotSimpleNotFoundMagnifier.default,
    title,
    subtitle,
    set,
    collection
  });
});