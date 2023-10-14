sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-UnableToLoad", "./sapIllus-Scene-UnableToLoad", "./sapIllus-Spot-UnableToLoad", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogUnableToLoad, _sapIllusSceneUnableToLoad, _sapIllusSpotUnableToLoad, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogUnableToLoad.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneUnableToLoad.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotUnableToLoad.default;
    }
  });
  _sapIllusDialogUnableToLoad = _interopRequireDefault(_sapIllusDialogUnableToLoad);
  _sapIllusSceneUnableToLoad = _interopRequireDefault(_sapIllusSceneUnableToLoad);
  _sapIllusSpotUnableToLoad = _interopRequireDefault(_sapIllusSpotUnableToLoad);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "UnableToLoad";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_UNABLETOLOAD;
  const subtitle = _i18nDefaults.IM_SUBTITLE_UNABLETOLOAD;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogUnableToLoad.default,
    sceneSvg: _sapIllusSceneUnableToLoad.default,
    spotSvg: _sapIllusSpotUnableToLoad.default,
    title,
    subtitle,
    set,
    collection
  });
});