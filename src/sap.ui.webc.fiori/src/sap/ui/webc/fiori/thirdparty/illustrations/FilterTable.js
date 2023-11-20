sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-FilterTable", "./sapIllus-Scene-FilterTable", "./sapIllus-Spot-FilterTable", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogFilterTable, _sapIllusSceneFilterTable, _sapIllusSpotFilterTable, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogFilterTable.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneFilterTable.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotFilterTable.default;
    }
  });
  _sapIllusDialogFilterTable = _interopRequireDefault(_sapIllusDialogFilterTable);
  _sapIllusSceneFilterTable = _interopRequireDefault(_sapIllusSceneFilterTable);
  _sapIllusSpotFilterTable = _interopRequireDefault(_sapIllusSpotFilterTable);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "FilterTable";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_FILTERTABLE;
  const subtitle = _i18nDefaults.IM_SUBTITLE_FILTERTABLE;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogFilterTable.default,
    sceneSvg: _sapIllusSceneFilterTable.default,
    spotSvg: _sapIllusSpotFilterTable.default,
    title,
    subtitle,
    set,
    collection
  });
});