sap.ui.define(["exports", "./ManagedStyles", "./FeaturesRegistry", "./generated/css/FontFace.css", "./generated/css/OverrideFontFace.css"], function (_exports, _ManagedStyles, _FeaturesRegistry, _FontFace, _OverrideFontFace) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _FontFace = _interopRequireDefault(_FontFace);
  _OverrideFontFace = _interopRequireDefault(_OverrideFontFace);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const insertFontFace = () => {
    const openUI5Support = (0, _FeaturesRegistry.getFeature)("OpenUI5Support");
    // Only set the main font if there is no OpenUI5 support, or there is, but OpenUI5 is not loaded
    if (!openUI5Support || !openUI5Support.isOpenUI5Detected()) {
      insertMainFontFace();
    }
    // Always set the override font - OpenUI5 in CSS Vars mode does not set it, unlike the main font
    insertOverrideFontFace();
  };
  const insertMainFontFace = () => {
    if (!(0, _ManagedStyles.hasStyle)("data-ui5-font-face")) {
      (0, _ManagedStyles.createStyle)(_FontFace.default, "data-ui5-font-face");
    }
  };
  const insertOverrideFontFace = () => {
    if (!(0, _ManagedStyles.hasStyle)("data-ui5-font-face-override")) {
      (0, _ManagedStyles.createStyle)(_OverrideFontFace.default, "data-ui5-font-face-override");
    }
  };
  var _default = insertFontFace;
  _exports.default = _default;
});