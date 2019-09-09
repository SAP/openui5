/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log", "sap/base/assert"],
	function(ManagedObject, Log, assert) {
	"use strict";

	function apply(FNClass, oOptions) {

		if ( typeof FNClass !== 'function' || !(FNClass.prototype instanceof ManagedObject) ) {
			throw new TypeError("ManagedObjectRegistry mixin can only be applied to subclasses of sap.ui.base.ManagedObject");
		}

		oOptions = oOptions || {};

		var fnOnDuplicate = oOptions.onDuplicate || function(sId, oldInstance, newInstance) {
			var sStereotype = FNClass.getMetadata().getStereotype();
			Log.error("adding object \"" + sStereotype + "\" with duplicate id '" + sId + "'");
			throw new Error("Error: adding object \"" + sStereotype + "\" with duplicate id '" + sId + "'");
		};

		var fnOnDeregister = oOptions.onDeregister || null;

		/**
		 * Map (object) of objects keyed by their ID.
		 * @private
		 */
		var mInstances = Object.create(null);

		/**
		 * Number of objects in <code>mInstances</code>.
		 * @private
		 */
		var iInstancesCount = 0;

		FNClass.prototype.register = function register() {
			var sId = this.getId(),
				old = mInstances[sId];

			if ( old && old !== this ) {
				fnOnDuplicate(sId, old, this);
				// executes only if duplicate check succeeds
				iInstancesCount--;
			}

			mInstances[sId] = this;
			iInstancesCount++;
		};

		FNClass.prototype.deregister = function deregister() {
			if ( mInstances[this.sId] ) {
				if ( fnOnDeregister ) {
					fnOnDeregister(this.sId);
				}
				delete mInstances[this.sId];
				iInstancesCount--;
			}
		};

		FNClass["registry"] = Object.freeze({

			/*
			 * Returns the number of existing objects.
			 *
			 * @returns {int} Number of currently existing objects.
			 */
			get size() {
				return iInstancesCount;
			},

			/*
			 * Return an object with all registered object instances, keyed by their ID.
			 *
			 * Each call creates a new snapshot object. Depending on the size of the UI,
			 * this operation therefore might be expensive. Consider to use the <code>forEach</code>
			 * or <code>filter</code> method instead of executing the same operations on the returned
			 * object.
			 *
			 * <b>Note</b>: The returned object is created by a call to <code>Object.create(null)</code>,
			 * so it doesn't have a prototype and therefore no <code>toString</code> method.
			 *
			 * @returns {object} Object with all elements, keyed by their ID
			 */
			all: function() {
				var mResults = Object.create(null);
				return Object.assign(mResults, mInstances);
			},

			/*
			 * Retrieves an object by its ID.
			 *
			 * @returns {sap.ui.core.Element} Object with the given ID or <code>undefined</code>
			 */
			get: function(id) {
				assert(id == null || typeof id === "string", "id must be a string when defined");
				// allow null, as this occurs frequently and it is easier to check whether there is a control in the end than
				// first checking whether there is an ID and then checking for a control
				return id == null ? undefined : mInstances[id];
			},

			/*
			 * Calls the given <code>callback</code> for each object.
			 *
			 * If objects are created or destroyed during the <code>forEach</code> loop, then the behavior
			 * is undefined. Newly added elements might or might not be visited. If an element is destroyed
			 * during the loop and was not visited yet, it won't be visited.
			 *
			 * <code>function callback(element, id)</code>
			 *
			 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
			 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
			 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
			 * context object, that object wins over the given <code>thisArg</code>.
			 *
			 * @param {function(sap.ui.core.Element,sap.ui.core.ID)} callback
			 *        Function to call for each element
			 * @param {Object} [thisArg=undefined]
			 *        Context object to provide as <code>this</code> in each call of <code>callback</code>
			 * @throws {TypeError} If <code>callback</code> is not a function
			 */
			forEach: function(callback, thisArg) {
				if (typeof callback !== "function") {
					throw new TypeError(callback + " is not a function");
				}
				if ( thisArg != null ) {
					callback = callback.bind(thisArg);
				}
				for ( var id in mInstances ) {
					callback(mInstances[id], id);
				}
			},

			/*
			 * Collects all elements for which the given <code>callback</code> returns a value that coerces
			 * to <code>true</code>.
			 *
			 * If elements are created or destroyed within the <code>callback</code>, then the behavior is
			 * undefined. Newly added objects might or might not be visited. If an element is destroyed
			 * during the filtering and was not visited yet, it won't be visited.
			 *
			 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
			 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
			 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
			 * context object, that object wins over the given <code>thisArg</code>.
			 *
			 * This function returns an array with all elements matching the given predicate. The order of the
			 * elements in the array is undefined and might change between calls (over time and across different
			 * versions of UI5).
			 *
			 * @param {function(sap.ui.core.Element,sap.ui.core.ID)} callback
			 *        predicate against which each element is tested
			 * @param {Object} thisArg
			 *        context object to provide as <code>this</code> in each call of <code>callback</code>
			 * @returns {sap.ui.core.Element[]}
			 *        Array of elements matching the predicate; order is undefined and might change in newer versions of UI5
			 * @throws {TypeError} If <code>callback</code> is not a function
			 */
			filter: function(callback, thisArg) {
				if (typeof callback !== "function") {
					throw new TypeError(callback + " is not a function");
				}
				if ( thisArg != null ) {
					callback = callback.bind(thisArg);
				}
				var result = [],
					id;
				for ( id in mInstances ) {
					if ( callback(mInstances[id], id) ) {
						result.push(mInstances[id]);
					}
				}

				return result;
			}

		});

	}

	return {
		apply : apply
	};

});