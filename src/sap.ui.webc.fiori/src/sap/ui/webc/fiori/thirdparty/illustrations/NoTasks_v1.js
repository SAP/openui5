sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoTasks_v1", "./sapIllus-Scene-NoTasks_v1", "./sapIllus-Spot-NoTasks_v1", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoTasks_v, _sapIllusSceneNoTasks_v, _sapIllusSpotNoTasks_v, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoTasks_v.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoTasks_v.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoTasks_v.default;
    }
  });
  _sapIllusDialogNoTasks_v = _interopRequireDefault(_sapIllusDialogNoTasks_v);
  _sapIllusSceneNoTasks_v = _interopRequireDefault(_sapIllusSceneNoTasks_v);
  _sapIllusSpotNoTasks_v = _interopRequireDefault(_sapIllusSpotNoTasks_v);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoTasks_v1";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOTASKS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOTASKS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoTasks_v.default,
    sceneSvg: _sapIllusSceneNoTasks_v.default,
    spotSvg: _sapIllusSpotNoTasks_v.default,
    title,
    subtitle,
    set,
    collection
  });
});