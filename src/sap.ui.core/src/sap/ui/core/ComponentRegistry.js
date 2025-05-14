/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObjectRegistry",
	"sap/ui/core/ElementRegistry"
], (
	Log,
	ManagedObjectRegistry,
	ElementRegistry
) => {
	"use strict";

	/**
	 * Registry of all <code>Component</code>s that currently exist.
	 *
	 * @alias module:sap/ui/core/ComponentRegistry
	 * @namespace
	 * @public
	 * @since 1.120
	 *
	 */
	const ComponentRegistry = ManagedObjectRegistry.create();

	/**
	 * Number of existing components.
	 *
	 * @type {int}
	 * @readonly
	 * @name module:sap/ui/core/ComponentRegistry.size
	 * @public
	 */

	/**
	 * Return an object with all instances of <code>sap.ui.core.Component</code>,
	 * keyed by their ID.
	 *
	 * Each call creates a new snapshot object. Depending on the size of the UI,
	 * this operation therefore might be expensive. Consider to use the <code>forEach</code>
	 * or <code>filter</code> method instead of executing similar operations on the returned
	 * object.
	 *
	 * <b>Note</b>: The returned object is created by a call to <code>Object.create(null)</code>,
	 * and therefore lacks all methods of <code>Object.prototype</code>, e.g. <code>toString</code> etc.
	 *
	 * @returns {Object<sap.ui.core.ID,sap.ui.core.Component>} Object with all components, keyed by their ID
	 * @name module:sap/ui/core/ComponentRegistry.all
	 * @function
	 * @public
	 */

	/**
	 * Retrieves a Component by its ID.
	 *
	 * When the ID is <code>null</code> or <code>undefined</code> or when there's no Component with
	 * the given ID, then <code>undefined</code> is returned.
	 *
	 * @param {sap.ui.core.ID} id ID of the Component to retrieve
	 * @returns {sap.ui.core.Component|undefined} Component with the given ID or <code>undefined</code>
	 * @name module:sap/ui/core/ComponentRegistry.get
	 * @function
	 * @public
	 */

	/**
	 * Calls the given <code>callback</code> for each existing component.
	 *
	 * The expected signature of the callback is
	 * <pre>
	 *    function callback(oComponent, sID)
	 * </pre>
	 * where <code>oComponent</code> is the currently visited component instance and <code>sID</code>
	 * is the ID of that instance.
	 *
	 * The order in which the callback is called for components is not specified and might change between
	 * calls (over time and across different versions of UI5).
	 *
	 * If components are created or destroyed within the <code>callback</code>, then the behavior is
	 * not specified. Newly added objects might or might not be visited. When a component is destroyed during
	 * the filtering and was not visited yet, it might or might not be visited. As the behavior for such
	 * concurrent modifications is not specified, it may change in newer releases.
	 *
	 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
	 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
	 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
	 * context object, that object wins over the given <code>thisArg</code>.
	 *
	 * @param {function(sap.ui.core.Component,sap.ui.core.ID)} callback
	 *        Function to call for each Component
	 * @param {Object} [thisArg=undefined]
	 *        Context object to provide as <code>this</code> in each call of <code>callback</code>
	 * @throws {TypeError} If <code>callback</code> is not a function
	 * @name module:sap/ui/core/ComponentRegistry.forEach
	 * @function
	 * @public
	 */

	/**
	 * Returns an array with components for which the given <code>callback</code> returns a value that coerces
	 * to <code>true</code>.
	 *
	 * The expected signature of the callback is
	 * <pre>
	 *    function callback(oComponent, sID)
	 * </pre>
	 * where <code>oComponent</code> is the currently visited component instance and <code>sID</code>
	 * is the ID of that instance.
	 *
	 * If components are created or destroyed within the <code>callback</code>, then the behavior is
	 * not specified. Newly added objects might or might not be visited. When a component is destroyed during
	 * the filtering and was not visited yet, it might or might not be visited. As the behavior for such
	 * concurrent modifications is not specified, it may change in newer releases.
	 *
	 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
	 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
	 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
	 * context object, that object wins over the given <code>thisArg</code>.
	 *
	 * This function returns an array with all components matching the given predicate. The order of the
	 * components in the array is not specified and might change between calls (over time and across different
	 * versions of UI5).
	 *
	 * @param {function(sap.ui.core.Component,sap.ui.core.ID):boolean} callback
	 *        predicate against which each Component is tested
	 * @param {Object} [thisArg=undefined]
	 *        context object to provide as <code>this</code> in each call of <code>callback</code>
	 * @returns {sap.ui.core.Component[]}
	 *        Array of components matching the predicate; order is undefined and might change in newer versions of UI5
	 * @throws {TypeError} If <code>callback</code> is not a function
	 * @name module:sap/ui/core/ComponentRegistry.filter
	 * @function
	 * @public
	 */
	return ComponentRegistry;
});
