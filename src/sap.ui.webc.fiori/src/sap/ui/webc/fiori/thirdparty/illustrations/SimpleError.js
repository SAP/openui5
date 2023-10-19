sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleError", "./sapIllus-Scene-SimpleError", "./sapIllus-Spot-SimpleError", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleError, _sapIllusSceneSimpleError, _sapIllusSpotSimpleError, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleError.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleError.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleError.default;
    }
  });
  _sapIllusDialogSimpleError = _interopRequireDefault(_sapIllusDialogSimpleError);
  _sapIllusSceneSimpleError = _interopRequireDefault(_sapIllusSceneSimpleError);
  _sapIllusSpotSimpleError = _interopRequireDefault(_sapIllusSpotSimpleError);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleError";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOUPLOAD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOUPLOAD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleError.default,
    sceneSvg: _sapIllusSceneSimpleError.default,
    spotSvg: _sapIllusSpotSimpleError.default,
    title,
    subtitle,
    set,
    collection
  });
});