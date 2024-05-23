/*!
* ${copyright}
*/
sap.ui.define([
	"sap/base/config/GlobalConfigurationProvider",
	"sap/base/config/MemoryConfigurationProvider"
], (
	GlobalConfigurationProvider,
	MemoryConfigurationProvider
) => {
	"use strict";

	let bFrozen = false;
	const rValidKey = /^[a-z][A-Za-z0-9]*$/;
	const rXXAlias = /^(sapUi(?!Xx))(.*)$/;
	let mCache = Object.create(null);
	const aProvider = [];
	const mUrlParamOptions = {
		name: "sapUiIgnoreUrlParams",
		type: "boolean"
	};
	const mInternalDefaultValues = {
		"boolean": false,
		"code": undefined,
		"integer": 0,
		"string": "",
		"string[]": [],
		"function[]": [],
		"function": undefined,
		"object": {},
		"mergedObject": {}
	};

	/**
	 * Enum for available types of configuration entries.
	 *
	 * @enum {string}
	 * @alias module:sap/base/config.Type
	 * @private
	 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
	 */
	const TypeEnum = {
		/**
		 * defaultValue: false
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"Boolean": "boolean",
		/**
		 * defaultValue: 0
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"Integer": "integer",
		/**
		 * defaultValue: ""
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"String": "string",
		/**
		 * defaultValue: []
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"StringArray": "string[]",
		/**
		 * defaultValue: []
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"FunctionArray": "function[]",
		/**
		 * defaultValue: undefined
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"Function": "function",
		/**
		 * defaultValue: {}
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"Object":  "object",
		/**
		 * defaultValue: {}
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		"MergedObject":  "mergedObject"
	};

	// TODO fix
	var bGlobalIgnoreExternal = get(mUrlParamOptions);

	function deepClone(src) {
		if (src == null) {
			return src;
		} else if (Array.isArray(src)) {
			return cloneArray(src);
		} else if (typeof src === "object") {
			return cloneObject(src);
		} else {
			return src;
		}
	}

	function cloneArray(src) {
		var aClone = [];
		for (var i = 0; i < src.length; i++) {
			aClone.push(deepClone(src[i]));
		}

		return aClone;
	}

	function cloneObject(src) {
		var oClone = {};

		for (var key in src) {
			if (key === "__proto__") {
				continue;
			}
			oClone[key] = deepClone(src[key]);
		}

		return oClone;
	}

	function registerProvider(oProvider) {
		if (bFrozen) {
			throw new Error("Registering a configuration provider after configuration is frozen is not allowed!");
		}
		if (aProvider.indexOf(oProvider) === -1) {
			aProvider.push(oProvider);
			invalidate();
			bGlobalIgnoreExternal = get(mUrlParamOptions);
			oProvider.setConfiguration?.(Configuration);
		}
	}

	/**
	 * Converts a given value to the given type.
	 *
	 * @name module:sap/base/config.convertToType
	 * @function
	 * @param {any} vValue The value to be converted
	 * @param {string} vType The resulting type
	 * @param {string} [sName] The property name of the enumeration to check
	 * @returns {any} The converted value
	 * @throws {TypeError} Throws an TypeError if the given value could not be converted to the requested type
	 *
	 * @private
	 */
	function convertToType(vValue, vType, sName) {
		if (vValue === undefined || vValue === null) {
			return vValue;
		}

		if (typeof vType === "string") {
			switch (vType) {
				case TypeEnum.Boolean:
					if (typeof vValue === "string") {
						return vValue.toLowerCase() === "true" || vValue.toLowerCase() === "x";
					} else {
						vValue = !!vValue;
					}
					break;
				case TypeEnum.Integer:
					if (typeof vValue === "string") {
						vValue = parseInt(vValue);
					}
					if (typeof vValue !== 'number' && isNaN(vValue)) {
						throw new TypeError("unsupported value");
					}
					break;
				case TypeEnum.String:
					vValue = '' + vValue; // enforce string
					break;
				case TypeEnum.StringArray:
					if (Array.isArray(vValue)) {
						return vValue;
					} else if (typeof vValue === "string") {
						// enforce array
						vValue = vValue ? vValue.split(/[,;]/).map(function(s) {
							return s.trim();
						}) : [];
						return vValue;
					} else {
						throw new TypeError("unsupported value");
					}
				case TypeEnum.FunctionArray:
					vValue.forEach(function(fnFunction) {
						if ( typeof fnFunction !== "function" ) {
							throw new TypeError("Not a function: " + fnFunction);
						}
					});
					break;
				case TypeEnum.Function:
					if (typeof vValue !== "function") {
						throw new TypeError("unsupported value");
					}
					break;
				case TypeEnum.Object:
				case TypeEnum.MergedObject:
					if (typeof vValue === "string") {
						vValue = JSON.parse(vValue);
					}
					if (typeof vValue !== "object") {
						throw new TypeError("unsupported value");
					}
					break;
				default:
					throw new TypeError("unsupported type");
			}
		} else if (typeof vType === "object" && !Array.isArray(vType)) {
			vValue = checkEnum(vType, vValue, sName);
		} else if (typeof vType === "function") {
			vValue = vType(vValue);
		} else {
			throw new TypeError("unsupported type");
		}

		return vValue;
	}

	/**
	 * Checks if a value exists within an enumerable list.
	 *
	 * @name module:sap/base/config._.checkEnum
	 * @function
	 * @param {object} oEnum Enumeration object with values for validation
	 * @param {string} sValue Value to check against enumerable list
	 * @param {string} sPropertyName Name of the property which is checked
	 * @returns {string} Value passed to the function for check
	 * @throws {TypeError} If the value could not be found, an TypeError is thrown
	 *
	 * @private
	 */
	function checkEnum(oEnum, sValue, sPropertyName) {
		var aValidValues = [];
		for (var sKey in oEnum) {
			if (oEnum.hasOwnProperty(sKey)) {
				if (oEnum[sKey] === sValue) {
					return sValue;
				}
				aValidValues.push(oEnum[sKey]);
			}
		}
		throw new TypeError("Unsupported Enumeration value for " + sPropertyName + ", valid values are: " + aValidValues.join(", "));
	}

	function get(mOptions) {
		if (typeof mOptions.name !== "string" || !rValidKey.test(mOptions.name)) {
			throw new TypeError(
				"Invalid configuration key '" + mOptions.name + "'!"
			);
		}
		var sCacheKey = mOptions.name;
		if (mOptions.provider) {
			sCacheKey += "-" + mOptions.provider.getId();
		}
		if (!(sCacheKey in mCache)) {
			mOptions = Object.assign({}, mOptions);
			var vValue;

			var bIgnoreExternal = bGlobalIgnoreExternal || !mOptions.external;
			var sName = mOptions.name;
			var vMatch = sName.match(rXXAlias);
			var vDefaultValue = mOptions.hasOwnProperty("defaultValue") ? mOptions.defaultValue : mInternalDefaultValues[mOptions.type];

			const aAllProvider = [...aProvider, ...(mOptions.provider ? [mOptions.provider] : [])];

			for (var i = aAllProvider.length - 1; i >= 0; i--) {
				if (!aAllProvider[i].external || !bIgnoreExternal) {
					const vProviderValue = convertToType(aAllProvider[i].get(sName, mOptions.freeze), mOptions.type, mOptions.name);
					if (vProviderValue !== undefined) {
						if (mOptions.type === TypeEnum.MergedObject) {
							vValue = Object.assign({}, vProviderValue, vValue);
						} else {
							vValue = vProviderValue;
							break;
						}
					}
				}
			}
			if (vValue === undefined && (vMatch && vMatch[1] === "sapUi")) {
				mOptions.name = vMatch[1] + "Xx" + vMatch[2];
				vValue = get(mOptions);
			}
			if (vValue === undefined) {
				if (typeof vDefaultValue === 'function') {
					vDefaultValue = vDefaultValue();
				}
				vValue = vDefaultValue;
			}
			mCache[sCacheKey] = vValue;
		}
		var vCachedValue = mCache[sCacheKey];
		if (typeof mOptions.type !== 'function' && (mOptions.type === TypeEnum.StringArray || mOptions.type === TypeEnum.Object || mOptions.type === TypeEnum.MergedObject)) {
			vCachedValue = deepClone(vCachedValue);
		}
		return vCachedValue;
	}

	function invalidate() {
		mCache = Object.create(null);
	}

	function getWritableInstance() {
		const oProvider = new MemoryConfigurationProvider();

		return {
			set(sName, vValue) {
				const rValidKey = /^[a-z][A-Za-z0-9]*$/;
				if (rValidKey.test(sName)) {
					oProvider.set(sName, vValue);
					Configuration._.invalidate();
				} else {
					throw new TypeError(
						"Invalid configuration key '" + sName + "'!"
					);
				}
			},
			get(mOptions) {
				mOptions.provider = oProvider;
				return Configuration.get(mOptions);
			},
			Type: Configuration.Type
		};
	}

	function freeze() {
		for (const provider of aProvider) {
			provider.freeze?.();
		}
		delete Configuration._.freeze;
		bFrozen = true;
	}

	/**
	 * The base Configuration.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
	 * @alias module:sap/base/config
	 * @namespace
	 */
	var Configuration = {
		/**
		 * Generic getter for configuration options that are not explicitly exposed via a dedicated own getter.
		 *
		 * @name module:sap/base/config.get
		 * @function
		 * @param {object} mOptions The options object that contains the following properties
		 * @param {string} mOptions.name Name of the configuration parameter. Must start with 'sapUi/sapUiXx' prefix followed by letters only. The name must be camel-case
		 * @param {module:sap/base/config.Type|object<string, string>|function} mOptions.type Type of the configuration parameter. This argument can be a <code>module:sap/base/config.Type</code>, object or function.
		 * @param {any} [mOptions.defaultValue=undefined] Default value of the configuration parameter corresponding to the given type or a function returning the default value.
		 * @param {boolean} [mOptions.external=false] Whether external (e.g. url-) parameters should be included or not
		 * @param {boolean} [mOptions.freeze=false] Freezes parameter and parameter can't be changed afterwards.
		 * @returns {any} Value of the configuration parameter
		 * @throws {TypeError} Throws an error if the given parameter name does not match the definition.
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl, sap.ui.intergration, sap.ui.export
		 */
		get: get,

		/**
		 * Returns a writable base configuration instance
		 * @returns {module:sap/base/config} The writable base configuration
		 * @private
		 * @ui5-restricted sap.ui.core, sap.fl
		 */
		getWritableInstance: getWritableInstance,

		/** Register a new Configuration provider
		 *
		 * @name module:sap/base/config.registerProvider
		 * @function
		 * @param {object} oProvider The provider instance
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		registerProvider: registerProvider,
		Type: TypeEnum,
		_: {
			freeze: freeze,
			checkEnum: checkEnum,
			invalidate: invalidate
		}
	};

	Configuration.registerProvider(GlobalConfigurationProvider);

	return Configuration;
});