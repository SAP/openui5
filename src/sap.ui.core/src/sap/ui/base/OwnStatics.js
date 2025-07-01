/*!
 * ${copyright}
 */

// Provides class sap.ui.base.OwnStatics
sap.ui.define(function() {
	"use strict";

	const statics = new WeakMap();

	/**
	 * A utility module to manage static properties tied to specific classes.
	 * Each class can have exactly one static object associated with it.
	 * The static object is frozen to prevent modification after registration.
	 *
	 * @private
	 * @alias module:sap/ui/base/OwnStatics
	 */
	const OwnStatics = {
		/**
		 * Retrieves the static object associated with a given class.
		 *
		 * @param {function} clazz - The class constructor whose statics should be retrieved.
		 * @returns {object|undefined} The static object if defined, or `undefined` if none was set.
		 */
		get(clazz) {
			return statics.get(clazz);
		},
		/**
		 * Associates a static object with a given class. Can only be called once per class.
		 * The object is frozen upon registration to make it immutable.
		 *
		 * @param {function} clazz - The class constructor to associate with the static object.
		 * @param {object} obj - The static object to associate.
		 * @throws {TypeError} If statics have already been defined for the class.
		 */
		set(clazz, obj) {
			if (statics.get(clazz)) {
				throw new TypeError("The 'OwnStatics' can only be defined once for a class");
			}
			Object.freeze(obj);
			statics.set(clazz, obj);
		}
	};

	return OwnStatics;
});