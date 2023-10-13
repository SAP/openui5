sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-NoNotifications", "./sapIllus-Scene-NoNotifications", "./sapIllus-Spot-NoNotifications", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogNoNotifications, _sapIllusSceneNoNotifications, _sapIllusSpotNoNotifications, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogNoNotifications.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneNoNotifications.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotNoNotifications.default;
    }
  });
  _sapIllusDialogNoNotifications = _interopRequireDefault(_sapIllusDialogNoNotifications);
  _sapIllusSceneNoNotifications = _interopRequireDefault(_sapIllusSceneNoNotifications);
  _sapIllusSpotNoNotifications = _interopRequireDefault(_sapIllusSpotNoNotifications);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "NoNotifications";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_NONOTIFICATIONS;
  const subtitle = _i18nDefaults.IM_SUBTITLE_NONOTIFICATIONS;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogNoNotifications.default,
    sceneSvg: _sapIllusSceneNoNotifications.default,
    spotSvg: _sapIllusSpotNoNotifications.default,
    title,
    subtitle,
    set,
    collection
  });
});