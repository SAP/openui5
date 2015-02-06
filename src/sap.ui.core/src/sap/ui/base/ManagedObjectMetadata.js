/*!
 * ${copyright}
 */

// Provides class sap.ui.base.ManagedObjectMetadata
sap.ui.define(['jquery.sap.global', './DataType', './Metadata'],
	function(jQuery, DataType, Metadata) {
	"use strict";


	/**
	 * Creates a new metadata object that describes a subclass of ManagedObject.
	 *
	 * Note: throughout this class documentation, the described subclass of ManagedObject 
	 * is referenced as <i>the described class</i>. 
	 *  
	 * @param {string} sClassName fully qualified name of the described class 
	 * @param {object} oClassInfo static info to construct the metadata from
	 *
	 * @class
	 * @classdesc 
	 * 
	 * <strong>Note about Info Objects</strong>
	 * 
	 * Several methods in this class return info objects that describe a property,
	 * aggregation, association or event of the class described by this metadata object.
	 * The type, structure and behavior of these info objects is not yet documented and 
	 * not part of the stable, public API. 
	 * 
	 * Code using such methods and the returned info objects therefore needs to be aware 
	 * of the following restrictions:
	 * 
	 * <ul>
	 * <li>the set of properties exposed by each info object, their type and value 
	 *     might change as well as the class of the info object itself.
	 *     
	 *     Properties that represent settings provided during class definition
	 *     (in the oClassInfo parameter of the 'extend' call, e.g. 'type', 'multiple'
	 *     of an aggregation) are more likely to stay the same than additional, derived 
	 *     properties like '_iKind'.</li>
	 *
	 * <li>info objects must not be modified / enriched although they technically could.</li>
	 * 
	 * <li>the period of validity of info objects is not defined. They should be 
	 *     referenced only for a short time and not be kept as members of long living 
	 *     objects or closures.</li>  
	 * 
	 * </ul>
	 * 
	 * @author Frank Weigel
	 * @version ${version}
	 * @since 0.8.6
	 * @alias sap.ui.base.ManagedObjectMetadata
	 */
	var ManagedObjectMetadata = function(sClassName, oClassInfo) {
	
		// call super constructor
		Metadata.apply(this, arguments);
	
	};
	
	//chain the prototypes
	ManagedObjectMetadata.prototype = jQuery.sap.newObject(Metadata.prototype);
	
	var rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
	var mSingular = {'children' : -3, 'ies' : 'y', 'ves' : 'f', 'oes' : -2, 'ses' : -2, 'ches' : -2, 'shes' : -2, 'xes' : -2, 's' : -1 };

	/**
	 * Guess a singular name for a given plural name.
	 * 
	 * This method is not guaranteed to return a valid result. If the result is not satisfying, 
	 * the singular name for an aggregation/association should be specified in the class metadata.
	 * 
	 * @private
	 */
	ManagedObjectMetadata._guessSingularName = function(sName) {
		return sName.replace(rPlural, function($,sPlural) {
			var vRepl = mSingular[sPlural.toLowerCase()];
			return typeof vRepl === "string" ? vRepl : sPlural.slice(0,vRepl);
		});
	};
	
	/**
	 * @private
	 */
	ManagedObjectMetadata.prototype.applySettings = function(oClassInfo) {
	
		var oStaticInfo = oClassInfo.metadata;
	
		Metadata.prototype.applySettings.call(this, oClassInfo);
	
		function normalize(mInfoMap, sDefaultName, oDefaultValues) {
			var sName,oInfo;
			mInfoMap = mInfoMap || {};
			for (sName in mInfoMap) {
				oInfo = mInfoMap[sName];
				// if settings are not an object literal and if there is a default setting, set it
				if ( sDefaultName && typeof oInfo !== "object" ) {
					oInfo = {};
					oInfo[sDefaultName] = mInfoMap[sName];
				}
				oInfo = jQuery.extend({}, oDefaultValues, oInfo);
				oInfo.name = sName;
				// if info contains a multiple flag but no singular name, calculate one
				if ( oInfo.multiple === true && !oInfo.singularName) {
					oInfo.singularName = ManagedObjectMetadata._guessSingularName(sName);
				}
				mInfoMap[sName] = oInfo;
			}
			return mInfoMap;
		}

		function emptyMap(mInfoMap) {
			mInfoMap = mInfoMap || {};
			for (var sName in mInfoMap) {
				mInfoMap[sName] = {};
			}
			return mInfoMap;
		}

		function filter(mInfoMap, bPublic) {
			var mResult = {},sName;
			for (sName in mInfoMap) {
				if ( bPublic === (mInfoMap[sName].visibility === 'public') ) {
					mResult[sName] = mInfoMap[sName];
				}
			}
			return mResult;
		}
		
		var rLibName = /([a-z][^.]*(?:\.[a-z][^.]*)*)\./;
	
		function defaultLibName(sName) {
		  var m = rLibName.exec(sName);
		  return (m && m[1]) || "";
		}
	
		// init basic metadata from static infos and fallback to defaults
		this._sLibraryName = oStaticInfo.library || defaultLibName(this.getName());
		this._mProperties = normalize(oStaticInfo.properties, "type", { type : "string", group : "Misc" });
		var mAllAggregations = normalize(oStaticInfo.aggregations, "type", { type : "sap.ui.core.Control", multiple : true, visibility : 'public' });
		this._mAggregations = filter(mAllAggregations, true);
		this._mPrivateAggregations = filter(mAllAggregations, false);
		this._sDefaultAggregation = oStaticInfo.defaultAggregation || null;
		this._mAssociations = normalize(oStaticInfo.associations, "type", { type : "sap.ui.core.Control", multiple : false});
		this._mEvents = normalize(oStaticInfo.events, /* no default setting */ null, { allowPreventDefault : false });
		this._mSpecialSettings = emptyMap(oStaticInfo.specialSettings);
	
		this._bEnriched = false;
	
		if ( oClassInfo.metadata.__version > 1.0 ) {
			this.generateAccessors();
		}
	
	};
	
	/**
	 * @private
	 */
	ManagedObjectMetadata.prototype.afterApplySettings = function() {
	
		Metadata.prototype.afterApplySettings.call(this);
	
		// if there is a parent class, produce the flattened "all" views for the element specific metadata
		// PERFOPT: this could be done lazily
		var oParent = this.getParent();
		if ( oParent && oParent instanceof ManagedObjectMetadata ) {
			this._mAllEvents = jQuery.extend({}, oParent._mAllEvents, this._mEvents);
			this._mAllProperties = jQuery.extend({}, oParent._mAllProperties, this._mProperties);
			this._mAllPrivateAggregations = jQuery.extend({}, oParent._mAllPrivateAggregations, this._mPrivateAggregations);
			this._mAllAggregations = jQuery.extend({}, oParent._mAllAggregations, this._mAggregations);
			this._mAllAssociations = jQuery.extend({}, oParent._mAllAssociations, this._mAssociations);
			this._sDefaultAggregation = this._sDefaultAggregation || oParent._sDefaultAggregation;
			if ( oParent._mHiddenAggregations ) {
			  this._mHiddenAggregations = jQuery.extend({}, oParent._mHiddenAggregations);
			}
			this._mAllSpecialSettings = jQuery.extend({}, oParent._mAllSpecialSettings, this._mSpecialSettings);
		} else {
			this._mAllEvents = this._mEvents;
			this._mAllProperties = this._mProperties;
			this._mAllPrivateAggregations = this._mPrivateAggregations;
			this._mAllAggregations = this._mAggregations;
			this._mAllAssociations = this._mAssociations;
			this._mAllSpecialSettings = this._mSpecialSettings;
		}
	
	};
	
	ManagedObjectMetadata.Kind = {
		SPECIAL_SETTING : -1, PROPERTY : 0, SINGLE_AGGREGATION : 1, MULTIPLE_AGGREGATION : 2, SINGLE_ASSOCIATION : 3, MULTIPLE_ASSOCIATION : 4, EVENT : 5
	};
	
	
	/**
	 * Returns the name of the library that contains the described UIElement.
	 * @return {string} the name of the library
	 * @public
	 */
	ManagedObjectMetadata.prototype.getLibraryName = function() {
		return this._sLibraryName;
	};
	
	/**
	 * Returns whether the class/control is abstract
	 * @return {boolean} whether the class/control is abstract
	 * @public
	 */
	ManagedObjectMetadata.prototype.isAbstract = function() {
		return this._bAbstract;
	};
	
	// ---- properties ------------------------------------------------------------------------
	
	/**
	 * Declares an additional property for the described class.
	 *
	 * Any property declaration via this method must happen before the described class
	 * is subclassed, or the added property will not be visible in the subclass.
	 *
	 * Typically used to enrich UIElement classes in an aspect oriented manner.
	 * @param {string} sName name of the property to add
	 * @param {object} oInfo metadata for the property
	 * @public
	 * @see sap.ui.core.EnabledPropagator
	 */
	ManagedObjectMetadata.prototype.addProperty = function(sName, oInfo) {
		oInfo.name = sName;
		this._mProperties[sName] = oInfo;
		if (!this._mAllProperties[sName]) {// ensure extended AllProperties meta-data is also enriched
			this._mAllProperties[sName] = oInfo;
		}
	
		if ( this._bEnriched ) {
			this._bEnriched = false;
			this._enrichChildInfos();
		}
		// TODO notify listeners (subclasses) about change
	};
	
	/**
	 * Checks the existence of the given property by its name
	 * @param {string} sName name of the property
	 * @return {boolean} true, if the property exists
	 * @public
	 */
	ManagedObjectMetadata.prototype.hasProperty = function(sName) {
		return !!this._mAllProperties[sName];
	};

	/**
	 * Returns an info object for the named public property of the described class, 
	 * no matter whether the property was defined by the class itself or by one of its 
	 * ancestor classes.
	 * 
	 * If neither the described class nor its ancestor classes define a property with the 
	 * given name, <code>undefined</code> is returned.
	 *  
	 * @param {string} sName name of the property
	 * @returns {Object} An info object describing the property or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 * @experimental Type, structure and behavior of the returned info object is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getProperty = function(sName) {
		if ( !this._bEnriched ) {
			this._enrichChildInfos();
		}
		var oProp = this._mAllProperties[sName];
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return typeof oProp === 'object' ? oProp : undefined;
	};
	
	/**
	 * Returns a map of info objects for the public properties of the described class.
	 * Properties declared by ancestor classes are not included.
	 *
	 * The returned map keys the property info objects by their name.
	 * 
	 * @return {map} Map of property info objects keyed by the property names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getProperties = function() {
		return this._mProperties;
	};
	

	/**
	 * Returns a map of info objects for all public properties of the described class,
	 * including public properties from the ancestor classes.
	 *
	 * The returned map keys the property info objects by their name.
	 * 
	 * @return {map} Map of property info objects keyed by the property names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAllProperties = function() {
		return this._mAllProperties;
	};
	
	// ---- aggregations ----------------------------------------------------------------------

	/**
	 * Checks the existence of the given aggregation by its name.
	 * @param {string} sName name of the aggregation
	 * @return {boolean} true, if the aggregation exists
	 * @public
	 */
	ManagedObjectMetadata.prototype.hasAggregation = function(sName) {
		return !!this._mAllAggregations[sName];
	};
	
	/**
	 * Returns an info object for the named public aggregation of the described class
	 * no matter whether the aggregation was defined by the class itself or by one of its 
	 * ancestor classes.
	 * 
	 * If neither the class nor its ancestor classes define a public aggregation with the given 
	 * name, <code>undefined</code> is returned.
	 *  
	 * If the name is not given (or has a falsy value), then it is substituted by the 
	 * name of the default aggregation of the 'described class' (if any).
	 *  
	 * @param {string} [sName] name of the aggregation or empty
	 * @returns {Object} An info object describing the aggregation or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 * @experimental Type, structure and behavior of the returned info object is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAggregation = function(sName) {
		if ( !this._bEnriched ) {
			this._enrichChildInfos();
		}
		sName = sName || this._sDefaultAggregation;
		var oAggr = sName ? this._mAllAggregations[sName] : undefined;
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return typeof oAggr === 'object' ? oAggr : undefined;
	};
	
	/**
	 * Returns a map of info objects for the public aggregations of the described class.
	 * Aggregations declared by ancestor classes are not included.
	 *
	 * The returned map keys the aggregation info objects by their name.
	 * In case of 0..1 aggregations this is the singular name, otherwise it is the plural name.
	 *
	 * @return {map} Map of aggregation info objects keyed by aggregation names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAggregations = function() {
		return this._mAggregations;
	};
	
	/**
	 * Returns a map of info objects for all public aggregations of the described class,
	 * including public aggregations form the ancestor classes.
	 *
	 * The returned map keys the aggregation info objects by their name.
	 * In case of 0..1 aggregations this is the singular name, otherwise it is the plural
	 * name.
	 *
	 * @return {map} Map of aggregation info objects keyed by aggregation names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAllAggregations = function() {
		return this._mAllAggregations;
	};
	
	/**
	 * Returns a map of info objects for all private (hidden) aggregations of the described class,
	 * including private aggregations from the ancestor classes.
	 *
	 * The returned map contains aggregation info objects keyed by the aggregation name.
	 * In case of 0..1 aggregations this is the singular name, otherwise it is the plural name.
	 *
	 * @return {map} Map of aggregation infos keyed by aggregation names
	 * @protected
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAllPrivateAggregations = function() {
		return this._mAllPrivateAggregations;
	};
	
	/**
	 * Returns the info object for the named public or private aggregation declared by the 
	 * described class or by any of its ancestors.
	 *
	 * If the name is not given (or has a falsy value), then it is substituted by the 
	 * name of the default aggregation of the described class (if it is defined).
	 *  
	 * @param {string} sAggregationName name of the aggregation to be retrieved or empty   
	 * @return {object} aggregation info object or undefined
	 * @protected
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getManagedAggregation = function(sAggregationName) {
		sAggregationName = sAggregationName || this._sDefaultAggregation;
		var oAggr = sAggregationName ? this._mAllAggregations[sAggregationName] || this._mAllPrivateAggregations[sAggregationName] : undefined;
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return typeof oAggr === 'object' ? oAggr : undefined;
	};
	
	/**
	 * Returns the name of the default aggregation of the described class.
	 * 
	 * If the class itself does not define a default aggregation, then the default aggregation
	 * of the parent is returned. If no class in the hierarchy defines a default aggregation,
	 * <code>undefined</code> is returned.
	 *
	 * @return {string} Name of the default aggregation
	 */
	ManagedObjectMetadata.prototype.getDefaultAggregationName = function() {
		return this._sDefaultAggregation;
	};
	
	/**
	 * Returns an info object for the default aggregation of the described class.
	 * 
	 * If the class itself does not define a default aggregation, then the
	 * info object for the default aggregation of the parent class is returned.
	 *
	 * @return {Object} An info object for the default aggregation
	 */
	ManagedObjectMetadata.prototype.getDefaultAggregation = function() {
		return this._sDefaultAggregation && this.getAllAggregations()[this._sDefaultAggregation];
	};
	
	// ---- associations ----------------------------------------------------------------------
	
	/**
	 * Checks the existence of the given association by its name
	 * @param {string} sName name of the association
	 * @return {boolean} true, if the association exists
	 * @public
	 */
	ManagedObjectMetadata.prototype.hasAssociation = function(sName) {
		return !!this._mAllAssociations[sName];
	};
	
	/**
	 * Returns an info object for the named public association of the described class, 
	 * no matter whether the association was defined by the class itself or by one of its 
	 * ancestor classes.
	 * 
	 * If neither the described class nor its ancestor classes define an association with 
	 * the given name, <code>undefined</code> is returned.
	 *  
	 * @param {string} sName name of the association
	 * @returns {Object} An info object describing the association or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 * @experimental Type, structure and behavior of the returned info object is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAssociation = function(sName) {
		if ( !this._bEnriched ) {
			this._enrichChildInfos();
		}
		var oAssoc = this._mAllAssociations[sName];
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return typeof oAssoc === 'object' ? oAssoc : undefined;
	};
	
	/**
	 * Returns a map of info objects for all public associations of the described class.
	 * Associations declared by ancestor classes are not included.
	 *
	 * The returned map keys the association info objects by their name. 
	 * In case of 0..1 associations this is the singular name, otherwise it is the plural name.
	 *
	 * @return {map} Map of association info objects keyed by association names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAssociations = function() {
		return this._mAssociations;
	};
	
	/**
	 * Returns a map of info objects for all public associations of the described class,
	 * including public associations form the ancestor classes.
	 *
	 * The returned map keys the association info objects by their name.
	 * In case of 0..1 associations this is the singular name, otherwise it is the plural name.
	 *
	 * @return {map} Map of association info objects keyed by association names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAllAssociations = function() {
		return this._mAllAssociations;
	};

	// ---- events ----------------------------------------------------------------------------
	
	/**
	 * Checks the existence of the given event by its name
	 * 
	 * @param {string} sName name of the event
	 * @return {boolean} true, if the event exists
	 * @public
	 */
	ManagedObjectMetadata.prototype.hasEvent = function(sName) {
		return !!this._mAllEvents[sName];
	};
	
	/**
	 * Returns an info object for the named public event of the described class, 
	 * no matter whether the event was defined by the class itself or by one of its 
	 * ancestor classes.
	 * 
	 * If neither the described class nor its ancestor classes define an event with the 
	 * given name, <code>undefined</code> is returned.
	 *  
	 * @param {string} sName name of the event
	 * @returns {Object} An info object describing the event or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 * @experimental Type, structure and behavior of the returned info object is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getEvent = function(sName) {
		if ( !this._bEnriched ) {
			this._enrichChildInfos();
		}
		var oEvent = this._mAllEvents[sName];
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return typeof oEvent === 'object' ? oEvent : undefined;
	};
	
	
	/**
	 * Returns a map of info objects for the public events of the described class.
	 * Events declared by ancestor classes are not included.
	 * 
	 * The returned map keys the event info objects by their name.
	 *
	 * @return {map} Map of event info objects keyed by event names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getEvents = function() {
		return this._mEvents;
	};
	
	/**
	 * Returns a map of info objects for all public events of the described class,
	 * including public events form the ancestor classes.
	 *
	 * The returned map keys the event info objects by their name.
	 *
	 * @return {map} Map of event info objects keyed by event names
	 * @public
	 * @experimental Type, structure and behavior of the returned info objects is not documented 
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects} 
	 *   in the constructor documentation of this class.
	 */
	ManagedObjectMetadata.prototype.getAllEvents = function() {
		return this._mAllEvents;
	};	

	/**
	 * Checks the existence of the given special setting.
	 * Special settings are settings that are accepted in the mSettings 
	 * object at construction time or in an {@link sap.ui.base.ManagedObject.applySettings} 
	 * call but that are neither properties, aggregations, associations nor events.
	 * 
	 * @param {string} sName name of the settings
	 * @return {boolean} true, if the special setting exists
	 * @private
	 * @experimental Since 1.27.0
	 */
	ManagedObjectMetadata.prototype.hasSpecialSetting = function (sName) {
		return !!this._mAllSpecialSettings[sName];
	};
	
	// ----------------------------------------------------------------------------------------
	
	/**
	 * Returns a map of default values for all properties declared by the
	 * described class and its ancestors, keyed by the property name.
	 *
	 * @return {map} Map of default values keyed by property names
	 * @public
	 */
	ManagedObjectMetadata.prototype.getPropertyDefaults = function() {
	
		var mDefaults = this._mDefaults,
			oType;
		if ( mDefaults ) {
			return mDefaults;
		}
	
		if ( this.getParent() instanceof ManagedObjectMetadata ) {
			mDefaults = jQuery.sap.newObject(this.getParent().getPropertyDefaults());
		} else {
			mDefaults = {};
		}
	
		for (var s in this._mProperties) {
			if ( this._mProperties[s].defaultValue !== null ) {
				mDefaults[s] = this._mProperties[s].defaultValue;
			} else {
				oType = DataType.getType(this._mProperties[s].type);
				if (oType instanceof DataType) {
					mDefaults[s] = oType.getDefaultValue();
				} else { // Enumeration
					for (var i in oType) {
						mDefaults[s] = oType[i];
						break;
					}
				}
			}
		}
		this._mDefaults = mDefaults;
		return mDefaults;
	};
	
	
	ManagedObjectMetadata.prototype.createPropertyBag = function() {
		if ( !this._fnPropertyBagFactory ) {
			this._fnPropertyBagFactory = jQuery.sap.factory(this.getPropertyDefaults());
		}
		return new (this._fnPropertyBagFactory)();
	};
	
	/**
	 * Helper method that enriches the (generated) information objects for children
	 * (e.g. properties, aggregations, ...) of this Element.
	 *
	 * Also ensures that the parent metadata is enriched.
	 *
	 * @private
	 */
	ManagedObjectMetadata.prototype._enrichChildInfos = function() {
	
		if ( this._bEnriched ) {
			return;
		}
	
		if ( this.getParent() instanceof ManagedObjectMetadata ) {
			this.getParent()._enrichChildInfos();
		}
	
		var m,sName,oInfo;

		function method(sPrefix, sName) {
			return sPrefix + sName.substring(0,1).toUpperCase() + sName.substring(1);
		}
	
		// adapt special settings
		m = this._mSpecialSettings;
		for (sName in m) {
			oInfo = m[sName];
			oInfo._sName = sName;
			oInfo._sUID = "special:" + sName;
			oInfo._oParent = this;
			oInfo._iKind = ManagedObjectMetadata.Kind.SPECIAL_SETTING;
		}

		// adapt properties
		m = this._mProperties;
		for (sName in m) {
			oInfo = m[sName];
			oInfo._sName = sName;
			oInfo._sUID = sName;
			oInfo._oParent = this;
			oInfo._iKind = ManagedObjectMetadata.Kind.PROPERTY;
			oInfo._sMutator = method("set", sName);
			oInfo._sGetter = method("get", sName);
		}
	
		// adapt aggregations
		m = this._mAggregations;
		for (sName in m) {
			oInfo = m[sName];
			oInfo._sName = sName;
			oInfo._sUID = "aggregation:" + sName;
			oInfo._oParent = this;
			oInfo._sDestructor = method("destroy", sName);
			oInfo._sGetter = method("get", sName);
			if ( oInfo.multiple ) {
				oInfo._iKind = ManagedObjectMetadata.Kind.MULTIPLE_AGGREGATION;
				oInfo._sMutator = method("add", oInfo.singularName);
				oInfo._sRemoveMutator = method("remove", oInfo.singularName);
				oInfo._sRemoveAllMutator = method("removeAll", sName);
			} else {
				oInfo._iKind = ManagedObjectMetadata.Kind.SINGLE_AGGREGATION;
				oInfo._sMutator = method("set", sName);
			}
		}
	
		// adapt associations
		m = this._mAssociations;
		for (sName in m) {
			oInfo = m[sName];
			oInfo._sName = sName;
			oInfo._sUID = "association:" + sName;
			oInfo._oParent = this;
			oInfo._sGetter = method("get", sName);
			if ( oInfo.multiple ) {
				oInfo._iKind = ManagedObjectMetadata.Kind.MULTIPLE_ASSOCIATION;
				oInfo._sMutator = method("add", oInfo.singularName);
			} else {
				oInfo._iKind = ManagedObjectMetadata.Kind.SINGLE_ASSOCIATION;
				oInfo._sMutator = method("set", sName);
			}
		}
	
		// adapt events
		m = this._mEvents;
		for (sName in m) {
			oInfo = m[sName];
			oInfo._sName = sName;
			oInfo._sUID = "event:" + sName;
			oInfo._oParent = this;
			oInfo._iKind = ManagedObjectMetadata.Kind.EVENT;
			oInfo._sMutator = method("attach", sName);
		}

		this._bEnriched = true;
	};
	
	/**
	 * Builds a "reflection like" map of setters/type infos keyed by the possible JSON names.
	 * Mainly used for the {@link sap.ui.core.Element.applySettings} method.
	 *
	 * @see sap.ui.core.Element.prototype.applySettings
	 * @private
	 */
	ManagedObjectMetadata.prototype.getJSONKeys = function() {
	
		if ( this._mJSONKeys ) {
			return this._mJSONKeys;
		}
	
		this._enrichChildInfos();
	
		var mJSONKeys = {};
		function addKeys(m) {
			var sName, oInfo;
			for (sName in m) {
				oInfo = m[sName];
				if ( !mJSONKeys[sName] || oInfo._iKind < mJSONKeys[sName]._iKind ) {
					mJSONKeys[sName] = oInfo;
				}
				mJSONKeys[oInfo._sUID] = oInfo;
			}
		}
	
		addKeys(this._mAllSpecialSettings);
		addKeys(this.getAllProperties());
		addKeys(this.getAllAggregations());
		addKeys(this.getAllAssociations());
		addKeys(this.getAllEvents());
	
		this._mJSONKeys = mJSONKeys;
		return mJSONKeys;
	};
	
	/**
	 * Filter out settings from the given map that are not described in the metadata.
	 * If null or undefined is given, null or undefined is returned.
	 * 
	 * @param {object} mSettings original filters or null
	 * @returns {object} filtered settings or null
	 * @private
	 * @since 1.27.0
	 */
	ManagedObjectMetadata.prototype.removeUnknownSettings = function(mSettings) {

		jQuery.sap.assert(mSettings == null || typeof mSettings === 'object', "mSettings must be null or an object");

		if ( mSettings == null ) {
			return mSettings;
		}
		
		var mValidKeys = this.getJSONKeys(),
			mResult = {},
			sName;
		
		for ( sName in  mSettings ) {
			if ( mValidKeys.hasOwnProperty(sName) ) {
				mResult[sName] = mSettings[sName];
			}
		}
		
		return mResult;
	};

	ManagedObjectMetadata.prototype.generateAccessors = function() {
	
		var that = this;
		var proto = this.getClass().prototype;
		function cap(sName) {
			return sName.slice(0,1).toUpperCase() + sName.slice(1);
		}
		
		function method(sPrefix, sName, fn, bDeprecated) {
			var sName = sPrefix + sName.substring(0,1).toUpperCase() + sName.substring(1);
			if ( !proto[sName] ) {
				proto[sName] = bDeprecated ? function() {
					jQuery.sap.log.warning("Usage of deprecated feature: " + that.getName() + "." + sName);
					return fn.apply(this, arguments);
				} : fn;
				that._aPublicMethods.push(sName);
			}
		}
	
		function method2(sName, fn, bDeprecated) {
			if ( !proto[sName] ) {
				proto[sName] = bDeprecated ? function() {
					jQuery.sap.log.warning("Usage of deprecated feature: " + that.getName() + "." + sName);
					return fn.apply(this, arguments);
				} : fn;
				that._aPublicMethods.push(sName);
			}
		}
	
		jQuery.each(this._mProperties, function(n,info) {
			var N = cap(n);
			method2("get" + N, function() { return this.getProperty(n); });
			method2("set" + N, function(v) { this.setProperty(n,v); return this; }, info.deprecated);
			if ( info.bindable ) {
				method2("bind" + N, function(p,fn,m) { this.bindProperty(n,p,fn,m); return this; }, info.deprecated);
				method2("unbind" + N, function(p) { this.unbindProperty(n,p); return this; });
			}
		});
		jQuery.each(this._mAggregations, function(n,info) {
			if ( !info.multiple ) {
				method("get", n, function() { return this.getAggregation(n); });
				method("set", n, function(v) { this.setAggregation(n,v); return this; }, info.deprecated);
			} else {
				var n1 = info.singularName;
				method("get", n, function() { return this.getAggregation(n,[]); });
				method("add", n1, function(a) { this.addAggregation(n,a); return this; }, info.deprecated);
				method("insert", n1, function(i,a) { this.insertAggregation(n,i,a); return this; }, info.deprecated);
				method("remove", n1, function(a) { return this.removeAggregation(n,a); });
				method("removeAll", n, function() { return this.removeAllAggregation(n); });
				method("indexOf", n1, function(a) { return this.indexOfAggregation(n,a); });
			}
			method("destroy", n, function() { this.destroyAggregation(n); return this; });
			if ( info.bindable ) {
				method("bind", n, function(p,t,s,f) { this.bindAggregation(n,p,t,s,f); return this; }, info.deprecated);
				method("unbind", n, function(p) { this.unbindAggregation(n,p); return this; });
			}
		});
		jQuery.each(this._mAssociations, function(n,info) {
			if ( !info.multiple ) {
				method("get", n, function() { return this.getAssociation(n); });
				method("set", n, function(v) { this.setAssociation(n,v); return this; }, info.deprecated);
			} else {
				var n1 = info.singularName;
				method("get", n, function() { return this.getAssociation(n,[]); });
				method("add", n1, function(a) { this.addAssociation(n,a); return this; }, info.deprecated);
				method("remove", n1, function(a) { return this.removeAssociation(n,a); });
				method("removeAll", n, function() { return this.removeAllAssociation(n); });
			}
		});
		jQuery.each(this._mEvents, function(n,info) {
			method("attach", n, function(d,f,o) { this.attachEvent(n,d,f,o); return this; }, info.deprecated);
			method("detach", n, function(f,o) { this.detachEvent(n,f,o); return this; });
			var n1 = !!info.allowPreventDefault;
			var n2 = !!info.enableEventBubbling;
			method("fire", n, function(p) { return this.fireEvent(n,p, n1, n2); });
		});
	
	};
	
	(function() {
	
		/**
		 * Usage counters for the different UID tokens
		 */
		var mUIDCounts = {};
	
		function uid(sId) {
			jQuery.sap.assert(!/[0-9]+$/.exec(sId), "AutoId Prefixes must not end with numbers");
	
			sId = sap.ui.getCore().getConfiguration().getUIDPrefix() + sId;
	
			// initialize counter
			mUIDCounts[sId] = mUIDCounts[sId] || 0;
	
			// combine prefix + counter
			// concatenating sId and a counter is only safe because we don't allow trailing numbers in sId!
			return (sId + mUIDCounts[sId]++);
		}
	
		/**
		 * Calculates a new id based on a prefix.
		 *
		 * @return {string} A (hopefully unique) control id
		 * @public
		 * @function
		 */
		ManagedObjectMetadata.uid = uid;
	
		/**
		 * Calculates a new id for an instance of this class.
		 *
		 * Note that the calculated short name part is usually not unique across
		 * all classes, but doesn't have to be. It might even be empty when the
		 * class name consists of invalid characters only.
		 *
		 * @return {string} A (hopefully unique) control id
		 * @public
		 */
		ManagedObjectMetadata.prototype.uid = function() {
	
			var sId = this._sUIDToken;
			if ( typeof sId !== "string" ) {
				// start with qualified class name
				sId  = this.getName();
				// reduce to unqualified name
				sId = sId.slice(sId.lastIndexOf('.') + 1);
				// reduce a camel case, multi word name to the last word
				sId = sId.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").slice(-1)[0];
				// remove unwanted chars (and no trailing digits!) and convert to lower case
				sId = this._sUIDToken = sId.replace(/([^A-Za-z0-9-_.:])|([0-9]+$)/g,"").toLowerCase();
			}
	
			return uid(sId);
		};
	
	}());

	return ManagedObjectMetadata;

}, /* bExport= */ true);
