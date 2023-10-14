sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-AddColumn", "./sapIllus-Scene-AddColumn", "./sapIllus-Spot-AddColumn", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogAddColumn, _sapIllusSceneAddColumn, _sapIllusSpotAddColumn, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogAddColumn.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneAddColumn.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotAddColumn.default;
    }
  });
  _sapIllusDialogAddColumn = _interopRequireDefault(_sapIllusDialogAddColumn);
  _sapIllusSceneAddColumn = _interopRequireDefault(_sapIllusSceneAddColumn);
  _sapIllusSpotAddColumn = _interopRequireDefault(_sapIllusSpotAddColumn);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "AddColumn";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_ADDCOLUMN;
  const subtitle = _i18nDefaults.IM_SUBTITLE_ADDCOLUMN;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogAddColumn.default,
    sceneSvg: _sapIllusSceneAddColumn.default,
    spotSvg: _sapIllusSpotAddColumn.default,
    title,
    subtitle,
    set,
    collection
  });
});