sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoTasks", "./sapIllus-Scene-NoTasks", "./sapIllus-Spot-NoTasks", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoTasks, _sapIllusSceneNoTasks, _sapIllusSpotNoTasks, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoTasks.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoTasks.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoTasks.default;
    }
  });
  _sapIllusDialogNoTasks = _interopRequireDefault(_sapIllusDialogNoTasks);
  _sapIllusSceneNoTasks = _interopRequireDefault(_sapIllusSceneNoTasks);
  _sapIllusSpotNoTasks = _interopRequireDefault(_sapIllusSpotNoTasks);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoTasks";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOTASKS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOTASKS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoTasks.default,
    sceneSvg: _sapIllusSceneNoTasks.default,
    spotSvg: _sapIllusSpotNoTasks.default,
    title,
    subtitle,
    set,
    collection
  });
});