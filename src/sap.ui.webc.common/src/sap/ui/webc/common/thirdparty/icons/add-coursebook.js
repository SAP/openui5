sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/add-coursebook", "./v5/add-coursebook"], function (_exports, _Theme, _addCoursebook, _addCoursebook2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _addCoursebook.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _addCoursebook.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _addCoursebook.pathData : _addCoursebook2.pathData;
  _exports.pathData = pathData;
  var _default = "add-coursebook";
  _exports.default = _default;
});