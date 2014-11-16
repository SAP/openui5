/*!
 * ${copyright}
 */

// Provides class sap.ui.base.Metadata
sap.ui.define(['jquery.sap.global', 'jquery.sap.script'],
	function(jQuery/* , jQuerySap */) {
	"use strict";


	/**
	 * Creates a new metadata object from the given static infos.
	 *
	 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
	 * @param {object} oClassInfo info to construct the class and its metadata from
	 *
	 * @class Metadata for a class.
	 * @author Frank Weigel
	 * @version ${version}
	 * @since 0.8.6
	 * @public
	 * @alias sap.ui.base.Metadata
	 */
	var Metadata = function(sClassName, oClassInfo) {
	
		jQuery.sap.assert(typeof sClassName === "string" && sClassName, "Metadata: sClassName must be a non-empty string");
		jQuery.sap.assert(typeof oClassInfo === "object", "Metadata: oClassInfo must be empty or an object");
	
		// support for old usage of Metadata
		if ( !oClassInfo || typeof oClassInfo.metadata !== "object" ) {
			oClassInfo = {
				metadata : oClassInfo || {},
				// retrieve class by its name. Using a lookup costs time but avoids the need for redundant arguments to this function
				constructor : jQuery.sap.getObject(sClassName)
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
			var oParentClass = jQuery.sap.getObject(oStaticInfo.baseType);
			if ( typeof oParentClass !== "function" ) {
				jQuery.sap.log.fatal("base class '" + oStaticInfo.baseType + "' does not exist");
			}
			// link metadata with base metadata
			if ( oParentClass.getMetadata ) {
				this._oParent = oParentClass.getMetadata();
				jQuery.sap.assert(oParentClass === oParentClass.getMetadata().getClass(), "Metadata: oParentClass must match the class in the parent metadata");
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
		
		// handle interfaces
		this._aInterfaces = jQuery.sap.unique(oStaticInfo.interfaces || []);
	
		// take over metadata from static info
		this._aPublicMethods = jQuery.sap.unique(oStaticInfo.publicMethods || []);
	
		// enrich prototype
		oPrototype = this._oClass.prototype;
		jQuery.sap.forIn(oClassInfo, function(n, v) {
			if ( n !== "metadata" && n !== "constructor" ) {
				oPrototype[n] = v;
				if ( !n.match(/^_|^on|^init$|^exit$/) ) {
					// TODO hard coded knowledge about event handlers ("on") and about init/exit hooks is not nice....
					that._aPublicMethods.push(n);
				}
			}
		});
		
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
			this._aAllPublicMethods = jQuery.sap.unique(this._oParent._aAllPublicMethods.concat(this._aPublicMethods));
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
	 * Returns the fully qualified name of the class that is described by this metadata object
	 * @return {string} name of the described class
	 * @public
	 */
	Metadata.prototype.getName = function() {
		return this._sClassName;
	};
	
	/**
	 * Returns the (constructor of the) class described by this metadata object.
	 * @return {function} class described by this metadata
	 * @public
	 */
	Metadata.prototype.getClass = function() {
		return this._oClass;
	};
	
	/**
	 * Returns the metadata object of the base class of the class described by this metadata object
	 * or null if the class has no (documented) base class.
	 *
	 * @return {sap.ui.base.Metadata} metadata of the base class
	 * @public
	 */
	Metadata.prototype.getParent = function() {
		return this._oParent;
	};
	
	/**
	 * Returns an array with the names of the public methods declared by this class.
	 *
	 * @return {string[]} array with names of public methods declared by this class
	 * @public
	 */
	Metadata.prototype.getPublicMethods = function() {
		return this._aPublicMethods;
	};
	
	/**
	 * Returns an array with the names of all public methods declared by this class
	 * and its ancestors.
	 *
	 * @return {string[]} array with names of all public methods provided by this class and its ancestors
	 * @public
	 */
	Metadata.prototype.getAllPublicMethods = function() {
		return this._aAllPublicMethods;
	};
	
	/**
	 * Returns the names of interfaces implemented by this class.
	 * As the representation of interfaces is not clear yet, this method is still private.
	 *
	 * @return {string} array of names of implemented interfaces
	 * @private
	 */
	Metadata.prototype.getInterfaces = function() {
		return this._aInterfaces;
	};
	
	/**
	 * Checks whether the class described by this object or one of its ancestors
	 * implements the given interface.
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
	
	
	Metadata.prototype.isAbstract = function() {
		return this._bAbstract;
	};
	
	Metadata.prototype.isFinal = function() {
		return this._bFinal;
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
		function upush(a,v) {
			Array.prototype.push.apply(a, v); // appends "inplace"
			jQuery.sap.unique(a);
		}
		upush(this._aPublicMethods, aNames);
		upush(this._aAllPublicMethods, aNames);
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
	
		jQuery.sap.assert(!fnBaseClass || typeof fnBaseClass === "function");
		jQuery.sap.assert(typeof sClassName === "string" && !!sClassName);
		jQuery.sap.assert(!oClassInfo || typeof oClassInfo === "object");
		jQuery.sap.assert(!FNMetaImpl || typeof FNMetaImpl === "function");
	
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
		jQuery.sap.assert(!fnClass || typeof fnClass === "function");
	
		// ensure defaults
		if ( fnBaseClass ) {
			// default constructor just delegates to base class
			if ( !fnClass ) {
				if ( oClassInfo.metadata.deprecated ) {
				  // create default factory with deprecation warning
					fnClass = function() {
						jQuery.sap.log.warning("Usage of deprecated class: " + sClassName);
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
			fnClass.prototype = jQuery.sap.newObject(fnBaseClass.prototype);
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
		jQuery.sap.setObject(sClassName, fnClass);
	
		// add metadata
		var oMetadata = new FNMetaImpl(sClassName, oClassInfo);
		fnClass.getMetadata = fnClass.prototype.getMetadata = jQuery.sap.getter(oMetadata);
	
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
