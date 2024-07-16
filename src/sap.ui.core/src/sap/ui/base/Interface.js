/*!
 * ${copyright}
 */

// Provides class sap.ui.base.Interface
sap.ui.define(['sap/ui/base/Object'], function(BaseObject) {
	"use strict";

	/**
	 * Constructs a facade for the given object, containing only the named methods.
	 *
	 * For each method named in <code>aMethods</code>, a wrapper function will be added to the facade.
	 * When called, the wrapper function calls the method with the same name in the original <code>oObject</code>,
	 * passing all its call parameters to it without modification. A return value of the original method will
	 * be returned to the caller. Before returning it, values of type <code>sap.ui.base.Object</code> will be
	 * replaced by their facades, calling {@link sap.ui.base.Object#getInterface getInterface} on them.
	 *
	 * It is possible to create different facades exposing different sets of methods for the same object,
	 * but as <code>getInterface</code> can only return one of those interfaces, the special handling of the
	 * return values doesn't support multiple facades per object.
	 *
	 *
	 * @class A class whose instances act as a facade for other objects.
	 *
	 * <b>Note:</b> If a class returns a facade in its constructor, only the defined functions will be visible,
	 * no internals of the class can be accessed.
	 *
	 * @example
	 * <code>sap.ui.define([
	 *   "sap/ui/base/Object",
	 *   "sap/ui/base/Interface"
	 * ], (BaseObject, Interface) => {
	 *   "use strict";
	 *   const MyModule = BaseObject.extend("MyModule", {
	 *     constructor: function() {
	 *       this._limitedModuleInterface = new Interface(this, [
	 *         "doSomething",
	 *         "doSomethingElse"
	 *       ]);
	 *     },
	 *     doSomething() {
	 *       // Can be called on a MyModule instance and on the facade
	 *     },
	 *     doSomethingElse() {
	 *       // Can be called on a MyModule instance and on the facade
	 *     },
	 *     doSomethingNot() {
	 *      // Can be called only on a MyModule instance and not on the facade
	 *     },
	 *     getFacade() {
	 *       return this._limitedModuleInterface;
	 *     }
	 *   });
	 *   return MyModule;
	 * });
	 * </code>
	 *
	 * @author Malte Wedel, Daniel Brinkmann
	 * @version ${version}
	 * @param {sap.ui.base.Object} oObject
	 *   Object for which a facade should be created
	 * @param {string[]} aMethods
	 *   Names of the methods, that should be available in the new facade
	 * @public
	 * @alias sap.ui.base.Interface
	 */
	var Interface = BaseObject._Interface;

	return Interface;

});
