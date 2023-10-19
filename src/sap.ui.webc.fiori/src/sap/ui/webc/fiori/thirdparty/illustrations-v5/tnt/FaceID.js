sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations", "./tnt-Dialog-FaceID", "./tnt-Scene-FaceID", "./tnt-Spot-FaceID"], function (_exports, _Illustrations, _tntDialogFaceID, _tntSceneFaceID, _tntSpotFaceID) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "dialogSvg", {
    enumerable: true,
    get: function () {
      return _tntDialogFaceID.default;
    }
  });
  Object.defineProperty(_exports, "sceneSvg", {
    enumerable: true,
    get: function () {
      return _tntSceneFaceID.default;
    }
  });
  Object.defineProperty(_exports, "spotSvg", {
    enumerable: true,
    get: function () {
      return _tntSpotFaceID.default;
    }
  });
  _tntDialogFaceID = _interopRequireDefault(_tntDialogFaceID);
  _tntSceneFaceID = _interopRequireDefault(_tntSceneFaceID);
  _tntSpotFaceID = _interopRequireDefault(_tntSpotFaceID);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const name = "FaceID";
  const set = "tnt";
  const collection = "V5";
  (0, _Illustrations.registerIllustration)(name, {
    dialogSvg: _tntDialogFaceID.default,
    sceneSvg: _tntSceneFaceID.default,
    spotSvg: _tntSpotFaceID.default,
    set,
    collection
  });
});