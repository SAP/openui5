sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-ResizeColumn", "./sapIllus-Scene-ResizeColumn", "./sapIllus-Spot-ResizeColumn", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogResizeColumn, _sapIllusSceneResizeColumn, _sapIllusSpotResizeColumn, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogResizeColumn.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneResizeColumn.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotResizeColumn.default;
    }
  });
  _sapIllusDialogResizeColumn = _interopRequireDefault(_sapIllusDialogResizeColumn);
  _sapIllusSceneResizeColumn = _interopRequireDefault(_sapIllusSceneResizeColumn);
  _sapIllusSpotResizeColumn = _interopRequireDefault(_sapIllusSpotResizeColumn);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "ResizeColumn";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_RESIZECOLUMN;
  const subtitle = _i18nDefaults.IM_SUBTITLE_RESIZECOLUMN;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogResizeColumn.default,
    sceneSvg: _sapIllusSceneResizeColumn.default,
    spotSvg: _sapIllusSpotResizeColumn.default,
    title,
    subtitle,
    set,
    collection
  });
});