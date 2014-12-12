/*!
 * ${copyright}
 */

// Provides the base class for all objects with managed properties and aggregations.
sap.ui.define(['jquery.sap.global', './BindingParser', './DataType', './EventProvider', './ManagedObjectMetadata', 'sap/ui/model/CompositeBinding', 'sap/ui/model/ContextBinding', 'sap/ui/model/Model', 'sap/ui/model/Type', 'jquery.sap.act', 'jquery.sap.script', 'jquery.sap.strings'],
	function(jQuery, BindingParser, DataType, EventProvider, ManagedObjectMetadata, CompositeBinding, ContextBinding, Model, Type/* , jQuerySap2, jQuerySap, jQuerySap1 */) {
	"use strict";



	/**
	 * Constructs and initializes a managed object with the given <code>sId</code> and settings.
	 *
	 * If the optional <code>mSettings</code> are given, they must be a simple object
	 * that defines values for properties, aggregations, associations or events keyed by their name.
	 *
	 * <b>Valid Names:</b>
	 *
	 * The property (key) names supported in the object literal are exactly the (case sensitive)
	 * names documented in the JSDoc for the properties, aggregations, associations and events
	 * of the managed object and its base classes. Note that for  0..n aggregations and associations this
	 * usually is the plural name, whereas it is the singular name in case of 0..1 relations.
	 *
	 * If a key name is ambiguous for a specific managed object class (e.g. a property has the same
	 * name as an event), then this method prefers property, aggregation, association and
	 * event in that order. To resolve such ambiguities, the keys can be prefixed with
	 * <code>aggregation:</code>, <code>association:</code> or <code>event:</code>.
	 * In that case the keys must be quoted due to the ':'.
	 *
	 * Each subclass should document the set of supported names in its constructor documentation.
	 *
	 * <b>Valid Values:</b>
	 *
	 * <ul>
	 * <li>for normal properties, the value has to be of the correct simple type (no type conversion occurs)
	 * <li>for 0..1 aggregations, the value has to be an instance of the aggregated type
	 * <li>for 0..n aggregations, the value has to be an array of instances of the aggregated type
	 * <li>for 0..1 associations, an instance of the associated type or an id (string) is accepted
	 * <li>0..n associations are not supported yet
	 * <li>for events either a function (event handler) is accepted or an array of length 2
	 *     where the first element is a function and the 2nd element is an object to invoke the method on.
	 * </ul>
	 *
	 * @param {string} [sId] id for the new managed object; generated automatically if no non-empty id is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] optional map/JSON-object with initial property values, aggregated objects etc. for the new object
	 * @param {object} [oScope] scope object for resolving string based type and formatter references in bindings
	 *
	 * @class Base Class for managed objects.
	 * @extends sap.ui.base.EventProvider
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.base.ManagedObject
	 * @experimental Since 1.11.2. ManagedObject as such is public and usable. Only the support for the optional parameter
	 * oScope in the constructor is still experimental and might change in future versions. Applications should not rely on it.
	 */
	var ManagedObject = EventProvider.extend("sap.ui.base.ManagedObject", {

		metadata : {
		  "abstract" : true,
		  publicMethods : [ "getId", "getMetadata", "getModel", "setModel", "hasModel", "bindProperty", "unbindProperty", "bindAggregation", "unbindAggregation", "bindObject", "unbindObject", "getObjectBinding"],
		  library : "sap.ui.core", // UI Library that contains this class
		  properties : {
		  },
		  aggregations : {
		  },
		  associations : {},
		  events : {
			  "validationSuccess" : { enableEventBubbling : true },
			  "validationError" : { enableEventBubbling : true },
			  "parseError" : { enableEventBubbling : true },
			  "formatError" : { enableEventBubbling : true }
		  }
		},

		constructor : function(sId, mSettings, oScope) {

			EventProvider.apply(this); // no use to pass our arguments
			if (typeof (sId) != "string" && arguments.length > 0) {
				// shift arguments in case sId was missing, but mSettings was given
				oScope = mSettings;
				mSettings = sId;
				if (mSettings && mSettings.id) {
					sId = mSettings["id"];
				} else {
					sId = null;
				}
			}

			if (!sId) {
				sId = this.getMetadata().uid() || jQuery.sap.uid();
			} else {
				var preprocessor = ManagedObject._fnIdPreprocessor;
				sId = (preprocessor ? preprocessor.call(this, sId) : sId);
				var oType = DataType.getType("sap.ui.core.ID");
				if (!oType.isValid(sId)) {
					throw new Error("\"" + sId + "\" is not a valid ID.");
				}
			}
			this.sId = sId;

			// managed object interface
			// create an empty property bag that uses a map of defaultValues as its prototype
			this.mProperties = this.getMetadata().createPropertyBag();
			this.mAggregations = {};
			this.mAssociations = {};
			this.mMethods = {};

			// private properties
			this.oParent = null;

			this.aDelegates = [];
			this.aBeforeDelegates = [];
			this.iSuppressInvalidate = 0;
			this.oPropagatedProperties = {oModels:{}, oBindingContexts:{}};
			this.mSkipPropagation = {};

			// data binding
			this.oModels = {};
			this.oBindingContexts = {};
			this.mBindingInfos = {};
			this.sBindingPath = null;
			this.mBindingParameters = null;
			this.mBoundObjects = {};

			// apply the owner id if defined
			this._sOwnerId = ManagedObject._sOwnerId;

			// make sure that the object is registered before initializing
			// and to deregister the object in case of errors
			try {

				// registers the object in the Core
				if (this.register) {
					this.register();
				}

				// TODO: generic concept for init hooks?
				if ( this._initCompositeSupport ) {
					this._initCompositeSupport(mSettings);
				}

				// Call init method here instead of specific Controls constructor.
				if (this.init) {
					this.init();
				}

				// apply the settings
				this.applySettings(mSettings, oScope);

			} catch (ex) {

				// unregisters the object in the Core
				if (this.deregister) {
					this.deregister();
				}

				// forward the exception
				throw ex;

			}

		}

	}, /* Metadata constructor */ ManagedObjectMetadata);



	/**
	 * Creates a new ManagedObject from the given data.
	 *
	 * If vData is a managed object already, that object is returned.
	 * If vData is an object (literal), then a new object is created with vData as settings.
	 * The type of the object is either determined by a "Type" entry in the vData or
	 * by a type information in the oKeyInfo object
	 * @param {sap.ui.base.ManagedObject|object} vData the data to create the object from
	 * @param {object} oKeyInfo
	 * @public
	 * @static
	 */
	ManagedObject.create = function(vData, oKeyInfo) {
		if ( !vData || vData instanceof ManagedObject || typeof vData !== "object" || vData instanceof String) {
			return vData;
		}

		function getClass(vType) {
			if ( typeof vType === "function" ) {
				return vType;
			}
			if (typeof vType === "string" ) {
				return jQuery.sap.getObject(vType);
			}
		}

		var fnClass = getClass(vData.Type) || getClass(oKeyInfo && oKeyInfo.type);
		if ( typeof fnClass === "function" ) {
			return new fnClass(vData);
		}

		// we don't know how to create the ManagedObject from vData, so fail
		// extension points could be integrated here
		var message = "Don't know how to create a ManagedObject from " + vData + " (" + (typeof vData) + ")";
		jQuery.sap.log.fatal(message);
		throw new Error(message);
	};

	/**
	 * A global preprocessor for the ID of a ManagedObject (used internally).
	 * If set, this function will be called before the ID is applied to any ManagedObject.
	 * If the original ID was empty, the hook will not be called (to be discussed).
	 *
	 * The expected signature is <code>function(sId)</code>, and <code>this</code> will
	 * be the current ManagedObject.
	 *
	 * @return new ID of the ManagedObject
	 * @type function
	 * @private
	 */
	ManagedObject._fnIdPreprocessor = null;

	/**
	 * A global preprocessor for the settings of a ManagedObject (used internally).
	 * If set, this function will be called before the settings are applied to any ManagedObject.
	 * If the original settings are empty, the hook will not be called (to be discussed).
	 *
	 * The expected signature is <code>function(mSettings)</code>, and <code>this</code> will
	 * be the current ManagedObject.
	 *
	 * @type function
	 * @private
	 */
	ManagedObject._fnSettingsPreprocessor = null;

	ManagedObject.runWithPreprocessors = function(fn, oPreprocessors) {
		jQuery.sap.assert(typeof fn === "function", "fn must be a function");
		jQuery.sap.assert(!oPreprocessors || typeof oPreprocessors === "object", "oPreprocessors must be an object");

		var oOldPreprocessors = { id : this._fnIdPreprocessor, settings : this._fnSettingsPreprocessor };
		oPreprocessors = oPreprocessors || {};

		this._fnIdPreprocessor = oPreprocessors.id;
		this._fnSettingsPreprocessor = oPreprocessors.settings;

		try {
			var result = fn.call();
			this._fnIdPreprocessor = oOldPreprocessors.id;
			this._fnSettingsPreprocessor = oOldPreprocessors.settings;
			return result;
		} catch (e) {
			this._fnIdPreprocessor = oOldPreprocessors.id;
			this._fnSettingsPreprocessor = oOldPreprocessors.settings;
			throw e;
		}

	};

	/*
	 * Returns the Id of the Component in whose context the given ManagedObject has been created.
	 * 
	 * Might return <code>undefined</code> or <code>null</code> when no owner
	 * has been recorded for the given object. See {@link sap.ui.core.Component.getOwnerIdFor Component.getOwnerIdFor} 
	 * for detailed constraints.
	 * 
	 * @deprecated Since 1.25.1. Use sap.ui.core.Component.getOwnerIdFor or sap.ui.core.Component.getOwnerComponentFor instead.
	 */
	ManagedObject.getOwnerIdFor = function(oObject) {
		jQuery.sap.log.error("[Deprecated] The private method sap.ui.base.ManagedObject.getOwnerIdFor must no longer be used. Use the public sap.ui.core.Component.getOwnerForId instead.");
		return oObject && oObject._sOwnerId;
	};

	/*
	 * Redirect to new functionality
	 * @deprecated Since 1.25.1. Use sap.ui.core.Component.runAsOwner instead.
	 */
	ManagedObject.runWithOwner = function(fn, oOwner) {
		jQuery.sap.log.error("[Deprecated] The private method sap.ui.base.ManagedObject.runWithOwner must no longer be used. Use the public sap.ui.core.Component.runAsOwner instead.");
		if ( oOwner && typeof oOwner.runAsOwner === "function" ) {
			oOwner.runAsOwner(fn);
		} else {
			throw new Error("trying to execute a function with a non-suitable owner " + oOwner + ". See the deprecation hint in the console.");
		}
	};

	/**
	 * Sets all the properties, aggregations, associations and event handlers as given in
	 * the object literal <code>mSettings</code>. If a property, aggregation, etc.
	 * is not listed in <code>mSettings</code>, then its value is not changed by this method.
	 *
	 * For properties and 0..1 aggregations/associations, any given setting overwrites
	 * the current value. For 0..n aggregations, the given values are appended; event
	 * listeners are registered in addition to existing ones.
	 *
	 * For the possible keys and values in <code>mSettings</code> see the general
	 * documentation in {@link sap.ui.base.ManagedObject} or the specific documentation
	 * of the constructor of the concrete managed object class.
	 *
	 * @param {object} mSettings the settings to apply to this managed object
	 * @param {object} [oScope] Scope object to resolve types and formatters
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @public
	 * @experimental Since 1.11.2 support for the scope object for resolving string based type
	 * and formatter references in bindings is still experimental
	 */
	ManagedObject.prototype.applySettings = function(mSettings, oScope) {

		// PERFOPT: don't retrieve (expensive) JSONKeys if no settings are given
		if ( !mSettings || jQuery.isEmptyObject(mSettings) ) {
			return this;
		}

		var oMetadata = this.getMetadata(),
			mValidKeys = oMetadata.getJSONKeys(),
			makeObject = ManagedObject.create,
			preprocessor = ManagedObject._fnSettingsPreprocessor,
			sKey, oValue, oKeyInfo;

		var that = this;
		// helper method for array handling when adding elements to aggregation, e.g. in case of content from an extension point
		var flattenArrayOrAddAggregation = function (oElement, oKeyInfo){
			if (jQuery.isArray(oElement)){
				for (var i = 0, len = oElement.length; i < len; i++){
					flattenArrayOrAddAggregation(oElement[i], oKeyInfo);
				}
			} else {
				that[oKeyInfo._sMutator](makeObject(oElement, oKeyInfo));
			}
		};

		// call the preprocessor if it has been defined
		preprocessor && preprocessor.call(this, mSettings); // TODO: decide whether to call for empty settings as well?

		// process models
		if ( mSettings.models ) {
			if ( typeof mSettings.models !== "object" ) {
				throw new Error("models must be a simple object");
			}
			if ( mSettings.models instanceof Model) {
				this.setModel(mSettings.models);
			} else {
				for (sKey in mSettings.models ) {
					this.setModel(mSettings.models[sKey], sKey === "undefined" ? undefined : sKey);
				}
			}
			delete mSettings.models;
		}
		//process BindingContext
		if ( mSettings.bindingContexts ) {
			if ( typeof mSettings.bindingContexts !== "object" ) {
				throw new Error("bindingContexts must be a simple object");
			}
			if ( mSettings.bindingContexts instanceof sap.ui.model.Context) {
				this.setBindingContext(mSettings.bindingContexts);
			} else {
				for (sKey in mSettings.bindingContexts ) {
					this.setBindingContext(mSettings.bindingContexts[sKey], sKey === "undefined" ? undefined : sKey);
				}
			}
			delete mSettings.bindingContexts;
		}
		//process object bindings
		if ( mSettings.objectBindings ) {
			if ( typeof mSettings.objectBindings !== "string" && typeof mSettings.objectBindings !== "object" ) {
				throw new Error("binding must be a string or simple object");
			}
			if ( typeof mSettings.objectBindings === "string" || mSettings.objectBindings.path ) { // excludes "path" as model name
				this.bindObject(mSettings.objectBindings);
			} else {
				for (var sKey in mSettings.objectBindings ) {
					mSettings.objectBindings.model = sKey;
					this.bindObject(mSettings.objectBindings[sKey]);
				}
			}
			delete mSettings.objectBindings;
		}

		// process all settings
		// process settings
		for (sKey in mSettings) {
			// get info object for the key
			if ( (oKeyInfo = mValidKeys[sKey]) !== undefined ) {
				oValue = mSettings[sKey];
				var oBindingInfo;
				switch (oKeyInfo._iKind) {
				case 0: // PROPERTY
					oBindingInfo = this.extractBindingInfo(oValue, oScope);
					if (oBindingInfo && typeof oBindingInfo === "object") {
						this.bindProperty(sKey, oBindingInfo);
					} else {
						this[oKeyInfo._sMutator](oBindingInfo || oValue);
					}
					break;
				case 1: // SINGLE_AGGREGATION
					oBindingInfo = oKeyInfo.altTypes && this.extractBindingInfo(oValue, oScope);
					if ( oBindingInfo && typeof oBindingInfo === "object" ) {
						this.bindProperty(sKey, oBindingInfo);
					} else {
						if (jQuery.isArray(oValue)){
							// assumption: we have an extensionPoint here which is always an array, even if it contains a single control
							if (oValue.length > 1){
								jQuery.sap.log.error("Tried to add an array of controls to a single aggregation");
							}
							oValue = oValue[0];
						}
						this[oKeyInfo._sMutator](makeObject(oBindingInfo || oValue, oKeyInfo));
					}
					break;
				case 2: // MULTIPLE_AGGREGATION
					oBindingInfo = this.extractBindingInfo(oValue, oScope);
					if (oBindingInfo && typeof oBindingInfo === "object" ) {
						this.bindAggregation(sKey, oBindingInfo);
					} else {
						oValue = oBindingInfo || oValue; // could be an unescaped string if altTypes contains 'string'
						if ( oValue && !jQuery.isArray(oValue) ) {
							oValue = [oValue];
						}
						if ( oValue ) {
							// check if there is an array within the oValue array - could be e.g. in case of content coming from an extensionpoint
							flattenArrayOrAddAggregation(oValue, oKeyInfo);
						}
					}
					break;
				case 3: // SINGLE_ASSOCIATION
					this[oKeyInfo._sMutator](oValue);
					break;
				case 4: // MULTIPLE_ASSOCIATION
					if ( oValue && !jQuery.isArray(oValue) ) {
						oValue = [oValue];
					}
					if ( oValue ) {
						for (var i = 0,l = oValue.length; i < l; i++) {
							this[oKeyInfo._sMutator](oValue[i]);
						}
					}
					break;
				case 5: // EVENT
					if ( typeof oValue == "function" ) {
						this[oKeyInfo._sMutator](oValue);
					} else {
						this[oKeyInfo._sMutator](oValue[0], oValue[1], oValue[2]);
					}
						//this[oKeyInfo._sMutator].apply(this, oValue); // could be replacement for line before
					break;
				default:
					break;
				}
			}
		}

		return this;
	};

	/**
	 * Returns a simple string representation of this managed object.
	 *
	 * Mainly useful for tracing purposes.
	 * @public
	 * @return {string} a string description of this managed object
	 */
	ManagedObject.prototype.toString = function() {
		return "ManagedObject " + this.getMetadata().getName() + "#" + this.getId();
	};

	/**
	 * Returns the object's Id.
	 *
	 * @return {string} the objects's Id.
	 * @public
	 */
	ManagedObject.prototype.getId = function() {
		return this.sId;
	};


	/**
	 * Sets a new value for the given property <code>sPropertyName</code> and marks
	 * this object as changed. If the given <code>oValue</code> equals the
	 * current value, nothing happens.
	 *
	 * @param {string}  sPropertyName name of the property to set
	 * @param {any}     oValue value to set the property to
	 * @param {boolean} [bSuppressInvalidate] if true, the managed is not marked as changed
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * TODO better name bSuppressInvalidate positive, e.g. "bStayValid"
	 * @protected
	 */
	ManagedObject.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		// check for a value change
		var oOldValue = this.mProperties[sPropertyName];

		// value validation
		oValue = this.validateProperty(sPropertyName, oValue);

		if (jQuery.sap.equal(oOldValue, oValue)) {
			return this;
		} // no change

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			//Refresh only for property changes with suppressed invalidation (others lead to rerendering and refresh is handled there)
			jQuery.sap.act.refresh();
			this.iSuppressInvalidate++;
		}

		// change the property (and invalidate if the rendering should be updated)
		this.mProperties[sPropertyName] = oValue;
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// check whether property is bound and update model in case of two way binding
		this.updateModelProperty(sPropertyName, oValue, oOldValue);

		// prototype for generic property change events
		// TODO: THINK ABOUT CONFIGURATION TO ENABLE THIS
		EventProvider.prototype.fireEvent.apply(this, ["_change", {
			"id": this.getId(),
			"name": sPropertyName,
			"oldValue": oOldValue,
			"newValue": oValue
		}]);

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Returns the value for the property with the given <code>sPropertyName</code>
	 *
	 * @param {string} sPropertyName the name of the property
	 * @type any
	 * @return the value of the property
	 * @protected
	 */
	ManagedObject.prototype.getProperty = function(sPropertyName) {
		var oValue = this.mProperties[sPropertyName],
			oMetadata = this.getMetadata(),
			oProperty = oMetadata.getAllProperties()[sPropertyName],
			oType;

		if (!oProperty) {
			throw new Error("Property \"" + sPropertyName + "\" does not exist in " + this);
		}

		oType = DataType.getType(oProperty.type);

		// If property has an array type, clone the array to avoid modification of original data
		if (oType instanceof DataType && oType.isArrayType() && jQuery.isArray(oValue)) {
			oValue = oValue.slice(0);
		}

		// If proprerty is of type String instead of string, convert with valueOf()
		if (oValue instanceof String) {
			oValue = oValue.valueOf();
		}

		return oValue;
	};

	/**
	 * Checks whether the given value is of the proper type for the given property name. In case null or undefined is
	 * passed, the default value for this property is returned.
	 *
	 * @param {string} sPropertyName the name of the property
	 * @param {any} oValue the value
	 * @return {any} the passed value or the property's default value if null or undefined was passed
	 * @throws Error if no property with the given name is found or the given value does not fit to the property type
	 * @protected
	 */
	ManagedObject.prototype.validateProperty = function(sPropertyName, oValue) {
		var oMetadata = this.getMetadata(),
			oProperty = oMetadata.getAllProperties()[sPropertyName],
			oType;

		if (!oProperty) {
			throw new Error("Property \"" + sPropertyName + "\" does not exist in " + this);
		}

		oType = DataType.getType(oProperty.type);

		// If property has an array type, clone the array to avoid modification of original data
		if (oType instanceof DataType && oType.isArrayType() && jQuery.isArray(oValue)) {
			oValue = oValue.slice(0);
		}

		// In case null is passed as the value return the default value, either from the property or from the type
		if (oValue === null || oValue === undefined) {
			if (oProperty.defaultValue !== null) {
				oValue = oProperty.defaultValue;
			} else {
				oValue = oType.getDefaultValue();
			}
		} else if (oType instanceof DataType) {
			// Implicit casting for string only, other types are causing errors

			if (oType.getName() == "string") {
				if (!(typeof oValue == "string" || oValue instanceof String)) {
					oValue = "" + oValue;
				}
			} else if (oType.getName() == "string[]") {
				// For compatibility convert string values to array with single entry
				if (typeof oValue == "string") {
					oValue = [oValue];
				}
				if (!jQuery.isArray(oValue)) {
					throw new Error("\"" + oValue + "\" is of type " + typeof oValue + ", expected string[]" +
							" for property \"" + sPropertyName + "\" of " + this);
				}
				for (var i = 0; i < oValue.length; i++) {
					if (!typeof oValue[i] == "string") {
						oValue[i] = "" + oValue[i];
					}
				}
			} else if (!oType.isValid(oValue)) {
				throw new Error("\"" + oValue + "\" is of type " + typeof oValue + ", expected " +
						oType.getName() + " for property \"" + sPropertyName + "\" of " + this);
			}
		} else if (!(oValue in oType)) { // Enumeration
			throw new Error("\"" + oValue + "\" is not a valid entry of the enumeration for property \"" + sPropertyName + "\" of " + this);
		}

		// Normalize the value (if a normalizer was set using the setNormalizer method on the type)
		if (oType && oType.normalize && typeof oType.normalize === "function") {
			oValue = oType.normalize(oValue);
		}

		return oValue;
	};

	/**
	 * Returns the origin info on the property value of the given property name
	 *
	 * @param {string} sPropertyName the name of the property
	 * @return {object} a map of properties describing the origin of this property value or null
	 * @public
	 */
	ManagedObject.prototype.getOriginInfo = function(sPropertyName) {
		var oValue = this.mProperties[sPropertyName];
		if (!(oValue instanceof String && oValue.originInfo)) {
			return null;
		}
		return oValue.originInfo;
	};


	// ######################################################################################################
	// Associations
	// ######################################################################################################

	/**
	 * Sets an association for the managed object
	 *
	 * @param {string}
	 *            sAssociationName name of the association
	 * @param {string | sap.ui.base.ManagedObject}
	 *            sId the ID of the managed object that is set as an association, or the managed object itself or null
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, the managed objects invalidate method is not called
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.setAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sId instanceof ManagedObject) {
			sId = sId.getId();
		} else if (sId != null && typeof sId !== "string") {
			jQuery.sap.assert(false, "setAssociation(): sId must be a string, an instance of sap.ui.base.ManagedObject or null");
			return this;
		}

		if (this.mAssociations[sAssociationName] === sId) {
			return this;
		} // no change

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		this.mAssociations[sAssociationName] = sId;

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Returns an association of the managed object with a given sAssociationName
	 *
	 * @param {string} sAssociationName the name of the association
	 * @param {object}
	 *			  oDefaultForCreation the object that is used in case the current aggregation is empty (only null or empty array allowed)
	 * @return {string | string[]} the ID of the associated managed object or an array of such IDs; may be null if the association has not been populated
	 * @protected
	 */
	ManagedObject.prototype.getAssociation = function(sAssociationName, oDefaultForCreation) {
		var result = this.mAssociations[sAssociationName];

		if (!result) {
			result = this.mAssociations[sAssociationName] = oDefaultForCreation || null;
		} else {
			if (typeof result.length === 'number' && !(result.propertyIsEnumerable('length')) ) {
				// Return a copy of the array instead of the array itself as reference!!
				return result.slice();
			}
			// simple type or ManagedObject
			return result;
		}

		return result;
	};

	/**
	 * Adds some entity with the ID <code>sId</code> to the association identified by <code>sAssociationName</code>.
	 *
	 * @param {string}
	 *            sAssociationName the string identifying the association the object should be added to.
	 * @param {string | sap.ui.base.ManagedObject}
	 *            sId the ID of the managed object to add; if empty, nothing is added; if a <code>sap.ui.base.ManagedObject</code> is given, its ID is added
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this managed object as well as the newly associated object are not marked as changed
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.addAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sId instanceof ManagedObject) {
			sId = sId.getId();
		} else if (typeof sId !== "string") {
		  // TODO what about empty string?
		jQuery.sap.assert(false, "addAssociation(): sId must be a string or an instance of sap.ui.base.ManagedObject");
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		var aIds = this.mAssociations[sAssociationName];
		if (!aIds) {
			aIds = this.mAssociations[sAssociationName] = [sId];
		} else {
			aIds.push(sId);
		}

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Removes a ManagedObject from the association named <code>sAssociationName</code>.
	 *
	 * @param {string}
	 *            sAssociationName the string identifying the association the ManagedObject should be removed from.
	 * @param {int | string | sap.ui.base.ManagedObject}
	 *            vObject the position or ID of the ManagedObject to remove or the ManagedObject itself; if <code>vObject</code> is invalid input,
	 *            a negative value or a value greater or equal than the current size of the association, nothing is removed
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, the managed object is not marked as changed
	 * @return the ID of the removed ManagedObject or null
	 * @protected
	 */
	ManagedObject.prototype.removeAssociation = function(sAssociationName, vObject, bSuppressInvalidate) {
		var aIds = this.mAssociations[sAssociationName];
		var sId = null;

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (typeof (vObject) == "object" && vObject.getId) { // object itself is given
			vObject = vObject.getId();
		}

		if (typeof (vObject) == "string") { // ID of the object is given or has just been retrieved
			for (var i = 0; i < aIds.length; i++) {
				if (aIds[i] == vObject) {
					vObject = i;
					break;
				}
			}
		}

		if (typeof (vObject) == "number") { // "object" is the index now
			if (vObject < 0 || vObject >= aIds.length) {
				jQuery.sap.log.warning("ManagedObject.removeAssociation called with invalid index: " + sAssociationName + ", " + vObject);
			} else {
				sId = aIds[vObject];
				aIds.splice(vObject, 1);
				if (!this.isInvalidateSuppressed()) {
					this.invalidate();
				}
			}
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return sId;
	};

	/**
	 * Removes all the objects in the 0..n-association named <code>sAssociationName</code> (and returns them in an array).<br/>
	 *
	 * @param {string}
	 *            sAssociationName the name of the association
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @type Array
	 * @return an array with the IDs of the removed objects (might be empty)
	 * @protected
	 */
	ManagedObject.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate){
		var aIds = this.mAssociations[sAssociationName];
		if (!aIds)	{
			return [];
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		delete this.mAssociations[sAssociationName];
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return aIds;
	};

	// ######################################################################################################
	// End of Associations
	// ######################################################################################################


	// ######################################################################################################
	// Aggregations
	// ######################################################################################################

	/**
	 * Checks whether the given value is of the proper type for the given aggregation name.
	 *
	 * @param {string} sAggregationName the name of the aggregation
	 * @param {sap.ui.base.ManagedObject|any} oObject the aggregated object or a primitive value
	 * @param {boolean} bMultiple whether the aggregation must have cardinality 0..n
	 * @return {sap.ui.base.ManagedObject|any} the passed object
	 * @throws Error if no aggregation with the given name is found or the given value does not fit to the aggregation type
	 * @protected
	 */
	ManagedObject.prototype.validateAggregation = function(sAggregationName, oObject, bMultiple) {
		var oMetadata = this.getMetadata(),
			oAggregation = oMetadata.getManagedAggregation(sAggregationName), // public or private
			aAltTypes,
			oType,
			i,
			msg;

		// undeclared aggregation
		if (!oAggregation) {
			if (sAggregationName && oMetadata._mHiddenAggregations && oMetadata._mHiddenAggregations[sAggregationName]) {
				oAggregation = oMetadata._mHiddenAggregations[sAggregationName];
				jQuery.sap.log.error("Support for '_mHiddenAggregations' is about to be removed (with 1.12 latest). Hidden aggregations like '" + oMetadata.getName() + "." + sAggregationName + "' instead can be declared like normal aggregations but with visibility:'hidden'.");
			} else {
				msg = "Aggregation \"" + sAggregationName + "\" does not exist in " + this;

				if ( /^sap\.(ui\.core|ui\.commons|ui\.table|ui\.ux3|m|makit|viz|uiext\.inbox)$/.test(oMetadata.getLibraryName() || "") ) {
					throw new Error(msg);
				} else {
					// TODO throw for any lib as soon as "hidden" aggregations are a public feature.
					// Otherwise, composite controls currently would have no legal way to react
					jQuery.sap.log.error("Support for undeclared aggregations is about to be removed (with 1.12 latest). Hidden aggregations like '" + oMetadata.getName() + "." + sAggregationName + "' can be declared like normal aggregations but with visibility:'hidden'.");
					jQuery.sap.assert(false, msg);
					return oObject;
				}
			}
		}

		if (oAggregation.multiple !== bMultiple ) {
			throw new Error("Aggregation '" + sAggregationName + "' of " + this + " used with wrong cardinality (declared as " + (oAggregation.multiple ? "0..n" : "0..1") + ")");
		}

		//Null is a valid value for 0..1 aggregations
		if (!oAggregation.multiple && !oObject) {
			return oObject;
		}

		oType = jQuery.sap.getObject(oAggregation.type);
		// class types
		if ( typeof oType === "function" && oObject instanceof oType ) {
			return oObject;
		}
		// interfaces
		if ( oObject && oObject.getMetadata && oObject.getMetadata().isInstanceOf(oAggregation.type) ) {
			return oObject;
		}
		// alternative types
		aAltTypes = oAggregation.altTypes;
		if ( aAltTypes && aAltTypes.length ) {
			// for primitive types, null or undefined is valid as well
			if ( oObject == null ) {
				return oObject;
			}
			for (i = 0; i < aAltTypes.length; i++) {
				oType = DataType.getType(aAltTypes[i]);
				if (oType instanceof DataType) {
					if (oType.isValid(oObject)) {
						return oObject;
					}
				} else if (oObject in oType) { // Enumeration
					return oObject;
				}
			}
		}

		// TODO make this stronger again (e.g. for FormattedText)
		msg = "\"" + oObject + "\" is not valid for aggregation \"" + sAggregationName + "\" of " + this;
		if ( DataType.isInterfaceType(oAggregation.type) ) {
			jQuery.sap.assert(false, msg);
			return oObject;
		} else {
		  throw new Error(msg);
		}
	};

	/**
	 * Sets an aggregation for the managed object
	 *
	 * @param {string}
	 *            sAggregationName name of the aggregation
	 * @param {object}
	 *            oObject the managed object that is set as an aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		var oOldChild = this.mAggregations[sAggregationName];
		if (oOldChild === oObject) {
			return this;
		} // no change
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ false);

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (oOldChild instanceof ManagedObject) { // remove old child
			oOldChild.setParent(null);
		}
		this.mAggregations[sAggregationName] = oObject;
		if (oObject instanceof ManagedObject) { // adopt new child
			oObject.setParent(this, sAggregationName, bSuppressInvalidate);
		} else {
			if (!this.isInvalidateSuppressed()) {
				this.invalidate();
			}
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Returns an aggregation of the managed object with a given sAggregationName
	 *
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {sap.ui.base.ManagedObject | Array}
	 *			  oDefaultForCreation the object that is used in case the current aggregation is empty
	 * @type sap.ui.base.ManagedObject|Array
	 * @return the aggregation array in case of 0..n-aggregations or the managed object or null in case of 0..1-aggregations
	 * @protected
	 */
	ManagedObject.prototype.getAggregation = function(sAggregationName, oDefaultForCreation) {
		var aChildren = this.mAggregations[sAggregationName];
		if (!aChildren) {
			aChildren = this.mAggregations[sAggregationName] = oDefaultForCreation || null;
		}
		if (aChildren) {
			if (typeof aChildren.length === 'number' && !(aChildren.propertyIsEnumerable('length')) ) {
				// Return a copy of the array instead of the array itself as reference!!
				return aChildren.slice();
			}
			// simple type or ManagedObject
			return aChildren;
		} else {
			return null;
		}
	};

	/**
	 * Checks for the provided managed object <code>oObject</code> in the aggregation
	 * named <code>sAggregationName</code> and returns its index if found, or -1
	 * otherwise. Returns -2 if the given named aggregation is not a multiple one
	 * (and does not contain the given child).
	 *
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the ManagedObject whose index is looked for.
	 * @return {int} the index of the provided managed object in the aggregation.
	 * @protected
	 */
	ManagedObject.prototype.indexOfAggregation = function(sAggregationName, oObject) {
		var aChildren = this.mAggregations[sAggregationName];
		if (aChildren) {
			if (aChildren.length == undefined) {
				return -2;
			} // not a multiple aggregation

			for (var i = 0; i < aChildren.length; i++) {
				if (aChildren[i] == oObject) {
					return i;
				}
			}
		}
		return -1;
	};

	/**
	 * Inserts managed object <code>oObject</code> to the aggregation named <code>sAggregationName</code> at
	 * position <code>iIndex</code>. Please note that this does not work as expected when an object
	 * is added that is already part of the aggregation. In order to change the index of an object
	 * inside an aggregation, first remove the object, then insert again.
	 *
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation the managed object <code>oObject</code>
	 *            should be inserted into.
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the ManagedObject to add; if empty, nothing is inserted.
	 * @param {int}
	 *            iIndex the <code>0</code>-based index the managed object should be inserted at; for a negative
	 *            value <code>iIndex</code>, <code>oObject</code> is inserted at position 0; for a value
	 *            greater than the current size of the aggregation, <code>oObject</code> is inserted at
	 *            the last position
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject as well as the added child are not marked as changed
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (!oObject) {
			return this;
		}
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ true);

		var aChildren = this.mAggregations[sAggregationName] || (this.mAggregations[sAggregationName] = []);
		// force index into valid range
		var i;
		if (iIndex < 0) {
			i = 0;
		} else if (iIndex > aChildren.length) {
			i = aChildren.length;
		} else {
			i = iIndex;
		}
		if (i !== iIndex) {
			jQuery.sap.log.warning("ManagedObject.insertAggregation: index '" + iIndex + "' out of range [0," + aChildren.length + "], forced to " + i);
		}
		aChildren.splice(i, 0, oObject);
		oObject.setParent(this, sAggregationName, bSuppressInvalidate);

		return this;
	};

	/**
	 * Adds some entity <code>oObject</code> to the aggregation identified by <code>sAggregationName</code>.
	 *
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation that <code>oObject</code> should be added to.
	 * @param {sap.ui.base.ManagedObject}
	 *            oObject the object to add; if empty, nothing is added
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject as well as the added child are not marked as changed
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (!oObject) {
			return this;
		}
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ true);

		var aChildren = this.mAggregations[sAggregationName];
		if (!aChildren) {
			aChildren = this.mAggregations[sAggregationName] = [oObject];
		} else {
			aChildren.push(oObject);
		}
		oObject.setParent(this, sAggregationName, bSuppressInvalidate);
		return this;
	};

	/**
	 * Removes an object from the aggregation named <code>sAggregationName</code>.
	 *
	 * @param {string}
	 *            sAggregationName the string identifying the aggregation the ManagedObject should be removed from
	 * @param {int | string | sap.ui.base.ManagedObject}
	 *            vObject the position or ID of the ManagedObject to remove or the ManagedObject itself; if <code>vObject</code> is invalid,
	 *            a negative value or a value greater or equal than the current size of the aggregation, nothing is removed
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @type sap.ui.base.ManagedObject
	 * @return the removed object or null
	 * @protected
	 */
	ManagedObject.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		var aChildren = this.mAggregations[sAggregationName],
			oChild = null,
			i;

		if ( !aChildren ) {
			return null;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (typeof (vObject) == "string") { // ID of the object is given
			// Note: old lookup via sap.ui.getCore().byId(vObject) only worked for Elements, not for managed objects in general!
			for (i = 0; i < aChildren.length; i++) {
				if (aChildren[i] && aChildren[i].getId() === vObject) {
					vObject = i;
					break;
				}
			}
		}

		if (typeof (vObject) == "object") { // the object itself is given or has just been retrieved
			for (i = 0; i < aChildren.length; i++) {
				if (aChildren[i] == vObject) {
					vObject = i;
					break;
				}
			}
		}

		if (typeof (vObject) == "number") { // "vObject" is the index now
			if (vObject < 0 || vObject >= aChildren.length) {
				jQuery.sap.log.warning("ManagedObject.removeAggregation called with invalid index: " + sAggregationName + ", " + vObject);

			} else {
				oChild = aChildren[vObject];
				aChildren.splice(vObject, 1); // first remove it from array, then call setParent (avoids endless recursion)
				oChild.setParent(null);
				if (!this.isInvalidateSuppressed()) {
					this.invalidate();
				}
			}
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return oChild;
	};

	/**
	 * Removes all the controls in the 0..n-aggregation named <code>sAggregationName</code> (and returns them in an array).<br/>
	 * Additionally unregisters them from the hosting UIArea.
	 *
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @type Array
	 * @return an array of the removed elements (might be empty)
	 * @protected
	 */
	ManagedObject.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate){
		var aChildren = this.mAggregations[sAggregationName];
		if (!aChildren)	{
			return [];
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		delete this.mAggregations[sAggregationName];
		for (var i = 0; i < aChildren.length; i++) {
			aChildren[i].setParent(null);
		}
		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return aChildren;
	};

	/**
	 * Destroys (all) the managed object(s) in the aggregation named <code>sAggregationName</code> and afterwards empties the
	 * aggregation.
	 *
	 * @param {string}
	 *            sAggregationName the name of the aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @return {sap.ui.base.ManagedObject} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	ManagedObject.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate){
		var aChildren = this.mAggregations[sAggregationName],
			i, aChild;

		if (!aChildren) {
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		// Deleting the aggregation here before destroying the children is a BUG:
		//
		// The destroy() method on the children calls _removeChild() on this instance
		// to properly remove each child from the bookkeeping by executing the named
		// removeXYZ() method. But as the aggegation is deleted here already,
		// _removeChild() doesn't find the child in the bookkeeping and therefore
		// refuses to work. Asa result ,side effects from removeXYZ() are missing.
		//
		// The lines below marked with 'FIXME DESTROY' sketch a potential fix, but
		// that fix has proven to be incompatible for several controls that don't
		// properly implement removeXYZ(). As this might affect custom controls
		// as well, the fix has been postponed.
		//
		delete this.mAggregations[sAggregationName]; //FIXME DESTROY: should be removed here

		if (aChildren instanceof ManagedObject) {
			// FIXME DESTROY: this._removeChild(aChildren, sAggregationName, bSuppressInvalidate); // (optional, done by destroy())
			aChildren.destroy(bSuppressInvalidate);
		} else if (jQuery.isArray(aChildren)) {
			for (i = aChildren.length - 1; i >= 0; i--) {
				aChild = aChildren[i];
				if (aChild) {
					// FIXME DESTROY: this._removeChild(aChild, sAggregationName, bSuppressInvalidate); // (optional, done by destroy())
					aChild.destroy(bSuppressInvalidate);
				}
			}
		}

		// FIXME DESTROY: // 'delete' aggregation only now so that _removeChild() can still do its cleanup
		// FIXME DESTROY: delete this.mAggregations[sAggregationName];

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	// ######################################################################################################
	// End of Aggregations
	// ######################################################################################################


	/**
	 * This triggers rerendering of itself and its children.<br/> As <code>sap.ui.base.ManagedObject</code> "bubbles up" the
	 * invalidate, changes to child-<code>Elements</code> will also result in rerendering of the whole sub tree.
	 * @protected
	 */
	ManagedObject.prototype.invalidate = function() {
		if (this.oParent) {
			this.oParent.invalidate(this);
		}
	};


	/**
	 * Returns whether rerendering is currently suppressed on this ManagedObject
	 * @return boolean
	 * @protected
	 */
	ManagedObject.prototype.isInvalidateSuppressed = function() {
		var bInvalidateSuppressed = this.iSuppressInvalidate > 0;
		if (this.oParent && this.oParent instanceof ManagedObject) {
			bInvalidateSuppressed = bInvalidateSuppressed || this.oParent.isInvalidateSuppressed();
		}
		return bInvalidateSuppressed;
	};


	/**
	 * Removes the given child from this object's named aggregation.
	 * @see sap.ui.core.UIArea#_removeChild
	 * @see sap.ui.base.ManagedObject#setParent
	 *
	 * @param {sap.ui.base.ManagedObject}
	 *            oChild the child object to be removed
	 * @param {string}
	 *            sAggregationName the name of this object's aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @private
	 */
	ManagedObject.prototype._removeChild = function(oChild, sAggregationName, bSuppressInvalidate) {
		if (!sAggregationName) {
			// an aggregation name has to be specified!
			jQuery.sap.log.error("Cannot remove aggregated child without aggregation name.", null, this);
		} else {
			// set suppress invalidate flag
			if (bSuppressInvalidate) {
				this.iSuppressInvalidate++;
			}

			var iIndex = this.indexOfAggregation(sAggregationName, oChild);
			var oAggregationInfo = this.getMetadata().getJSONKeys()[sAggregationName];
			// Note: we assume that this is the given child's parent, i.e. -1 not expected!
			if (iIndex == -2) { // 0..1
				if (oAggregationInfo && this[oAggregationInfo._sMutator]) { // TODO properly deal with hidden aggregations
					this[oAggregationInfo._sMutator](null);
				} else {
					this.setAggregation(sAggregationName, null, bSuppressInvalidate);
				}
			} else if (iIndex > -1 ) { // 0..n
				if (oAggregationInfo && this[oAggregationInfo._sRemoveMutator]) { // TODO properly deal with hidden aggregations
					this[oAggregationInfo._sRemoveMutator](iIndex);
				} else {
					this.removeAggregation(sAggregationName, iIndex, bSuppressInvalidate);
				}
			} //else {
				// already removed!?
				// this is the unexpected -1
				// TODO: What would be better? Explicit removeCompositeChild callback on subclass?
			//}
			if (!this.isInvalidateSuppressed()) {
				this.invalidate();
			}

			// reset suppress invalidate flag
			if (bSuppressInvalidate) {
				this.iSuppressInvalidate--;
			}
		}
	};

	/**
	 * Defines this object's new parent. If no new parent is given, the parent is
	 * just unset and we assume that the old parent has removed this child from its
	 * aggregation. But if a new parent is given, this child is first removed from
	 * its old parent.
	 *
	 * @param {sap.ui.base.ManagedObject}
	 *            oParent the object that becomes this objects's new parent
	 * @param {string}
	 *            sAggregationName the name of the parent objects's aggregation
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed. The old parent, however, is marked.
	 * @return {sap.ui.base.ManagedObject}
	 *            Returns <code>this</code> to allow method chaining
	 * @private
	 */
	ManagedObject.prototype.setParent = function(oParent, sAggregationName, bSuppressInvalidate) {
		if ( !oParent ) {
			this.oParent = null;
			this.sParentAggregationName = null;
			this.oPropagatedProperties = {oModels:{}, oBindingContexts:{}};

			jQuery.sap.act.refresh();

			// Note: no need (and no way how) to invalidate
			return;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			//Refresh only for changes with suppressed invalidation (others lead to rerendering and refresh is handled there)
			jQuery.sap.act.refresh();
			this.iSuppressInvalidate++;
		}

		var oOldParent = this.getParent();
		if (oOldParent) { // remove this object from its old parent
			// Note: bSuppressInvalidate  by intention is not propagated to the old parent.
			// It is not sure whether the (direct or indirect) caller of setParent
			// has enough knowledge about the old parent to automatically propagate this.
			// If needed, callers can first remove the object from the oldParent (specifying a
			// suitable value for bSuppressInvalidate there) and only then call setParent.
			oOldParent._removeChild(this, this.sParentAggregationName);
		}
		// adopt new parent
		this.oParent = oParent;
		this.sParentAggregationName = sAggregationName;

		//get properties to propagate
		this.oPropagatedProperties = oParent._getPropertiesToPropagate();

		// update bindings
		if (this.hasModel()) {
			this.updateBindingContext(false, true, undefined, true);
			this.updateBindings(true,null); // TODO could be restricted to models that changed
			this.propagateProperties(true);
		}

		// only the parent knows where to render us, so we have to invalidate it
		if ( oParent && !this.isInvalidateSuppressed() ) {
			oParent.invalidate(this);
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Returns the parent managed object or <code>null</code> if this object hasn't been added to a parent yet.
	 *
	 * @return {sap.ui.base.ManagedObject} The parent managed object or <code>null</code>
	 * @public
	 */
	ManagedObject.prototype.getParent = function() {
		/* Be aware that internally this.oParent is used to reduce method calls.
		 * Check for side effects when overriding this method */
		return this.oParent;
	};


	/**
	 * Cleans up the resources associated with this object and all its aggregated children.
	 *
	 * After an object has been destroyed, it can no longer be used in!
	 *
	 * Applications should call this method if they don't need the object any longer.
	 *
	 * @param {boolean}
	 *            [bSuppressInvalidate] if true, this ManagedObject is not marked as changed
	 * @public
	 */
	ManagedObject.prototype.destroy = function(bSuppressInvalidate) {
		var that = this;

		// jQuery.sap.log.debug("destroying " + this);

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		if (this.exit) {
			this.exit();
		}

		// TODO: generic concept for exit hooks?
		if ( this._exitCompositeSupport ) {
			this._exitCompositeSupport();
		}

		// ensure that also our children are destroyed!!
		for (var oAggr in this.mAggregations) {
			this.destroyAggregation(oAggr, bSuppressInvalidate);
		}

		// Deregister, if available
		if (this.deregister) {
			this.deregister();
		}

		// remove this child from parent aggregation
		if (this.oParent && this.sParentAggregationName) {
			this.oParent._removeChild(this, this.sParentAggregationName, bSuppressInvalidate);
		}
		// for robustness only - should have been cleared by _removeChild already
		delete this.oParent;

		// Data Binding
		jQuery.each(this.mBindingInfos, function(sName, oBindingInfo) {
			if (oBindingInfo.factory) {
				that.unbindAggregation(sName, true);
			} else {
				that.unbindProperty(sName, true);
			}
		});

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		EventProvider.prototype.destroy.apply(this, arguments);

		// finally make the object unusable
		this.setParent = function(){
			throw Error("The object with ID " + that.getId() + " was destroyed and cannot be used anymore.");
		};

		// make visible that it's been destroyed.
		this.bIsDestroyed = true;

	};


	// DataBinding
	/**
	 * Binding parser to use.
	 */
	ManagedObject.bindingParser = BindingParser.simpleParser;

	/**
	 * Determines whether a given object contains binding information instead of a
	 * value or aggregated controls. The method is used in applySettings for processing
	 * the JSON notation of properties/aggregations in the constructor.
	 *
	 * @param {object} oValue the value
	 * @param {object} oKeyInfo the metadata of the property
	 *
	 * @returns {boolean} whether the value contains binding information
	 *
	 * @private
	 * @deprecated
	 */
	ManagedObject.prototype.isBinding = function(oValue, oKeyInfo) {
		return typeof this.extractBindingInfo(oValue) === "object";
	};

	/**
	 * Checks whether the given value can be interpreted as a binding info and
	 * returns that binding info or an unescaped string or undefined when it is not.
	 *
	 * When the 'complex' binding syntax is enabled, the function might also return
	 * a string value in case the given value was a string, did not represent a binding
	 * but contained escaped special characters.
	 *
	 * There are two possible notations for binding information in the object literal notation
	 * of the ManagedObject constructor and ManagedObject.applySettings:
	 * <ul>
	 *   <li>property: "{path}"
	 *   This is used for property binding and can only contain the path.
	 *   </li>
	 *   <li>property:{path:"path", template:oTemplate}
	 *   This is used for aggregation binding, where a template is required or can
	 *   be used for property binding when additional data is required (e.g. formatter).
	 *   </li>
	 * </ul>
	 *
	 * @param {object} oValue
	 * @param {object} oScope
	 *
	 * @returns {object} the binding info object or an unescaped string or undefined.
	 *     If a binding info is returned, it contains at least a path property
	 *     or nested bindings (parts) and, dependant of the binding type,
	 *     additional properties
	 *
	 * @private
	 */
	ManagedObject.prototype.extractBindingInfo = function(oValue, oScope) {

		// property:{path:"path", template:oTemplate}
		if (oValue && typeof oValue === "object") {
			if (oValue.ui5object) {
				// if value contains ui5object property, this is not a binding info,
				// remove it and not check for path or parts property
				delete oValue.ui5object;
			} else if (oValue.path || oValue.parts) {
				// allow JSON syntax for templates
				if (oValue.template) {
					oValue.template = ManagedObject.create(oValue.template);
				}
				return oValue;
			}
		}

		// property:"{path}" or "\{path\}"
		if (typeof oValue === "string") {
			// either returns a binding info or an unescaped string or undefined - depending on binding syntax
			return ManagedObject.bindingParser(oValue, oScope, true);
		}

		// return undefined;
	};

	/**
	 * Returns the binding infos for the given property or aggregation. The binding info contains information about path, binding object, format options,
	 * sorter, filter etc. for the property or aggregation.
	 *
	 * @param {string} sName the name of the property or aggregation
	 *
	 * @returns {object} the binding info object, containing at least a path property
	 *                   and, dependant of the binding type, additional properties
	 *
	 * @protected
	 */
	ManagedObject.prototype.getBindingInfo = function(sName) {
		return this.mBindingInfos[sName];
	};

	/**
	 * Bind the object to the referenced entity in the model, which is used as the binding context
	 * to resolve bound properties or aggregations of the object itself and all of its children
	 * relatively to the given path.
	 * If a relative binding path is used, this will be applied whenever the parent context changes.
	 * @param {string} sPath the binding path
	 * @param {object} [mParameters] map of additional parameters for this binding
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.bindObject = function(sPath, mParameters) {
		var boundObject = {},
			oldBoundObject,
			sModelName,
			iSeparatorPos;
		// support object notation
		if (typeof sPath == "object") {
			var oBindingInfo = sPath;
			sPath = oBindingInfo.path;
			mParameters = oBindingInfo.parameters;
			sModelName = oBindingInfo.model;
			boundObject.events = oBindingInfo.events;
		}
		// if a model separator is found in the path, extract model name and path
		iSeparatorPos = sPath.indexOf(">");
		boundObject.sBindingPath = sPath;
		boundObject.mBindingParameters = mParameters;
		if (iSeparatorPos > 0) {
			sModelName = sPath.substr(0, iSeparatorPos);
			boundObject.sBindingPath = sPath.substr(iSeparatorPos + 1);
		}

		//if old binding exists detach handler
		oldBoundObject = this.mBoundObjects[sModelName];
		if (oldBoundObject && oldBoundObject.binding) {
			oldBoundObject.binding.detachChange(oldBoundObject.fChangeHandler);
			oldBoundObject.binding.detachEvents(oldBoundObject.events);
		}
		this.mBoundObjects[sModelName] = boundObject;

		// if the models are already available, create the binding
		if (this.getModel(sModelName)) {
			this._bindObject(sModelName, boundObject);
		}
		return this;
	};

	/**
	 * Create object binding
	 *
	 * @private
	 */
	ManagedObject.prototype._bindObject = function(sModelName, oBoundObject) {
		var oBinding,
			oParentContext,
			oModel,
			that = this;

		var fChangeHandler = function(oEvent) {
			that.setBindingContext(oBinding.getBoundContext(), sModelName);
		};

		oModel = this.getModel(sModelName);

		if (this.oParent && oModel == this.oParent.getModel(sModelName)) {
			oParentContext = this.oParent.getBindingContext(sModelName);
		}

		oBinding = oModel.bindContext(oBoundObject.sBindingPath, oParentContext, oBoundObject.mBindingParameters);
		oBinding.attachChange(fChangeHandler);
		oBoundObject.binding = oBinding;
		oBoundObject.fChangeHandler = fChangeHandler;

		oBinding.attachEvents(oBoundObject.events);

		oBinding.initialize();
	};

	/**
	 * Bind the object to the referenced entity in the model, which is used as the binding context
	 * to resolve bound properties or aggregations of the object itself and all of its children
	 * relatively to the given path.
	 *
	 * @deprecated Since 1.11.1, please use bindElement instead.
	 * @param {string} sPath the binding path
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.bindContext = function(sPath) {
		return this.bindElement(sPath);
	};

	/**
	 * Removes the defined binding context of this object, all bindings will now resolve
	 * relative to the parent context again.
	 *
	 * @deprecated Since 1.11.1, please use unbindElement instead.
	 * @param {string} [sModelName] name of the model to remove the context for.
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindContext = function(sModelName) {
		return this.unbindElement(sModelName);
	};

	/**
	 * Removes the defined binding context of this object, all bindings will now resolve
	 * relative to the parent context again.
	 *
	 * @param {string} [sModelName] name of the model to remove the context for.
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindObject = function(sModelName) {
		//TODO detach changerHandler
		var oBoundObject = this.mBoundObjects[sModelName];
		if (oBoundObject) {
			if (oBoundObject.binding) {
				oBoundObject.binding.detachChange(oBoundObject.fChangeHandler);
				oBoundObject.binding.detachEvents(oBoundObject.events);
			}
			delete this.mBoundObjects[sModelName];
			delete this.oBindingContexts[sModelName];
			this.updateBindingContext(false, false, sModelName);
		}
		return this;
	};

	/**
	 * Bind a property to the model.
	 * The Setter for the given property will be called with the value retrieved
	 * from the data model.
	 * This is a generic method which can be used to bind any property to the
	 * model. A managed object may flag properties in the metamodel with
	 * bindable="bindable" to get typed bind methods for a property.
	 *
	 * @param {string} sName the name of the property
	 * @param {object} oBindingInfo the binding information
	 * @param {string} oBindingInfo.path the binding path
	 * @param {string} [oBindingInfo.model] the model identifier
	 * @param {function} [oBindingInfo.formatter] the formatter function
	 * @param {boolean} [oBindingInfo.useRawValues] determines if the parameters in the formatter functions should be passed as raw values or not. In this case
	 * 					the specified type for the binding is not used and the values are not formatted. Note: use this flag only when using multiple bindings.
	 * 					If you use only one binding and want raw values then simply don't specify a type for that binding.
	 * @param {sap.ui.model.Type|string} [oBindingInfo.type] the sap.ui.model.Type object or class name
	 * @param {object} [oBindingInfo.formatOptions] the format options to be used
	 * @param {object} [oBindingInfo.constraints] the constraints for this value
	 * @param {sap.ui.model.BindingMode} [oBindingInfo.mode=Default] the binding mode to be used for this property binding (e.g. one way)
	 * @param {object} [oBindingInfo.parameters] a map of parameters which is passed to the binding
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.bindProperty = function(sName, oBindingInfo) {
		var sPath,
			oFormat,
			sMode,
			fnFormatter,
			oType,
			iSeparatorPos,
			bAvailable = true,
			that = this,
			oMetadata = this.getMetadata(),
			oProperty = oMetadata.getAllProperties()[sName],
			oKeyInfo = oMetadata.getJSONKeys()[sName];

		// check whether property or alternative type on aggregation exists
		if (!oProperty && !(oKeyInfo && oKeyInfo.altTypes)) {
			throw new Error("Property \"" + sName + "\" does not exist in " + this);
		}

		// old API compatbility (sName, sPath, oFormat, sMode)
		if (typeof oBindingInfo == "string") {
			sPath = arguments[1];
			oFormat = arguments[2];
			sMode = arguments[3];

			// find out whether formatter or type has been provided
			if (typeof oFormat == "function") {
				fnFormatter = oFormat;
			}
			else if (oFormat instanceof Type) {
				oType = oFormat;
			}
			oBindingInfo = {formatter: fnFormatter, parts : [ {path: sPath, type: oType, mode: sMode} ]};
		}

		// only one binding object with one binding specified
		if (!oBindingInfo.parts) {
			oBindingInfo.parts = [];
			oBindingInfo.parts[0] = {
				path: oBindingInfo.path,
				type: oBindingInfo.type,
				formatOptions: oBindingInfo.formatOptions,
				constraints: oBindingInfo.constraints,
				model: oBindingInfo.model,
				mode: oBindingInfo.mode
			};
			delete oBindingInfo.path;
			delete oBindingInfo.mode;
			delete oBindingInfo.model;
		}

		jQuery.each(oBindingInfo.parts, function(i, oPart) {
			if (typeof oPart == "string") {
				oPart = { path: oPart };
				oBindingInfo.parts[i] = oPart;
			}
			// if a model separator is found in the path, extract model name and path
			iSeparatorPos = oPart.path.indexOf(">");
			if (iSeparatorPos > 0) {
				oPart.model = oPart.path.substr(0, iSeparatorPos);
				oPart.path = oPart.path.substr(iSeparatorPos + 1);
			}
			// if a formatter exists or we have multiple bindings the binding mode can be one way only
			if (oBindingInfo.formatter || oBindingInfo.parts.length > 1) {
				oPart.mode = sap.ui.model.BindingMode.OneWay;
			}

			if (!that.getModel(oPart.model)) {
				bAvailable = false;
			}

		});

		// if property is already bound, unbind it first
		if (this.isBound(sName)) {
			this.unbindProperty(sName, true);
		}

		// store binding info to create the binding, as soon as the model is available, or when the model is changed
		this.mBindingInfos[sName] = oBindingInfo;

		// if the models are already available, create the binding
		if (bAvailable) {
			this._bindProperty(sName, oBindingInfo);
		}
		return this;
	};

	ManagedObject.prototype._bindProperty = function(sName, oBindingInfo) {
		var oModel,
			sMode,
			oContext,
			oBinding,
			oType,
			clType,
			oPropertyInfo = this.getMetadata().getJSONKeys()[sName], // TODO fix handling of hidden entitites?
			that = this,
			aBindings = [],
			fModelChangeHandler = function(oEvent){
				that.updateProperty(sName);
				if (oBinding.getBindingMode() === sap.ui.model.BindingMode.OneTime) {
					oBinding.detachChange(fModelChangeHandler);
					oBinding.detachEvents(oBindingInfo.events);
				}
			};

		// Only use context for bindings on the primary model
		oContext = this.getBindingContext(oBindingInfo.model);

		jQuery.each(oBindingInfo.parts, function(i, oPart) {
			// Only use context for bindings on the primary model
			oContext = that.getBindingContext(oPart.model);
			// Create binding object
			oModel = that.getModel(oPart.model);
			// Create type instance if needed
			oType = oPart.type;
			if (typeof oType == "string") {
				clType = jQuery.sap.getObject(oType);
				oType = new clType(oPart.formatOptions, oPart.constraints);
			}

			oBinding = oModel.bindProperty(oPart.path, oContext, oBindingInfo.parameters);
			oBinding.setType(oType, oPropertyInfo.type);
			oBinding.setFormatter(oPart.formatter);

			sMode = !oPart.mode ? oModel.getDefaultBindingMode() : oPart.mode;
			oBinding.setBindingMode(sMode);

			aBindings.push(oBinding);
		});

		// check if we have a composite binding or a formatter function created by the BindingParser which has property textFragments
		if (aBindings.length > 1 || ( oBindingInfo.formatter && oBindingInfo.formatter.textFragments )) {
			// Create type instance if needed
			oType = oBindingInfo.type;
			if (typeof oType == "string") {
				clType = jQuery.sap.getObject(oType);
				oType = new clType(oBindingInfo.formatOptions, oBindingInfo.constraints);
			}
			oBinding = new CompositeBinding(aBindings, oBindingInfo.useRawValues);
			oBinding.setType(oType, oPropertyInfo.type);
			oBinding.setBindingMode(oBindingInfo.mode);
		} else {
			oBinding = aBindings[0];
		}

		oBinding.attachChange(fModelChangeHandler);

		// set only one formatter function if any
		// because the formatter gets the context of the element we have to set the context via proxy to ensure compatibility
		// for formatter function which is now called by the property binding
		// proxy formatter here because "this" is the correct cloned object
		oBinding.setFormatter(jQuery.proxy(oBindingInfo.formatter, this));

		// Set additional information on the binding info
		oBindingInfo.binding = oBinding;
		oBindingInfo.modelChangeHandler = fModelChangeHandler;

		oBinding.attachEvents(oBindingInfo.events);

		oBinding.initialize();
	};

	/**
	 * Unbind the property from the model
	 *
	 * @param {string} sName the name of the property
	 * @param {boolean} bSuppressReset whether the reset to the default value when unbinding should be suppressed
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindProperty = function(sName, bSuppressReset){
		var oBindingInfo = this.mBindingInfos[sName],
			oPropertyInfo = this.getMetadata().getJSONKeys()[sName];
		if (oBindingInfo) {
			if (oBindingInfo.binding) {
				oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
				oBindingInfo.binding.detachEvents(oBindingInfo.events);
			}
			delete this.mBindingInfos[sName];
			if (!bSuppressReset) {
				this[oPropertyInfo._sMutator](null);
			}
		}
		return this;
	};

	/**
	 * Generic method which is called, whenever an property binding is changed.
	 * This method gets the external format from the property binding and applies
	 * it to the setter.
	 *
	 * @private
	 */
	ManagedObject.prototype.updateProperty = function(sName) {
		var oBindingInfo = this.mBindingInfos[sName],
			oBinding = oBindingInfo.binding,
			oPropertyInfo = this.getMetadata().getJSONKeys()[sName];

		// If model change was triggered by the property itself, don't call the setter again
		if (oBindingInfo.skipPropertyUpdate) {
			return;
		}

		try {
			var oValue = oBinding.getExternalValue();
			oBindingInfo.skipModelUpdate = true;
			this[oPropertyInfo._sMutator](oValue);
			oBindingInfo.skipModelUpdate = false;
		} catch (oException) {
			oBindingInfo.skipModelUpdate = false;
			if (oException instanceof sap.ui.model.FormatException) {
				this.fireFormatError({
					element : this,
					property : sName,
					type : oBinding.getType(),
					newValue : oBinding.getValue(),
					oldValue : this.getProperty(sName),
					exception: oException
				}, false, true); // bAllowPreventDefault, bEnableEventBubbling
				oBindingInfo.skipModelUpdate = true;
				this[oPropertyInfo._sMutator](null);
				oBindingInfo.skipModelUpdate = false;
			} else {
				throw oException;
			}
		}
	};

	/**
	 * Update the property in the model if two way data binding mode is enabled
	 *
	 * @param sName the name of the property to update
	 * @param oValue the new value to set for the property in the model
	 * @private
	 */
	ManagedObject.prototype.updateModelProperty = function(sName, oValue, oOldValue){
		if (this.isBound(sName)) {
			var oBindingInfo = this.mBindingInfos[sName],
				oBinding = oBindingInfo.binding;

			// If property change was triggered by the model, don't update the model again
			if (oBindingInfo.skipModelUpdate) {
				return;
			}

			// only one property binding should work with two way mode...composite binding does not work with two way binding
			if (oBinding && oBinding.getBindingMode() == sap.ui.model.BindingMode.TwoWay) {
				try {
					// Set flag to avoid originating propery to be updated from the model
					oBindingInfo.skipPropertyUpdate = true;
					oBinding.setExternalValue(oValue);
					oBindingInfo.skipPropertyUpdate = false;

					// If external value differs from own value after model update,
					// update property again
					var oExternalValue = oBinding.getExternalValue();
					if (oValue != oExternalValue) {
						this.updateProperty(sName);
					}

					// Only fire validation success, if a type is used
					if (oBinding.getType()) {
						this.fireValidationSuccess({
							element : this,
							property : sName,
							type : oBinding.getType(),
							newValue : oValue,
							oldValue : oOldValue
						}, false, true); // bAllowPreventDefault, bEnableEventBubbling
					}
				} catch (oException) {
					oBindingInfo.skipPropertyUpdate = false;
					if (oException instanceof sap.ui.model.ParseException) {
						this.fireParseError({
							element : this,
							property : sName,
							type : oBinding.getType(),
							newValue : oValue,
							oldValue : oOldValue,
							exception: oException
						}, false, true); // bAllowPreventDefault, bEnableEventBubbling
					} else if (oException instanceof sap.ui.model.ValidateException) {
						this.fireValidationError({
							element : this,
							property : sName,
							type : oBinding.getType(),
							newValue : oValue,
							oldValue : oOldValue,
							exception: oException
						}, false, true); // bAllowPreventDefault, bEnableEventBubbling
					} else {
						throw oException;
					}
				}
			}
		}
	};

	/**
	 * Bind an aggregation to the model.
	 *
	 * The bound aggregation will use the given template, clone it for each item
	 * which exists in the bound list and set the appropriate binding context.
	 * This is a generic method which can be used to bind any aggregation to the
	 * model. A managed object may flag aggregations in the metamodel with
	 * bindable="bindable" to get typed bind<i>Something</i> methods for those aggregations.
	 *
	 * @param {string} sName the aggregation to bind
	 * @param {object} oBindingInfo the binding info
	 * @param {string} oBindingInfo.path the binding path
	 * @param {sap.ui.base.ManagedObject} oBindingInfo.template the template to clone for each item in the aggregation
	 * @param {boolean} [oBindingInfo.templateShareable=true] option to enable that the template will be shared which means that it won't be destroyed or cloned automatically
	 * @param {function} oBindingInfo.factory the factory function
	 * @param {number} oBindingInfo.startIndex the first entry of the list to be created
	 * @param {number} oBindingInfo.length the amount of entries to be created (may exceed the sizelimit of the model)
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [oBindingInfo.sorter] the initial sort order (optional)
	 * @param {sap.ui.model.Filter[]} [oBindingInfo.filters] the predefined filters for this aggregation (optional)
	 * @param {object} [oBindingInfo.parameters] a map of parameters which is passed to the binding
	 * @param {function} [oBindingInfo.groupHeaderFactory] a factory function to generate custom group visualization (optional)
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.bindAggregation = function(sName, oBindingInfo) {
		var sPath,
			oTemplate,
			aSorters,
			aFilters,
			oMetadata = this.getMetadata(),
			oAggregation = oMetadata.getAllAggregations()[sName];

		// check whether aggregation exists
		if (!oAggregation) {
			throw new Error("Aggregation \"" + sName + "\" does not exist in " + this);
		}

		// Old API compatibility (sName, sPath, oTemplate, oSorter, aFilters)
		if (typeof oBindingInfo == "string") {
			sPath = arguments[1];
			oTemplate = arguments[2];
			aSorters = arguments[3];
			aFilters = arguments[4];
			oBindingInfo = {path: sPath, sorter: aSorters, filters: aFilters};
			// allow either to pass the template or the factory function as 3rd parameter
			if (oTemplate instanceof ManagedObject) {
				oBindingInfo.template = oTemplate;
			} else if (typeof oTemplate === "function") {
				oBindingInfo.factory = oTemplate;
			}
		}

		// if aggregation is already bound, unbind it first
		if (this.isBound(sName)) {
			this.unbindAggregation(sName, true);
		}

		// check whether a template has been provided, which is required for proper processing of the binding
		// If aggregation is marked correspondingly in the metadata, factory can be omitted (usually requires an updateXYZ method)
		if (!(oBindingInfo.template || oBindingInfo.factory)) {
			if ( oAggregation._doesNotRequireFactory ) {
				// add a dummy factory as property 'factory' is used to distinguish between property- and list-binding
				oBindingInfo.factory = function() {
					throw new Error("dummy factory called unexpectedly ");
				};
			} else {
				throw new Error("Missing template or factory function for aggregation " + sName + " of " + this + " !");
			}
		}

		// if we have a template we will create a factory function
		if (oBindingInfo.template) {
			// set default for templateShareable
			if (oBindingInfo.templateShareable === undefined) {
				oBindingInfo.templateShareable = true;
			}
			oBindingInfo.factory = function(sId) {
				return oBindingInfo.template.clone(sId);
			};
		}

		// if a model separator is found in the path, extract model name and path
		var iSeparatorPos = oBindingInfo.path.indexOf(">");
		if (iSeparatorPos > 0) {
			oBindingInfo.model = oBindingInfo.path.substr(0, iSeparatorPos);
			oBindingInfo.path = oBindingInfo.path.substr(iSeparatorPos + 1);
		}

		// store binding info to create the binding, as soon as the model is available, or when the model is changed
		this.mBindingInfos[sName] = oBindingInfo;

		// if the model is already available create the binding
		if (this.getModel(oBindingInfo.model)) {
			this._bindAggregation(sName, oBindingInfo);
		}
		return this;
	};

	ManagedObject.prototype._bindAggregation = function(sName, oBindingInfo) {
		var that = this,
			oBinding,
			fModelChangeHandler = function(oEvent){
				var sUpdater = "update" + sName.substr(0,1).toUpperCase() + sName.substr(1);
				if (that[sUpdater]) {
					var sChangeReason = oEvent && oEvent.getParameter("reason");
					if (sChangeReason) {
						that[sUpdater](sChangeReason);
					} else {
						that[sUpdater]();
					}
				} else {
					that.updateAggregation(sName);
				}
			},
			fModelRefreshHandler = function(oEvent){
				var sRefresher = "refresh" + sName.substr(0,1).toUpperCase() + sName.substr(1);
				if (that[sRefresher]) {
					that[sRefresher](oEvent.getParameter("reason"));
				} else {
					fModelChangeHandler(oEvent);
				}
			};
			var oModel = this.getModel(oBindingInfo.model);
			if (this.isTreeBinding(sName)) {
				oBinding = oModel.bindTree(oBindingInfo.path, this.getBindingContext(oBindingInfo.model), oBindingInfo.filters, oBindingInfo.parameters);
			} else {
				oBinding = oModel.bindList(oBindingInfo.path, this.getBindingContext(oBindingInfo.model), oBindingInfo.sorter, oBindingInfo.filters, oBindingInfo.parameters);
			}

		if (this.bUseExtendedChangeDetection === true) {
			oBinding.enableExtendedChangeDetection();
		}

		oBindingInfo.binding = oBinding;
		oBindingInfo.modelChangeHandler = fModelChangeHandler;
		oBindingInfo.modelRefreshHandler = fModelRefreshHandler;

		oBinding.attachChange(fModelChangeHandler);

		oBinding.attachRefresh(fModelRefreshHandler);

		oBinding.attachEvents(oBindingInfo.events);

		oBinding.initialize();
	};

	/**
	 * Unbind the aggregation from the model
	 *
	 * @param {string} sName the name of the aggregation
	 * @param {boolean} bSuppressReset whether the reset to empty aggregation when unbinding should be suppressed
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.unbindAggregation = function(sName, bSuppressReset){
		var oBindingInfo = this.mBindingInfos[sName],
			oAggregationInfo = this.getMetadata().getJSONKeys()[sName];
		if (oBindingInfo) {
			if (oBindingInfo.binding) {
				oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
				oBindingInfo.binding.detachRefresh(oBindingInfo.modelRefreshHandler);
				oBindingInfo.binding.detachEvents(oBindingInfo.events);
			}
			// remove template if any
			if (!oBindingInfo.templateShareable && oBindingInfo.template && oBindingInfo.template.destroy) {
					oBindingInfo.template.destroy();
			}

			delete this.mBindingInfos[sName];
			if (!bSuppressReset) {
				this[oAggregationInfo._sDestructor]();
			}
		}
		return this;
	};

	/**
	 * Generic method which is called, whenever an aggregation binding is changed.
	 * This method deletes all elements in this aggregation and recreates them
	 * according to the data model.
	 * In case a managed object needs special handling for a aggregation binding, it can create
	 * a typed update-method (e.g. "updateRows") which will be used instead of the
	 * default behaviour.
	 *
	 * @private
	 */
	ManagedObject.prototype.updateAggregation = function(sName) {
		var oBindingInfo = this.mBindingInfos[sName],
			oBinding = oBindingInfo.binding,
			fnFactory = oBindingInfo.factory,
			oAggregationInfo = this.getMetadata().getJSONKeys()[sName],  // TODO fix handling of hidden aggregations
			oClone,
			oNewGroup = null,
			sGroupFunction = null,
			bGrouped = null,
			sGroup = null,
			that = this;
		this[oAggregationInfo._sDestructor]();
		if (this.isTreeBinding(sName)) {
			var iNodeIndex = 0,
				update = function(aContexts, fnFactory, oBinding, oParent){
					jQuery.each(aContexts, function(iIndex, oContext) {
						var sId = that.getId() + "-" + iNodeIndex++;
						oClone = fnFactory(sId, oContext);
						oClone.setBindingContext(oContext, oBindingInfo.model);
						oParent[oAggregationInfo._sMutator](oClone); // also sets the Parent
						update(oBinding.getNodeContexts(oContext), fnFactory, oBinding, oClone);
					});
				};
			update(oBinding.getRootContexts(), fnFactory, oBinding, this);
		} else {
			sGroupFunction = oAggregationInfo._sMutator + "Group";
			bGrouped = oBinding.isGrouped() && this[sGroupFunction];
			jQuery.each(oBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length), function(iIndex, oContext) {
				if (bGrouped && oBinding.aSorters.length > 0) {
					oNewGroup = oBinding.aSorters[0].fnGroup(oContext);
					if (typeof oNewGroup == "string") {
						oNewGroup = {
							key: oNewGroup
						};
					}
					if (oNewGroup.key !== sGroup) {
						var oGroupHeader;
						//If factory is defined use it
						if (oBindingInfo.groupHeaderFactory) {
							oGroupHeader = oBindingInfo.groupHeaderFactory(oNewGroup);
						}
						that[sGroupFunction](oNewGroup, oGroupHeader);
						sGroup = oNewGroup.key;
					}
				}
				var sId = that.getId() + "-" + iIndex;
				oClone = fnFactory(sId, oContext);
				oClone.setBindingContext(oContext, oBindingInfo.model);
				that[oAggregationInfo._sMutator](oClone);
			});
		}
	};

	/**
	 * Generic method which can be called, when an aggregation needs to be refreshed.
	 * This method does not make any change on the aggregtaion, but just calls the
	 * getContexts method to trigger fetching of new data.
	 *
	 * @private
	 */
	ManagedObject.prototype.refreshAggregation = function(sName) {
		var oBindingInfo = this.mBindingInfos[sName],
			oBinding = oBindingInfo.binding;
		oBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);
	};

	/**
	 *  This method is used internally and should only be overridden by a tree managed object which utilizes the tree binding.
	 *  In this case and if the aggregation is a tree node the overridden method should then return true.
	 *  If true is returned the tree binding will be used instead of the list binding.
	 *
	 *  @param {string} sName the aggregation to bind (e.g. nodes for a tree managed object)
	 *  @return {boolean} whether tree binding should be used or list binding. Default is false. Override method to change this behavior.
	 *
	 *  @protected
	 */
	ManagedObject.prototype.isTreeBinding = function(sName) {
		return false;
	};

	/**
	 * Create or update local bindings.
	 *
	 * Called when model or binding contexts have changed. Creates bindings when the model was not available
	 * at the time bindProperty or bindAggregation was called. Recreates the bindings when they exist already
	 * and when the model has changed.
	 *
	 * @param {boolean} bUpdateAll forces an update of all bindings, sModelName will be ignored
	 * @param {string|undefined} sModelName name of a model whose bindings should be updated
	 *
	 * @private
	 */
	ManagedObject.prototype.updateBindings = function(bUpdateAll, sModelName) {
		var that = this;

		/*
		 * Checks whether the binding for the given oBindingInfo became invalid because
		 * of the current model change (as identified by bUpdateAll and sModelName).
		 *
		 * Precondition: oBindingInfo contains a 'binding' object
		 *
		 * @param oBindingInfo
		 * @returns {boolean}
		 */
		function becameInvalid(oBindingInfo) {
			var aParts = oBindingInfo.parts,
				i;

			if (aParts && aParts.length > 1) {
				// composite binding: invalid when for any part the model has the same name (or updateall) and when the model instance for that part differs
				for (i = 0; i < aParts.length; i++) {
					if ( (bUpdateAll || aParts[i].model == sModelName) && !oBindingInfo.binding.aBindings[i].updateRequired(that.getModel(aParts[i].model)) ) {
						return true;
					}
				}
			} else if (oBindingInfo.factory) {
				// list binding: invalid when  the model has the same name (or updateall) and when the model instance differs
				return (bUpdateAll || oBindingInfo.model == sModelName) && !oBindingInfo.binding.updateRequired(that.getModel(oBindingInfo.model));
			} else {
				// simple property binding: invalid when the model has the same name (or updateall) and when the model instance differs
				return (bUpdateAll || aParts[0].model == sModelName) && !oBindingInfo.binding.updateRequired(that.getModel(aParts[0].model));
			}
			return false;
		}

		/*
		 * Checks whether a binding can be created for the given oBindingInfo
		 * @param oBindingInfo
		 * @returns {boolean}
		 */
		function canCreate(oBindingInfo) {
			var aParts = oBindingInfo.parts,
				i;

			if (aParts) {
				for (i = 0; i < aParts.length; i++) {
					if ( !that.getModel(aParts[i].model) ) {
						return false;
					}
				}
				return true;
			} else if (oBindingInfo.factory) { // List binding check
				return !!that.getModel(oBindingInfo.model);
			}
			// there should be no other cases
			return false;
		}

		// create property and aggregation bindings if they don't exist yet
		jQuery.each(this.mBindingInfos, function(sName, oBindingInfo) {

			// if there is a binding and if it became invalid through the current model change, then remove it
			if ( oBindingInfo.binding && becameInvalid(oBindingInfo) ) {
				oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
				if (oBindingInfo.modelRefreshHandler) { // only list bindings currently have a refresh handler attached
					oBindingInfo.binding.detachRefresh(oBindingInfo.modelRefreshHandler);
				}
				oBindingInfo.binding.detachEvents(oBindingInfo.events);
				delete oBindingInfo.binding;
			}

			// if there is no binding and if all required information is available, create a binding object
			if ( !oBindingInfo.binding && canCreate(oBindingInfo) ) {
				if (oBindingInfo.factory) {
					that._bindAggregation(sName, oBindingInfo);
				} else {
					that._bindProperty(sName, oBindingInfo);
				}
			}

		});

	};


	/**
	 * Find out whether a property or aggregation is bound
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {boolean} whether a binding exists for the given name
	 * @public
	 */
	ManagedObject.prototype.isBound = function(sName){
		return (sName in this.mBindingInfos);
	};

	/**
	 * Get the object binding object for a specific model
	 *
	 * @param {string} sModelName the name of the model
	 * @return {sap.ui.model.Binding} the element binding for the given model name
	 * @public
	 */
	ManagedObject.prototype.getObjectBinding = function(sModelName){
		return this.mBoundObjects[sModelName] && this.mBoundObjects[sModelName].binding;
	};

	/**
	 * Returns the parent managed object as new eventing parent to enable control event bubbling
	 * or <code>null</code> if this object hasn't been added to a parent yet.
	 *
	 * @return {sap.ui.base.EventProvider} the parent event provider
	 * @protected
	 */
	ManagedObject.prototype.getEventingParent = function() {
		return this.oParent;
	};

	/**
	 * Get the binding object for a specific aggregation/property
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {sap.ui.model.Binding} the binding for the given name
	 * @public
	 */
	ManagedObject.prototype.getBinding = function(sName){
		return this.mBindingInfos[sName] && this.mBindingInfos[sName].binding;
	};

	/**
	 * Get the binding path for a specific aggregation/property
	 *
	 * @param {string} sName the name of the property or aggregation
	 * @return {string} the binding path for the given name
	 * @protected
	 */
	ManagedObject.prototype.getBindingPath = function(sName){
		var oInfo = this.mBindingInfos[sName];
		return oInfo && (oInfo.path || (oInfo.parts && oInfo.parts[0] && oInfo.parts[0].path));
	};

	/**
	 * Set the binding context for this ManagedObject for the model with the given name.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * Note: A ManagedObject inherits binding contexts from the Core only when it is a descendant of an UIArea.
	 *
	 * @param {Object} oContext the new binding context for this object
	 * @param {string} [sModelName] the name of the model to set the context for or <code>undefined</code>
	 *
	 * @return {sap.ui.base.ManagedObject} reference to the instance itself
	 * @public
	 */
	ManagedObject.prototype.setBindingContext = function(oContext, sModelName){
		jQuery.sap.assert(sModelName === undefined || (typeof sModelName === "string" && !/^(undefined|null)?$/.test(sModelName)), "sModelName must be a string or omitted");
		var oOldContext = this.oBindingContexts[sModelName];

		if (oOldContext !== oContext) {
			this.oBindingContexts[sModelName] = oContext;
			this.updateBindingContext(true, true, sModelName);
			this.propagateProperties(sModelName);
		}
		return this;
	};

	/**
	 * Update the binding context in this object and all aggregated children
	 * @private
	 */
	ManagedObject.prototype.updateBindingContext = function(bSkipLocal, bSkipChildren, sModelName, bUpdateAll){

		var oModel,
			oModelNames = {},
			oParentContext,
			oBoundObject,
			that = this;

		// find models that need an context update
		if (bUpdateAll) {
			for (sModelName in this.oModels) {
				if ( this.oModels.hasOwnProperty(sModelName) ) {
					oModelNames[sModelName] = sModelName;
				}
			}
			for (sModelName in this.oPropagatedProperties.oModels) {
				if ( this.oPropagatedProperties.oModels.hasOwnProperty(sModelName) ) {
					oModelNames[sModelName] = sModelName;
				}
			}
		} else {
			oModelNames[sModelName] = sModelName;
		}

		for (sModelName in oModelNames ) {
			if ( oModelNames.hasOwnProperty(sModelName) ) {
				sModelName = sModelName === "undefined" ? undefined : sModelName;
				oModel = this.getModel(sModelName);
				oBoundObject = this.mBoundObjects[sModelName];

				if (oModel && oBoundObject && oBoundObject.sBindingPath && !bSkipLocal) {
					if (!oBoundObject.binding) {
						this._bindObject(sModelName, oBoundObject);
					} else {
						oParentContext = null;
						if (this.oParent && oModel == this.oParent.getModel(sModelName)) {
							oParentContext = this.oParent.getBindingContext(sModelName);
						}
						if (oParentContext !== oBoundObject.binding.getContext()) {
							oBoundObject.binding.setContext(oParentContext);
						}
					}
					continue;
				}
				// update context in existing bindings
				jQuery.each(this.mBindingInfos, function(sName, oBindingInfo) {
					var oBinding = oBindingInfo.binding;
					var aParts = oBindingInfo.parts,
						i;
					if (!oBinding) {
						return;
					}
					if (aParts && aParts.length > 1) {
						// composite binding: update required  when a part use the model with the same name
						for (i = 0; i < aParts.length; i++) {
							if ( aParts[i].model == sModelName ) {
								oBinding.aBindings[i].setContext(that.getBindingContext(aParts[i].model));
							}
						}
					} else if (oBindingInfo.factory) {
						// list binding: update required when the model has the same name (or updateall)
						if ( oBindingInfo.model == sModelName) {
							oBinding.setContext(that.getBindingContext(oBindingInfo.model));
						}

					} else {
						// simple property binding: update required when the model has the same name
						if ( aParts[0].model == sModelName) {
							oBinding.setContext(that.getBindingContext(aParts[0].model));
						}
					}
				});
				if (!bSkipChildren) {
					var oContext = this.getBindingContext(sModelName);
					// also update context in all child elements
					jQuery.each(this.mAggregations, function(sName, oAggregation) {
						if (oAggregation instanceof ManagedObject) {
							oAggregation.oPropagatedProperties.oBindingContexts[sModelName] = oContext;
							oAggregation.updateBindingContext(false,false,sModelName);
						} else if (oAggregation instanceof Array) {
							for (var i = 0; i < oAggregation.length; i++) {
								oAggregation[i].oPropagatedProperties.oBindingContexts[sModelName] = oContext;
								oAggregation[i].updateBindingContext(false,false,sModelName);
							}
						}
					});
				}
			}
		}
	};


	/**
	 * Get the binding context of this object for the given model name.
	 *
	 * If the object does not have a binding context set on itself and has no own Model set,
	 * it will use the first binding context defined in its parent hierarchy.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * Note: A ManagedObject inherits binding contexts from the Core only when it is a descendant of an UIArea.
	 *
	 * @param {string} [sModelName] the name of the model or <code>undefined</code>
	 * @return {Object} the binding context of this object
	 * @public
	 */
	ManagedObject.prototype.getBindingContext = function(sModelName){
		var oModel = this.getModel(sModelName);

		if (this.oBindingContexts[sModelName]) {
			return this.oBindingContexts[sModelName];
		} else if (oModel && this.oParent && this.oParent.getModel(sModelName) && oModel != this.oParent.getModel(sModelName)) {
			return undefined;
		} else {
			return this.oPropagatedProperties.oBindingContexts[sModelName];
		}
	};

	/**
	 * Sets or unsets a model for the given model name for this ManagedObject.
	 *
	 * The <code>sName</code> must either be <code>undefined</code> (or omitted) or a non-empty string.
	 * When the name is omitted, the default model is set/unset.
	 *
	 * When <code>oModel</code> is <code>null</code> or <code>undefined</code>, a previously set model
	 * with that name is removed from this ManagedObject. If an ancestor (parent, UIArea or Core) has a model
	 * with that name, this ManagedObject will immediately inherit that model from its ancestor.
	 *
	 * All local bindings that depend on the given model name, are updated (created if the model references
	 * became complete now; updated, if any model reference has changed; removed if the model references
	 * became incomplete now).
	 *
	 * Any change (new model, removed model, inherited model) is also applied to all aggregated descendants
	 * as long as a descendant doesn't have its own model set for the given name.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * Note: By design, it is not possible to hide an inherited model by setting a <code>null</code> or
	 * <code>undefined</code> model. Applications can set an empty model to achieve the same.
	 *
	 * Note: A ManagedObject inherits models from the Core only when it is a descendant of an UIArea.
	 *
	 * @param {sap.ui.model.Model} oModel the model to be set or <code>null</code> or <code>undefined</code>
	 * @param {string} [sName] the name of the model or <code>undefined</code>
	 * @return {sap.ui.base.ManagedObject} <code>this</code> to allow method chaining
	 * @public
	 */
	ManagedObject.prototype.setModel = function(oModel, sName) {
		jQuery.sap.assert(oModel == null || oModel instanceof Model, "oModel must be an instance of sap.ui.model.Model, null or undefined");
		jQuery.sap.assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
		if (!oModel && this.oModels[sName]) {
			delete this.oModels[sName];
			// propagate Models to children
			// model changes are propagated until (including) the first descendant that has its own model with the same name
			this.propagateProperties(sName);
			// if the model instance for a name changes, all bindings for that model name have to be updated
			this.updateBindings(false, sName);
		} else if ( oModel && oModel !== this.oModels[sName] ) {
			//TODO: handle null!
			this.oModels[sName] = oModel;
			// propagate Models to children
			// model changes are propagated until (including) the first descendant that has its own model with the same name
			this.propagateProperties(sName);
			// update binding context, for primary model only
			this.updateBindingContext(false, true, sName);
			// if the model instance for a name changes, all bindings for that model name have to be updated
			this.updateBindings(false, sName);
		} // else nothing to do
		return this;
	};

	/**
	 * Propagate Properties (models and bindingContext) to aggregated objects.
	 * @param {string|undefined|true} sName when <code>true</code>, all bindings are updated.
	 *           Otherwise only those for the given model name (undefined == name of default model)
	 *
	 * @private
	 */
	ManagedObject.prototype.propagateProperties = function(vName) {
		var oProperties = this._getPropertiesToPropagate(),
			bUpdateAll = vName === true, // update all bindings when no model name parameter has been specified
			sName = bUpdateAll ? undefined : vName,
			that = this;
		jQuery.each(this.mAggregations, function(sAggregationName, oAggregation) {
			if (that.mSkipPropagation[sAggregationName]) {
				return true; //skip
			}
			if (oAggregation instanceof ManagedObject) {
				that._propagateProperties(vName, oAggregation, oProperties, bUpdateAll, sName);
			} else if (oAggregation instanceof Array) {
				for (var i = 0; i < oAggregation.length; i++) {
					if (oAggregation[i] instanceof ManagedObject) {
						that._propagateProperties(vName, oAggregation[i], oProperties, bUpdateAll, sName);
					}
				}
			}
		});
	};

	ManagedObject.prototype._propagateProperties = function(vName, oObject, oProperties, bUpdateAll, sName) {
		if (!oProperties) {
			oProperties = this._getPropertiesToPropagate();
			bUpdateAll = vName === true;
			sName = bUpdateAll ? undefined : vName;
		}
		oObject.oPropagatedProperties = oProperties;
		oObject.updateBindings(bUpdateAll,sName);
		oObject.updateBindingContext(false, true, sName, bUpdateAll);
		oObject.propagateProperties(vName);
	};

	/**
	 * Get properties for propagation
	 * @return {object} oProperties
	 * @private
	 */
	ManagedObject.prototype._getPropertiesToPropagate = function() {
		var bNoOwnModels = jQuery.isEmptyObject(this.oModels),
			bNoOwnContexts = jQuery.isEmptyObject(this.oBindingContexts);

		function merge(empty,o1,o2) {
			return empty ? o1 : jQuery.extend({}, o1, o2);
		}

		if (bNoOwnContexts && bNoOwnModels) {
			//propagate the existing container
			return this.oPropagatedProperties;
		} else {
			//merge propagated and own properties
			return {
					oModels : merge(bNoOwnModels, this.oPropagatedProperties.oModels, this.oModels),
					oBindingContexts : merge(bNoOwnContexts, this.oPropagatedProperties.oBindingContexts, this.oBindingContexts)
			};
		}
	};

	/**
	 * Get the model to be used for data bindings with the given model name.
	 * If the object does not have a model set on itself, it will use the first
	 * model defined in its parent hierarchy.
	 *
	 * The name can be omitted to reference the default model or it must be a non-empty string.
	 *
	 * Note: to be compatible with future versions of this API, applications must not use the value <code>null</code>,
	 * the empty string <code>""</code> or the string literals <code>"null"</code> or <code>"undefined"</code> as model name.
	 *
	 * @param {string|undefined} [sName] name of the model to be retrieved
	 * @return {sap.ui.model.Model} oModel
	 * @public
	 */
	ManagedObject.prototype.getModel = function(sName) {
		jQuery.sap.assert(sName === undefined || (typeof sName === "string" && !/^(undefined|null)?$/.test(sName)), "sName must be a string or omitted");
		return this.oModels[sName] || this.oPropagatedProperties.oModels[sName];
	};

	/**
	 * Check if any model is set to the ManagedObject or to one of its parents (including UIArea and Core).
	 *
	 * Note: A ManagedObject inherits models from the Core only when it is a descendant of an UIArea.
	 *
	 * @return {boolean} whether a model reference exists or not
	 * @public
	 */
	ManagedObject.prototype.hasModel = function() {
		return !(jQuery.isEmptyObject(this.oModels) && jQuery.isEmptyObject(this.oPropagatedProperties.oModels));
	};

	/**
	 * Clones a tree of objects starting with the object on which clone is called first (root object).
	 *
	 * The ids within the newly created clone tree are derived from the original ids by appending
	 * the given <code>sIdSuffix</code> (if no suffix is given, one will be created; it will be
	 * unique across multiple clone calls).
	 *
	 * The <code>oOptions</code> configuration object can have the following properties:
	 * <ul>
	 * <li>The boolean value <code>cloneChildren</code> specifies wether associations/aggregations will be cloned</li>
	 * <li>The boolean value <code>cloneBindings</code> specifies if bindings will be cloned</li>
	 * </ul>
	 *
	 * For each cloned object the following settings are cloned based on the metadata of the object and the defined options:
	 * <ul>
	 * <li>all properties that are not bound. If cloneBinding is false even these properties will be cloned;
	 * the values are used by reference, they are not cloned</li>
	 * <li>all aggregated objects that are not bound. If cloneBinding is false even the ones that are bound will be cloned;
	 * they are all cloned recursively using the same <code>sIdSuffix</code></li>
	 * <li>all associated controls; when an association points to an object inside the cloned object tree,
	 *     then the cloned association will be modified to that it points to the clone of the target object.
	 *     When the association points to a managed object outside of the cloned object tree, then its
	 *     target won't be changed.</li>
	 * <li>all models set via setModel(); used by reference </li>
	 * <li>all property and aggregation bindings (if cloneBindings is true); the pure binding infos (path, model name) are
	 *     cloned, but all other information like template control or factory function,
	 *     data type or formatter function are copied by reference. The bindings themselves
	 *     are created anew as they are specific for the combination (object, property, model).
	 *     As a result, any later changes to a binding of the original object are not reflected
	 *     in the clone, but changes to e.g the type or template etc. are.</li>
	 * </ul>
	 *
	 * Each clone is created by first collecting the above mentioned settings and then creating
	 * a new instance with the normal constructor function. As a result, any side effects of
	 * mutator methods (setProperty etc.) or init hooks are repeated during clone creation.
	 * There is no need to override <code>clone()</code> just to reproduce these internal settings!
	 *
	 * Custom controls however can override <code>clone()</code> to implement additional clone steps.
	 * They usually will first call <code>clone()</code> on the super class and then modify the
	 * returned clone accordingly.
	 *
	 * Applications <b>must never provide</b> the second parameter <code>aLocaleIds</code>.
	 * It is determined automatically for the root object (and its non-existance also serves as
	 * an indicator for the root object). Specifying it will break the implementation of <code>clone()</code>.
	 *
	 * @param {string} [sIdSuffix] a suffix to be appended to the cloned object id
	 * @param {string[]} [aLocalIds] an array of local IDs within the cloned hierarchy (internally used)
	 * @param {Object} [oOptions] configuration object
	 * @return {sap.ui.base.ManagedObject} reference to the newly created clone
	 * @protected
	 */
	ManagedObject.prototype.clone = function(sIdSuffix, aLocalIds, oOptions) {
		var that = this,
			bCloneChildren = true,
			bCloneBindings = true;

		if (oOptions) {
			bCloneChildren = !!oOptions.cloneChildren;
			bCloneBindings = !!oOptions.cloneBindings;
		}
		// if no id suffix has been provided use a generated UID
		if (!sIdSuffix) {
			sIdSuffix = ManagedObjectMetadata.uid("clone") || jQuery.sap.uid();
		}
		// if no local ID array has been passed, collect IDs of all aggregated objects to
		// be able to properly adapt associations, which are within the cloned object hierarchy
		if (!aLocalIds && bCloneChildren) {
			aLocalIds = jQuery.map(this.findAggregatedObjects(true), function(oObject) {
				return oObject.getId();
			});
		}

		var oMetadata = this.getMetadata(),
			oClass = oMetadata._oClass,
			sId = this.getId() + "-" + sIdSuffix,
			mSettings = {},
			mProps = this.mProperties,
			sKey,
			oClone,
			escape = ManagedObject.bindingParser.escape;

		// Clone properties (only those with non-default value)
		for (sKey in mProps) {
			//do not clone properties if property is bound and bindings are cloned; Property is set on update
			if ( mProps.hasOwnProperty(sKey) && !(this.isBound(sKey) && bCloneBindings)) {
				// Note: to avoid double resolution of binding expressions, we have to escape string values once again
				if (typeof mProps[sKey] === "string") {
					mSettings[sKey] = escape(mProps[sKey]);
				} else {
					mSettings[sKey] = mProps[sKey];
				}
			}
		}

		// Clone models
		mSettings["models"] = this.oModels;

		// Clone BindingContext
		mSettings["bindingContexts"] = this.oBindingContexts;

		if (bCloneChildren) {
			// Clone aggregations
			jQuery.each(this.mAggregations, function(sName, oAggregation) {
				//do not clone aggregation if aggregation is bound and bindings are cloned; aggregation is filled on update
				if (oMetadata.hasAggregation(sName) && !(that.isBound(sName) && bCloneBindings)) {
					if (oAggregation instanceof ManagedObject) {
						mSettings[sName] = oAggregation.clone(sIdSuffix, aLocalIds);
					} else if (jQuery.isArray(oAggregation)) {
						mSettings[sName] = [];
						for (var i = 0; i < oAggregation.length; i++) {
							mSettings[sName].push(oAggregation[i].clone(sIdSuffix, aLocalIds));
						}
					} else {
						// must be an alt type
						mSettings[sName] = oAggregation;
					}
				}
			});

			// Clone associations
			jQuery.each(this.mAssociations, function(sName, oAssociation) {
				// Check every associated ID against the ID array, to make sure associations within
				// the template are properly converted to associations within the clone
				if (jQuery.isArray(oAssociation)) {
					oAssociation = oAssociation.slice(0);
					for (var i = 0; i < oAssociation.length; i++) {
						if (jQuery.inArray(oAssociation[i], aLocalIds) >= 0) {
							oAssociation[i] += "-" + sIdSuffix;
						}
					}
				} else if (jQuery.inArray(oAssociation, aLocalIds) >= 0) {
					oAssociation += "-" + sIdSuffix;
				}
				mSettings[sName] = oAssociation;
			});
		}
		// Create clone instance
		oClone = new oClass(sId, mSettings);

		/* Clone element bindings: Clone the objects not the parameters
		 * Context will only be updated when adding the control to the control tree;
		 * Maybe we have to call updateBindingcontext() here?
		 */
		jQuery.each(this.mBoundObjects, function(sName, oBoundObject) {
			oClone.mBoundObjects[sName] = jQuery.extend({}, oBoundObject);
		});

		// Clone events
		jQuery.each(this.mEventRegistry, function(sName, aListeners) {
			oClone.mEventRegistry[sName] = aListeners.slice();
		});

		// Clone bindings
		if (bCloneBindings) {
			jQuery.each(this.mBindingInfos, function(sName, oBindingInfo) {
				var oCloneBindingInfo = jQuery.extend({}, oBindingInfo);

				// clone the template if it is not shared
				if (!oBindingInfo.templateShareable && oBindingInfo.template && oBindingInfo.template.clone) {
					oCloneBindingInfo.template = oBindingInfo.template.clone(sIdSuffix,	aLocalIds);
					delete oCloneBindingInfo.factory;
				}

				delete oCloneBindingInfo.binding; // remove the runtime binding info (otherwise the property will not be connected again!)
				if (oBindingInfo.factory || oBindingInfo.template) {
					oClone.bindAggregation(sName, oCloneBindingInfo);
				} else {
					oClone.bindProperty(sName, oCloneBindingInfo);
				}
			});
		}
		return oClone;
	};

	/**
	 * Update all localization dependant objects that this managedObject can reach,
	 * except for its children (which will be updated from the Core).
	 *
	 * To make the update work as smooth as possible, it happens in two phases:
	 * <ol>
	 *  <li>In phase 1 all known models are updated.
	 *  <li>In phase 2 all bindings are updated.
	 * </ol>
	 * This separation is necessary as the models for the bindings might be updated
	 * in some ManagedObject or in the Core and the order in which the objects are visited
	 * is not defined (Core.mElements order)
	 *
	 * @private
	 */
	ManagedObject._handleLocalizationChange = function(iPhase) {
		var i;

		if ( iPhase === 1 ) {

			/*
			 * phase 1: update the models
			 */
			jQuery.each(this.oModels, function(sName, oModel) {
				if ( oModel && oModel._handleLocalizationChange ) {
					oModel._handleLocalizationChange();
				}
			});

		} else if ( iPhase === 2 ) {

			/*
			 * phase 2: update bindings and types
			 */
			jQuery.each(this.mBindingInfos, function(sName, oBindingInfo) {
				var aParts = oBindingInfo.parts;
				if (aParts) {
					// property or composite binding: visit all parts
					for (i = 0; i < aParts.length; i++) {
						if ( oBindingInfo.type && oBindingInfo.type._handleLocalizationChange ) {
							oBindingInfo.type._handleLocalizationChange();
						}
					}
					if ( oBindingInfo.modelChangeHandler ) {
						oBindingInfo.modelChangeHandler();
					}
				} // else: don't update list bindings
				// Note: the template for a list binding will be visited by the core!
			});

		}
	};

	/**
	 * Maps the given aggregation with name <code>sOldAggrName</code>
	 * on aggregation <code>sNewAggrName</code> (When calling an accessor function
	 * of the old aggregation the call is forwarded to the corresponding accessor
	 * function of the new aggregation).
	 *
	 * This function should help to perform a smooth transition for users of a managed object
	 * when an aggregation must be renamed.
	 *
	 * Both aggregations must have a mutiple cardinality (0..n) and must have the same
	 * aggregated type!
	 *
	 * @param {object} oPrototype prototype of the ManagedObject class for which a mapping should be defined
	 * @param {string} sOldAggrName Name of the old deprecated aggregation
	 * @param {string} sNewAggrName Name of the new aggregation
	 * @deprecated
	 */
	ManagedObject._mapAggregation = function(oPrototype, sOldAggrName, sNewAggrName){
		var mKeys = oPrototype.getMetadata().getJSONKeys(); // TODO fix handling of hidden entitites?
		var oOldAggrInfo = mKeys[sOldAggrName];
		var oNewAggrInfo = mKeys[sNewAggrName];

		//Check whether aggregations exist and are multiple.
		if (!oOldAggrInfo || !oNewAggrInfo || oOldAggrInfo._iKind != 2 || oNewAggrInfo._iKind != 2) {
			return;
		}

		var mFunc = {"insert" : true, "add" : true, "remove" : true, "removeAll" : false, "indexOf" : true, "destroy" : false, "get" : false};

		function method(sPrefix, sName) {
			return sPrefix + sName.substring(0,1).toUpperCase() + sName.substring(1);
		}

		function fAggrDelegator(sFuncName){
			return function() {
				return this[sFuncName].apply(this, arguments);
			};
		}

		for (var sPrefix in mFunc) {
			var sOldFuncName = method(sPrefix, mFunc[sPrefix] ? oOldAggrInfo.singularName : oOldAggrInfo._sName);
			var sNewFuncName = method(sPrefix, mFunc[sPrefix] ? oNewAggrInfo.singularName : oNewAggrInfo._sName);
			oPrototype[sOldFuncName] = fAggrDelegator(sNewFuncName);
		}
	};

	/**
	 * Searches and returns an array of child elements and controls which are
	 * referenced within an aggregation or aggregations of child elements/controls.
	 * This can be either done recursive or not.
	 * <br>
	 * <b>Take care: this operation might be expensive.</b>
	 * @param {boolean}
	 *          bRecursive true, if all nested children should be returned.
	 * @return {sap.ui.base.ManagedObject[]} array of child elements and controls
	 * @public
	 */
	ManagedObject.prototype.findAggregatedObjects = function(bRecursive) {

		var aAggregatedObjects = [];
		function fFindObjects(oObject) {
			for (var n in oObject.mAggregations) {
				var a = oObject.mAggregations[n];
				if (jQuery.isArray(a)) {
					for (var i = 0; i < a.length; i++) {
						aAggregatedObjects.push(a[i]);
						if (bRecursive) {
							fFindObjects(a[i]);
						}
					}
				} else if (a instanceof ManagedObject) {
					aAggregatedObjects.push(a);
					if (bRecursive) {
						fFindObjects(a);
					}
				}
			}
		}
		fFindObjects(this);
		return aAggregatedObjects;

	};


	return ManagedObject;

}, /* bExport= */ true);
