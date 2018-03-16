/*!
 * ${copyright}
 */

// Provides class sap.ui.base.DataType
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * Pseudo-Constructor for class <code>DataType</code>, never to be used.
	 *
	 * @class Represents the type of properties in a <code>ManagedObject</code> class.
	 *
	 * Each type provides some metadata like its {@link #getName qualified name} or its
	 * {@link #getBaseType base type} in case of a derived type. Array types provide information
	 * about the allowed {@link #getComponentType type of components} in an array, enumeration types
	 * inform about the set of their allowed {@link #getEnumValues keys and values}.
	 *
	 * Each type has a method to {@link #isValid check whether a value is valid} for a property
	 * of that type.
	 *
	 * Already defined types can be looked up by calling {@link #.getType DataType.getType}, new
	 * types can only be created by calling the factory method {@link #.createType DataType.createType},
	 * calling the constructor will throw an error.
	 *
	 * @author SAP SE
	 * @since 0.9.0
	 * @alias sap.ui.base.DataType
	 * @public
	 * @hideconstructor
	 * @throws {Error} Constructor must not be called, use {@link #.createType DataType.createType} instead
	 */
	var DataType = function() {
		// Avoid construction of a DataType.
		// DataType is only a function to support the "instanceof" operator.
		throw new Error();
	};

	/**
	 * The qualified name of the data type.
	 *
	 * @returns {string} Name of the data type
	 * @public
	 */
	DataType.prototype.getName = function() {
		return undefined;
	};

	/**
	 * The base type of this type or undefined if this is a primitive type.
	 * @returns {sap.ui.base.DataType|undefined} Base type or <code>undefined</code>
	 * @public
	 */
	DataType.prototype.getBaseType = function() {
		return undefined;
	};

	/**
	 * Returns the most basic (primitive) type that this type has been derived from.
	 *
	 * If the type is a primitive type by itself, <code>this</code> is returned.
	 *
	 * @returns {sap.ui.base.DataType} Primitive type of this type
	 * @public
	 */
	DataType.prototype.getPrimitiveType = function() {
		/*eslint-disable consistent-this*/
		var oType = this;
		/*eslint-enable consistent-this*/
		while (oType.getBaseType()) {
			oType = oType.getBaseType();
		}
		return oType;
	};

	/**
	 * Returns the component type of this type or <code>undefined</code> if this is not an array type.
	 *
	 * @returns {sap.ui.base.DataType|undefined} Component type or <code>undefined</code>
	 * @public
	 */
	DataType.prototype.getComponentType = function() {
		return undefined;
	};

	/**
	 * The default value for this type. Each type must define a default value.
	 * @returns {any} Default value of the data type. The type of the returned value
	 *    must match the JavaScript type of the data type (a string for string types etc.)
	 * @public
	 */
	DataType.prototype.getDefaultValue = function() {
		return undefined;
	};

	/**
	 * Whether this type is an array type.
	 * @returns {boolean} Whether this type is an array type
	 * @public
	 */
	DataType.prototype.isArrayType = function() {
		return false;
	};

	/**
	 * Whether this type is an enumeration type.
	 * @returns {boolean} Whether this type is an enum type
	 * @public
	 */
	DataType.prototype.isEnumType = function() {
		return false;
	};

	/**
	 * Returns the object with keys and values from which this enum type was created
	 * or <code>undefined</code> if this is not an enum type.
	 *
	 * @returns {object} Object with enum keys and values or <code>undefined</code>
	 * @public
	 */
	DataType.prototype.getEnumValues = function() {
		return undefined;
	};

	/**
	 * Parses the given string value and converts it into the specific data type.
	 * @param {string} sValue String representation for a value of this type
	 * @returns {any} Value in the correct internal format
	 * @public
	 */
	DataType.prototype.parseValue = function(sValue) {
		return sValue;
	};

	/**
	 * Checks whether the given value is valid for this type.
	 *
	 * To be implemented by concrete types.
	 * @param {any} vValue Value to be checked
	 * @returns {boolean} Whether the given value is valid for this data type (without conversion)
	 * @public
	 * @function
	 */
	DataType.prototype.isValid = undefined;
	// Note that <code>isValid</code> must be assigned a falsy value here as it otherwise
	// would be called in addition to any <code>isValid</code> implementation in subtypes.
	// See <code>createType</code> for details.

	/**
	 * Set or unset a normalizer function to be used for values of this data type.
	 *
	 * When a normalizer function has been set, it will be applied to values of this type
	 * whenever {@link #normalize} is called. <code>ManagedObject.prototype.setProperty</code>
	 * calls the <code>normalize</code> method before setting a new value to a property
	 * (normalization is applied on-write, not on-read).
	 *
	 * The <code>fnNormalize</code> function has the signature
	 * <pre>
	 *   fnNormalize(value:any) : any
	 * </pre>
	 * It will be called with a value for this type and should return a normalized
	 * value (which also must be valid for the this type). There's no mean to reject a value.
	 * The <code>this</code> context of the function will be this type.
	 *
	 * This method allows applications or application frameworks to plug-in a generic value
	 * normalization for a type, e.g. to convert all URLs in some app-specific way before
	 * they are applied to controls. It is not intended to break-out of the value range
	 * defined by a type.
	 *
	 * @param {function} fnNormalizer Function to apply for normalizing
	 * @public
	 */
	DataType.prototype.setNormalizer = function(fnNormalizer) {
		jQuery.sap.assert(typeof fnNormalizer === "function", "DataType.setNormalizer: fnNormalizer must be a function");
		this._fnNormalizer = typeof fnNormalizer === "function" ? fnNormalizer : undefined;
	};

	/**
	 * Normalizes the given value using the specified normalizer for this data type.
	 *
	 * If no normalizer has been set, the original value is returned.
	 *
	 * @param {any} oValue Value to be normalized
	 * @returns {any} Normalized value
	 * @public
	 */
	DataType.prototype.normalize = function(oValue) {
		return this._fnNormalizer ? this._fnNormalizer(oValue) : oValue;
	};


	function createType(sName, mSettings, oBase) {

		mSettings = mSettings || {};

		// create a new type object with the base type as prototype
		var oBaseObject = oBase || DataType.prototype;
		var oType = Object.create(oBaseObject);

		// getter for the name
		oType.getName = function() {
			return sName;
		};

		// if a default value is specified, create a getter for it
		if ( mSettings.hasOwnProperty("defaultValue") ) {
			var vDefault = mSettings.defaultValue;
			oType.getDefaultValue = function() {
				return vDefault;
			};
		}

		// if a validator is specified either chain it with the base type validator
		// or set it if no base validator exists
		if ( mSettings.isValid ) {
			var fnIsValid = mSettings.isValid;
			oType.isValid = oBaseObject.isValid ? function(vValue) {
				if ( !oBaseObject.isValid(vValue) ) {
					return false;
				}
				return fnIsValid(vValue);
			} : fnIsValid;
		}

		if ( mSettings.parseValue ) {
			oType.parseValue = mSettings.parseValue;
		}

		// return the base type
		oType.getBaseType = function() {
			return oBase;
		};

		return oType;
	}

	// The generic "array" type must not be exposed by DataType.getType to avoid direct usage
	// as type of a managed property. It is therefore not stored in the mTypes map
	var arrayType = createType("array", {
		defaultValue : []
	});

	function createArrayType(componentType) {
		jQuery.sap.assert(componentType instanceof DataType, "DataType.<createArrayType>: componentType must be a DataType");

		// create a new type object with the base type as prototype
		var oType = Object.create(DataType.prototype);

		// getter for the name
		oType.getName = function() {
			return componentType.getName() + "[]";
		};

		// getter for component type
		oType.getComponentType = function() {
			return componentType;
		};

		// array validator
		oType.isValid = function(aValues) {
			if (aValues === null) {
				return true;
			}
			if (Array.isArray(aValues)) {
				for (var i = 0; i < aValues.length; i++) {
					if (!componentType.isValid(aValues[i])) {
						return false;
					}
				}
				return true;
			}
			return false;
		};

		// array parser
		oType.parseValue = function(sValue) {
			var aValues = sValue.split(",");
			for (var i = 0; i < aValues.length; i++) {
				aValues[i] = componentType.parseValue(aValues[i]);
			}
			return aValues;
		};

		// is an array type
		oType.isArrayType = function() {
			return true;
		};

		// return the base type
		oType.getBaseType = function() {
			return arrayType;
		};

		return oType;
	}

	function createEnumType(sTypeName, oEnum) {

		var mValues = {},
			sDefaultValue;
		for (var sName in oEnum) {
			var sValue = oEnum[sName];
			// the first entry will become the default value
			if (!sDefaultValue) {
				sDefaultValue = sValue;
			}
			if ( typeof sValue !== "string") {
				throw new Error("Value " + sValue + " for enum type " + sTypeName + " is not a string");
			}
			// if there are multiple entries with the same value, the one where name
			// and value are matching is taken
			if (!mValues.hasOwnProperty(sValue) || sName == sValue) {
				mValues[sValue] = sName;
			}
		}

		var oType = Object.create(DataType.prototype);

		// getter for the name
		oType.getName = function() {
			return sTypeName;
		};

		// enum validator
		oType.isValid = function(v) {
			return typeof v === "string" && mValues.hasOwnProperty(v);
		};

		// enum parser
		oType.parseValue = function(sValue) {
			return oEnum[sValue];
		};

		// default value
		oType.getDefaultValue = function() {
			return sDefaultValue;
		};

		// return the base type
		oType.getBaseType = function() {
			return mTypes.string;
		};

		// is an enum type
		oType.isEnumType = function() {
			return true;
		};

		// enum values are best represented by the existing global object
		oType.getEnumValues = function() {
			return oEnum;
		};

		return oType;
	}

	var mTypes = {

		"any" :
			createType("any", {
				defaultValue : null,
				isValid : function(vValue) {
					return true;
				}
			}),

		"boolean" :
			createType("boolean", {
				defaultValue : false,
				isValid : function(vValue) {
					return typeof vValue === "boolean";
				},
				parseValue: function(sValue) {
					return sValue == "true";
				}
			}),

		"int" :
			createType("int", {
				defaultValue : 0,
				isValid : function(vValue) {
					return typeof vValue === "number" && Math.floor(vValue) == vValue;
				},
				parseValue: function(sValue) {
					return parseInt(sValue, 10);
				}
			}),

		"float" :
			createType("float", {
				defaultValue : 0.0,
				isValid : function(vValue) {
					return typeof vValue === "number";
				},
				parseValue: function(sValue) {
					return parseFloat(sValue);
				}
			}),

		"string" :
			createType("string", {
				defaultValue : "",
				isValid : function(vValue) {
					return typeof vValue === "string" || vValue instanceof String;
				},
				parseValue: function(sValue) {
					return sValue;
				}
			}),

		"object" :
			createType("object", {
				defaultValue : null,
				isValid : function(vValue) {
					return typeof vValue === "object" || typeof vValue === "function";
				},
				parseValue: function(sValue) {
					return sValue ? JSON.parse(sValue) : null;
				}
			}),

		"function" :
			createType("function", {
				defaultValue : null,
				isValid : function(vValue) {
					return vValue == null || typeof vValue === 'function';
				},
				parseValue: function(sValue) {
					throw new TypeError("values of type function can't be parsed from a string");
				}
			})

	};

	/**
	 * Looks up the type with the given name and returns it.
	 *
	 * See {@link topic:ac56d92162ed47ff858fdf1ce26c18c4 Defining Control Properties} for
	 * a list of the built-in primitive types and their semantics.
	 *
	 * The lookup consists of the following steps:
	 * <ul>
	 * <li>When a type with the given name is already known, it will be returned</li>
	 * <li>When the name ends with a pair of brackets (<code>[]</code>), a type with the name
	 *     in front of the brackets (<code>name.slice(0,-2)</code>) will be looked up and an
	 *     array type will be created with the looked-up type as its component type. If the
	 *     component type is <code>undefined</code>, <code>undefined</code> will be returned</li>
	 * <li>When a global property exists with the same name as the type and when the value of that
	 *     property is an instance of <code>DataType</code>, that instance will be returned</li>
	 * <li>When a global property exists with the same name as the type and when the value of that
	 *     property is a plain object (its prototype is <code>Object</code>), then an enum type will
	 *     be created, based on the keys and values in that object. The <code>parseValue</code> method
	 *     of the type will accept any of the keys in the plain object and convert them to the
	 *     corresponding value; <code>isValid</code> will accept any of the values from the plain
	 *     object's keys. The <code>defaultValue</code> will be the value of the first key found in
	 *     the plain object</li>
	 * <li>When a global property exist with any other, non-falsy value, a warning is logged and the
	 *     primitive type 'any' is returned</li>
	 * <li>If no such global property exist, an error is logged and <code>undefined</code>
	 *     is returned</li>
	 * </ul>
	 *
	 * <b<Note:</b> UI Libraries and even components can introduce additional types. This method
	 * only checks for types that either have been defined already, or that describe arrays of
	 * values of an already defined type or types whose name matches the global name of a plain
	 * object (containing enum keys and values). This method doesn't try to load modules that
	 * might contain type definitions. So before being able to lookup and use a specific type,
	 * the module containing its definition has to be loaded. For that reason it is suggested that
	 * controls (or <code>ManagedObject</code> classes in general) declare a dependency to all
	 * modules (typically <code>some/lib/library.js</code> modules) that contain the type definitions
	 * needed by the specific control or class definition.
	 *
	 * @param {string} sTypeName Qualified name of the type to retrieve
	 * @returns {sap.ui.base.DataType|undefined} Type object or <code>undefined</code> when
	 *     no such type has been defined yet
	 * @public
	 */
	DataType.getType = function(sTypeName) {
		jQuery.sap.assert( sTypeName && typeof sTypeName === 'string', "sTypeName must be a non-empty string");

		var oType = mTypes[sTypeName];
		if ( !(oType instanceof DataType) ) {
			// check for array types
			if (sTypeName.indexOf("[]", sTypeName.length - 2) > 0) {
				var sComponentTypeName = sTypeName.slice(0, -2),
					oComponentType = this.getType(sComponentTypeName);
				oType = oComponentType && createArrayType(oComponentType);
				if ( oType ) {
					mTypes[sTypeName] = oType;
				}
			} else if ( sTypeName !== 'array') {
				oType = jQuery.sap.getObject(sTypeName);
				if ( oType instanceof DataType ) {
					mTypes[sTypeName] = oType;
				} else if ( jQuery.isPlainObject(oType) ) {
					oType = mTypes[sTypeName] = createEnumType(sTypeName, oType);
				} else {
					if ( oType ) {
						jQuery.sap.log.warning("'" + sTypeName + "' is not a valid data type. Falling back to type 'any'.");
						oType = mTypes.any;
					} else {
						jQuery.sap.log.error("data type '" + sTypeName + "' could not be found.");
						oType = undefined;
					}
				}
			}
		}
		return oType;
	};

	/**
	 * Derives a new type from a given base type.
	 *
	 * Example:<br>
	 * <pre>
	 *
	 *   var fooType = DataType.createType('foo', {
	 *       isValid : function(vValue) {
	 *           return /^(foo(bar)?)$/.test(vValue);
	 *       }
	 *   }, DataType.getType('string'));
	 *
	 *   fooType.isValid('foo'); // true
	 *   fooType.isValid('foobar'); // true
	 *   fooType.isValid('==foobar=='); // false
	 *
	 * </pre>
	 *
	 * If <code>mSettings</code> contains an implementation for <code>isValid</code>,
	 * then the validity check of the newly created type will first execute the check of the
	 * base type and then call the given <code>isValid</code> function.
	 *
	 * Array types and enumeration types cannot be created with this method. They're created
	 * on-the-fly by {@link #.getType DataType.getType} when such a type is looked up.
	 *
	 * <b>Note:</b> The creation of new primitive types is not supported. When a type is created
	 * without a base type, it is automatically derived from the primitive type <code>any</code>.
	 *
	 * <b>Note:</b> If a type has to be used in classes tagged with <code>@ui5-metamodel</code>,
	 * then the implementation of <code>isValid</code> must exactly have the structure shown
	 * in the example above (single return statement, regular expression literal of the form
	 * <code>/^(...)$/</code>, calling <code>/regex/.test()</code> on the given value).
	 * Only the inner part of the regular expression literal can be different.
	 *
	 * @param {string} sName Unique qualified name of the new type
	 * @param {object} [mSettings] Settings for the new type
	 * @param {any} [mSettings.defaultValue] Default value for the type (inherited if not given)
	 * @param {function} [mSettings.isValid] Additional validity check function for values of the
	 *                       type (inherited if not given)
	 * @param {function} [mSettings.parseValue] Parse function that converts a locale independent
	 *                       string into a value of the type (inherited if not given)
	 * @param {sap.ui.base.DataType|string} [base='any'] Base type for the new type
	 * @returns {sap.ui.base.DataType} The newly created type object
	 * @public
	 */
	DataType.createType = function(sName, mSettings, oBase) {
		jQuery.sap.assert(typeof sName === "string" && sName, "DataType.createType: type name must be a non-empty string");
		jQuery.sap.assert(oBase == null || oBase instanceof DataType || typeof oBase === "string" && oBase,
				"DataType.createType: base type must be empty or a DataType or a non-empty string");
		if ( /[\[\]]/.test(sName) ) {
			jQuery.sap.log.error(
				"DataType.createType: array types ('something[]') must not be created with createType, " +
				"they're created on-the-fly by DataType.getType");
		}
		if ( typeof oBase === "string" ) {
			oBase = DataType.getType(oBase);
		}
		oBase = oBase || mTypes.any;
		if ( oBase.isArrayType() || oBase.isEnumType() ) {
			jQuery.sap.log.error("DataType.createType: base type must not be an array- or enum-type");
		}
		if ( sName === 'array' || mTypes[sName] instanceof DataType ) {
			if ( sName === 'array' || mTypes[sName].getBaseType() == null ) {
				throw new Error("DataType.createType: primitive or hidden type " + sName + " can't be re-defined");
			}
			jQuery.sap.log.warning("DataTypes.createType: type " + sName + " is redefined. " +
				"This is an unsupported usage of DataType and might cause issues." );
		}
		var oType = mTypes[sName] = createType(sName, mSettings, oBase);
		return oType;
	};


	// ---- minimal support for interface types -------------------------------------------------------------------

	var mInterfaces = {};

	/**
	 * Registers the given array of type names as known interface types.
	 * Only purpose is to enable the {@link #isInterfaceType} check.
	 * @param {string[]} aTypes interface types to be registered
	 * @private
	 * @sap-restricted sap.ui.base,sap.ui.core.Core
	 */
	DataType.registerInterfaceTypes = function(aTypes) {
		for (var i = 0; i < aTypes.length; i++) {
			jQuery.sap.setObject(aTypes[i], mInterfaces[aTypes[i]] = new String(aTypes[i]));
		}
	};

	/**
	 * @param {string} sType name of type to check
	 * @returns {boolean} whether the given type is known to be an interface type
	 * @private
	 * @sap-restricted sap.ui.base,sap.ui.core.Core
	 */
	DataType.isInterfaceType = function(sType) {
		return mInterfaces.hasOwnProperty(sType) && jQuery.sap.getObject(sType) === mInterfaces[sType];
	};

	return DataType;

}, /* bExport= */ true);
