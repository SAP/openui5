sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-SortColumn", "./sapIllus-Scene-SortColumn", "./sapIllus-Spot-SortColumn", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogSortColumn, _sapIllusSceneSortColumn, _sapIllusSpotSortColumn, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogSortColumn.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneSortColumn.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotSortColumn.default;
    }
  });
  _sapIllusDialogSortColumn = _interopRequireDefault(_sapIllusDialogSortColumn);
  _sapIllusSceneSortColumn = _interopRequireDefault(_sapIllusSceneSortColumn);
  _sapIllusSpotSortColumn = _interopRequireDefault(_sapIllusSpotSortColumn);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "SortColumn";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_SORTCOLUMN;
  const subtitle = _i18nDefaults.IM_SUBTITLE_SORTCOLUMN;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogSortColumn.default,
    sceneSvg: _sapIllusSceneSortColumn.default,
    spotSvg: _sapIllusSpotSortColumn.default,
    title,
    subtitle,
    set,
    collection
  });
});