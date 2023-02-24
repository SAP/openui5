sap.ui.define(["exports", "../getSharedResource"], function (_exports, _getSharedResource) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerIllustration = _exports.getIllustrationDataSync = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const registry = (0, _getSharedResource.default)("SVGIllustration.registry", new Map());
  const ILLUSTRATION_NOT_FOUND = "ILLUSTRATION_NOT_FOUND";
  const registerIllustration = (name, {
    dialogSvg,
    sceneSvg,
    spotSvg,
    set,
    title,
    subtitle
  } = {}) => {
    // eslint-disable-line
    registry.set(`${set}/${name}`, {
      dialogSvg,
      sceneSvg,
      spotSvg,
      title,
      subtitle
    });
  };
  _exports.registerIllustration = registerIllustration;
  const getIllustrationDataSync = nameProp => {
    let set = "fiori";
    if (nameProp.startsWith("Tnt")) {
      set = "tnt";
      nameProp = nameProp.replace(/^Tnt/, "");
    }
    return registry.get(`${set}/${nameProp}`) || ILLUSTRATION_NOT_FOUND;
  };
  _exports.getIllustrationDataSync = getIllustrationDataSync;
});