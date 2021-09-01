sap.ui.define(['exports', '../getSharedResource'], function (exports, getSharedResource) { 'use strict';

	const loaders = new Map();
	const registry = getSharedResource("SVGIcons.registry", new Map());
	const iconCollectionPromises = getSharedResource("SVGIcons.promises", new Map());
	const ICON_NOT_FOUND = "ICON_NOT_FOUND";
	const DEFAULT_COLLECTION = "SAP-icons";
	const registerIconBundle = async (collectionName, bundleData) => {
		throw new Error("This method has been removed. Use `registerIconLoader` instead.");
	};
	const registerIconLoader = async (collectionName, loader) => {
		loaders.set(collectionName, loader);
	};
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
				pathData: iconData.path,
				ltr: iconData.ltr,
				accData: iconData.acc,
				collection: bundleData.collection,
				packageName: bundleData.packageName,
			 });
		});
	};
	const registerIcon = (name, { pathData, ltr, accData, collection, packageName } = {}) => {
		if (!collection) {
			collection = DEFAULT_COLLECTION;
		}
		const key = `${collection}/${name}`;
		registry.set(key, {
			pathData,
			ltr,
			accData,
			packageName,
		});
	};
	const _parseName = name => {
		if (name.startsWith("sap-icon://")) {
			name = name.replace("sap-icon://", "");
		}
		let collection;
		[name, collection] = name.split("/").reverse();
		collection = collection || DEFAULT_COLLECTION;
		if (collection === "SAP-icons-TNT") {
			collection = "tnt";
		}
		if (collection === "BusinessSuiteInAppSymbols") {
			collection = "business-suite";
			name = name.replace("icon-", "");
		}
		const registryKey = `${collection}/${name}`;
		return { name, collection, registryKey };
	};
	const getIconDataSync = nameProp => {
		const { registryKey } = _parseName(nameProp);
		return registry.get(registryKey);
	};
	const getIconData = async nameProp => {
		const { collection, registryKey } = _parseName(nameProp);
		let iconData = ICON_NOT_FOUND;
		try {
			iconData = await _loadIconCollectionOnce(collection);
		} catch (e) {
			console.error(e.message);
		}
		if (iconData === ICON_NOT_FOUND) {
			return iconData;
		}
		if (!registry.has(registryKey)) {
			_fillRegistry(iconData);
		}
		return registry.get(registryKey);
	};
	const _getRegisteredNames = async () => {
		await getIconData("edit");
		await getIconData("tnt/arrow");
		await getIconData("business-suite/3d");
		return Array.from(registry.keys());
	};

	exports._getRegisteredNames = _getRegisteredNames;
	exports.getIconData = getIconData;
	exports.getIconDataSync = getIconDataSync;
	exports.registerIcon = registerIcon;
	exports.registerIconBundle = registerIconBundle;
	exports.registerIconLoader = registerIconLoader;

	Object.defineProperty(exports, '__esModule', { value: true });

});
