/*
 * ! ${copyright}
 */

// Provides class sap.ui.base.ManagedObjectObserver.
sap.ui.define([
	'sap/ui/base/Object', 'sap/ui/base/ManagedObject'
], function(BaseObject, ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new ManagedObjectObserver.
	 * Use the ManagedObjectObserver to get notified if properties, aggregations, associations on a
	 * ManagedObject instance change.
	 *
	 * Use the observe method the add instances of ManagedObject that should be observed.
	 * Use the disconnect method to disconnect this Observer.
	 * With the constructor a fnCallback function is passed that is called for any change.
	 * Depending on the change type different change object are passed:
	 * <b>Property Change</b>
	 * {string}
	 *      change.name the name of the property that changed
	 * {string}
	 *      change.type 'property'
	 * {object}
	 *      change.object the managed object instance on which the change occured
	 * {any}
	 *      change.old the old value
	 * {any}
	 *      change.current the new value
	 *
	 * <b>Aggregation Change</b>
	 * {string}
	 *      change.name the name of the aggregation that changed
	 * {string}
	 *      change.type 'aggregation'
	 * {object}
	 *      change.object the managed object instance on which the change occured
	 * {any}
	 *      change.mutation 'remove' or 'insert'
	 * {sap.ui.base.ManagedObject}
	 *      change.child the child managed object instance
	 *
	 * <b>Association Change</b>
	 * {string}
	 *      change.name the name of the association that changed
	 * {string}
	 *      change.type 'association'
	 * {object}
	 *      change.object the managed object instance on which the change occured
	 * {any}
	 *      change.mutation 'remove' or 'insert'
	 * {string|string[]}
	 *      change.ids the ids that changed
	 *
	 * @param {function} fnCallback the callback function for the observer, if a change happens
	 *
	 * @private
	 */
	var ManagedObjectObserver = BaseObject.extend("sap.ui.base.ManagedObjectObserver",{
		constructor: function(fnCallback) {
			if (!fnCallback && typeof fnCallback !== "function") {
				throw new Error("Missing callback function in ManagedObjectObserver constructor");
			}
			this._fnCallback = fnCallback;
		}
	});

	/**
	 * Starts observing the given object. A configuration is used to specify the meta data settings that should be observed.
	 * Configuration should be as specific as possible to avoid negative performance impact.
	 * Observing all settings (properties, aggregations, associations) should be avoided.
	 *
	 * @param {sap.ui.base.ManagedObject}
	 *    oObject the managed object instance to be observed
	 * @param {object}
	 *     oConfiguration a mandatory configuration specifying the settings to observe for the object
	 * @param {boolean|string[]} [oConfiguration.properties]
	 *     true if all properties should be observed or list of the property names to observe
	 * @param {boolean|string[]} [oConfiguration.aggregations]
	 *     true if all aggregations should be observed or list of the aggregation names to observe
	 * @param {boolean|string[]} [oConfiguration.associations]
	 *     true if all associations should be observed or list of the association names to observe
	 *
	 * @private
	 */
	ManagedObjectObserver.prototype.observe = function(oObject, oConfiguration) {
		create(oObject, this, oConfiguration);
	};

	/**
	 * Disconnect the observer from all objects.
	 * @private
	 */
	ManagedObjectObserver.prototype.disconnect = function() {
		destroy(this);
	};

	//private implementation
	var Observer = {},
		mTargets = {};

	//observer interface for ManagedObject implementation.

	/**
	 * Called from sap.ui.base.ManagedObject if a property is changed.
	 *
	 * @param {string} sName the name of the property that changed
	 * @param {any} vOld the old value of the property
	 * @param {any} vNew the new value of the property
	 * @private
	 */
	Observer.propertyChange = function(oManagedObject, sName, vOld, vNew) {
		//managed object does a propertyChange.call(this, sName, vOld, vNew)
		handleChange("properties", oManagedObject, sName, function() {
			return {
				type: "property",
				old: vOld,
				current: vNew
			};
		});
	};

	/**
	 * Called from sap.ui.base.ManagedObject if an aggregation is changed.
	 *
	 * @param {string} sName the name of the aggregation that changed
	 * @param {string} sMutation "remove" or "insert"
	 * @param {sap.ui.base.ManagedObject|sap.ui.base.ManagedObject[]} vObject the removed or inserted object or objects array
	 * @private
	 */
	Observer.aggregationChange = function(oManagedObject, sName, sMutation, vObjects) {
		//managed object does a aggregationChange.call(this, sName, sMutation, vObjects)
		handleChange("aggregations", oManagedObject, sName, function() {
			return {
				type: "aggregation",
				mutation: sMutation,
				children: Array.isArray(vObjects) ? vObjects : null,
				child: !Array.isArray(vObjects) ? vObjects : null
			};
		});
	};

	/**
	 * Called from sap.ui.base.ManagedObject if an association is changed.
	 *
	 * @param {string} sName the name of the association that changed
	 * @param {string} sMutation "remove" or "insert"
	 * @param {string|string[]} vIds the removed or inserted id or list of ids
	 * @private
	 */
	Observer.associationChange = function(oManagedObject, sName, sMutation, vIds) {
		//managed object does a associationChange.call(this, sName, sMutation, vIds)
		handleChange("associations", oManagedObject, sName, function() {
			return {
				type: "association",
				mutation: sMutation,
				ids: vIds
			};
		});
	};

	//handles the change event and pipelines it to the ManagedObjectObservers that are attached as listeners
	function handleChange (sType, oObject, sName, fnCreateChange) {
		var sId = oObject.getId(),
			oTargetConfig = mTargets[sId];
		if (oTargetConfig) {
			var oChange;
			for (var i = 0; i < oTargetConfig.listeners.length; i++) {
				if (isObserving(oTargetConfig.configurations[i], sType, sName)) {
					if (!oChange) {
						oChange = fnCreateChange();
						oChange.name = sName;
						oChange.object = oObject;
					}
					var oListener = oTargetConfig.listeners[i];
					oListener._fnCallback(oChange);
				}
			}
		}
	}

	//checks whether the type and name is part of the given configuration.
	//if true is returned a change needs to be processed.
	function isObserving(oConfiguration, sType, sName) {
		//no configuration, listen to all types
		if (oConfiguration == null || !sType || !sName) {
			return false;
		}
		//either all (true) properties/aggregations/associations are relevant or a specific list or names is provided
		return oConfiguration[sType] === true || (Array.isArray(oConfiguration[sType]) && oConfiguration[sType].indexOf(sName) > -1);
	}

	//adds a listener and its configuration to the internal list of observed targets mTargets.
	//if the listener is already registed to the target only its configuration is updated.
	//adds the observer to the target managed object if an observer is missing.
	function create (oTarget, oListener, oConfiguration) {
		if (!(oTarget instanceof ManagedObject)) {
			jQuery.sap.log.warning("ManagedObjectObserver can only observe ManagedObjects");
		}
		var sId = oTarget.getId();
		if (!mTargets.hasOwnProperty(sId)) {
			mTargets[sId] = {
				listeners: [],
				configurations: [],
				object: oTarget
			};
		}
		var oTargetConfig = mTargets[sId],
			iIndex = oTargetConfig.listeners.indexOf(oListener);
		if (iIndex === -1) {
			//not registered, push listener and configuration
			oTargetConfig.listeners.push(oListener);
			oTargetConfig.configurations.push(oConfiguration);
		} else {
			//already registered, update the configuration
			oTargetConfig.configurations[iIndex] = oConfiguration;
		}
		if (!oTarget._observer) {
			oTarget._observer = Observer;
		}
	}

	//removes a given listener by looking at all registered targets and their listeners.
	//if there are no more listeners to a target, the registered target is removed from the mTargets map.
	function destroy (oListener) {
		for (var n in mTargets) {
			var oTargetConfig = mTargets[n];
			for (var i = 0; i < oTargetConfig.listeners.length; i++) {
				if (oTargetConfig.listeners[i] === oListener) {
					oTargetConfig.listeners.splice(i, 1);
					oTargetConfig.configurations.splice(i, 1);
				}
			}
			if (oTargetConfig.listeners && oTargetConfig.listeners.length === 0) {
				delete mTargets[n];
				delete oTargetConfig.object._observer;
			}
		}
	}

	return ManagedObjectObserver;
}, /* bExport= */true);
