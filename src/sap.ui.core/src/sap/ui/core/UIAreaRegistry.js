/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObjectRegistry"
], (
	Log,
	ManagedObjectRegistry
) => {
	"use strict";

	const fnOnDuplicate = function(sId, oldUIArea, newUIArea) {
        var sMsg = "adding UIArea with duplicate id '" + sId + "'";
        Log.error(sMsg);
        throw new Error("Error: " + sMsg);
    };

	/**
	 * Registry of all <code>sap.ui.core.UIArea</code>s that currently exist.
	 *
	 * @namespace sap.ui.core.UIAreaRegistry
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	const UIAreaRegistry = ManagedObjectRegistry.create({
		"onDuplicate": fnOnDuplicate
	});

	/**
	 * Number of existing UIAreas.
	 *
	 * @type {int}
	 * @readonly
	 * @name module:sap/ui/core/UIAreaRegistry.size
	 * @private
	 * @ui5-restricted sap.ui.core
	 */

	/**
	 * Return an object with all instances of <code>sap.ui.core.UIArea</code>,
	 * keyed by their ID.
	 *
	 * Each call creates a new snapshot object. Depending on the size of the UI,
	 * this operation therefore might be expensive. Consider to use the <code>forEach</code>
	 * or <code>filter</code> method instead of executinTg similar operations on the returned
	 * object.
	 *
	 * <b>Note</b>: The returned object is created by a call to <code>Object.create(null)</code>,
	 * and therefore lacks all methods of <code>Object.prototype</code>, e.g. <code>toString</code> etc.
	 *
	 * @returns {Object<sap.ui.core.ID,sap.ui.core.UIArea>} Object with all UIAreas, keyed by their ID
	 * @name module:sap/ui/core/UIAreaRegistry.all
	 * @function
	 * @private
	 * @ui5-restricted sap.ui.core
	 */

	/**
	 * Retrieves an UIArea by its ID.
	 *
	 * When the ID is <code>null</code> or <code>undefined</code> or when there's no UIArea with
	 * the given ID, then <code>undefined</code> is returned.
	 *
	 * @param {sap.ui.core.ID} id ID of the UIArea to retrieve
	 * @returns {sap.ui.core.UIArea|undefined} UIArea with the given ID or <code>undefined</code>
	 * @name module:sap/ui/core/UIAreaRegistry.get
	 * @function
	 * @private
	 * @ui5-restricted sap.ui.core
	 */

	/**
	 * Calls the given <code>callback</code> for each UIArea.
	 *
	 * The expected signature of the callback is
	 * <pre>
	 *    function callback(oUIArea, sID)
	 * </pre>
	 * where <code>oUIArea</code> is the currently visited UIArea instance and <code>sID</code>
	 * is the ID of that instance.
	 *
	 * The order in which the callback is called for UIAreas is not specified and might change between
	 * calls (over time and across different versions of UI5).
	 *
	 * If UIAreas are created or destroyed within the <code>callback</code>, then the behavior is
	 * not specified. Newly added objects might or might not be visited. When an UIArea is destroyed or
	 * the root node is changed during the filtering and was not visited yet, it might or might not be
	 * visited. As the behavior for such concurrent modifications is not specified, it may change in
	 * newer releases.
	 *
	 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
	 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
	 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
	 * context object, that object wins over the given <code>thisArg</code>.
	 *
	 * @param {function(sap.ui.core.UIArea,sap.ui.core.ID)} callback
	 *        Function to call for each UIArea
	 * @param {Object} [thisArg=undefined]
	 *        Context object to provide as <code>this</code> in each call of <code>callback</code>
	 * @throws {TypeError} If <code>callback</code> is not a function
	 * @name module:sap/ui/core/UIAreaRegistry.forEach
	 * @function
	 * @private
	 * @ui5-restricted sap.ui.core
	 */

	/**
	 * Returns an array with UIAreas for which the given <code>callback</code> returns a value that coerces
	 * to <code>true</code>.
	 *
	 * The expected signature of the callback is
	 * <pre>
	 *    function callback(oUIArea, sID)
	 * </pre>
	 * where <code>oUIArea</code> is the currently visited UIArea instance and <code>sID</code>
	 * is the ID of that instance.
	 *
	 * If UIAreas are created or destroyed within the <code>callback</code>, then the behavior is
	 * not specified. Newly added objects might or might not be visited. When an UIArea is destroyed or
	 * the root node is changed during the filtering and was not visited yet, it might or might not be
	 * visited. As the behavior for such concurrent modifications is not specified, it may change in
	 * newer releases.
	 *
	 * If a <code>thisArg</code> is given, it will be provided as <code>this</code> context when calling
	 * <code>callback</code>. The <code>this</code> value that the implementation of <code>callback</code>
	 * sees, depends on the usual resolution mechanism. E.g. when <code>callback</code> was bound to some
	 * context object, that object wins over the given <code>thisArg</code>.
	 *
	 * This function returns an array with all UIAreas matching the given predicate. The order of the
	 * UIAreas in the array is not specified and might change between calls (over time and across different
	 * versions of UI5).
	 *
	 * @param {function(sap.ui.core.UIArea,sap.ui.core.ID):boolean} callback
	 *        predicate against which each UIArea is tested
	 * @param {Object} [thisArg=undefined]
	 *        context object to provide as <code>this</code> in each call of <code>callback</code>
	 * @returns {sap.ui.core.UIArea[]}
	 *        Array of UIAreas matching the predicate; order is undefined and might change in newer versions of UI5
	 * @throws {TypeError} If <code>callback</code> is not a function
	 * @name module:sap/ui/core/UIAreaRegistry.filter
	 * @function
	 * @private
	 * @ui5-restricted sap.ui.core
	 */

	return UIAreaRegistry;
});
