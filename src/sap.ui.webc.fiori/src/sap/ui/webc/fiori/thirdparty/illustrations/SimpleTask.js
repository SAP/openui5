sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SimpleTask", "./sapIllus-Scene-SimpleTask", "./sapIllus-Spot-SimpleTask", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSimpleTask, _sapIllusSceneSimpleTask, _sapIllusSpotSimpleTask, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSimpleTask.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSimpleTask.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSimpleTask.default;
    }
  });
  _sapIllusDialogSimpleTask = _interopRequireDefault(_sapIllusDialogSimpleTask);
  _sapIllusSceneSimpleTask = _interopRequireDefault(_sapIllusSceneSimpleTask);
  _sapIllusSpotSimpleTask = _interopRequireDefault(_sapIllusSpotSimpleTask);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SimpleTask";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NOTASKS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NOTASKS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSimpleTask.default,
    sceneSvg: _sapIllusSceneSimpleTask.default,
    spotSvg: _sapIllusSpotSimpleTask.default,
    title,
    subtitle,
    set,
    collection
  });
});