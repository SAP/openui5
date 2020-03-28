/*!
 * ${copyright}
 */

// Provides class sap.m.InstanceManager
sap.ui.define(["sap/base/assert", "sap/base/Log", "sap/ui/thirdparty/jquery"],
	function(assert, Log, jQuery) {
	"use strict";

	/**
	 * Provides methods to manage instances. This is specifically designed for managing the opened Popover, Dialog, ActionSheet,
	 * and it's possible to close all of the opened Popover, Dialog, ActionSheet in history handling.
	 *
	 * Example:
	 * <pre>
	 *   sap.ui.define([
	 *      "sap/m/InstanceManager"
	 *   ], function(InstanceManager) {
	 *     ...
	 *     InstanceManager.closeAllPopovers();
	 *     ...
	 *   });
	 * </pre>
	 *
	 * @namespace
	 * @alias sap.m.InstanceManager
	 * @public
	 * @since 1.9.2
	 */
	var InstanceManager = {};

	var mRegistry = {},
		aEmptyArray = [];

	var sPopoverCategoryId = "_POPOVER_",
		sDialogCategoryId = "_DIALOG_",
		sLightBoxCategoryId = "_LIGHTBOX_";

	/**
	 * Adds an instance to the given category. If the instance is already added to the same category, it won't be added again.
	 *
	 * @param {string} sCategoryId The category's id.
	 * @param {object} oInstance The instance that will be added to the given category.
	 * @returns {sap.m.InstanceManager} Enable method chaining.
	 * @protected
	 * @function
	 */
	InstanceManager.addInstance = function(sCategoryId, oInstance) {
		assert(sCategoryId, "In sap.m.InstanceManager.addInstance method, the parameter sCategoryId can't be null or empty string");
		assert(oInstance instanceof Object, "In sap.m.InstanceManager.addInstance method, the parameter oInstance should be an object");

		if (!mRegistry[sCategoryId]) {
			mRegistry[sCategoryId] = [];
		}

		if (mRegistry[sCategoryId].indexOf(oInstance) === -1) {
			mRegistry[sCategoryId].push(oInstance);
		}

		return this;
	};

	/**
	 * Removes a managed instance from the given category.
	 *
	 * @param {string} sCategoryId The category's id.
	 * @param {object} oInstance The instance that will be removed from the given category.
	 * @returns {object} The removed instance or null. If the instance isn't managed, this method returns null instead of the instance object.
	 * @protected
	 * @function
	 */
	InstanceManager.removeInstance = function(sCategoryId, oInstance) {
		var aCategory = mRegistry[sCategoryId],
			i;

		assert(sCategoryId, "In sap.m.InstanceManager.removeInstance method, the parameter sCategoryId can't be null or empty string");
		assert(oInstance instanceof Object, "In sap.m.InstanceManager.removeInstance method, the parameter oInstance should be an object");

		if (!aCategory) {
			return null;
		}

		i = aCategory.indexOf(oInstance);

		return (i === -1) ? null : aCategory.splice(i, 1);
	};

	/**
	 * Returns an array of managed instances in the given category.
	 *
	 * @param {string} sCategoryId The category's id.
	 * @returns {object} Managed instances in the given category.
	 * @protected
	 * @function
	 */
	InstanceManager.getInstancesByCategoryId = function(sCategoryId) {
		assert(sCategoryId, "In sap.m.InstanceManager.getInstancesByCategoryId method, the parameter sCategoryId can't be null or empty string");

		return mRegistry[sCategoryId] || aEmptyArray;
	};

	/**
	 * Checks if an instance is managed under the given category.
	 *
	 * @param {string} sCategoryId The category that the instance is supposed to be in.
	 * @param {object} oInstance The instance that needs to be checked.
	 * @returns {boolean} Whether the instance is managed in the given category.
	 * @protected
	 * @function
	 */
	InstanceManager.isInstanceManaged = function(sCategoryId, oInstance) {
		assert(sCategoryId, "In sap.m.InstanceManager.isInstanceManaged method, the parameter sCategoryId can't be null or empty string");
		assert(oInstance instanceof Object, "In sap.m.InstanceManager.isInstanceManaged method, the parameter oInstance should be an object");

		var aCategory = mRegistry[sCategoryId];

		if (!aCategory || !oInstance) {
			return false;
		}

		return aCategory.indexOf(oInstance) !== -1;
	};

	/**
	 * Returns if there's no managed instance in the given category.
	 *
	 * @param {string} sCategoryId The category's id.
	 * @returns {boolean} Whether the category is empty.
	 * @protected
	 */
	InstanceManager.isCategoryEmpty = function(sCategoryId) {
		assert(sCategoryId, "In sap.m.InstanceManager.isCategoryEmpty method, the parameter sCategoryId can't be null or empty string");

		var aCategory = mRegistry[sCategoryId];

		return !aCategory || aCategory.length === 0;
	};

	/**
	 * Adds a control to predefined popover category in instance manager.
	 *
	 * @param {sap.ui.core.Control} oPopover Popover to be added to instance manager. Custom popover which doesn't inherit from sap.m.Popover can also be added as long as it has a close method.
	 * @returns {sap.m.InstanceManager} Enable method chaining.
	 * @protected
	 */
	InstanceManager.addPopoverInstance = function(oPopover){
		if (typeof oPopover.close === "function") {
			InstanceManager.addInstance(sPopoverCategoryId, oPopover);
		} else {
			Log.warning("In method addPopoverInstance: the parameter doesn't have a close method and can't be managed.");
		}
		return this;
	};

	/**
	 * Adds a control to predefined dialog category in instance manager.
	 *
	 * @param {sap.ui.core.Control} oDialog Dialog to be added to instance manager. Dialog which doesn't inherit from sap.m.Dialog can also be added as long as it has a close method.
	 * @returns {sap.m.InstanceManager} Enable method chaining.
	 * @protected
	 */
	InstanceManager.addDialogInstance = function(oDialog){
		if (typeof oDialog.close === "function" ) {
			InstanceManager.addInstance(sDialogCategoryId, oDialog);
		} else {
			Log.warning("In method addDialogInstance: the parameter doesn't have a close method and can't be managed.");
		}
		return this;
	};

	/**
	 * Adds a control to predefined lightbox category in instance manager.
	 *
	 * @param {sap.m.LightBox} oLightBox Dialog to be added to instance manager. Dialog which doesn't inherit from sap.m.Dialog can also be added as long as it has a close method.
	 * @returns {sap.m.InstanceManager} Enable method chaining.
	 * @protected
	 */
	InstanceManager.addLightBoxInstance = function(oLightBox){
		if (typeof oLightBox.close === "function" ) {
			InstanceManager.addInstance(sLightBoxCategoryId, oLightBox);
		} else {
			Log.warning("In method addLightBoxInstance: the parameter doesn't have a close method and can't be managed.");
		}
		return this;
	};

	/**
	 * Removes control from predefined popover category in instance manager.
	 *
	 * @param {sap.ui.core.Control} oPopover to be removed from instance manager.
	 * @returns {sap.ui.core.Control} The removed popover or null. If the popover isn't managed, this method returns null instead of the removed popover.
	 * @protected
	 */
	InstanceManager.removePopoverInstance = function(oPopover){
		return InstanceManager.removeInstance(sPopoverCategoryId, oPopover);
	};

	/**
	 * Removes control from predefined dialog category in instance manager.
	 *
	 * @param {sap.ui.core.Control} oDialog to be removed from instance manager.
	 * @returns {sap.ui.core.Control} The removed popover or null. If the popover isn't managed, this method returns null instead of the removed popover.
	 * @protected
	 * @function
	 */
	InstanceManager.removeDialogInstance = function(oDialog){
		return InstanceManager.removeInstance(sDialogCategoryId, oDialog);
	};

	/**
	 * Removes control from predefined lightbox category in instance manager.
	 *
	 * @param {sap.m.LightBox} oLightBox to be removed from instance manager.
	 * @returns {sap.m.LightBox|null} The removed popover or null. If the LightBox isn't managed, this method returns null instead of the removed LightBox.
	 * @protected
	 */
	InstanceManager.removeLightBoxInstance = function(oLightBox){
		return InstanceManager.removeInstance(sLightBoxCategoryId, oLightBox);
	};

	/**
	 * Returns true if there's at least one popover managed in the predefined popover category, otherwise it returns false.
	 *
	 * @returns {boolean} Whether there's popover(s) open.
	 * @public
	 */
	InstanceManager.hasOpenPopover = function(){
		return !InstanceManager.isCategoryEmpty(sPopoverCategoryId);
	};

	/**
	 * Returns true if there's at least one dialog managed in the predefined dialog category, otherwise it returns false.
	 *
	 * @returns {boolean} Whether there's dialog(s) open.
	 * @public
	 */
	InstanceManager.hasOpenDialog = function(){
		return !InstanceManager.isCategoryEmpty(sDialogCategoryId);
	};

	/**
	 * Returns true if there's at least one LightBox managed in the predefined lightbox category, otherwise it returns false.
	 *
	 * @returns {boolean} Whether there's LightBox(es) is/are open.
	 * @public
	 */
	InstanceManager.hasOpenLightBox = function(){
		return !InstanceManager.isCategoryEmpty(sLightBoxCategoryId);
	};

	/**
	 * Checks if the given dialog instance is managed under the dialog category.
	 * For dialog instances, managed means the dialog is open.
	 *
	 * This function is specially provided for customized controls which doesn't have the possibility to check whether it's open.
	 * If the given dialog is an instance of sap.m.Dialog, sap.m.ActionSheet, the isOpen() method on the instance is
	 * preferred to be called than this function.
	 *
	 * @param {sap.ui.core.Control} oDialog The dialog that is checked for the openness.
	 * @returns {boolean} Whether the given dialog is open.
	 * @public
	 */
	InstanceManager.isDialogOpen = function(oDialog){
		return InstanceManager.isInstanceManaged(sDialogCategoryId, oDialog);
	};

	/**
	 * Check if the given popover instance is managed under the popover category.
	 * For popover instances, managed means the popover is open.
	 *
	 * This function is specially provided for customized controls which doesn't have the possibility to check whether it's open.
	 * If the given popover is an instance of sap.m.Popover, sap.m.ActionSheet, the isOpen() method on the instance is
	 * preferred to be called than this function.
	 *
	 * @param {sap.ui.core.Control} oPopover The popover that is checked for the openness.
	 * @returns {boolean} Whether the given popover is open.
	 * @public
	 */
	InstanceManager.isPopoverOpen = function(oPopover){
		return InstanceManager.isInstanceManaged(sPopoverCategoryId, oPopover);
	};

	/**
	 * Check if the given LightBox instance is managed under the LightBox category.
	 * For LightBox instances, 'managed' means the LightBox is open.
	 *
	 * This function is specially intended for controls that don't provide a way to check whether they're open.
	 * If the given lightbox is an instance of <code>sap.m.LightBox</code>, its <code>isOpen()</code> should be called
	 * instead of this function.
	 *
	 * @param {sap.m.LightBox} oLightBox The LightBox that is checked.
	 * @returns {boolean} Whether the given popover is open.
	 * @public
	 */
	InstanceManager.isLightBoxOpen = function(oLightBox){
		return InstanceManager.isInstanceManaged(sLightBoxCategoryId, oLightBox);
	};

	/**
	 * Gets all of the open popovers. If there's no popover open, an empty array is returned.
	 *
	 * @returns {sap.ui.core.Control[]} The open popovers.
	 * @public
	 */
	InstanceManager.getOpenPopovers = function(){
		return InstanceManager.getInstancesByCategoryId(sPopoverCategoryId);
	};

	/**
	 * Gets all of the open dialogs. If there's no dialog open, an empty array is returned.
	 *
	 * @returns {sap.ui.core.Control[]} The open dialogs.
	 * @public
	 */
	InstanceManager.getOpenDialogs = function(){
		return InstanceManager.getInstancesByCategoryId(sDialogCategoryId);
	};

	/**
	 * Gets all of the open LightBoxes. If there's no dialog open, an empty array is returned.
	 *
	 * @returns {sap.m.LightBox[]} The opened LightBoxes.
	 * @public
	 */
	InstanceManager.getOpenLightBoxes = function(){
		return InstanceManager.getInstancesByCategoryId(sLightBoxCategoryId);
	};

	/**
	 * Closes all open popovers.
	 *
	 * @public
	 * @returns {sap.m.InstanceManager} Enable method chaining.
	 */
	InstanceManager.closeAllPopovers = function(){
		var aIntances = InstanceManager.getOpenPopovers(), i;
		for (i = 0 ; i < aIntances.length ; i++) {
			aIntances[i].close();
		}
		return this;
	};

	/**
	 * Closes all of the open dialogs.
	 *
	 * @param {function} fnCallback
	 * @public
	 * @returns {sap.m.InstanceManager} Enable method chaining.
	 */
	InstanceManager.closeAllDialogs = function(fnCallback) {
		var oDeferred,
			aDeferred = [],
			aIntances = InstanceManager.getOpenDialogs(),
			dialog,
			i;

		for (i = 0 ; i < aIntances.length; i++) {
			dialog = aIntances[i];

			if (!dialog.getCloseOnNavigation()) {
				continue;
			}

			if (fnCallback) {
				oDeferred = new jQuery.Deferred().done();
				aDeferred.push(oDeferred);

				/*eslint-disable no-loop-func */
				dialog.attachEvent("afterClose", (function(def){
					return function() {
						def.resolve();
					};
				}(oDeferred)));
				/*eslint-enable no-loop-func */

			}

			dialog.close();
		}

		if (fnCallback) {
			jQuery.when.apply(this, aDeferred).then(fnCallback);
		}

		return this;
	};

	/**
	 * Closes all open lightboxes.
	 *
	 * @public
	 * @returns {sap.m.InstanceManager} Enable method chaining.
	 */
	InstanceManager.closeAllLightBoxes = function(){
		var aIntances = InstanceManager.getOpenLightBoxes(), iLength = aIntances.length, index;
		for (index = 0; index < iLength; index += 1) {
			aIntances[index].close();
		}
		return this;
	};

	return InstanceManager;

}, /* bExport= */ true);