sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-Company", "./tnt-Scene-Company", "./tnt-Spot-Company"], function (_exports, _Illustrations, _tntDialogCompany, _tntSceneCompany, _tntSpotCompany) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogCompany.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneCompany.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotCompany.default;
    }
  });
  _tntDialogCompany = _interopRequireDefault(_tntDialogCompany);
  _tntSceneCompany = _interopRequireDefault(_tntSceneCompany);
  _tntSpotCompany = _interopRequireDefault(_tntSpotCompany);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "Company";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogCompany.default,
    sceneSvg: _tntSceneCompany.default,
    spotSvg: _tntSpotCompany.default,
    set,
    collection
  });
});