sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/meeting-room", "./v5/meeting-room"], function (_exports, _Theme, _meetingRoom, _meetingRoom2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _meetingRoom.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _meetingRoom.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _meetingRoom.pathData : _meetingRoom2.pathData;
  _exports.pathData = pathData;
  var _default = "meeting-room";
  _exports.default = _default;
});