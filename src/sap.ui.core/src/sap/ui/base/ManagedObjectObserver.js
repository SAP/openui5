/*
 * ! ${copyright}
 */

// Provides class sap.ui.base.ManagedObjectObserver.
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/EventProvider',
	"sap/base/util/array/uniqueSort",
	"sap/ui/thirdparty/jquery"
], function(BaseObject, ManagedObject, EventProvider, uniqueSort, jQuery) {
	"use strict";

	/**
	 * Constructor for a new ManagedObjectObserver.
	 *
	 * @classdesc
	 * Use the <code>ManagedObjectObserver</code> to get notified when properties, aggregations or associations of a
	 * <code>ManagedObject</code> instance have changed.
	 *
	 * Use the {@link #observe} method to add instances of ManagedObject that should be observed or to enhance
	 * the set of observed properties, aggregations etc. for an already observed instance.
	 *
	 * Use the {@link #unobserve} method to stop observing an instance of ManagedObject or to reduce the set of
	 * observed properties, aggregations etc. for an observed instance.
	 *
	 * Use the {@link #disconnect} method to completely stop observing all instances of ManagedObject hat previously
	 * had been added to this observer.
	 *
	 * The only parameter to the constructor is a function <code>fnCallback</code> which will be called for every
	 * observed change. Depending on the type of the change, different change objects are passed to the callback:
	 *
	 * <h4>Property Change</h4>
	 * {string}
	 *      change.name the name of the property that changed<br>
	 * {string}
	 *      change.type 'property'<br>
	 * {object}
	 *      change.object the managed object instance on which the change occurred<br>
	 * {any}
	 *      change.old the old value<br>
	 * {any}
	 *      change.current the new value<br>
	 *
	 * <h4>Aggregation Change</h4>
	 * {string}
	 *      change.name the name of the aggregation that changed<br>
	 * {string}
	 *      change.type 'aggregation'<br>
	 * {object}
	 *      change.object the managed object instance on which the change occurred<br>
	 * {any}
	 *      change.mutation 'remove' or 'insert'<br>
	 * {sap.ui.base.ManagedObject}
	 *      change.child the child managed object instance<br>
	 *
	 * <h4>Association Change</h4>
	 * {string}
	 *      change.name the name of the association that changed<br>
	 * {string}
	 *      change.type 'association'<br>
	 * {object}
	 *      change.object the managed object instance on which the change occurred<br>
	 * {any}
	 *      change.mutation 'remove' or 'insert'<br>
	 * {string|string[]}
	 *      change.ids the ids that changed<br>
	 *
	 * <h4>Event Registry Change</h4>
	 * {string}
	 *      change.name the name of the event that changed<br>
	 * {string}
	 *      change.type 'event'<br>
	 * {object}
	 *      change.object the managed object instance on which the change occurred<br>
	 * {any}
	 *      change.mutation 'remove' or 'insert'<br>
	 * {object}
	 *      change.listener the listener object<br>
	 *{object}
	 *      change.func the listeners function<br>
	 *{object}
	 *      change.data the events data<br>
	 *
	 * <h4>Binding Change</h4>
	 * {string}
	 *      change.name the name of the binding that changed<br>
	 * {string}
	 *      change.type 'binding'<br>
	 * {object}
	 *      change.object the managed object instance on which the change occurred<br>
	 * {any}
	 *      change.mutation 'prepare', 'ready' or 'remove'<br>
	 * {object}
	 *      change.bindingInfo the binding info object<br>
	 * {string}
	 *      change.memberType 'property' or 'aggregation'<br>
	 *
	 * <h4>destroy managed Object</h4>
	 * {string}
	 *      change.type 'destroy'<br>
	 * {object}
	 *      change.object the managed object instance on which the change occurred<br>
	 *
	 * @param {function} fnCallback Callback function for this observer, to be called whenever a change happens
	 *
	 * @since 1.50.0
	 * @private
	 * @ui5-restricted sap.ui.model.base
	 * @constructor
	 * @alias sap.ui.base.ManagedObjectObserver
	 */
	var ManagedObjectObserver = BaseObject.extend("sap.ui.base.ManagedObjectObserver", {
		constructor: function (fnCallback) {
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
	 *     oObject the managed object instance to be observed
	 * @param {object}
	 *     oConfiguration a mandatory configuration specifying the settings to observe for the object
	 * @param {boolean|string[]} [oConfiguration.properties]
	 *     true if all properties should be observed or list of the property names to observe
	 * @param {boolean|string[]} [oConfiguration.aggregations]
	 *     true if all aggregations should be observed or list of the aggregation names to observe
	 * @param {boolean|string[]} [oConfiguration.associations]
	 *     true if all associations should be observed or list of the association names to observe
	 * @param {boolean|string[]} [oConfiguration.bindings]
	 *     true if all bindings should be observed or list of the binding names to observe
	 * @param {boolean|string[]} [oConfiguration.events]
	 *     true if all events should be observed or list of the event names to observe
	 * @param {boolean} [oConfiguration.destroy]
	 *     true if destroy should be observed
	 * @param {boolean} [oConfiguration.parent]
	 *     true if an API parent change should be observed
	 * @throws {TypeError} if the given object is not a ManagedObject and not <code>null</code> or <code>undefined</code>
	 *
	 * @private
	 * @ui5-restricted sap.ui.model.base
	 */
	ManagedObjectObserver.prototype.observe = function (oObject, oConfiguration) {
		if (!(oObject instanceof ManagedObject)) {
			// silently ignore calls with null or undefined
			if (oObject == null) {
				return;
			}
			throw new TypeError("ManagedObjectObserver can only handle ManagedObjects, but observe was called for " + oObject);
		}
		normalizeConfiguration(oObject, oConfiguration);
		create(oObject, this, oConfiguration);
	};

	/**
	 * Stops observing the given object. A configuration is used to specify the meta data settings that should be ignored.
	 * Configuration should be as specific as possible to avoid negative performance impact.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject
	 *     the managed object instance that was observed
	 * @param {object} oConfiguration
	 *     a configuration specifying the settings to stop observing for the object.
	 *     If no configuration is provided, the object is unobserved completely
	 * @param {boolean|string[]} [oConfiguration.properties]
	 *     true if all properties should be stopped observing or list of the property names to stop observing
	 * @param {boolean|string[]} [oConfiguration.aggregations]
	 *     true if all aggregations should be stopped observing or list of the aggregation names to stop observing
	 * @param {boolean|string[]} [oConfiguration.associations]
	 *     true if all associations should be stopped observing or list of the association names to stop observing
	 * @param {boolean|string[]} [oConfiguration.bindings]
	 *     true if all bindings should be stopped observing or list of the binding names to stop observing
	 * @param {boolean|string[]} [oConfiguration.events]
	 *     true if all events should be stopped observing or list of the event names to stop observing
	 * @param {boolean} [oConfiguration.destroy]
	 *     true if destroy should be stopped observing
	 * @param {boolean} [oConfiguration.parent]
	 *     true if a parent change should be stopped observing
	 * @throws {TypeError} if the given object is not a ManagedObject and not <code>null</code> or <code>undefined</code>
	 *
	 * @private
	 * @ui5-restricted sap.ui.model.base
	 */
	ManagedObjectObserver.prototype.unobserve = function (oObject, oConfiguration) {
		if (!(oObject instanceof ManagedObject)) {
			// silently ignore calls with null or undefined
			if (oObject == null) {
				return;
			}
			throw new TypeError("ManagedObjectObserver can only handle ManagedObjects, but unobserve was called for " + oObject);
		}

		if (oConfiguration) {
			normalizeConfiguration(oObject, oConfiguration);
		}
		remove(oObject, this, oConfiguration);
	};

	/**
	 * Checks whether a given configuration set for a control is observed.
	 *
	 * All given settings must be observed for the method to return true.
	 *
	 * @param {sap.ui.base.ManagedObject} oObject
	 *        the managed object instance that was observed
	 * @param {object} oConfiguration
	 *        a configuration specifying the settings to check for the object.
	 *        If no configuration is provided it checks if the object observes at least for one property, etc.
	 * @param {boolean|string[]} [oConfiguration.properties]
	 *        true if all properties should be checked or list of the property names to check
	 * @param {boolean|string[]} [oConfiguration.aggregations]
	 *        true if all aggregations should be checked or list of the aggregation names to check
	 * @param {boolean|string[]} [oConfiguration.associations]
	 *        true if all associations should be checked or list of the association names to check
	 * @return {boolean} <code>true</code> if configuration is observed
	 * @throws {TypeError} if the given object is not a ManagedObject and not <code>null</code> or <code>undefined</code>
	 *
	 * @private
	 * @ui5-restricted sap.ui.model.base
	 */
	ManagedObjectObserver.prototype.isObserved = function (oObject, oConfiguration) {
		if (!(oObject instanceof ManagedObject)) {
			// silently ignore calls with null or undefined
			if (oObject == null) {
				return false;
			}
			throw new TypeError("ManagedObjectObserver can only handle ManagedObjects, but isObserved was called for " + oObject);
		}
		return isObjectObserved(oObject, this, oConfiguration);
	};

	/**
	 * Disconnect the observer from all objects.
	 * @private
	 * @ui5-restricted sap.ui.model.base
	 */
	ManagedObjectObserver.prototype.disconnect = function () {
		destroy(this);
	};

	/**
	 * Returns the current configuration of a given control
	 *
	 * @param {sap.ui.base.ManagedObject} oObject the managed object instance that is observed
	 * @return {object} oConfiguration the configuration of the given object
	 */
	ManagedObjectObserver.prototype.getConfiguration = function (oObject) {
		return getConfiguration(oObject, this);
	};

	// private implementation
	var Observer = {},
		mTargets = Object.create(null);

	// observer interface for ManagedObject implementation.

	/**
	 * Called from sap.ui.base.ManagedObject if a property is changed.
	 *
	 * @param {sap.ui.base.ManagedObject} oManagedObject Object that reports a change
	 * @param {string} sName the name of the property that changed
	 * @param {any} vOld the old value of the property
	 * @param {any} vNew the new value of the property
	 * @private
	 * @ui5-restricted sap.ui.base.ManagedObject
	 */
	Observer.propertyChange = function (oManagedObject, sName, vOld, vNew) {
		// managed object does a propertyChange.call(this, sName, vOld, vNew)
		handleChange("properties", oManagedObject, sName, function () {
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
	 * @param {sap.ui.base.ManagedObject} oManagedObject Object that reports a change
	 * @param {string} sName the name of the aggregation that changed
	 * @param {string} sMutation "remove" or "insert"
	 * @param {sap.ui.base.ManagedObject|sap.ui.base.ManagedObject[]} vObjects the removed or inserted object or objects array
	 * @private
	 * @ui5-restricted sap.ui.base.ManagedObject
	 */
	Observer.aggregationChange = function (oManagedObject, sName, sMutation, vObjects) {
		// managed object does an aggregationChange.call(this, sName, sMutation, vObjects)
		handleChange("aggregations", oManagedObject, sName, function () {
			return {
				type: "aggregation",
				mutation: sMutation,
				children: Array.isArray(vObjects) ? vObjects : null,
				child: !Array.isArray(vObjects) ? vObjects : null
			};
		});
	};

	/**
	 * Called from sap.ui.base.ManagedObject if a parent is changed.
	 *
	 * @param {sap.ui.base.ManagedObject} oManagedObject Object that reports a change
	 * @param {string} sName the name of the triggering parent aggregation
	 * @param {string} sMutation "set" or "unset"
	 * @param {sap.ui.base.ManagedObject} oParent the changed parent
	 * @private
	 * @ui5-restricted sap.ui.base.ManagedObject
	 */
	Observer.parentChange = function(oManagedObject, sName, sMutation, oParent) {
		//managed object does a parent change handle this
		handleChange("parent", oManagedObject, sName, function () {
			return {
				type: "parent",
				mutation: sMutation,
				parent: oParent
			};
		});

		//As the change of a parent is only possible when an aggregation change is applied
		//handle this change
		var sParentMutation = sMutation === "unset" ? "remove" : "insert";
		Observer.aggregationChange(oParent, sName, sParentMutation, oManagedObject);
	};

	/**
	 * Called from sap.ui.base.ManagedObject if an association is changed.
	 *
	 * @param {sap.ui.base.ManagedObject} oManagedObject Object that reports a change
	 * @param {string} sName the name of the association that changed
	 * @param {string} sMutation "remove" or "insert"
	 * @param {string|string[]} vIds the removed or inserted id or list of ids
	 * @private
	 * @ui5-restricted sap.ui.base.ManagedObject
	 */
	Observer.associationChange = function (oManagedObject, sName, sMutation, vIds) {
		// managed object does an associationChange.call(this, sName, sMutation, vIds)
		handleChange("associations", oManagedObject, sName, function () {
			return {
				type: "association",
				mutation: sMutation,
				ids: vIds
			};
		});
	};

	/**
	 * Called from sap.ui.base.ManagedObject if an event registration is changed.
	 *
	 * @param {string} sName the name of the event that changed
	 * @param {string} sMutation "remove" or "insert"
	 * @param {object} vListener the removed or inserted listener
	 * @param {function} fnFunc the removed or inserted handler function
	 * @param {object} oData the removed or inserted event data
	 * @private
	 */
	Observer.eventChange = function(oManagedObject, sName, sMutation, vListener, fnFunc, oData) {
		//managed object does a eventChange.call(this, sName, sMutation, vListener, fnFunc, oData)
		handleChange("events", oManagedObject, sName, function() {
			return {
				type: "event",
				mutation: sMutation,
				listener: vListener,
				func: fnFunc,
				data: oData
			};
		});
	};

	/**
	 * Called from sap.ui.base.ManagedObject if a binding changed for a property or aggregation.
	 *
	 * @param {string} sName The name of the property or aggregation of which the binding is changed
	 * @param {string} sMutation "prepared", "ready", "removed"
	 * @param {object} oBindingInfo the binding info
	 * @param {string} sMemberType 'aggregation' or 'property'
	 * @private
	 */
	Observer.bindingChange = function(oManagedObject, sName, sMutation, oBindingInfo, sMemberType) {
		//managed object does a bindingChange.call(this, sName, sMutation, oBindingInfo, sType)
		handleChange("bindings", oManagedObject, sName, function() {
			return {
				type: "binding",
				mutation: sMutation,
				bindingInfo: oBindingInfo,
				memberType: sMemberType
			};
		});
	};

	/**
	 * Called from sap.ui.base.ManagedObject if object is destroyed
	 *
	 * @param {sap.ui.base.ManagedObject} oManagedObject Object that reports a change
	 * @private
	 * @ui5-restricted sap.ui.base.ManagedObject
	 */
	Observer.objectDestroyed = function(oManagedObject) {
		handleChange("destroy", oManagedObject, null, function () {
			return {
				type: "destroy"
			};
		});
		var sId = oManagedObject.getId();
		if (mTargets[sId]) {
			// detachEvent doesn't fail if the listener is not registered
			oManagedObject.detachEvent("EventHandlerChange", fnHandleEventChange);
			delete mTargets[sId];
		}
		delete oManagedObject._observer;
	};

	// handles the change event and pipelines it to the ManagedObjectObservers that are attached as listeners
	function handleChange(sType, oObject, sName, fnCreateChange) {
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

	// checks whether the type and name is part of the given configuration.
	// if true is returned a change needs to be processed.
	function isObserving(oConfiguration, sType, sName) {
		// no configuration, listen to all types
		if (oConfiguration == null || !sType) {
			return false;
		}

		if (sType != "destroy" && sType != "parent" && !sName) {
			return false;
		}

		// either all (true) properties/aggregations/associations are relevant or a specific list or names is provided
		return oConfiguration[sType] === true || (Array.isArray(oConfiguration[sType]) && oConfiguration[sType].indexOf(sName) > -1);
	}

	// adds a listener and its configuration to the internal list of observed targets mTargets.
	// if the listener is already registered to the target, only its configuration is updated.
	// adds the observer to the target managed object if an observer is missing.
	function create(oTarget, oListener, oConfiguration) {
		updateConfiguration(oTarget, oListener, oConfiguration, false);
	}

	function getConfiguration(oTarget, oListener) {
		var sId = oTarget.getId();
		var oTargetConfig = mTargets[sId];
		if (oTargetConfig && oTargetConfig.listeners) {
			var iIndex = oTargetConfig.listeners.indexOf(oListener);
			if (iIndex >= 0) {
				//return the current configuration
				var oConfiguration = jQuery.extend(true,{}, oTargetConfig.configurations[iIndex]);
				return oConfiguration;
			}
		}

		return null;
	}

	// removes the given configuration for the given listener from the internal list of observed targets mTargets.
	// removes the observer from the target managed object if the target hasn't to be observed any longer
	function remove(oTarget, oListener, oConfiguration) {
		oConfiguration = oConfiguration || getConfiguration(oTarget, oListener);
		updateConfiguration(oTarget, oListener, oConfiguration, true);
	}

	function isObjectObserved(oTarget, oListener, oConfiguration) {
		var sId = oTarget.getId(),
			oTargetConfig = mTargets[sId];

		//in case no configuration is given take the current configuration
		oConfiguration = oConfiguration || getConfiguration(oTarget, oListener);

		if (!oTargetConfig) {
			return false;
		}
		var iIndex = oTargetConfig.listeners.indexOf(oListener);
		if (iIndex === -1) {
			return false;
		} else {
			//make a subset check
			return isSubArray(oTargetConfig.configurations[iIndex].properties, oConfiguration.properties) &&
				isSubArray(oTargetConfig.configurations[iIndex].aggregations, oConfiguration.aggregations) &&
				isSubArray(oTargetConfig.configurations[iIndex].associations, oConfiguration.associations) &&
				isSubArray(oTargetConfig.configurations[iIndex].bindings, oConfiguration.bindings) &&
				isSubArray(oTargetConfig.configurations[iIndex].events, oConfiguration.events) &&
				isBooleanEqual(oTargetConfig.configurations[iIndex].destroy, oConfiguration.destroy) &&
				isBooleanEqual(oTargetConfig.configurations[iIndex].parent, oConfiguration.parent);
		}
	}

	// removes a given listener by looking at all registered targets and their listeners.
	// if there are no more listeners to a target, the registered target is removed from the mTargets map.
	function destroy(oListener) {
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
				oTargetConfig.object._observer = undefined;
			}
		}
	}

	// update a complete configuration, create one if needed or remove it
	function updateConfiguration(oTarget, oListener, oConfiguration, bRemove) {

		var sId = oTarget.getId(),
			oTargetConfig = mTargets[sId],
			oCurrentConfig,
			iIndex;
		if (bRemove) {
			if (!oTargetConfig) {
				// no registration so far, nothing to remove
				return;
			}
			iIndex = oTargetConfig.listeners.indexOf(oListener);
			if (iIndex >= 0) {
				// already registered, update the configuration
				oCurrentConfig = oTargetConfig.configurations[iIndex];
			}
		} else {
			if (!oTargetConfig) {
				oTargetConfig = mTargets[sId] = {
					listeners: [],
					configurations: [],
					object: oTarget
				};
			}
			iIndex = oTargetConfig.listeners.indexOf(oListener);
			if (iIndex === -1) {
				// not registered, push listener and configuration
				oTargetConfig.listeners.push(oListener);
				oTargetConfig.configurations.push(oConfiguration);
			} else {
				oCurrentConfig = oTargetConfig.configurations[iIndex];
			}
		}
		if (oCurrentConfig) {
			oCurrentConfig.properties = oCurrentConfig.properties || [];
			updateSingleArray(oCurrentConfig.properties, oConfiguration.properties, bRemove);

			oCurrentConfig.aggregations = oCurrentConfig.aggregations || [];
			updateSingleArray(oCurrentConfig.aggregations, oConfiguration.aggregations, bRemove);

			oCurrentConfig.associations = oCurrentConfig.associations || [];
			updateSingleArray(oCurrentConfig.associations, oConfiguration.associations, bRemove);

			oCurrentConfig.bindings = oCurrentConfig.bindings || [];
			updateSingleArray(oCurrentConfig.bindings, oConfiguration.bindings, bRemove);

			oCurrentConfig.events = oCurrentConfig.events || [];
			updateSingleArray(oCurrentConfig.events, oConfiguration.events, bRemove);

			if (oConfiguration.destroy != null) {
				if (bRemove) {
					delete oCurrentConfig.destroy;
				} else {
					oCurrentConfig.destroy = oConfiguration.destroy;
				}
			}

			if (oConfiguration.parent != null) {
				if (bRemove) {
					delete oCurrentConfig.parent;
				} else {
					oCurrentConfig.parent = oConfiguration.parent;
				}
			}
		}
		var bEventsObserved = hasObserverFor(oTarget, "events");

		if (oTarget._observer && bRemove) {
			//delete oTarget._observer;
			if (!bEventsObserved && EventProvider.hasListener(oTarget, "EventHandlerChange", fnHandleEventChange)) {
				oTarget.detachEvent("EventHandlerChange", fnHandleEventChange);
			}
			if (!bEventsObserved &&
					!hasObserverFor(oTarget, "properties") &&
					!hasObserverFor(oTarget, "aggregations") &&
					!hasObserverFor(oTarget, "associations") &&
					!hasObserverFor(oTarget, "destroy") &&
					!hasObserverFor(oTarget, "parent") &&
					!hasObserverFor(oTarget, "bindings")) {
				delete oTarget._observer;
				delete mTargets[sId];
			}
		} else if (!oTarget._observer && !bRemove) {
			//is any config listening to events
			if (bEventsObserved && !EventProvider.hasListener(oTarget, "EventHandlerChange", fnHandleEventChange)) {
				oTarget.attachEvent("EventHandlerChange", fnHandleEventChange);
			}
			oTarget._observer = Observer;
		}

	}

	//checks whether a given type (events, aggregations, associations, properties, bindings, destroy) is
	//currently observed on the given target
	function hasObserverFor(oTarget, sType) {
		var sId = oTarget.getId(),
			oTargetConfig = mTargets[sId];
		if (oTargetConfig) {
			var aConfigs = oTargetConfig.configurations.filter(function(oEntry) {
				return oEntry.hasOwnProperty(sType) && oEntry[sType] && (oEntry[sType] === true || oEntry[sType].length > 0);
			});
			return aConfigs.length > 0;
		}
		return false;
	}

	function fnHandleEventChange(oEvent) {
		var oTarget = oEvent.getSource(),
			sEventId = oEvent.mParameters.EventId;
		if (oTarget.getMetadata().hasEvent(sEventId)) {
			if (oEvent.mParameters.type === "listenerAttached") {
				Observer.eventChange(oTarget, sEventId, "insert", oEvent.mParameters.listener, oEvent.mParameters.func, oEvent.mParameters.data);
			} else if (oEvent.mParameters.type === "listenerDetached") {
				Observer.eventChange(oTarget, sEventId, "remove", oEvent.mParameters.listener, oEvent.mParameters.func, oEvent.mParameters.data);
			}
		}
	}

	// update the single array for observing and unobserving
	function updateSingleArray(aOrig, aAdditional, bRemove) {
		if (!aAdditional) {
			return;
		}

		for (var i = 0; i < aAdditional.length; i++) {
			var iIndex = aOrig.indexOf(aAdditional[i]);
			if (iIndex > -1 && bRemove) {
				aOrig.splice(iIndex, 1);
			} else if (iIndex === -1 && !bRemove) {
				aOrig.push(aAdditional[i]);
			}
		}
	}

	function isSubArray(aFullArray, aSubArray) {
		if (!Array.isArray(aSubArray) || aSubArray.length == 0) {
			// empty array is contained in 'anything'
			return true;
		}

		if (!Array.isArray(aFullArray) || aFullArray.length == 0) {
			// empty array contains no other (non-empty) array
			return false;
		}

		var aUnion = uniqueSort(aFullArray.concat(aSubArray)); // merge arrays, remove duplicates

		//in case aSubArray is inside aFullArray the length did not change
		return aFullArray.length === aUnion.length;
	}

	function isBooleanEqual(bOriginal,bCompare) {
		if (bCompare == null) {
			return true;
		}

		return bOriginal === bCompare;

	}

	// in case the configuration for a specific type is set to true translate this to the complete array in order not to get in trouble
	// when deregistering properties
	function normalizeConfiguration(oObject, oConfiguration) {
		var oMetadata = oObject.getMetadata(),
			aProperties = Object.keys(oMetadata.getAllProperties()),
			aAggregations = Object.keys(oMetadata.getAllAggregations()),
			aAssociations = Object.keys(oMetadata.getAllAssociations()),
			aBindings = uniqueSort(aProperties.concat(aAggregations)),
			aEvents = Object.keys(oMetadata.getAllEvents());

		oConfiguration.properties = oConfiguration.properties === true ? aProperties : oConfiguration.properties;
		oConfiguration.aggregations = oConfiguration.aggregations === true ? aAggregations : oConfiguration.aggregations;
		oConfiguration.associations = oConfiguration.associations === true ? aAssociations : oConfiguration.associations;

		oConfiguration.bindings = oConfiguration.bindings === true ? aBindings : oConfiguration.bindings;
		oConfiguration.events = oConfiguration.events === true ? aEvents : oConfiguration.events;
		oConfiguration.destroy = (oConfiguration.destroy == null) ? false : oConfiguration.destroy;
		oConfiguration.parent = (oConfiguration.parent == null) ? false : oConfiguration.parent;
	}

	return ManagedObjectObserver;
});
