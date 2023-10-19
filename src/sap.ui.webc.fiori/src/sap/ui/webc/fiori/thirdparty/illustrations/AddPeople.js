sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./sapIllus-Dialog-AddPeople", "./sapIllus-Scene-AddPeople", "./sapIllus-Spot-AddPeople", "../generated/i18n/i18n-defaults"], function (_exports, _Illustrations, _sapIllusDialogAddPeople, _sapIllusSceneAddPeople, _sapIllusSpotAddPeople, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusDialogAddPeople.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSceneAddPeople.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _sapIllusSpotAddPeople.default;
    }
  });
  _sapIllusDialogAddPeople = _interopRequireDefault(_sapIllusDialogAddPeople);
  _sapIllusSceneAddPeople = _interopRequireDefault(_sapIllusSceneAddPeople);
  _sapIllusSpotAddPeople = _interopRequireDefault(_sapIllusSpotAddPeople);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "AddPeople";
  const set = "fiori";
  const collection = "V4";
  const title = _i18nDefaults.IM_TITLE_ADDPEOPLE;
  const subtitle = _i18nDefaults.IM_SUBTITLE_ADDPEOPLE;
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _sapIllusDialogAddPeople.default,
    sceneSvg: _sapIllusSceneAddPeople.default,
    spotSvg: _sapIllusSpotAddPeople.default,
    title,
    subtitle,
    set,
    collection
  });
});