/*!
 * ${copyright}
 */

// Provides class sap.ui.base.ManagedObjectMetadata
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'./DataType',
	'./Metadata',
	'sap/base/Log',
	'sap/base/assert',
	'sap/base/util/ObjectPath',
	'sap/base/strings/escapeRegExp',
	'sap/base/util/merge',
	'sap/base/util/isPlainObject'
],
function(
	jQuery,
	DataType,
	Metadata,
	Log,
	assert,
	ObjectPath,
	escapeRegExp,
	merge,
	isPlainObject
) {
	"use strict";

	/**
	 * Creates a new metadata object that describes a subclass of ManagedObject.
	 *
	 * <b>Note:</b> Code outside the <code>sap.ui.base</code> namespace must not call this
	 * constructor directly. Instances will be created automatically when a new class is
	 * defined with one of the {@link sap.ui.base.ManagedObject.extend <i>SomeClass</i>.extend}
	 * methods.
	 *
	 * <b>Note</b>: throughout this class documentation, the described subclass of ManagedObject
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
	 *
	 * @author Frank Weigel
	 * @version ${version}
	 * @since 0.8.6
	 * @alias sap.ui.base.ManagedObjectMetadata
	 * @extends sap.ui.base.Metadata
	 * @public
	 */
	var ManagedObjectMetadata = function(sClassName, oClassInfo) {

		// call super constructor
		Metadata.apply(this, arguments);

	};

	// chain the prototypes
	ManagedObjectMetadata.prototype = Object.create(Metadata.prototype);

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	function capitalize(sName) {
		return sName.charAt(0).toUpperCase() + sName.slice(1);
	}

	var rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
	var mSingular = {'children' : -3, 'ies' : 'y', 'ves' : 'f', 'oes' : -2, 'ses' : -2, 'ches' : -2, 'shes' : -2, 'xes' : -2, 's' : -1 };

	function guessSingularName(sName) {
		return sName.replace(rPlural, function($,sPlural) {
			var vRepl = mSingular[sPlural.toLowerCase()];
			return typeof vRepl === "string" ? vRepl : sPlural.slice(0,vRepl);
		});
	}

	function deprecation(fn, name) {
		return function() {
			Log.warning("Usage of deprecated feature: " + name);
			return fn.apply(this, arguments);
		};
	}

	function remainder(obj, info) {
		var result = null;

		for (var n in info) {
			if ( hasOwnProperty.call(info, n) && typeof obj[n] === 'undefined' ) {
				result = result || {};
				result[n] = info[n];
			}
		}

		return result;
	}

	var Kind = {
		SPECIAL_SETTING : -1, PROPERTY : 0, SINGLE_AGGREGATION : 1, MULTIPLE_AGGREGATION : 2, SINGLE_ASSOCIATION : 3, MULTIPLE_ASSOCIATION : 4, EVENT : 5
	};

	/**
	 * Guess a singular name for a given plural name.
	 *
	 * This method is not guaranteed to return a valid result. If the result is not satisfying,
	 * the singular name for an aggregation/association should be specified in the class metadata.
	 *
	 * @private
	 * @function
	 */
	ManagedObjectMetadata._guessSingularName = guessSingularName;

	// ---- SpecialSetting --------------------------------------------------------------------

	/**
	 * SpecialSetting info object
	 * @private
	 * @since 1.27.1
	 */
	function SpecialSetting(oClass, name, info) {
		info = typeof info !== 'object' ? { type: info } : info;
		this.name = name;
		this.type = info.type || 'any';
		this.visibility = info.visibility || 'public';
		this.defaultValue = info.defaultValue;
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = "special:" + name;
		this._iKind = Kind.SPECIAL_SETTING;
	}

	// ---- Property --------------------------------------------------------------------------

	/**
	 * Property info object
	 * @private
	 * @since 1.27.1
	 */
	function Property(oClass, name, info) {
		info = typeof info !== 'object' ? { type: info } : info;
		this.name = name;
		this.type = info.type || 'string';
		this.group = info.group || 'Misc';
		this.defaultValue = info.defaultValue !== null ? info.defaultValue : null;
		this.bindable = !!info.bindable;
		this.deprecated = !!info.deprecated || false;
		this.visibility = info.visibility || 'public';
		this.byValue = info.byValue === true; // non-boolean values reserved for the future
		this.selector = typeof info.selector === "string" ? info.selector : null;
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = name;
		this._iKind = Kind.PROPERTY;
		var N = capitalize(name);
		this._sMutator = 'set' + N;
		this._sGetter = 'get' + N;
		if ( this.bindable ) {
			this._sBind =  'bind' + N;
			this._sUnbind = 'unbind' + N;
		} else {
			this._sBind =
			this._sUnbind = undefined;
		}
		this._oType = null;
	}

	/**
	 * @private
	 */
	Property.prototype.generate = function(add) {
		var that = this,
			n = that.name;

		add(that._sGetter, function() { return this.getProperty(n); });
		add(that._sMutator, function(v) { this.setProperty(n,v); return this; }, that);
		if ( that.bindable ) {
			add(that._sBind, function(p,fn,m) { this.bindProperty(n,p,fn,m); return this; }, that);
			add(that._sUnbind, function(p) { this.unbindProperty(n,p); return this; });
		}
	};

	Property.prototype.getType = function() {
		return this._oType || (this._oType = DataType.getType(this.type));
	};

	Property.prototype.getDefaultValue = function() {
		var oDefaultValue = this.defaultValue,
			oType;

		if ( oDefaultValue === null ) {
			oType = this.getType();
			if ( oType instanceof DataType ) {
				oDefaultValue = oType.getDefaultValue();
			}
		}

		return oDefaultValue;
	};

	Property.prototype.get = function(instance) {
		if ( this.visibility !== 'public' ) {
			return instance.getProperty(this.name);
		}
		return instance[this._sGetter]();
	};

	Property.prototype.set = function(instance, oValue) {
		if ( this.visibility !== 'public' ) {
			return instance.setProperty(this.name, oValue);
		}
		return instance[this._sMutator](oValue);
	};

	// ---- Aggregation -----------------------------------------------------------------------

	/**
	 * Aggregation info object
	 * @private
	 * @since 1.27.1
	 */
	function Aggregation(oClass, name, info) {
		info = typeof info !== 'object' ? { type: info } : info;
		this.name = name;
		this.type = info.type || 'sap.ui.core.Control';
		this.altTypes = Array.isArray(info.altTypes) ? info.altTypes : undefined;
		this.multiple = typeof info.multiple === 'boolean' ? info.multiple : true;
		this.singularName = this.multiple ? info.singularName || guessSingularName(name) : undefined;
		this.bindable = !!info.bindable;
		this.deprecated = info.deprecated || false;
		this.visibility = info.visibility || 'public';
		this.selector = info.selector || null;
		this.forwarding = info.forwarding;
		this._doesNotRequireFactory = !!info._doesNotRequireFactory; // TODO clarify if public
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = 'aggregation:' + name;
		this._iKind = this.multiple ? Kind.MULTIPLE_AGGREGATION : Kind.SINGLE_AGGREGATION;
		this._oForwarder = this.forwarding ? new AggregationForwarder(this) : undefined;
		var N = capitalize(name);
		this._sGetter = 'get' + N;
		if ( this.multiple ) {
			var N1 = capitalize(this.singularName);
			this._sMutator = 'add' + N1;
			this._sInsertMutator = 'insert' + N1;
			this._sRemoveMutator = 'remove' + N1;
			this._sRemoveAllMutator = 'removeAll' + N;
			this._sIndexGetter = 'indexOf' + N1;
			this._sUpdater = 'update' + N;
			this._sRefresher = 'refresh' + N;
		} else {
			this._sMutator = 'set' + N;
			this._sInsertMutator =
			this._sRemoveMutator =
			this._sRemoveAllMutator =
			this._sIndexGetter =
			this._sUpdater =
			this._sRefresher = undefined;
		}
		this._sDestructor = 'destroy' + N;
		if ( this.bindable ) {
			this._sBind = 'bind' + N;
			this._sUnbind = 'unbind' + N;
		} else {
			this._sBind =
			this._sUnbind = undefined;
		}
	}

	/**
	 * @private
	 */
	Aggregation.prototype.generate = function(add) {
		var that = this,
			n = that.name;

		if ( !that.multiple ) {
			add(that._sGetter, function() { return this.getAggregation(n); });
			add(that._sMutator, function(v) { this.setAggregation(n,v); return this; }, that);
		} else {
			add(that._sGetter, function() { return this.getAggregation(n,[]); });
			add(that._sMutator, function(a) { this.addAggregation(n,a); return this; }, that);
			add(that._sInsertMutator, function(i,a) { this.insertAggregation(n,i,a); return this; }, that);
			add(that._sRemoveMutator, function(a) { return this.removeAggregation(n,a); });
			add(that._sRemoveAllMutator, function() { return this.removeAllAggregation(n); });
			add(that._sIndexGetter, function(a) { return this.indexOfAggregation(n,a); });
		}
		add(that._sDestructor, function() { this.destroyAggregation(n); return this; });
		if ( that.bindable ) {
			add(that._sBind, function(p,t,s,f) { this.bindAggregation(n,p,t,s,f); return this; }, that);
			add(that._sUnbind, function(p) { this.unbindAggregation(n,p); return this; });
		}
	};

	Aggregation.prototype.getType = function() {
		return this._oType || (this._oType = DataType.getType(this.type));
	};

	Aggregation.prototype.get = function(instance) {
		if ( this.visibility !== 'public' ) {
			return instance.getAggregation(this.name, this.multiple ? [] : undefined);
		}
		return instance[this._sGetter]();
	};

	Aggregation.prototype.set = function(instance, oValue) {
		if ( this.visibility !== 'public' ) {
			return instance.setAggregation(this.name, oValue);
		}
		return instance[this._sMutator](oValue);
	};

	Aggregation.prototype.add = function(instance, oValue) {
		if ( this.visibility !== 'public' ) {
			return instance.addAggregation(this.name, oValue);
		}
		return instance[this._sMutator](oValue);
	};

	Aggregation.prototype.insert = function(instance, oValue, iPos) {
		if ( this.visibility !== 'public' ) {
			return instance.insertAggregation(this.name, oValue, iPos);
		}
		return instance[this._sInsertMutator](oValue, iPos);
	};

	Aggregation.prototype.remove = function(instance, vValue) {
		if ( this.visibility !== 'public' ) {
			return instance.removeAggregation(this.name, vValue);
		}
		return instance[this._sRemoveMutator](vValue);
	};

	Aggregation.prototype.removeAll = function(instance) {
		if ( this.visibility !== 'public' ) {
			return instance.removeAllAggregation(this.name);
		}
		return instance[this._sRemoveAllMutator]();
	};

	Aggregation.prototype.indexOf = function(instance, oValue) {
		if ( this.visibility !== 'public' ) {
			return instance.indexOfAggregation(this.name, oValue);
		}
		return instance[this._sIndexGetter](oValue);
	};

	Aggregation.prototype.destroy = function(instance) {
		return instance[this._sDestructor]();
	};

	Aggregation.prototype.update = function(instance, sChangeReason) {
		if (instance[this._sUpdater]) {
			instance[this._sUpdater](sChangeReason);
		} else {
			//no change reason
			instance.updateAggregation(this.name);
		}
	};

	Aggregation.prototype.refresh = function(instance, sChangeReason) {
		if (instance[this._sRefresher]) {
			instance[this._sRefresher](sChangeReason);
		} else {
			//fallback there was no refresher before
			this.update(instance, sChangeReason);
		}
	};

	function AggregationForwarder(oAggregation) {
		var oForwardTo = oAggregation.forwarding;
		this.aggregation = oAggregation; // source aggregation info
		this.targetAggregationName = oForwardTo.aggregation;
		this.forwardBinding = oForwardTo.forwardBinding;
		this.targetAggregationInfo = null; // resolve lazily

		// make sure we have a way to get the target control
		if (oForwardTo.getter) {
			if (typeof oForwardTo.getter === "function") {
				this._getTarget = oForwardTo.getter;

			} else { // name of the function which returns the target element
				this._getTarget = (function(sGetterName) {
					return function() {
						return this[sGetterName](); // "this" context is the ManagedObject instance
					};
				})(oForwardTo.getter);
			}

		} else if (oForwardTo.idSuffix) { // target given by ID
			this._getTarget = (function(sIdSuffix) {
				return function() {
					return sap.ui.getCore().byId(this.getId() + sIdSuffix); // "this" context is the ManagedObject instance
				};
			})(oForwardTo.idSuffix);

		} else {
			throw new Error("Either getter or idSuffix must be given for forwarding the aggregation " + oAggregation.name
				+ " to the aggregation " + oForwardTo.aggregation + " in " + oAggregation._oParent.getName());
		}
	}

	AggregationForwarder.prototype._getTargetAggregationInfo = function(oTarget) {
		var oTargetAggregationInfo = this.targetAggregationInfo;
		if (!oTargetAggregationInfo && oTarget) {
			oTargetAggregationInfo = this.targetAggregationInfo = oTarget.getMetadata().getAggregation(this.targetAggregationName);

			if (!oTargetAggregationInfo) {
				throw new Error("Target aggregation " + this.targetAggregationName + " not found on " + oTarget);
			}

			if (this.aggregation.multiple && !oTargetAggregationInfo.multiple) { // cannot forward multi-to-single
				throw new Error("Aggregation " + this.aggregation + " (multiple: " + this.aggregation.multiple + ") cannot be forwarded to aggregation "
						+ this.targetAggregationName + " (multiple: " + oTargetAggregationInfo.multiple + ")");
			}
			if (!this.aggregation.multiple && oTargetAggregationInfo.multiple && this.aggregation.forwarding.forwardBinding) { // cannot forward bindings for single-to-multi
				throw new Error("Aggregation " + this.aggregation + " (multiple: " + this.aggregation.multiple + ") cannot be forwarded to aggregation "
						+ this.targetAggregationName + " (multiple: " + oTargetAggregationInfo.multiple + ") with 'forwardBinding' set to 'true'");
			}
		}
		return oTargetAggregationInfo;
	};

	/*
	 * Returns the forwarding target instance and ensures that this.targetAggregationInfo is available
	 */
	AggregationForwarder.prototype.getTarget = function(oInstance, bConnectTargetInfo) {
		var oTarget = this._getTarget.call(oInstance);
		this._getTargetAggregationInfo(oTarget);

		if (oTarget) {
			oInstance.mForwardedAggregations = oInstance.mForwardedAggregations || {};

			if (oInstance.mForwardedAggregations[this.aggregation.name] === undefined || bConnectTargetInfo) {
				// once the target is there, connect the aggregations:
				// Make mForwardedAggregations[name] a pointer to mAggregations[name] of the target, so the former always has the same elements,
				// without the need to update when elements are added/removed and without increasing memory for pointers per aggregated element
				// which would be required in a copy of the map
				var vTargetAggregation = oTarget.mAggregations[this.targetAggregationInfo.name];
				if (vTargetAggregation // target aggregation may not exist yet ... but an empty array is ok
						&& !bConnectTargetInfo
						&& !this.aggregation.forwarding.forwardBinding
						&& !(Array.isArray(vTargetAggregation) && vTargetAggregation.length === 0)) {
					// there should not be any content in the target at the time when the target has been found for the first time
					throw new Error("There is already content in aggregation " + this.targetAggregationInfo.name + " of " + oTarget + " to which forwarding is being set up now.");
				} else {
					var vInitial = oTarget.mAggregations[this.targetAggregationInfo.name] || (this.targetAggregationInfo.multiple ? [] : null); // initialize aggregation for the target
					oInstance.mForwardedAggregations[this.aggregation.name] = oTarget.mAggregations[this.targetAggregationInfo.name] = vInitial;
				}
			}
		}

		return oTarget;
	};

	AggregationForwarder.prototype.get = function(oInstance) {
		var oTarget = this.getTarget(oInstance);
		if (oTarget) {
			var result = this.targetAggregationInfo.get(oTarget);
			if (!this.aggregation.multiple && this.targetAggregationInfo.multiple) { // single-to-multi forwarding
				result = result[0]; // unwrap the element or return undefined if empty array was returned
			}
			return result;
		} else { // before target of forwarding exists
			return this.aggregation.multiple ? [] : null;
		}
	};

	AggregationForwarder.prototype.indexOf = function(oInstance, oAggregatedObject) {
		var oTarget = this.getTarget(oInstance);
		return this.targetAggregationInfo.indexOf(oTarget, oAggregatedObject);
	};

	AggregationForwarder.prototype.set = function(oInstance, oAggregatedObject) {
		var oTarget = this.getTarget(oInstance);
		// TODO oInstance.observer

		oInstance.mForwardedAggregations[this.aggregation.name] = oAggregatedObject;

		if (this.targetAggregationInfo.multiple) {
			// target aggregation is multiple, but should behave like single (because the source aggregation is single)
			var oPreviousElement = this.targetAggregationInfo.get(oTarget);
			if (oPreviousElement && oPreviousElement[0]) {
				if (oPreviousElement[0] === oAggregatedObject) { // no modification if same element is set
					return oInstance;
				}
				this.targetAggregationInfo.removeAll(oTarget);
			}
			ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
			this.targetAggregationInfo.add(oTarget, oAggregatedObject);
		} else {
			ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
			this.targetAggregationInfo.set(oTarget, oAggregatedObject);
		}
		ManagedObjectMetadata.addAPIParentInfoEnd(oAggregatedObject);

		return oInstance;
	};

	AggregationForwarder.prototype.add = function(oInstance, oAggregatedObject) {
		var oTarget = this.getTarget(oInstance);
		// TODO oInstance.observer

		ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
		this.targetAggregationInfo.add(oTarget, oAggregatedObject);
		ManagedObjectMetadata.addAPIParentInfoEnd(oAggregatedObject);

		return oInstance;
	};

	AggregationForwarder.prototype.insert = function(oInstance, oAggregatedObject, iIndex) {
		var oTarget = this.getTarget(oInstance);
		// TODO oInstance.observer

		ManagedObjectMetadata.addAPIParentInfoBegin(oAggregatedObject, oInstance, this.aggregation.name);
		this.targetAggregationInfo.insert(oTarget, oAggregatedObject, iIndex);
		ManagedObjectMetadata.addAPIParentInfoEnd(oAggregatedObject);

		return oInstance;
	};

	/**
	 * Adds information to the given oAggregatedObject about its original API parent (or a subsequent API parent in case of multiple forwarding).
	 * MUST be called before an element is forwarded to another internal aggregation (in case forwarding is done explicitly/manually without using
	 * the declarative mechanism introduced in UI5 1.56).
	 *
	 * CAUTION: ManagedObjectMetadata.addAPIParentInfoEnd(...) MUST be called AFTER the element has been forwarded (set to an aggregation of an
	 * internal control). These two calls must wrap the forwarding.
	 *
	 * @param {sap.ui.base.ManagedObject} oAggregatedObject Object to which the new API parent info should be added
	 * @param {sap.ui.base.ManagedObject} oParent Object that is a new API parent
	 * @param {string} sAggregationName the name of the aggregation under which oAggregatedObject is aggregated by the API parent
	 * @protected
	 */
	ManagedObjectMetadata.addAPIParentInfoBegin = function(oAggregatedObject, oParent, sAggregationName) {
		if (!oAggregatedObject) {
			return;
		}

		var oNewAPIParentInfo = {parent: oParent, aggregationName: sAggregationName};

		if (oAggregatedObject.aAPIParentInfos) {
			if (oAggregatedObject.aAPIParentInfos.forwardingCounter) { // defined and >= 1
				// this is another forwarding step from an element that was already the target of forwarding
				oAggregatedObject.aAPIParentInfos.forwardingCounter++;
			} else {
				// this is a fresh new round of aggregation forwarding, remove any previous forwarding info
				delete oAggregatedObject.aAPIParentInfos;
			}
		}

		// update API parent of oAggregatedObject
		if (!oAggregatedObject.aAPIParentInfos) {
			oAggregatedObject.aAPIParentInfos = [oNewAPIParentInfo];
			oAggregatedObject.aAPIParentInfos.forwardingCounter = 1;
		} else {
			oAggregatedObject.aAPIParentInfos.push(oNewAPIParentInfo);
		}
	};

	/**
	 * Completes the information about the original API parent of the given element.
	 * MUST be called after an element is forwarded to another internal aggregation. For every call to
	 * ManagedObjectMetadata.addAPIParentInfoBegin(...) this method here must be called as well.
	 *
	 * @param {sap.ui.base.ManagedObject} oAggregatedObject Object to which the new API parent info should be added
	 * @protected
	 */
	ManagedObjectMetadata.addAPIParentInfoEnd = function(oAggregatedObject) {
		oAggregatedObject && oAggregatedObject.aAPIParentInfos.forwardingCounter--;
	};

	AggregationForwarder.prototype.remove = function(oInstance, vAggregatedObject) {
		var oTarget = this.getTarget(oInstance);
		// TODO oInstance.observer
		var result = this.targetAggregationInfo.remove(oTarget, vAggregatedObject);
		// remove API parent of removed element (if any)
		if (result /* && result.aAPIParentInfos */) {
			// the second part should always be true when added via forwarding, but MultiInput still has a function "setTokens"
			// that forwards directly. That one now also sets the API parent info.
			// When aAPIParentInfos is there, then the other conditions are always true:
			// && result.aAPIParentInfos.length && result.aAPIParentInfos[result.aAPIParentInfos.length-1].parent === oInstance
			result.aAPIParentInfos && result.aAPIParentInfos.pop();
		}
		return result;
	};

	AggregationForwarder.prototype.removeAll = function(oInstance) {
		var oTarget = this.getTarget(oInstance);
		// TODO oInstance.observer

		delete oInstance.mForwardedAggregations[this.aggregation.name];

		var aRemoved = this.targetAggregationInfo.removeAll(oTarget);
		// update API parent of removed objects
		for (var i = 0; i < aRemoved.length; i++) {
			if (aRemoved[i].aAPIParentInfos) {
				aRemoved[i].aAPIParentInfos.pop();
			}
		}
		return aRemoved;
	};

	AggregationForwarder.prototype.destroy = function(oInstance) {
		var oTarget = this.getTarget(oInstance);
		// TODO oInstance.observer

		delete oInstance.mForwardedAggregations[this.aggregation.name];

		if (oTarget) {
			this.targetAggregationInfo.destroy(oTarget);
		}
		// API parent info of objects being destroyed is removed in ManagedObject.prototype.destroy()
		return oInstance;
	};


	// ---- Association -----------------------------------------------------------------------

	/**
	 * Association info object
	 * @private
	 * @since 1.27.1
	 */
	function Association(oClass, name, info) {
		info = typeof info !== 'object' ? { type: info } : info;
		this.name = name;
		this.type = info.type || 'sap.ui.core.Control';
		this.multiple = info.multiple || false;
		this.singularName = this.multiple ? info.singularName || guessSingularName(name) : undefined;
		this.deprecated = info.deprecated || false;
		this.visibility = info.visibility || 'public';
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = 'association:' + name;
		this._iKind = this.multiple ? Kind.MULTIPLE_ASSOCIATION : Kind.SINGLE_ASSOCIATION;
		var N = capitalize(name);
		this._sGetter = 'get' + N;
		if ( this.multiple ) {
			var N1 = capitalize(this.singularName);
			this._sMutator = 'add' + N1;
			this._sRemoveMutator = 'remove' + N1;
			this._sRemoveAllMutator = 'removeAll' + N;
		} else {
			this._sMutator = 'set' + N;
			this._sRemoveMutator =
			this._sRemoveAllMutator = undefined;
		}
	}

	/**
	 * @private
	 */
	Association.prototype.generate = function(add) {
		var that = this,
			n = that.name;

		if ( !that.multiple ) {
			add(that._sGetter, function() { return this.getAssociation(n); });
			add(that._sMutator, function(v) { this.setAssociation(n,v); return this; }, that);
		} else {
			add(that._sGetter, function() { return this.getAssociation(n,[]); });
			add(that._sMutator, function(a) { this.addAssociation(n,a); return this; }, that);
			add(that._sRemoveMutator, function(a) { return this.removeAssociation(n,a); });
			add(that._sRemoveAllMutator, function() { return this.removeAllAssociation(n); });
			if ( n !== that.singularName ) {
				add('removeAll' + capitalize(that.singularName), function() {
					Log.warning("Usage of deprecated method " +
						that._oParent.getName() + ".prototype." + 'removeAll' + capitalize(that.singularName) + "," +
						" use method " + that._sRemoveAllMutator  + " (plural) instead.");
					return this[that._sRemoveAllMutator]();
				});
			}
		}
	};

	Association.prototype.getType = function() {
		return this._oType || (this._oType = DataType.getType(this.type));
	};

	Association.prototype.get = function(instance) {
		if ( this.visibility !== 'public' ) {
			return instance.getAssociation(this.name, this.multiple ? [] : undefined);
		}
		return instance[this._sGetter]();
	};

	Association.prototype.set = function(instance, oValue) {
		if ( this.visibility !== 'public' ) {
			return instance.setAssociation(this.name, oValue);
		}
		return instance[this._sMutator](oValue);
	};

	Association.prototype.add = function(instance, oValue) {
		if ( this.visibility !== 'public' ) {
			return instance.addAssociation(this.name, oValue);
		}
		return instance[this._sMutator](oValue);
	};

	Association.prototype.remove = function(instance, vValue) {
		if ( this.visibility !== 'public' ) {
			return instance.removeAssociation(this.name, vValue);
		}
		return instance[this._sRemoveMutator](vValue);
	};

	Association.prototype.removeAll = function(instance) {
		if ( this.visibility !== 'public' ) {
			return instance.removeAllAssociation(this.name);
		}
		return instance[this._sRemoveAllMutator]();
	};

	// ---- Event -----------------------------------------------------------------------------

	/**
	 * Event info object
	 * @private
	 * @since 1.27.1
	 */
	function Event(oClass, name, info) {
		this.name = name;
		this.allowPreventDefault = info.allowPreventDefault || false;
		this.deprecated = info.deprecated || false;
		this.visibility = 'public';
		this.allowPreventDefault = !!info.allowPreventDefault;
		this.enableEventBubbling = !!info.enableEventBubbling;
		this.appData = remainder(this, info);
		this._oParent = oClass;
		this._sUID = 'event:' + name;
		this._iKind = Kind.EVENT;
		var N = capitalize(name);
		this._sMutator = 'attach' + N;
		this._sDetachMutator = 'detach' + N;
		this._sTrigger = 'fire' + N;
	}

	/**
	 * @private
	 */
	Event.prototype.generate = function(add) {
		var that = this,
			n = that.name,
			allowPreventDefault = that.allowPreventDefault,
			enableEventBubbling = that.enableEventBubbling;

		add(that._sMutator, function(d,f,o) { this.attachEvent(n,d,f,o); return this; }, that);
		add(that._sDetachMutator, function(f,o) { this.detachEvent(n,f,o); return this; });
		add(that._sTrigger, function(p) { return this.fireEvent(n,p, allowPreventDefault, enableEventBubbling); });
	};

	Event.prototype.attach = function(instance,data,fn,listener) {
		return instance[this._sMutator](data,fn,listener);
	};

	Event.prototype.detach = function(instance,fn,listener) {
		return instance[this._sDetachMutator](fn,listener);
	};

	Event.prototype.fire = function(instance,params, allowPreventDefault, enableEventBubbling) {
		return instance[this._sTrigger](params, allowPreventDefault, enableEventBubbling);
	};

	// ----------------------------------------------------------------------------------------

	ManagedObjectMetadata.prototype.metaFactorySpecialSetting = SpecialSetting;
	ManagedObjectMetadata.prototype.metaFactoryProperty = Property;
	ManagedObjectMetadata.prototype.metaFactoryAggregation = Aggregation;
	ManagedObjectMetadata.prototype.metaFactoryAssociation = Association;
	ManagedObjectMetadata.prototype.metaFactoryEvent = Event;

	/**
	 * @private
	 */
	ManagedObjectMetadata.prototype.applySettings = function(oClassInfo) {

		var that = this,
			oStaticInfo = oClassInfo.metadata;

		Metadata.prototype.applySettings.call(this, oClassInfo);

		function normalize(mInfoMap, FNClass) {
			var mResult = {},
				sName;

			if ( mInfoMap ) {
				for (sName in mInfoMap) {
					if ( hasOwnProperty.call(mInfoMap, sName) ) {
						mResult[sName] = new FNClass(that, sName, mInfoMap[sName]);
					}
				}
			}

			return mResult;
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

		// init basic metadata from static information and fallback to defaults
		this._sLibraryName = oStaticInfo.library || defaultLibName(this.getName());
		this._mSpecialSettings = normalize(oStaticInfo.specialSettings, this.metaFactorySpecialSetting);
		var mAllProperties = normalize(oStaticInfo.properties, this.metaFactoryProperty);
		this._mProperties = filter(mAllProperties, true);
		this._mPrivateProperties = filter(mAllProperties, false);
		var mAllAggregations = normalize(oStaticInfo.aggregations, this.metaFactoryAggregation);
		this._mAggregations = filter(mAllAggregations, true);
		this._mPrivateAggregations = filter(mAllAggregations, false);
		this._sDefaultAggregation = oStaticInfo.defaultAggregation || null;
		this._sDefaultProperty = oStaticInfo.defaultProperty || null;
		var mAllAssociations = normalize(oStaticInfo.associations, this.metaFactoryAssociation);
		this._mAssociations = filter(mAllAssociations, true);
		this._mPrivateAssociations = filter(mAllAssociations, false);
		this._mEvents = normalize(oStaticInfo.events, this.metaFactoryEvent);

		// as oClassInfo is volatile, we need to store the info
		this._oDesignTime = oClassInfo.metadata["designtime"] || oClassInfo.metadata["designTime"];
		this._sProvider = oClassInfo.metadata["provider"];

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
		if ( oParent instanceof ManagedObjectMetadata ) {
			this._mAllEvents = jQuery.extend({}, oParent._mAllEvents, this._mEvents);
			this._mAllPrivateProperties = jQuery.extend({}, oParent._mAllPrivateProperties, this._mPrivateProperties);
			this._mAllProperties = jQuery.extend({}, oParent._mAllProperties, this._mProperties);
			this._mAllPrivateAggregations = jQuery.extend({}, oParent._mAllPrivateAggregations, this._mPrivateAggregations);
			this._mAllAggregations = jQuery.extend({}, oParent._mAllAggregations, this._mAggregations);
			this._mAllPrivateAssociations = jQuery.extend({}, oParent._mAllPrivateAssociations, this._mPrivateAssociations);
			this._mAllAssociations = jQuery.extend({}, oParent._mAllAssociations, this._mAssociations);
			this._sDefaultAggregation = this._sDefaultAggregation || oParent._sDefaultAggregation;
			this._sDefaultProperty = this._sDefaultProperty || oParent._sDefaultProperty;
			this._mAllSpecialSettings = jQuery.extend({}, oParent._mAllSpecialSettings, this._mSpecialSettings);
			this._sProvider = this._sProvider || oParent._sProvider;
		} else {
			this._mAllEvents = this._mEvents;
			this._mAllPrivateProperties = this._mPrivateProperties;
			this._mAllProperties = this._mProperties;
			this._mAllPrivateAggregations = this._mPrivateAggregations;
			this._mAllAggregations = this._mAggregations;
			this._mAllPrivateAssociations = this._mPrivateAssociations;
			this._mAllAssociations = this._mAssociations;
			this._mAllSpecialSettings = this._mSpecialSettings;
		}

	};

	ManagedObjectMetadata.Kind = Kind;

	/**
	 * Returns the name of the library that contains the described UIElement.
	 * @return {string} the name of the library
	 * @public
	 */
	ManagedObjectMetadata.prototype.getLibraryName = function() {
		return this._sLibraryName;
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
	 * @private
	 * @restricted sap.ui.core
	 * @see sap.ui.core.EnabledPropagator
	 */
	ManagedObjectMetadata.prototype.addProperty = function(sName, oInfo) {
		var oProp = this._mProperties[sName] = new Property(this, sName, oInfo);
		if (!this._mAllProperties[sName]) {// ensure extended AllProperties meta-data is also enriched
			this._mAllProperties[sName] = oProp;
		}
		// TODO notify listeners (subclasses) about change
	};

	/**
	 * Checks the existence of the given public property by its name
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} sName name of the property
	 * @returns {Object} An info object describing the property or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 */
	ManagedObjectMetadata.prototype.getProperty = function(sName) {
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of property info objects keyed by the property names
	 * @public
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of property info objects keyed by the property names
	 * @public
	 */
	ManagedObjectMetadata.prototype.getAllProperties = function() {
		return this._mAllProperties;
	};

	/**
	 * Returns a map of info objects for all private (hidden) properties of the described class,
	 * including private properties from the ancestor classes.
	 *
	 * The returned map contains property info objects keyed by the property name.
	 *
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of property info objects keyed by property names
	 * @protected
	 */
	ManagedObjectMetadata.prototype.getAllPrivateProperties = function() {
		return this._mAllPrivateProperties;
	};

	/**
	 * Returns the info object for the named public or private property declared by the
	 * described class or by any of its ancestors.
	 *
	 * If the name is not given (or has a falsy value), then it is substituted by the
	 * name of the default property of the described class (if it is defined).
	 *
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} sName name of the property to be retrieved or empty
	 * @return {object} property info object or undefined
	 * @protected
	 */
	ManagedObjectMetadata.prototype.getManagedProperty = function(sName) {
		sName = sName || this._sDefaultProperty;
		var oProp = sName ? this._mAllProperties[sName] || this._mAllPrivateProperties[sName] : undefined;
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return typeof oProp === 'object' ? oProp : undefined;
	};

	/**
	 * Returns the name of the default property of the described class.
	 *
	 * If the class itself does not define a default property, then the default property
	 * of the parent is returned. If no class in the hierarchy defines a default property,
	 * <code>undefined</code> is returned.
	 *
	 * @return {string} Name of the default property
	 */
	ManagedObjectMetadata.prototype.getDefaultPropertyName = function() {
		return this._sDefaultProperty;
	};

	/**
	 * Returns an info object for the default property of the described class.
	 *
	 * If the class itself does not define a default property, then the
	 * info object for the default property of the parent class is returned.
	 *
	 * @return {Object} An info object for the default property
	 */
	ManagedObjectMetadata.prototype.getDefaultProperty = function() {
		return this.getProperty(this.getDefaultPropertyName());
	};

	// ---- aggregations ----------------------------------------------------------------------

	/**
	 * Checks the existence of the given public aggregation by its name.
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} [sName] name of the aggregation or empty
	 * @returns {Object} An info object describing the aggregation or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 */
	ManagedObjectMetadata.prototype.getAggregation = function(sName) {
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of aggregation info objects keyed by aggregation names
	 * @public
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of aggregation info objects keyed by aggregation names
	 * @public
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of aggregation info objects keyed by aggregation names
	 * @protected
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} sAggregationName name of the aggregation to be retrieved or empty
	 * @return {object} aggregation info object or undefined
	 * @protected
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
	 * @public
	 * @since 1.73
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
	 * @public
	 * @since 1.73
	 */
	ManagedObjectMetadata.prototype.getDefaultAggregation = function() {
		return this.getAggregation();
	};

	/**
	 * Defines that an aggregation <code>sForwardedSourceAggregation</code> of the ManagedObject described by this metadata
	 * should be "forwarded" to an aggregation of an internal element within the composite.
	 *
	 * This means that all adding, removal, or other operations happening on the source aggregation are actually called on the target instance.
	 * All elements added to the source aggregation will be located at the target aggregation (this means the target instance is their parent).
	 * Both, source and target element will return the added elements when asked for the content of the respective aggregation.
	 * If present, the named (non-generic) aggregation methods will be called for the target aggregation.
	 *
	 * When the source aggregation is bound, the binding will by default take place there and the add/remove operations will be forwarded to the
	 * target. However, optionally the binding can also be forwarded. The result is similar - all added/bound items will reside at the target -
	 * but when the binding is forwarded, the updateAggregation method is called on the target element and the add/remove methods are only called
	 * on the target element as well.
	 *
	 * Aggregations can only be forwarded to other aggregations of the same multiplicity (single/multiple).
	 * The target aggregation must also be "compatible" to the source aggregation in the sense that any items given to the source aggregation
	 * must also be valid in the target aggregation (otherwise the target element will throw a validation error).
	 *
	 * If the forwarded elements use data binding, the target element must be properly aggregated by the source element
	 * to make sure all models are available there as well (this is anyway important to avoid issues).
	 *
	 * The aggregation target must remain the same instance across the entire lifetime of the source control.
	 *
	 * Aggregation forwarding must be set up before any instances of the control are created (recommended: within the class definition)
	 * to avoid situations where forwarding is not yet set up when the first aggregated item is added.
	 *
	 * Aggregation forwarding will behave unexpectedly when the content in the target aggregation is modified by other actors
	 * (e.g. by the target element or by another forwarding from a different source aggregation). Hence, this is not allowed.
	 *
	 * For any given source aggregation this method may only be called once. Calling it again overrides the previous forwarding, but leaves
	 * any already forwarded elements at their previous target.
	 *
	 * @example <caption>A composite control <code>ComboBox</code> internally uses a control <code>List</code> to display the items added to
	 * its own <code>items</code> aggregation. So it forwards the items to the <code>listItems</code> aggregation of the <code>List</code>.
	 * At runtime, the internal <code>List</code> is always instantiated in the <code>init()</code> method of the <code>ComboBox</code> control
	 * and its ID is created as concatenation of the ID of the <code>ComboBox</code> and the suffix "-internalList".</caption>
	 *
	 *   ComboBox.getMetadata().forwardAggregation(
	 *      "items",
	 *      {
	 *          idSuffix: "-internalList", // internal control with the ID <control id> + "-internalList" must always exist after init() has been called
	 *          aggregation: "listItems"
	 *      }
	 *   );
	 *
	 * @example <caption>Same as above, but the internal <code>List</code> is not always instantiated initially. It is only lazily instantiated
	 * in the method <code>ComboBox.prototype._getInternalList()</code>. Instead of the ID suffix, the getter function can be given.</caption>
	 *
	 *   ComboBox.getMetadata().forwardAggregation(
	 *      "items",
	 *      {
	 *          getter: ComboBox.prototype._getInternalList, // the function returning (and instantiating if needed) the target list at runtime
	 *          aggregation: "listItems"
	 *      }
	 *   );
	 *
	 * @param {string}
	 *            sForwardedSourceAggregation The name of the aggregation to be forwarded
	 * @param {object}
	 *            mOptions The forwarding target as well as additional options
	 * @param {string|function}
	 *            [mOptions.getter] The function that returns the target element instance (the "this" context inside the function is the source instance),
	 *            or the name of such a function on this ManagedObject type. Either getter or idSuffix (but not both) must be defined.
	 * @param {string}
	 *            [mOptions.idSuffix] The ID suffix of the target element (the full target ID is the source instance ID plus this suffix,
	 *            the target element must always be instantiated after the init() method has been executed).
	 *            Either getter or idSuffix (but not both) must be defined.
	 * @param {string}
	 *            mOptions.aggregation The name of the aggregation on the target instance where the forwarding should lead to
	 * @param {boolean}
	 *            [mOptions.forwardBinding] Whether a binding of the source aggregation should also be forwarded to the target aggregation
	 *            or rather handled on the source aggregation, so only the resulting aggregation method calls are forwarded
	 *
	 * @since 1.54
	 *
	 * @private
	 * @ui5-restricted SAPUI5 Distribution libraries only
	 * @experimental As of 1.54, this method is still in an experimental state. Its signature might change or it might be removed
	 *   completely. Controls should prefer to declare aggregation forwarding in the metadata for the aggregation. See property
	 *   <code>forwarding</code> in the documentation of {@link sap.ui.base.ManagedObject.extend ManagedObject.extend}.
	 */
	ManagedObjectMetadata.prototype.forwardAggregation = function(sForwardedSourceAggregation, mOptions) {

		var oAggregation = this.getAggregation(sForwardedSourceAggregation);
		if (!oAggregation) {
			throw new Error("aggregation " + sForwardedSourceAggregation + " does not exist");
		}

		if (!mOptions || !mOptions.aggregation || !(mOptions.idSuffix || mOptions.getter) || (mOptions.idSuffix && mOptions.getter)) {
			throw new Error("an 'mOptions' object with 'aggregation' property and either 'idSuffix' or 'getter' property (but not both) must be given"
				+ " but does not exist");
		}

		if (oAggregation._oParent === this) {
			// store the information on the aggregation
			oAggregation.forwarding = mOptions;
			oAggregation._oForwarder = new AggregationForwarder(oAggregation);
		} else {
			// aggregation is defined on superclass; clone&modify the aggregation info to contain the forwarding information
			oAggregation = new this.metaFactoryAggregation(this, sForwardedSourceAggregation, {
				type: oAggregation.type,
				altTypes: oAggregation.altTypes,
				multiple: oAggregation.multiple,
				singularName: oAggregation.singularName,
				bindable: oAggregation.bindable,
				deprecated: oAggregation.deprecated,
				visibility: oAggregation.visibility,
				selector: oAggregation.selector,
				forwarding: mOptions
			});
			this._mAggregations[sForwardedSourceAggregation] =
			this._mAllAggregations[sForwardedSourceAggregation] = oAggregation;
		}
	};

	/**
	 * Returns a forwarder for the given aggregation (or undefined, when there is no forwarding), considering also inherited aggregations.
	 * @private
	 */
	ManagedObjectMetadata.prototype.getAggregationForwarder = function(sAggregationName) {
		var oAggregation = this._mAllAggregations[sAggregationName];
		return oAggregation ? oAggregation._oForwarder : undefined;
	};

	/**
	 * Returns the name of the default property of the described class.
	 *
	 * If the class itself does not define a default property, then the default property
	 * of the parent is returned. If no class in the hierarchy defines a default property,
	 * <code>undefined</code> is returned.
	 *
	 * @return {string} Name of the default property
	 */
	ManagedObjectMetadata.prototype.getDefaultPropertyName = function() {
		return this._sDefaultProperty;
	};

	/**
	 * Returns an info object for the default property of the described class.
	 *
	 * If the class itself does not define a default property, then the
	 * info object for the default property of the parent class is returned.
	 *
	 * @return {Object} An info object for the default property
	 */
	ManagedObjectMetadata.prototype.getDefaultProperty = function() {
		return this.getProperty(this.getDefaultPropertyName());
	};

	/**
	 * Returns an info object for a public setting with the given name that either is
	 * a public property or a public aggregation of cardinality 0..1 and with at least
	 * one simple alternative type. The setting can be defined by the class itself or
	 * by one of its ancestor classes.
	 *
	 * If neither the described class nor its ancestor classes define a suitable setting
	 * with the given name, <code>undefined</code> is returned.
	 *
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} sName name of the property like setting
	 * @returns {Object} An info object describing the property or aggregation or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 */
	ManagedObjectMetadata.prototype.getPropertyLikeSetting = function(sName) {
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		var oProp = this._mAllProperties[sName];
		if ( typeof oProp === 'object' ) {
			return oProp;
		}
		oProp = this._mAllAggregations[sName];
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return ( typeof oProp === 'object' && oProp.altTypes && oProp.altTypes.length > 0 ) ? oProp : undefined;
	};

	// ---- associations ----------------------------------------------------------------------

	/**
	 * Checks the existence of the given public association by its name
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} sName name of the association
	 * @returns {Object} An info object describing the association or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 */
	ManagedObjectMetadata.prototype.getAssociation = function(sName) {
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of association info objects keyed by association names
	 * @public
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of association info objects keyed by association names
	 * @public
	 */
	ManagedObjectMetadata.prototype.getAllAssociations = function() {
		return this._mAllAssociations;
	};

	/**
	 * Returns a map of info objects for all private (hidden) associations of the described class,
	 * including private associations from the ancestor classes.
	 *
	 * The returned map contains association info objects keyed by the association name.
	 * In case of 0..1 associations this is the singular name, otherwise it is the plural name.
	 *
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of association info objects keyed by association names
	 * @protected
	 */
	ManagedObjectMetadata.prototype.getAllPrivateAssociations = function() {
		return this._mAllPrivateAssociations;
	};

	/**
	 * Returns the info object for the named public or private association declared by the
	 * described class or by any of its ancestors.
	 *
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} sName name of the association to be retrieved
	 * @return {object} association info object or undefined
	 * @protected
	 */
	ManagedObjectMetadata.prototype.getManagedAssociation = function(sName) {
		var oAggr = this._mAllAssociations[sName] || this._mAllPrivateAssociations[sName];
		// typeof is used as a fast (but weak) substitute for hasOwnProperty
		return typeof oAggr === 'object' ? oAggr : undefined;
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @param {string} sName name of the event
	 * @returns {Object} An info object describing the event or <code>undefined</code>
	 * @public
	 * @since 1.27.0
	 */
	ManagedObjectMetadata.prototype.getEvent = function(sName) {
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of event info objects keyed by event names
	 * @public
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
	 * <b>Warning:</b> Type, structure and behavior of the returned info objects is not documented
	 *   and therefore not part of the API. See the {@link #constructor Notes about Info objects}
	 *   in the constructor documentation of this class.
	 *
	 * @return {Object<string,Object>} Map of event info objects keyed by event names
	 * @public
	 */
	ManagedObjectMetadata.prototype.getAllEvents = function() {
		return this._mAllEvents;
	};

	// ---- special settings ------------------------------------------------------------------


	/**
	 * Adds a new special setting.
	 * Special settings are settings that are accepted in the mSettings
	 * object at construction time or in an {@link sap.ui.base.ManagedObject.applySettings}
	 * call but that are neither properties, aggregations, associations nor events.
	 *
	 * @param {string} sName name of the setting
	 * @param {object} oInfo metadata for the setting
	 * @private
	 * @restricted sap.ui.core
	 */
	ManagedObjectMetadata.prototype.addSpecialSetting = function (sName, oInfo) {
		var oSS = new SpecialSetting(this, sName, oInfo);
		this._mSpecialSettings[sName] = oSS;
		if (!this._mAllSpecialSettings[sName]) {
			this._mAllSpecialSettings[sName] = oSS;
		}
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
	 */
	ManagedObjectMetadata.prototype.hasSpecialSetting = function (sName) {
		return !!this._mAllSpecialSettings[sName];
	};

	// ----------------------------------------------------------------------------------------

	/**
	 * Returns a map of default values for all properties declared by the
	 * described class and its ancestors, keyed by the property name.
	 *
	 * @return {Object<string,any>} Map of default values keyed by property names
	 * @public
	 */
	ManagedObjectMetadata.prototype.getPropertyDefaults = function() {

		var mDefaults = this._mDefaults, s;

		if ( mDefaults ) {
			return mDefaults;
		}

		if ( this.getParent() instanceof ManagedObjectMetadata ) {
			mDefaults = jQuery.extend({}, this.getParent().getPropertyDefaults());
		} else {
			mDefaults = {};
		}

		for (s in this._mProperties) {
			mDefaults[s] = this._mProperties[s].getDefaultValue();
		}
		//Add the default values for private properties
		for (s in this._mPrivateProperties) {
			mDefaults[s] = this._mPrivateProperties[s].getDefaultValue();
		}
		this._mDefaults = mDefaults;
		return mDefaults;
	};

	ManagedObjectMetadata.prototype.createPropertyBag = function() {
		if ( !this._fnPropertyBagFactory ) {
			this._fnPropertyBagFactory = function PropertyBag() {};
			this._fnPropertyBagFactory.prototype = this.getPropertyDefaults();
		}
		return new (this._fnPropertyBagFactory)();
	};

	/**
	 * Returns a map with all settings of the described class..
	 * Mainly used for the {@link sap.ui.base.ManagedObject#applySettings} method.
	 *
	 * @see sap.ui.base.ManagedObject#applySettings
	 * @private
	 */
	ManagedObjectMetadata.prototype.getJSONKeys = function() {

		if ( this._mJSONKeys ) {
			return this._mJSONKeys;
		}

		var mAllSettings = {},
			mJSONKeys = {};

		function addKeys(m) {
			var sName, oInfo, oPrevInfo;
			for (sName in m) {
				oInfo = m[sName];
				oPrevInfo = mAllSettings[sName];
				if ( !oPrevInfo || oInfo._iKind < oPrevInfo._iKind ) {
					mAllSettings[sName] = mJSONKeys[sName] = oInfo;
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
		this._mAllSettings = mAllSettings;
		return this._mJSONKeys;
	};

	/**
	 * @private
	 */
	ManagedObjectMetadata.prototype.getAllSettings = function() {
		if ( !this._mAllSettings ) {
			this.getJSONKeys();
		}
		return this._mAllSettings;
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

		assert(mSettings == null || typeof mSettings === 'object', "mSettings must be null or an object");

		if ( mSettings == null ) {
			return mSettings;
		}

		var mValidKeys = this.getJSONKeys(),
			mResult = {},
			sName;

		for ( sName in mSettings ) {
			if ( hasOwnProperty.call(mValidKeys, sName) ) {
				mResult[sName] = mSettings[sName];
			}
		}

		return mResult;
	};

	ManagedObjectMetadata.prototype.generateAccessors = function() {

		var proto = this.getClass().prototype,
			prefix = this.getName() + ".",
			methods = this._aPublicMethods,
			n;

		function add(name, fn, info) {
			if ( !proto[name] ) {
				proto[name] = (info && info.deprecated) ? deprecation(fn, prefix + info.name) : fn;
			}
			methods.push(name);
		}

		for (n in this._mProperties) {
			this._mProperties[n].generate(add);
		}
		for (n in this._mAggregations) {
			this._mAggregations[n].generate(add);
		}
		for (n in this._mAssociations) {
			this._mAssociations[n].generate(add);
		}
		for (n in this._mEvents) {
			this._mEvents[n].generate(add);
		}
	};

	// ---- Design Time capabilities -------------------------------------------------------------

	/**
	 * Returns a promise that resolves if the designtime preload of a library is loaded for the given oMetadata
	 * object is loaded.
	 * If the corresponding library does not contain a designtime setting with a module path to the library.designtime file
	 * the promise resolves immediately.
	 *
	 * @private
	 */
	function preloadDesigntimeLibrary(oMetadata) {
		//preload the designtime data for the library
		var sLibrary = oMetadata.getLibraryName(),
			sPreload = sap.ui.getCore().getConfiguration().getPreload(),
			oLibrary = sap.ui.getCore().getLoadedLibraries()[sLibrary];
		if (oLibrary && oLibrary.designtime) {
			var oPromise;
			if (sPreload === "async" || sPreload === "sync") {
				//ignore errors _loadJSResourceAsync is true here, do not break if there is no preload.
				oPromise = sap.ui.loader._.loadJSResourceAsync(oLibrary.designtime.replace(/\.designtime$/, "-preload.designtime.js"), true);
			} else {
				oPromise = Promise.resolve();
			}
			return new Promise(function(fnResolve, fnReject) {
				oPromise.then(function() {
					sap.ui.require([oLibrary.designtime], function(oLib) {
						fnResolve(oLib);
					}, fnReject);
				});
			});
		}
		return Promise.resolve(null);
	}

	/**
	 * Returns a promise that resolves with the own, unmerged designtime data.
	 * If the class is marked as having no designtime data, the promise will resolve with null.
	 *
	 * @private
	 */
	function loadOwnDesignTime(oMetadata) {
		if (isPlainObject(oMetadata._oDesignTime) || !oMetadata._oDesignTime) {
			return Promise.resolve(oMetadata._oDesignTime || {});
		}

		return new Promise(function(fnResolve, fnReject) {
			var sModule;
			if (typeof oMetadata._oDesignTime === "string") {
				//oMetadata._oDesignTime points to resource path to another file, for example: "sap/ui/core/designtime/<control>.designtime"
				sModule = oMetadata._oDesignTime;
			} else {
				sModule = oMetadata.getName().replace(/\./g, "/") + ".designtime";
			}
			preloadDesigntimeLibrary(oMetadata).then(function(oLib) {
				sap.ui.require([sModule], function(mDesignTime) {
					mDesignTime.designtimeModule = sModule;
					oMetadata._oDesignTime = mDesignTime;
					mDesignTime._oLib = oLib;
					fnResolve(mDesignTime);
				}, fnReject);
			});
		});
	}

	var mPredefinedDesignTimeModules = {};

	/**
	 * Sets the map with the module names to predefined DesignTime objects which will be available in {@link sap.ui.base.ManagedObjectMetadata.prototype.loadDesignTime}
	 * @param {Object<string,string>} mPredefinedDesignTime map containing the module names
	 * @private
	 * @ui5-restricted sap.ui.dt
	 */
	ManagedObjectMetadata.setDesignTimeDefaultMapping = function(mPredefinedDesignTime) {
		mPredefinedDesignTimeModules = mPredefinedDesignTime;
	};

	/**
	 * Returns a promise that resolves with the instance specific, unmerged designtime data.
	 * If no instance is provided, the promise will resolve with {}.
	 *
	 * @private
	 */
	function loadInstanceDesignTime(oInstance) {
		var sInstanceSpecificModule =
			oInstance instanceof ObjectPath.get('sap.ui.base.ManagedObject')
			&& typeof oInstance.data === "function"
			&& oInstance.data("sap-ui-custom-settings")
			&& oInstance.data("sap-ui-custom-settings")["sap.ui.dt"]
			&& oInstance.data("sap-ui-custom-settings")["sap.ui.dt"].designtime;

		if (typeof sInstanceSpecificModule === "string") {
			sInstanceSpecificModule = mPredefinedDesignTimeModules[sInstanceSpecificModule] || sInstanceSpecificModule;

			return new Promise(function(fnResolve, fnReject) {
				sap.ui.require([sInstanceSpecificModule], function(vDesignTime) {
					if (typeof vDesignTime === "function") {
						fnResolve(vDesignTime(oInstance));
					} else {
						fnResolve(vDesignTime);
					}
				}, fnReject);
			});
		} else {
			return Promise.resolve({});
		}
	}

	/**
	 * Extracts metadata from metadata map by scope key
	 * @param {object} mMetadata metadata map received from loader
	 * @param {string} sScopeKey scope name to be extracted
	 * @private
	 */
	function getScopeBasedDesignTime(mMetadata, sScopeKey) {
		var mResult = mMetadata;

		if ("default" in mMetadata) {
			mResult = merge(
				{},
				mMetadata.default,
				sScopeKey !== "default" && mMetadata[sScopeKey] || null
			);
		}

		return mResult;
	}

	function mergeDesignTime(mOwnDesignTime, mParentDesignTime, sScopeKey){
		// we use "sap/base/util/merge" to be able to also overwrite properties with null or undefined
		// using deep extend to inherit full parent designtime, unwanted inherited properties have to be overwritten with undefined
		return merge(
			{},
			getScopeBasedDesignTime(mParentDesignTime, sScopeKey),
			//non inherited DT properties
			{
				templates: {
					create: null //create template will not be inherited, they are special to the current type.
				}
			},
			getScopeBasedDesignTime(mOwnDesignTime, sScopeKey), {
				designtimeModule: mOwnDesignTime.designtimeModule || undefined,
				_oLib: mOwnDesignTime._oLib
			}
		);
	}

	/**
	 * Load and returns the design time metadata asynchronously. It inherits/merges parent
	 * design time metadata and if provided merges also instance specific design time
	 * metadata that was provided via the dt namespace.
	 *
	 * Be aware that ManagedObjects do not ensure to have unique IDs. This may lead to
	 * issues if you would like to persist DesignTime based information. In that case
	 * you need to take care of identification yourself.
	 *
	 * @param {sap.ui.base.ManagedObject} [oManagedObject] instance that could have instance specific design time metadata
	 * @param {string} [sScopeKey] scope name for which metadata will be resolved, see sap.ui.base.ManagedObjectMetadataScope
	 * @return {Promise} A promise which will return the loaded design time metadata
	 * @private
	 * @ui5-restricted sap.ui.dt com.sap.webide
	 * @since 1.48.0
	 */
	ManagedObjectMetadata.prototype.loadDesignTime = function(oManagedObject, sScopeKey) {
		sScopeKey = typeof sScopeKey === "string" && sScopeKey || "default";

		var oInstanceDesigntimeLoaded = loadInstanceDesignTime(oManagedObject);

		if (!this._oDesignTimePromise) {
			// Note: parent takes care of merging its ancestors
			var oWhenParentLoaded;
			var oParent = this.getParent();
			// check if the mixin is applied to the parent
			if (oParent instanceof ManagedObjectMetadata) {
				oWhenParentLoaded = oParent.loadDesignTime(null, sScopeKey);
			} else {
				oWhenParentLoaded = Promise.resolve({});
			}
			// Note that the ancestor designtimes and the own designtime will be loaded 'in parallel',
			// only the merge is done in sequence by chaining promises
			this._oDesignTimePromise = loadOwnDesignTime(this).then(function(mOwnDesignTime) {
				return oWhenParentLoaded.then(function(mParentDesignTime) {
					return mergeDesignTime(mOwnDesignTime, mParentDesignTime, sScopeKey);
				});
			});
		}

		return Promise.all([oInstanceDesigntimeLoaded, this._oDesignTimePromise])
			.then(function(aData){
				var oInstanceDesigntime = aData[0],
					oDesignTime = aData[1];
				return merge(
					{},
					oDesignTime,
					getScopeBasedDesignTime(oInstanceDesigntime || {}, sScopeKey)
				);
			});
	};

	// ---- autoid creation -------------------------------------------------------------

	/**
	 * Usage counters for the different UID tokens
	 */
	var mUIDCounts = {},
		sUIDPrefix;

	function uid(sId) {
		assert(!/[0-9]+$/.exec(sId), "AutoId Prefixes must not end with numbers");

		//read prefix from configuration only once
		sId = (sUIDPrefix || (sUIDPrefix = sap.ui.getCore().getConfiguration().getUIDPrefix())) + sId;

		// read counter (or initialize it)
		var iCount = mUIDCounts[sId] || 0;

		// increment counter
		mUIDCounts[sId] = iCount + 1;

		// combine prefix + counter
		// concatenating sId and a counter is only safe because we don't allow trailing numbers in sId!
		return sId + iCount;
	}

	/**
	 * Calculates a new ID based on a prefix.
	 *
	 * To guarantee uniqueness of the generated IDs across all ID prefixes,
	 * prefixes must not end with digits.
	 *
	 * @param {string} sIdPrefix prefix for the new ID
	 * @return {string} A (hopefully unique) control id
	 * @public
	 * @function
	 */
	ManagedObjectMetadata.uid = uid;

	/**
	 * Calculates a new ID for an instance of this class.
	 *
	 * Note that the calculated short name part is usually not unique across
	 * all classes, but doesn't have to be. It might even be empty when the
	 * class name consists of invalid characters only.
	 *
	 * @return {string} A (hopefully unique) control ID
	 * @public
	 */
	ManagedObjectMetadata.prototype.uid = function() {

		var sId = this._sUIDToken;
		if ( typeof sId !== "string" ) {
			// start with qualified class name
			sId = this.getName();
			// reduce to unqualified name
			sId = sId.slice(sId.lastIndexOf('.') + 1);
			// reduce a camel case, multi word name to the last word
			sId = sId.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").slice(-1)[0];
			// remove unwanted chars (and no trailing digits!) and convert to lower case
			sId = this._sUIDToken = sId.replace(/([^A-Za-z0-9-_.:])|([0-9]+$)/g,"").toLowerCase();
		}

		return uid(sId);
	};

	var rGeneratedUID;

	/**
	 * Test whether a given ID looks like it was automatically generated.
	 *
	 * Examples:
	 * <pre>
	 * True for:
	 *   "foo--__bar04--baz"
	 *   "foo--__bar04"
	 *   "__bar04--baz"
	 *   "__bar04"
	 *   "__bar04--"
	 *   "__bar04--foo"
	 * False for:
	 *   "foo__bar04"
	 *   "foo__bar04--baz"
	 * </pre>
	 *
	 * See {@link sap.ui.base.ManagedObjectMetadata.prototype.uid} for details on ID generation.
	 *
	 * @param {string} sId the ID that should be tested
	 * @return {boolean} whether the ID is likely to be generated
	 * @static
	 * @public
	 */
	ManagedObjectMetadata.isGeneratedId = function(sId) {
		sUIDPrefix = sUIDPrefix || sap.ui.getCore().getConfiguration().getUIDPrefix();
		rGeneratedUID = rGeneratedUID || new RegExp( "(^|-{1,3})" + escapeRegExp(sUIDPrefix) );

		return rGeneratedUID.test(sId);
	};

	return ManagedObjectMetadata;

}, /* bExport= */ true);