sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-GroupTable", "./sapIllus-Scene-GroupTable", "./sapIllus-Spot-GroupTable", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogGroupTable, _sapIllusSceneGroupTable, _sapIllusSpotGroupTable, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogGroupTable.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneGroupTable.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotGroupTable.default;
    }
  });
  _sapIllusDialogGroupTable = _interopRequireDefault(_sapIllusDialogGroupTable);
  _sapIllusSceneGroupTable = _interopRequireDefault(_sapIllusSceneGroupTable);
  _sapIllusSpotGroupTable = _interopRequireDefault(_sapIllusSpotGroupTable);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "GroupTable";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_GROUPTABLE;
  const subtitle = _i18nDefaults.IM_SUBTITLE_GROUPTABLE;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogGroupTable.default,
    sceneSvg: _sapIllusSceneGroupTable.default,
    spotSvg: _sapIllusSpotGroupTable.default,
    title,
    subtitle,
    set,
    collection
  });
});