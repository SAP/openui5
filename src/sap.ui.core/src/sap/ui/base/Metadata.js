/*!
 * ${copyright}
 */

// Provides class sap.ui.base.Metadata
sap.ui.define([
	'sap/base/util/ObjectPath',
	'sap/ui/Device',
	"sap/base/assert",
	"sap/base/Log",
	"sap/base/util/array/uniqueSort"
],
	function(ObjectPath, Device, assert, Log, uniqueSort) {
	"use strict";


	/**
	 * Creates a new metadata object from the given static infos.
	 *
	 * <b>Note:</b> Throughout this class documentation, the described subclass of Object
	 * is referenced as <i>the described class</i>.
	 *
	 * @param {string} sClassName Fully qualified name of the described class
	 * @param {object} oClassInfo Info to construct the class and its metadata from
	 *
	 * @class Metadata for a class.
	 * @author Frank Weigel
	 * @version ${version}
	 * @since 0.8.6
	 * @public
	 * @alias sap.ui.base.Metadata
	 */
	var Metadata = function(sClassName, oClassInfo) {

		assert(typeof sClassName === "string" && sClassName, "Metadata: sClassName must be a non-empty string");
		assert(typeof oClassInfo === "object", "Metadata: oClassInfo must be empty or an object");

		// support for old usage of Metadata
		if ( !oClassInfo || typeof oClassInfo.metadata !== "object" ) {
			oClassInfo = {
				metadata : oClassInfo || {},
				// retrieve class by its name. Using a lookup costs time but avoids the need for redundant arguments to this function
				constructor : ObjectPath.get(sClassName)
			};
			oClassInfo.metadata.__version = 1.0;
		}
		oClassInfo.metadata.__version = oClassInfo.metadata.__version || 2.0;
		if ( typeof oClassInfo.constructor !== "function" ) {
			throw Error("constructor for class " + sClassName + " must have been declared before creating metadata for it");
		}

		// invariant: oClassInfo exists, oClassInfo.metadata exists, oClassInfo.constructor exists
		this._sClassName = sClassName;
		this._oClass = oClassInfo.constructor;
		this.extend(oClassInfo);
	};

	/**
	 * @private
	 * @final
	 */
	Metadata.prototype.extend = function(oClassInfo) {
		this.applySettings(oClassInfo);
		this.afterApplySettings();
	};

	/**
	 * @private
	 * @since 1.3.1
	 */
	Metadata.prototype.applySettings = function(oClassInfo) {

		var that = this,
			oStaticInfo = oClassInfo.metadata,
			oPrototype;

		if ( oStaticInfo.baseType ) {
			// lookup base class by its name - same reasoning as above
			var oParentClass = ObjectPath.get(oStaticInfo.baseType);
			if ( typeof oParentClass !== "function" ) {
				Log.fatal("base class '" + oStaticInfo.baseType + "' does not exist");
			}
			// link metadata with base metadata
			if ( oParentClass.getMetadata ) {
				this._oParent = oParentClass.getMetadata();
				assert(oParentClass === oParentClass.getMetadata().getClass(), "Metadata: oParentClass must match the class in the parent metadata");
			} else {
				// fallback, if base class has no metadata
				this._oParent = new Metadata(oStaticInfo.baseType, {});
			}
		} else {
			this._oParent = undefined;
		}

		this._bAbstract = !!oStaticInfo["abstract"];
		this._bFinal = !!oStaticInfo["final"];
		this._sStereotype = oStaticInfo.stereotype || (this._oParent ? this._oParent._sStereotype : "object");
		this._bDeprecated = !!oStaticInfo["deprecated"];

		// handle interfaces
		this._aInterfaces = oStaticInfo.interfaces || [];

		// take over metadata from static info
		this._aPublicMethods = oStaticInfo.publicMethods || [];

		// interfaces info possibly not unique
		this._bInterfacesUnique = false;

		// enrich prototype
		oPrototype = this._oClass.prototype;
		for ( var n in oClassInfo ) {
			if ( n !== "metadata" && n !== "constructor") {
				oPrototype[n] = oClassInfo[n];
				if ( !n.match(/^_|^on|^init$|^exit$/)) {
					// TODO hard coded knowledge about event handlers ("on") and about init/exit hooks is not nice....
					that._aPublicMethods.push(n);
				}
			}
		}
	};

	/**
	 * Called after new settings have been applied.
	 *
	 * Typically, this method is used to do some cleanup (e.g. uniqueness)
	 * or to calculate an optimized version of some data.
	 * @private
	 * @since 1.3.1
	 */
	Metadata.prototype.afterApplySettings = function() {
		// create the flattened "all" view
		if ( this._oParent ) {
			//this._aAllInterfaces = jQuery.sap.unique(this._oParent._aAllInterfaces.concat(this._aInterfaces));
			this._aAllPublicMethods = this._oParent._aAllPublicMethods.concat(this._aPublicMethods);
			this._bInterfacesUnique = false;
		} else {
			//this._aAllInterfaces = this._aInterfaces;
			this._aAllPublicMethods = this._aPublicMethods;
		}

	};

	/**
	 * Stereotype of the described class.
	 * @experimental might be enhanced to a set of stereotypes
	 */
	Metadata.prototype.getStereotype = function() {
		return this._sStereotype;
	};

	/**
	 * Returns the fully qualified name of the described class
	 * @return {string} name of the described class
	 * @public
	 */
	Metadata.prototype.getName = function() {
		return this._sClassName;
	};

	/**
	 * Returns the (constructor of the) described class
	 * @return {function} class described by this metadata
	 * @public
	 */
	Metadata.prototype.getClass = function() {
		return this._oClass;
	};

	/**
	 * Returns the metadata object of the base class of the described class
	 * or null if the class has no (documented) base class.
	 *
	 * @return {sap.ui.base.Metadata} metadata of the base class
	 * @public
	 */
	Metadata.prototype.getParent = function() {
		return this._oParent;
	};

	/**
	 * Removes duplicate names in place from the interfaces and public methods members of this metadata object.
	 *
	 * @private
	 */
	Metadata.prototype._dedupInterfaces = function () {
		if (!this._bInterfacesUnique) {
			uniqueSort(this._aInterfaces);
			uniqueSort(this._aPublicMethods);
			uniqueSort(this._aAllPublicMethods);
			this._bInterfacesUnique = true;
		}
	};

	/**
	 * Returns an array with the names of the public methods declared by the described class, methods of
	 * ancestors are not listed.
	 *
	 * @return {string[]} array with names of public methods declared by the described class
	 * @deprecated As of 1.58, this method should not be used for productive code. The accuracy of the returned
	 *       information highly depends on the concrete class and is not actively monitored. There might be
	 *       more public methods or some of the returned methods might not really be intended for public use.
	 *       In general, pure visibility information should not be exposed in runtime metadata but be part of the
	 *       documentation.
	 *       Subclasses of <code>sap.ui.base.Object</code> might decide to provide runtime metadata describing
	 *       their public API, but this then should not be backed by this method.
	 *       See {@link sap.ui.core.mvc.ControllerMetadata#getAllMethods} for an example.
	 * @public
	 */
	Metadata.prototype.getPublicMethods = function() {
		this._dedupInterfaces();
		return this._aPublicMethods;
	};

	/**
	 * Returns an array with the names of all public methods declared by the described class
	 * and all its ancestors classes.
	 *
	 * @return {string[]} array with names of all public methods provided by the described class and its ancestors
	 * @deprecated As of 1.58, this method should not be used for productive code. The accuracy of the returned
	 *       information highly depends on the concrete class and is not actively monitored. There might be
	 *       more public methods or some of the returned methods might not really be intended for public use.
	 *       In general, pure visibility information should not be exposed in runtime metadata but be part of the
	 *       documentation.
	 *       Subclasses of <code>sap.ui.base.Object</code> might decide to provide runtime metadata describing
	 *       their public API, but this then should not be backed by this method.
	 *       See {@link sap.ui.core.mvc.ControllerMetadata#getAllMethods} for an example.
	 * @public
	 */
	Metadata.prototype.getAllPublicMethods = function() {
		this._dedupInterfaces();
		return this._aAllPublicMethods;
	};

	/**
	 * Returns the names of interfaces implemented by the described class.
	 * As the representation of interfaces is not clear yet, this method is still private.
	 *
	 * @return {string} array of names of implemented interfaces
	 * @private
	 */
	Metadata.prototype.getInterfaces = function() {
		this._dedupInterfaces();
		return this._aInterfaces;
	};

	/**
	 * Checks whether the described class or one of its ancestor classes implements the given interface.
	 *
	 * @param {string} sInterface name of the interface to test for (in dot notation)
	 * @return {boolean} whether this class implements the interface
	 * @public
	 */
	Metadata.prototype.isInstanceOf = function(sInterface) {
		if ( this._oParent ) {
			if ( this._oParent.isInstanceOf(sInterface) ) {
				return true;
			}
		}

		var a = this._aInterfaces;
		for (var i = 0,l = a.length; i < l; i++) {
			// FIXME doesn't handle interface inheritance (requires object representation for interfaces)
			if ( a[i] === sInterface ) {
				return true;
			}
		}

		return false;
	};

	/*
	 * Lazy calculation of the set of implemented types.
	 *
	 * A calculation function is configured as getter for the <code>_mImplementedTypes</code>
	 * on the prototype object. On first call for a metadata instance, it collects
	 * the implemented types (classes, interfaces) from the described class and
	 * any base classes and writes it to the property <code>_mImplementedTypes</code> of the
	 * current instance of metadata. Future read access to the property will immediately
	 * return the instance property and not call the calculation function again.
	 */
	Object.defineProperty(Metadata.prototype, "_mImplementedTypes", {
		get: function() {

			if ( this === Metadata.prototype ) {
				throw new Error("sap.ui.base.Metadata: The '_mImplementedTypes' property must not be accessed on the prototype");
			}

			// create map of types, including inherited types
			// Note: to save processing time and memory, the inherited types are merged via the prototype chain of 'result'
			var result = Object.create(this._oParent ? this._oParent._mImplementedTypes : null);
			/*
			 * Flat alternative:
			 * var result = Object.create(null);
			 * if ( this._oParent ) {
			 *   Object.assign(result, this._oParent._mImplementedTypes);
			 * }
			 */

			// add own class
			result[this._sClassName] = true;

			// additionally collect interfaces
			var aInterfaces = this._aInterfaces,
				i = aInterfaces.length;
			while ( i-- > 0 ) {
				if ( !result[aInterfaces[i]] ) {
					// take care to write property only if it hasn't been set already
					result[aInterfaces[i]] = true;
				}
			}

			// write instance property, hiding the getter on the prototype
			Object.defineProperty(this, "_mImplementedTypes", {
				value: Object.freeze(result),
				writable: false,
				configurable: false
			});

			return result;
		},
		configurable: true
	});

	/**
	 * Checks whether the class described by this metadata object is of the named type.
	 *
	 * This check is solely based on the type names as declared in the class metadata.
	 * It compares the given <code>vTypeName</code> with the name of this class, with the
	 * names of any base class of this class and with the names of all interfaces
	 * implemented by any of the aforementioned classes.
	 *
	 * Instead of a single type name, an array of type names can be given and the method
	 * will check if this class is of any of the listed types (logical or).
	 *
	 * Should the UI5 class system in future implement additional means of associating classes
	 * with type names (e.g. by introducing mixins), then this method might detect matches
	 * for those names as well.
	 *
	 * @param {string|string[]} vTypeName Type or types to check for
	 * @returns {boolean} Whether this class is of the given type or of any of the given types
	 * @public
	 * @since 1.56
	 */
	Metadata.prototype.isA = function(vTypeName) {
		var mTypes = this._mImplementedTypes;
		if ( Array.isArray(vTypeName) ) {
			for ( var i = 0; i < vTypeName.length; i++ ) {
				if ( vTypeName[i] in mTypes ) {
					return true;
				}
			}
			return false;
		}
		// Note: the check with 'in' also finds inherited types via the prototype chain of mTypes
		return vTypeName in mTypes;
	};

	/**
	 * Returns whether the described class is abstract
	 * @return {boolean} whether the class is abstract
	 * @public
	 */
	Metadata.prototype.isAbstract = function() {
		return this._bAbstract;
	};

	/**
	 * Returns whether the described class is final
	 * @return {boolean} whether the class is final
	 * @public
	 */
	Metadata.prototype.isFinal = function() {
		return this._bFinal;
	};

	/**
	 * Whether the described class is deprecated and should not be used any more
	 *
	 * @return {boolean} whether the class is considered deprecated
	 * @public
	 * @since 1.26.4
	 */
	Metadata.prototype.isDeprecated = function() {
		return this._bDeprecated;
	};

	/**
	 * Adds one or more new methods to the list of API methods.
	 *
	 * Can be used by contributer classes (like the EnabledPropagator) to enrich the declared set of methods.
	 * The method can either be called with multiple names (strings) or with one array of strings.
	 *
	 * <b>Note</b>: the newly added method(s) will only be visible in {@link sap.ui.base.Interface interface}
	 * objects that are created <i>after</i> this method has been called.
	 *
	 * @param {string|string[]} sMethod name(s) of the new method(s)
	 */
	Metadata.prototype.addPublicMethods = function(sMethod /* ... */) {
		var aNames = (sMethod instanceof Array) ? sMethod : arguments;
		Array.prototype.push.apply(this._aPublicMethods, aNames);
		Array.prototype.push.apply(this._aAllPublicMethods, aNames);
		this._bInterfacesUnique = false;
	};

	/**
	 * @since 1.3.1
	 * @private
	 */
	Metadata.createClass = function (fnBaseClass, sClassName, oClassInfo, FNMetaImpl) {

		if ( typeof fnBaseClass === "string" ) {
			FNMetaImpl = oClassInfo;
			oClassInfo = sClassName;
			sClassName = fnBaseClass;
			fnBaseClass = null;
		}

		assert(!fnBaseClass || typeof fnBaseClass === "function");
		assert(typeof sClassName === "string" && !!sClassName);
		assert(!oClassInfo || typeof oClassInfo === "object");
		assert(!FNMetaImpl || typeof FNMetaImpl === "function");

		// allow metadata class to preprocess
		FNMetaImpl = FNMetaImpl || Metadata;
		if ( typeof FNMetaImpl.preprocessClassInfo === "function" ) {
			oClassInfo = FNMetaImpl.preprocessClassInfo(oClassInfo);
		}

		// normalize oClassInfo
		oClassInfo = oClassInfo || {};
		oClassInfo.metadata = oClassInfo.metadata || {};
		if ( !oClassInfo.hasOwnProperty('constructor') ) {
			oClassInfo.constructor = undefined;
		}

		var fnClass = oClassInfo.constructor;
		assert(!fnClass || typeof fnClass === "function");

		// ensure defaults
		if ( fnBaseClass ) {
			// default constructor just delegates to base class
			if ( !fnClass ) {
				if ( oClassInfo.metadata.deprecated ) {
				  // create default factory with deprecation warning
					fnClass = function() {
						Log.warning("Usage of deprecated class: " + sClassName);
						fnBaseClass.apply(this, arguments);
					};
				} else {
					// create default factory
					fnClass = function() {
						fnBaseClass.apply(this, arguments);
					};
				}
			}
			// create prototype chain
			fnClass.prototype = Object.create(fnBaseClass.prototype);
			fnClass.prototype.constructor = fnClass;
			// enforce correct baseType
			oClassInfo.metadata.baseType = fnBaseClass.getMetadata().getName();
		} else {
			// default constructor does nothing
			fnClass = fnClass || function() { };
			// enforce correct baseType
			delete oClassInfo.metadata.baseType;
		}
		oClassInfo.constructor = fnClass;

		// make the class visible as JS Object
		ObjectPath.set(sClassName, fnClass);

		// add metadata
		var oMetadata = new FNMetaImpl(sClassName, oClassInfo);
		fnClass.getMetadata = fnClass.prototype.getMetadata = function() {
			return oMetadata;
		};

		// enrich function
		if ( !fnClass.getMetadata().isFinal() ) {
			fnClass.extend = function(sSCName, oSCClassInfo, fnSCMetaImpl) {
				return Metadata.createClass(fnClass, sSCName, oSCClassInfo, fnSCMetaImpl || FNMetaImpl);
			};
		}

		return fnClass;
	};

	return Metadata;

}, /* bExport= */ true);