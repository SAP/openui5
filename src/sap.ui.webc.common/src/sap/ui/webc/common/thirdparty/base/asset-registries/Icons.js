sap.ui.define(["exports", "../getSharedResource", "../assets-meta/IconCollectionsAlias", "../config/Icons", "../i18nBundle"], function (_exports, _getSharedResource, _IconCollectionsAlias, _Icons, _i18nBundle) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerIconLoader = _exports.registerIcon = _exports.getIconDataSync = _exports.getIconData = _exports.getIconAccessibleName = _exports._getRegisteredNames = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const loaders = new Map();
  const registry = (0, _getSharedResource.default)("SVGIcons.registry", new Map());
  const iconCollectionPromises = (0, _getSharedResource.default)("SVGIcons.promises", new Map());
  const ICON_NOT_FOUND = "ICON_NOT_FOUND";
  const registerIconLoader = (collectionName, loader) => {
    loaders.set(collectionName, loader);
  };
  _exports.registerIconLoader = registerIconLoader;
  const _loadIconCollectionOnce = async collectionName => {
    if (!iconCollectionPromises.has(collectionName)) {
      if (!loaders.has(collectionName)) {
        throw new Error(`No loader registered for the ${collectionName} icons collection. Probably you forgot to import the "AllIcons.js" module for the respective package.`);
      }
      const loadIcons = loaders.get(collectionName);
      iconCollectionPromises.set(collectionName, loadIcons(collectionName));
    }
    return iconCollectionPromises.get(collectionName);
  };
  const _fillRegistry = bundleData => {
    Object.keys(bundleData.data).forEach(iconName => {
      const iconData = bundleData.data[iconName];
      registerIcon(iconName, {
        pathData: iconData.path || iconData.paths,
        ltr: iconData.ltr,
        accData: iconData.acc,
        collection: bundleData.collection,
        packageName: bundleData.packageName
      });
    });
  };
  // set
  const registerIcon = (name, iconData) => {
    const key = `${iconData.collection}/${name}`;
    registry.set(key, {
      pathData: iconData.pathData,
      ltr: iconData.ltr,
      accData: iconData.accData,
      packageName: iconData.packageName,
      customTemplate: iconData.customTemplate,
      viewBox: iconData.viewBox,
      collection: iconData.collection
    });
  };
  /**
   * Processes the full icon name and splits it into - "name", "collection"
   * to form the proper registry key ("collection/name") under which the icon is registered:
   *
   * - removes legacy protocol ("sap-icon://")
   * - resolves aliases (f.e "SAP-icons-TNT/actor" => "tnt/actor")
   * - determines theme dependant icon collection (f.e "home" => "SAP-icons-v4/home" in Quartz | "SAP-icons-v5/home" in Horizon)
   *
   * @param { string } name
   * @return { object }
   */
  _exports.registerIcon = registerIcon;
  const processName = name => {
    // silently support ui5-compatible URIs
    if (name.startsWith("sap-icon://")) {
      name = name.replace("sap-icon://", "");
    }
    let collection;
    [name, collection] = name.split("/").reverse();
    name = name.replace("icon-", "");
    if (collection) {
      collection = (0, _IconCollectionsAlias.getIconCollectionByAlias)(collection);
    }
    collection = (0, _Icons.getEffectiveIconCollection)(collection);
    const registryKey = `${collection}/${name}`;
    return {
      name,
      collection,
      registryKey
    };
  };
  const getIconDataSync = name => {
    const {
      registryKey
    } = processName(name);
    return registry.get(registryKey);
  };
  _exports.getIconDataSync = getIconDataSync;
  const getIconData = async name => {
    const {
      collection,
      registryKey
    } = processName(name);
    let iconData = ICON_NOT_FOUND;
    try {
      iconData = await _loadIconCollectionOnce(collection);
    } catch (error) {
      const e = error;
      console.error(e.message); /* eslint-disable-line */
    }

    if (iconData === ICON_NOT_FOUND) {
      return iconData;
    }
    if (!registry.has(registryKey)) {
      // not filled by another await. many getters will await on the same loader, but fill only once
      _fillRegistry(iconData);
    }
    return registry.get(registryKey);
  };
  /**
   * Returns the accessible name for the given icon,
   * or undefined if accessible name is not present.
   *
   * @param { string } name
   * @return { Promise }
   */
  _exports.getIconData = getIconData;
  const getIconAccessibleName = async name => {
    if (!name) {
      return;
    }
    let iconData = getIconDataSync(name);
    if (!iconData) {
      iconData = await getIconData(name);
    }
    if (iconData && iconData !== ICON_NOT_FOUND && iconData.accData) {
      const i18nBundle = await (0, _i18nBundle.getI18nBundle)(iconData.packageName);
      return i18nBundle.getText(iconData.accData);
    }
  };
  // test page usage only
  _exports.getIconAccessibleName = getIconAccessibleName;
  const _getRegisteredNames = async () => {
    // fetch one icon of each collection to trigger the bundle load
    await getIconData("edit");
    await getIconData("tnt/arrow");
    await getIconData("business-suite/3d");
    return Array.from(registry.keys());
  };
  _exports._getRegisteredNames = _getRegisteredNames;
});