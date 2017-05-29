/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.ManagedObjectObserver.
sap.ui.define([
	'sap/ui/base/ManagedObject', 'sap/ui/dt/ElementUtil'
], function(ManagedObject, ElementUtil) {
	"use strict";

	/**
	 * Constructor for a new ManagedObjectObserver.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ManagedObjectObserver observes changes of a ManagedObject and propagates them via events.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ManagedObjectObserver
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be modified in future.
	 */
	var ManagedObjectObserver = ManagedObject.extend("sap.ui.dt.ManagedObjectObserver", /** @lends sap.ui.dt.ManagedObjectObserver.prototype */
	{
		metadata: {
			"abstract": true,
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.dt",
			properties: {

			},
			associations: {
				/**
				 * target ManagedObject to observe
				 */
				target: {
					type: "sap.ui.base.ManagedObject"
				}
			},
			events: {
				/**
				 * Event fired when the observed object is modified
				 */
				modified: {
					parameters: {
						type : "string",
						name : "string",
						value : "any",
						oldValue : "any",
						target : "sap.ui.core.Element"
					}
				},
				destroyed: {}
			}
		}
	});

	/**
	 * Called when the ManagedObjectObserver is created
	 *
	 * @protected
	 */
	ManagedObjectObserver.prototype.init = function() {
		this._fnFireModified = function() {
			this.fireModified();
		}.bind(this);
	};

	/**
	 * Called when the ManagedObjectObserver is destroyed
	 *
	 * @protected
	 */
	ManagedObjectObserver.prototype.exit = function() {
		this.unobserve();

		delete this._fnFireModified;
	};

	/**
	 * Sets a target ManagedObject to observe
	 *
	 * @param {string|sap.ui.base.ManagedObject} vTarget id or managed object to set
	 * @return {sap.ui.dt.ManagedObjectObserver} returns this
	 */
	ManagedObjectObserver.prototype.setTarget = function(vTarget) {
		this.unobserve();

		this.setAssociation("target", vTarget);

		var oTarget = this.getTargetInstance();
		if (oTarget) {
			this.observe(oTarget);
		}

		return this;
	};

	/**
	 * Starts observing the target object. Override this method in classes wich extend ManagedObjectObserver.
	 *
	 * @param {sap.ui.base.ManagedObject} oTarget The target to observe
	 * @protected
	 */
	ManagedObjectObserver.prototype.observe = function(oTarget) {
		this._bIsObserved = true;

		// _change event is triggered on property change of UI5 managed object
		oTarget.attachEvent("_change", this._fnFireModified, this);

		// Wrapper for the destroy method to recognize changes
		this._fnOriginalDestroy = oTarget.destroy;
		oTarget.destroy = function() {
			this.unobserve();
			// Original destroy method was restored by unobserve() call above
			var vOriginalReturn = oTarget.destroy.apply(oTarget, arguments);
			this.fireDestroyed();

			return vOriginalReturn;
		}.bind(this);

		// Wrapper for the bindProperty method to recognize changes
		this._fnOriginalBindProperty = oTarget.bindProperty;
		oTarget.bindProperty = function() {
			var vOriginalReturn = this._fnOriginalBindProperty.apply(oTarget, arguments);
			this.fireModified();

			return vOriginalReturn;
		}.bind(this);

		// Wrapper for the unbindProperty method to recognize changes
		this._fnOriginalUnBindProperty = oTarget.unbindProperty;
		oTarget.unbindProperty = function() {
			var vOriginalReturn = this._fnOriginalUnBindProperty.apply(oTarget, arguments);
			this.fireModified();

			return vOriginalReturn;
		}.bind(this);

		// Wrapper for the bindAggregation method to recognize changes
		this._fnOriginalBindAggregation = oTarget.bindAggregation;
		oTarget.bindAggregation = function(sAggregationName) {
			var vOriginalReturn = this._fnOriginalBindAggregation.apply(oTarget, arguments);
			this.fireModified();

			return vOriginalReturn;
		}.bind(this);

		// Wrapper for the unbindAggregation method to recognize changes
		this._fnOriginalUnBindAggregation = oTarget.unbindAggregation;
		oTarget.unbindAggregation = function(sAggregationName) {
			var vOriginalReturn = this._fnOriginalUnBindAggregation.apply(oTarget, arguments);
			this.fireModified();

			return vOriginalReturn;
		}.bind(this);

		// We wrap the native setParent method of the control with our logic
		this._fnOriginalSetParent = oTarget.setParent;
		oTarget.setParent = function(oParent, sAggregationName, bSuppressInvalidate) {
			var bFireModified = false;
			if (!oTarget._bInSetParent) {
				bFireModified = true;
				oTarget._bInSetParent = true;
			}

			var oCurrentParent = oTarget.getParent();
			var vOriginalReturn = this._fnOriginalSetParent.apply(oTarget, arguments);
			if (bFireModified && !oTarget.__bSapUiDtSupressParentChangeEvent) {
				oTarget._bInSetParent = false;
				// "dependents" is used to store some removed elements (e.g. from Combine)
				if (oCurrentParent !== oParent || sAggregationName === "dependents") {
					this.fireModified({
						type: "setParent",
						value: oParent,
						oldValue: oCurrentParent,
						target: oTarget
					});
				}
			}

			return vOriginalReturn;
		}.bind(this);

		// We wrap the native addAggregation method of the control with our logic
		this._fnOriginalAddAggregation = oTarget.addAggregation;
		oTarget.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			this._bAddOrSetAggregationCall = true;
			var vOriginalReturn = this._fnOriginalAddAggregation.apply(oTarget, arguments);
			this.fireModified({
				type: "addOrSetAggregation",
				name : sAggregationName,
				value: oObject,
				target: oTarget
			});
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native setAggregation method of the control with our logic
		this._fnOriginalSetAggregation = oTarget.setAggregation;
		oTarget.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			// same mutator as addAggregation for multiple = false aggregations
			this._bAddOrSetAggregationCall = true;
			var vOriginalReturn = this._fnOriginalSetAggregation.apply(oTarget, arguments);
			this.fireModified({
				type: "addOrSetAggregation",
				name : sAggregationName,
				value: oObject,
				target: oTarget
			});
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native removeAggregation method of the control with our logic
		this._fnOriginalRemoveAggregation = oTarget.removeAggregation;
		oTarget.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
			this._bRemoveAggregationCall = true;
			var vOriginalReturn = this._fnOriginalRemoveAggregation.apply(oTarget, arguments);
			this.fireModified({
				type: "removeAggregation",
				name : sAggregationName,
				value: vObject,
				target: oTarget
			});
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native insertAggregation method of the control with our logic
		this._fnOriginalInsertAggregation = oTarget.insertAggregation;
		oTarget.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			this._bInsertAggregationCall = true;
			var vOriginalReturn = this._fnOriginalInsertAggregation.apply(oTarget, arguments);
			this.fireModified({
				type: "insertAggregation",
				name : sAggregationName,
				value: oObject,
				target: oTarget
			});
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native removeAllAggregations method of the control with our logic
		this._fnOriginalRemoveAllAggregation = oTarget.removeAllAggregation;
		oTarget.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			this._bRemoveAllAggregationCall = true;
			var aRemovedObjects = oTarget.getAggregation(sAggregationName);
			var vOriginalReturn = this._fnOriginalRemoveAllAggregation.apply(oTarget, arguments);
			this.fireModified({
				type: "removeAllAggregation",
				name : sAggregationName,
				value: aRemovedObjects,
				target: oTarget
			});
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native destroyAggregation method of the control with our logic
		this._fnOriginalDestroyAggregation = oTarget.destroyAggregation;
		oTarget.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			this._bDestroyAggregationCall = true;
			var aRemovedObjects = oTarget.getAggregation(sAggregationName);
			var vOriginalReturn = this._fnOriginalDestroyAggregation.apply(oTarget, arguments);
			this.fireModified({
				type: "destroyAggregation",
				name : sAggregationName,
				value: aRemovedObjects,
				target: oTarget
			});
			return vOriginalReturn;
		}.bind(this);

		this._aOriginalAddMutators = {};
		this._aOriginalInsertMutators = {};
		this._aOriginalRemoveMutators = {};
		this._aOriginalRemoveAllMutators = {};
		this._aOriginalDestructors = {};
		var mAllAggregations = oTarget.getMetadata().getAllAggregations();
		Object.keys(mAllAggregations).forEach(function(sAggregationName) {
			var oAggregation = mAllAggregations[sAggregationName];
			var _fnOriginalAddMutator = oTarget[oAggregation._sMutator];
			this._aOriginalAddMutators[oAggregation.name] = _fnOriginalAddMutator;
			oTarget[oAggregation._sMutator] = function(oObject) {
				this._bAddOrSetAggregationCall = false;
				// if addAggregation or setAggregation method wasn't called directly

				var vOriginalReturn;
				vOriginalReturn = _fnOriginalAddMutator.apply(oTarget, arguments);

				if (!this._bAddOrSetAggregationCall) {
					this.fireModified({
						type: "addOrSetAggregation",
						name : oAggregation.name,
						value: oObject,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);

			var _fnOriginalInsertMutator = oTarget[oAggregation._sInsertMutator];
			this._aOriginalInsertMutators[oAggregation.name] = _fnOriginalInsertMutator;
			oTarget[oAggregation._sInsertMutator] = function(oObject, iIndex) {
				this._bInsertAggregationCall = false;

				var vOriginalReturn;
				vOriginalReturn = _fnOriginalInsertMutator.apply(oTarget, arguments);

				// if insertAggregation method wasn't called directly
				if (!this._bInsertAggregationCall) {
					this.fireModified({
						type: "insertAggregation",
						name : oAggregation.name,
						value: oObject,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);

			var _fnOriginalRemoveMutator = oTarget[oAggregation._sRemoveMutator];
			this._aOriginalRemoveMutators[oAggregation.name] = _fnOriginalRemoveMutator;
			oTarget[oAggregation._sRemoveMutator] = function(vObject, bSuppressInvalidate) {
				this._bRemoveAggregationCall = false;
				var vOriginalReturn = _fnOriginalRemoveMutator.apply(oTarget, arguments);
				// if removeAggregation method wasn't called directly
				if (!this._bRemoveAggregationCall) {
					this.fireModified({
						type: "removeAggregation",
						name : oAggregation.name,
						value: vObject,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);

			var _fnOriginalRemoveAllMutator = oTarget[oAggregation._sRemoveAllMutator];
			this._aOriginalRemoveAllMutators[oAggregation.name] = _fnOriginalRemoveAllMutator;
			oTarget[oAggregation._sRemoveAllMutator] = function(bSuppressInvalidate) {
				this._bRemoveAllAggregationCall = false;
				var aRemovedObjects = this.getAggregation(sAggregationName);
				var vOriginalReturn = _fnOriginalRemoveAllMutator.apply(oTarget, arguments);
				// if removeAllAggregation method wasn't called directly
				if (!this._bRemoveAllAggregationCall) {
					this.fireModified({
						type: "removeAllAggregation",
						name : oAggregation.name,
						value: aRemovedObjects,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);

			var _fnOriginalDestructor = oTarget[oAggregation._sDestructor];
			this._aOriginalDestructors[oAggregation.name] = _fnOriginalDestructor;
			oTarget[oAggregation._sDestructor] = function(bSuppressInvalidate) {
				this._bDestroyAggregationCall = false;
				var aRemovedObjects = this.getAggregation(sAggregationName);
				var vOriginalReturn = _fnOriginalDestructor.apply(oTarget, arguments);
				// if destroyAggregation method wasn't called directly
				if (!this._bDestroyAggregationCall) {
					this.fireModified({
						type: "destroyAggregation",
						name : oAggregation.name,
						value: aRemovedObjects,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);
		}.bind(this), this);

	};

	/**
	 * Stops observing the target object. Override this method in classes wich extend ManagedObjectObserver.
	 *
	 * @param {sap.ui.base.ManagedObject} oTarget The target to unobserve
	 * @protected
	 */
	ManagedObjectObserver.prototype.unobserve = function() {
		var oTarget = this.getTargetInstance();

		if (this._bIsObserved && oTarget) {
			this._bIsObserved = false;
			oTarget.destroy = this._fnOriginalDestroy;
			oTarget.bindProperty = this._fnOriginalBindProperty;
			oTarget.unbindProperty = this._fnOriginalUnBindProperty;
			oTarget.bindAggregation = this._fnOriginalBindAggregation;
			oTarget.unbindAggregation = this._fnOriginalUnBindAggregation;
			oTarget.setParent = this._fnOriginalSetParent;

			oTarget.addAggregation = this._fnOriginalAddAggregation;
			oTarget.removeAggregation = this._fnOriginalRemoveAggregation;
			oTarget.insertAggregation = this._fnOriginalInsertAggregation;
			oTarget.setAggregation = this._fnOriginalSetAggregation;
			oTarget.removeAllAggregation = this._fnOriginalRemoveAllAggregation;
			oTarget.destroyAggregation = this._fnOriginalDestroyAggregation;

			var mAllAggregations = oTarget.getMetadata().getAllAggregations();
			Object.keys(mAllAggregations).forEach(function(sAggregationName) {
				var oAggregation = mAllAggregations[sAggregationName];
				oTarget[oAggregation._sMutator] = this._aOriginalAddMutators[oAggregation.name];
				oTarget[oAggregation._sInsertMutator] = this._aOriginalInsertMutators[oAggregation.name];
				oTarget[oAggregation._sRemoveMutator] = this._aOriginalRemoveMutators[oAggregation.name];
				oTarget[oAggregation._sRemoveAllMutator] = this._aOriginalRemoveAllMutators[oAggregation.name];
				oTarget[oAggregation._sDestructor] = this._aOriginalDestructors[oAggregation.name];
			}, this);
			oTarget.detachEvent("_change", this._fnFireModified, this);
		}

		delete this._fnOriginalDestroy;
		delete this._fnOriginalBindProperty;
		delete this._fnOriginalUnBindProperty;
		delete this._fnOriginalBindAggregation;
		delete this._fnOriginalUnBindAggregation;
		delete this._fnOriginalSetParent;
		delete this._fnOriginalAddAggregation;
		delete this._fnOriginalRemoveAggregation;
		delete this._fnOriginalInsertAggregation;
		delete this._fnOriginalSetAggregation;
		delete this._fnOriginalRemoveAllAggregations;
		delete this._fnOriginalDestroyAggregation;
		delete this._aOriginalAddMutators;
		delete this._aOriginalInsertMutators;
		delete this._aOriginalRemoveMutators;
		delete this._aOriginalRemoveAllMutators;
		delete this._aOriginalDestructors;

	};

	/**
	 * @protected
	 * @return {sap.ui.base.ManagedObject} The instance of the associated target to observe.
	 */
	ManagedObjectObserver.prototype.getTargetInstance = function() {
		return sap.ui.getCore().byId(this.getTarget());
	};

	return ManagedObjectObserver;
}, /* bExport= */true);