sap.ui.define(["exports", "../getSharedResource"], function (_exports, _getSharedResource) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerIllustrationLoader = _exports.registerIllustration = _exports.getIllustrationDataSync = _exports.getIllustrationData = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const loaders = new Map();
  const registry = (0, _getSharedResource.default)("SVGIllustration.registry", new Map());
  const illustrationPromises = (0, _getSharedResource.default)("SVGIllustration.promises", new Map());
  const registerIllustration = (name, data) => {
    registry.set(`${data.set}/${name}`, {
      dialogSvg: data.dialogSvg,
      sceneSvg: data.sceneSvg,
      spotSvg: data.spotSvg,
      title: data.title,
      subtitle: data.subtitle
    });
  };
  _exports.registerIllustration = registerIllustration;
  const registerIllustrationLoader = (illustrationName, loader) => {
    loaders.set(illustrationName, loader);
  };
  _exports.registerIllustrationLoader = registerIllustrationLoader;
  const _loadIllustrationOnce = async illustrationName => {
    if (!illustrationPromises.has(illustrationName)) {
      if (!loaders.has(illustrationName)) {
        const illustrationPath = illustrationName.startsWith("Tnt") ? `tnt/${illustrationName.replace(/^Tnt/, "")}` : illustrationName;
        throw new Error(`No loader registered for the ${illustrationName} illustration. Probably you forgot to import the "@ui5/webcomponents-fiori/dist/illustrations/${illustrationPath}.js" module. Or you can import the "@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations.js" module that will make all illustrations available, but fetch only the ones used.`);
      }
      const loadIllustrations = loaders.get(illustrationName);
      illustrationPromises.set(illustrationName, loadIllustrations(illustrationName));
    }
    return illustrationPromises.get(illustrationName);
  };
  const getIllustrationDataSync = illustrationName => {
    let set = "fiori";
    if (illustrationName.startsWith("Tnt")) {
      set = "tnt";
      illustrationName = illustrationName.replace(/^Tnt/, "");
    }
    return registry.get(`${set}/${illustrationName}`);
  };
  _exports.getIllustrationDataSync = getIllustrationDataSync;
  const getIllustrationData = async illustrationName => {
    let set = "fiori";
    await _loadIllustrationOnce(illustrationName);
    if (illustrationName.startsWith("Tnt")) {
      set = "tnt";
      illustrationName = illustrationName.replace(/^Tnt/, "");
    }
    return registry.get(`${set}/${illustrationName}`);
  };
  _exports.getIllustrationData = getIllustrationData;
});