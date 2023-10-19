sap.ui.define(["exports", "../getSharedResource", "../config/Theme"], function (_exports, _getSharedResource, _Theme) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerIllustrationLoader = _exports.registerIllustration = _exports.getIllustrationDataSync = _exports.getIllustrationData = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var IllustrationCollections;
  (function (IllustrationCollections) {
    IllustrationCollections["sap_horizon"] = "V5";
    IllustrationCollections["sap_horizon_dark"] = "V5";
    IllustrationCollections["sap_horizon_hcb"] = "V5/HC";
    IllustrationCollections["sap_horizon_hcw"] = "V5/HC";
  })(IllustrationCollections || (IllustrationCollections = {}));
  const FALLBACK_COLLECTION = "V4";
  const loaders = new Map();
  const registry = (0, _getSharedResource.default)("SVGIllustration.registry", new Map());
  const illustrationPromises = (0, _getSharedResource.default)("SVGIllustration.promises", new Map());
  const getCollection = () => {
    const theme = (0, _Theme.getTheme)();
    if (IllustrationCollections[theme]) {
      return IllustrationCollections[theme];
    }
    return FALLBACK_COLLECTION;
  };
  /**
   * Processes the name of the illustration
   * The name is used to generate the registry key and the loader key
   * The registry key is used to store and get the illustration data from the registry
   * The loader key is used to store and get the illustration loader from the loaders map
   * The function generates the correct registry key and loader key based on whether an loader exists for the illustration
   * If there is no loader registered for the collection, it falls back to the default collection
   */
  const processName = name => {
    let collection = getCollection();
    const isTnt = name.startsWith("Tnt");
    const set = isTnt ? "tnt" : "fiori";
    let registryKey = `${set}/${collection}/${name}`;
    let loaderKey = `${collection}/${name}`;
    if (!loaders.has(loaderKey) && collection !== FALLBACK_COLLECTION) {
      collection = FALLBACK_COLLECTION;
      loaderKey = `${collection}/${name}`;
      registryKey = `${set}/${collection}/${name}`;
    }
    if (isTnt) {
      name = name.replace(/^Tnt/, "");
      registryKey = `${set}/${collection}/${name}`;
    }
    return {
      registryKey,
      loaderKey,
      collection
    };
  };
  const registerIllustration = (name, data) => {
    const collection = data.collection || FALLBACK_COLLECTION;
    registry.set(`${data.set}/${collection}/${name}`, {
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
  const _loadIllustrationOnce = illustrationName => {
    const {
      loaderKey
    } = processName(illustrationName);
    if (!illustrationPromises.has(loaderKey)) {
      if (!loaders.has(loaderKey)) {
        const illustrationPath = illustrationName.startsWith("Tnt") ? `tnt/${illustrationName.replace(/^Tnt/, "")}` : illustrationName;
        throw new Error(`No loader registered for the ${illustrationName} illustration. Probably you forgot to import the "@ui5/webcomponents-fiori/dist/illustrations/${illustrationPath}.js" module. Or you can import the "@ui5/webcomponents-fiori/dist/illustrations/AllIllustrations.js" module that will make all illustrations available, but fetch only the ones used.`);
      }
      const loadIllustrations = loaders.get(loaderKey);
      illustrationPromises.set(loaderKey, loadIllustrations(loaderKey));
    }
    return illustrationPromises.get(loaderKey);
  };
  const getIllustrationDataSync = illustrationName => {
    const {
      registryKey
    } = processName(illustrationName);
    return registry.get(registryKey);
  };
  _exports.getIllustrationDataSync = getIllustrationDataSync;
  const getIllustrationData = async illustrationName => {
    const {
      registryKey
    } = processName(illustrationName);
    await _loadIllustrationOnce(illustrationName);
    return registry.get(registryKey);
  };
  _exports.getIllustrationData = getIllustrationData;
});