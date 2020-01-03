/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.ManagedObjectObserver.
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/ElementUtil",
	"sap/base/util/includes"
], function(
	ManagedObject,
	ElementUtil,
	includes
) {
	"use strict";

	/**
	 * Constructor for a new ManagedObjectObserver.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @abstract
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
	var ManagedObjectObserver = ManagedObject.extend("sap.ui.dt.ManagedObjectObserver", /** @lends sap.ui.dt.ManagedObjectObserver.prototype */ {
		metadata: {
			"abstract": true,
			library: "sap.ui.dt",
			properties: {
				aggregations: {
					type: "array",
					defaultValue: null
				}
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
		this._fnFireModified = function(oEvent) {
			var oParams = oEvent.getParameters();
			if (oEvent.sId === "_change") {
				oEvent.sId = "propertyChanged";
			}
			this.fireModified({
				type: oEvent.sId,
				name: oParams.name,
				value: oParams.newValue,
				oldValue: oParams.oldValue,
				target: oEvent.getSource()
			});
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
	 * Starts observing the target object. Override this method in classes which extend ManagedObjectObserver.
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
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified();
			}
			return vOriginalReturn;
		}.bind(this);

		// Wrapper for the unbindAggregation method to recognize changes
		this._fnOriginalUnBindAggregation = oTarget.unbindAggregation;
		oTarget.unbindAggregation = function(sAggregationName) {
			var vOriginalReturn = this._fnOriginalUnBindAggregation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified();
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native setParent method of the control with our logic
		this._fnOriginalSetParent = oTarget.setParent;
		oTarget.setParent = function(oParent, sAggregationName) {
			var bFireModified = false;
			if (!oTarget._bInSetParent) {
				bFireModified = true;
				oTarget._bInSetParent = true;
			}

			var oCurrentParent = oTarget.getParent();
			var vOriginalReturn = this._fnOriginalSetParent.apply(oTarget, arguments);
			if (bFireModified) {
				oTarget._bInSetParent = false;
				if (
					!oTarget.__bSapUiDtSupressParentChangeEvent
					&& (
						oCurrentParent !== oParent
						// "dependents" is used to store some removed elements (e.g. from Combine)
						|| sAggregationName === "dependents"
					)
				) {
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
		oTarget.addAggregation = function(sAggregationName, oObject) {
			this._sAddOrSetAggregationCall = sAggregationName;
			var vOriginalReturn = this._fnOriginalAddAggregation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified({
					type: "addOrSetAggregation",
					name : sAggregationName,
					value: oObject,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native setAggregation method of the control with our logic
		this._fnOriginalSetAggregation = oTarget.setAggregation;
		oTarget.setAggregation = function(sAggregationName, oObject) {
			// same mutator as addAggregation for multiple = false aggregations
			this._sAddOrSetAggregationCall = sAggregationName;
			var vOriginalReturn = this._fnOriginalSetAggregation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified({
					type: "addOrSetAggregation",
					name : sAggregationName,
					value: oObject,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native removeAggregation method of the control with our logic
		this._fnOriginalRemoveAggregation = oTarget.removeAggregation;
		oTarget.removeAggregation = function(sAggregationName, vObject) {
			this._sRemoveAggregationCall = sAggregationName;
			var vOriginalReturn = this._fnOriginalRemoveAggregation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified({
					type: "removeAggregation",
					name : sAggregationName,
					value: vObject,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native insertAggregation method of the control with our logic
		this._fnOriginalInsertAggregation = oTarget.insertAggregation;
		oTarget.insertAggregation = function(sAggregationName, oObject) {
			this._sInsertAggregationCall = sAggregationName;
			var vOriginalReturn = this._fnOriginalInsertAggregation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified({
					type: "insertAggregation",
					name : sAggregationName,
					value: oObject,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native removeAllAggregations method of the control with our logic
		this._fnOriginalRemoveAllAggregation = oTarget.removeAllAggregation;
		oTarget.removeAllAggregation = function(sAggregationName) {
			this._sRemoveAllAggregationCall = sAggregationName;
			var aRemovedObjects = oTarget.getAggregation(sAggregationName);
			var vOriginalReturn = this._fnOriginalRemoveAllAggregation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified({
					type: "removeAllAggregation",
					name : sAggregationName,
					value: aRemovedObjects,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native destroyAggregation method of the control with our logic
		this._fnOriginalDestroyAggregation = oTarget.destroyAggregation;
		oTarget.destroyAggregation = function(sAggregationName) {
			this._sDestroyAggregationCall = sAggregationName;
			var aRemovedObjects = oTarget.getAggregation(sAggregationName);
			var vOriginalReturn = this._fnOriginalDestroyAggregation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAggregationName)) {
				this.fireModified({
					type: "destroyAggregation",
					name : sAggregationName,
					value: aRemovedObjects,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native addAssociation method of the control with our logic
		this._fnOriginalAddAssociation = oTarget.addAssociation;
		oTarget.addAssociation = function(sAssociationName, oObject) {
			this._sAddOrSetAssociationCall = sAssociationName;
			var vOriginalReturn = this._fnOriginalAddAssociation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAssociationName)) {
				this.fireModified({
					type: "addOrSetAggregation",
					name : sAssociationName,
					value: oObject,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native setAssociation method of the control with our logic
		this._fnOriginalSetAssociation = oTarget.setAssociation;
		oTarget.setAssociation = function(sAssociationName, oObject) {
			// same mutator as addAssociation for multiple = false associations
			this._sAddOrSetAssociationCall = sAssociationName;
			var vOriginalReturn = this._fnOriginalSetAssociation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAssociationName)) {
				this.fireModified({
					type: "addOrSetAggregation",
					name : sAssociationName,
					value: oObject,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native removeAssociation method of the control with our logic
		this._fnOriginalRemoveAssociation = oTarget.removeAssociation;
		oTarget.removeAssociation = function(sAssociationName, vObject) {
			this._sRemoveAssociationCall = sAssociationName;
			var vOriginalReturn = this._fnOriginalRemoveAssociation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAssociationName)) {
				this.fireModified({
					type: "removeAggregation",
					name : sAssociationName,
					value: vObject,
					target: oTarget
				});
			}
			return vOriginalReturn;
		}.bind(this);

		// We wrap the native removeAllAssociations method of the control with our logic
		this._fnOriginalRemoveAllAssociation = oTarget.removeAllAssociation;
		oTarget.removeAllAssociation = function(sAssociationName) {
			this._sRemoveAllAssociationCall = sAssociationName;
			var aRemovedObjects = oTarget.getAssociation(sAssociationName);
			var vOriginalReturn = this._fnOriginalRemoveAllAssociation.apply(oTarget, arguments);
			if (this._isAggregationObservable(sAssociationName)) {
				this.fireModified({
					type: "removeAllAggregation",
					name : sAssociationName,
					value: aRemovedObjects,
					target: oTarget
				});
			}
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
				delete this._sAddOrSetAggregationCall;
				// if addAggregation or setAggregation method wasn't called directly
				var vOriginalReturn = _fnOriginalAddMutator.apply(oTarget, arguments);

				if (
					(
						!this._sAddOrSetAggregationCall
						|| this._sAddOrSetAggregationCall !== oAggregation.name
					)
					&& this._isAggregationObservable(oAggregation.name)
				) {
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
			oTarget[oAggregation._sInsertMutator] = function(oObject) {
				delete this._sInsertAggregationCall;

				var vOriginalReturn = _fnOriginalInsertMutator.apply(oTarget, arguments);
				// if insertAggregation method wasn't called directly
				if (
					(
						!this._sInsertAggregationCall
						|| this._sInsertAggregationCall !== oAggregation.name
					)
					&& this._isAggregationObservable(oAggregation.name)
				) {
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
			oTarget[oAggregation._sRemoveMutator] = function(vObject) {
				delete this._sRemoveAggregationCall;

				var vOriginalReturn = _fnOriginalRemoveMutator.apply(oTarget, arguments);
				// if removeAggregation method wasn't called directly
				if (
					(
						!this._sRemoveAggregationCall
						|| this._sRemoveAggregationCall !== oAggregation.name
					)
					&& this._isAggregationObservable(oAggregation.name)
				) {
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
			oTarget[oAggregation._sRemoveAllMutator] = function() {
				delete this._sRemoveAllAggregationCall;
				var aRemovedObjects = this.getAggregation(sAggregationName);
				var vOriginalReturn = _fnOriginalRemoveAllMutator.apply(oTarget, arguments);
				// if removeAllAggregation method wasn't called directly
				if (
					(
						!this._sRemoveAllAggregationCall
						|| this._sRemoveAllAggregationCall !== oAggregation.name
					)
					&& this._isAggregationObservable(oAggregation.name)
				) {
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
			oTarget[oAggregation._sDestructor] = function() {
				delete this._sDestroyAggregationCall;
				var aRemovedObjects = this.getAggregation(sAggregationName);
				var vOriginalReturn = _fnOriginalDestructor.apply(oTarget, arguments);
				// if destroyAggregation method wasn't called directly
				if (
					(
						!this._sDestroyAggregationCall
						|| this._sDestroyAggregationCall !== oAggregation.name
					)
					&& this._isAggregationObservable(oAggregation.name)
				) {
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

		var mAllAssociations = oTarget.getMetadata().getAllAssociations();
		Object.keys(mAllAssociations).forEach(function(sAssociationName) {
			var oAssociation = mAllAssociations[sAssociationName];
			var _fnOriginalAddMutator = oTarget[oAssociation._sMutator];
			this._aOriginalAddMutators[oAssociation.name] = _fnOriginalAddMutator;
			oTarget[oAssociation._sMutator] = function(oObject) {
				delete this._sAddOrSetAssociationCall;
				// if addAssociation or setAssociation method wasn't called directly

				var vOriginalReturn;
				vOriginalReturn = _fnOriginalAddMutator.apply(oTarget, arguments);

				if (
					(
						!this._sAddOrSetAssociationCall
						|| this._sAddOrSetAssociationCall !== oAssociation.name
					)
					&& this._isAggregationObservable(oAssociation.name)
				) {
					this.fireModified({
						type: "addOrSetAggregation",
						name : oAssociation.name,
						value: oObject,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);

			var _fnOriginalRemoveMutator = oTarget[oAssociation._sRemoveMutator];
			this._aOriginalRemoveMutators[oAssociation.name] = _fnOriginalRemoveMutator;
			oTarget[oAssociation._sRemoveMutator] = function(vObject) {
				delete this._sRemoveAssociationCall;
				var vOriginalReturn = _fnOriginalRemoveMutator.apply(oTarget, arguments);
				// if removeAssociation method wasn't called directly
				if (
					(
						!this._sRemoveAssociationCall
						|| this._sRemoveAssociationCall !== oAssociation.name
					)
					&& this._isAggregationObservable(oAssociation.name)
				) {
					this.fireModified({
						type: "removeAggregation",
						name : oAssociation.name,
						value: vObject,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);

			var _fnOriginalRemoveAllMutator = oTarget[oAssociation._sRemoveAllMutator];
			this._aOriginalRemoveAllMutators[oAssociation.name] = _fnOriginalRemoveAllMutator;
			oTarget[oAssociation._sRemoveAllMutator] = function() {
				delete this._sRemoveAllAssociationCall;
				var aRemovedObjects = this.getAssociation(sAssociationName);
				var vOriginalReturn = _fnOriginalRemoveAllMutator.apply(oTarget, arguments);
				// if removeAllAssociation method wasn't called directly
				if (
					(
						!this._sRemoveAllAssociationCall
						|| this._sRemoveAllAssociationCall !== oAssociation.name
					)
					&& this._isAggregationObservable(oAssociation.name)
				) {
					this.fireModified({
						type: "removeAllAggregation",
						name : oAssociation.name,
						value: aRemovedObjects,
						target: oTarget
					});
				}
				return vOriginalReturn;
			}.bind(this);
		}.bind(this), this);
	};

	/**
	 * Stops observing the target object. Override this method in classes which extend ManagedObjectObserver.
	 *
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

			oTarget.addAssociation = this._fnOriginalAddAssociation;
			oTarget.removeAssociation = this._fnOriginalRemoveAssociation;
			oTarget.setAssociation = this._fnOriginalSetAssociation;
			oTarget.removeAllAssociation = this._fnOriginalRemoveAllAssociation;

			var mAllAggregations = oTarget.getMetadata().getAllAggregations();
			Object.keys(mAllAggregations).forEach(function(sAggregationName) {
				var oAggregation = mAllAggregations[sAggregationName];
				oTarget[oAggregation._sMutator] = this._aOriginalAddMutators[oAggregation.name];
				oTarget[oAggregation._sInsertMutator] = this._aOriginalInsertMutators[oAggregation.name];
				oTarget[oAggregation._sRemoveMutator] = this._aOriginalRemoveMutators[oAggregation.name];
				oTarget[oAggregation._sRemoveAllMutator] = this._aOriginalRemoveAllMutators[oAggregation.name];
				oTarget[oAggregation._sDestructor] = this._aOriginalDestructors[oAggregation.name];
			}, this);

			var mAllAssociations = oTarget.getMetadata().getAllAssociations();
			Object.keys(mAllAssociations).forEach(function(sAssociationName) {
				var oAssociation = mAllAssociations[sAssociationName];
				oTarget[oAssociation._sMutator] = this._aOriginalAddMutators[oAssociation.name];
				oTarget[oAssociation._sRemoveMutator] = this._aOriginalRemoveMutators[oAssociation.name];
				oTarget[oAssociation._sRemoveAllMutator] = this._aOriginalRemoveAllMutators[oAssociation.name];
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
	ManagedObjectObserver.prototype.getTargetInstance = function () {
		return ElementUtil.getElementInstance(this.getTarget());
	};

	/**
	 * Checks is specified aggregation is observable. By default all aggregations are observable.
	 * @param {string} sAggregationName - aggregation name
	 * @return {boolean} true if the aggregation is observable
	 * @protected
	 */
	ManagedObjectObserver.prototype._isAggregationObservable = function (sAggregationName) {
		return (
			this.getAggregations() === null
			|| includes(this.getAggregations(), sAggregationName)
		);
	};

	return ManagedObjectObserver;
});