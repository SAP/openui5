/*!
 * ${copyright}
 */

/*!
 * An interface to the core to be used by rules
 */
sap.ui.define([
	'sap/ui/core/ComponentRegistry',
	'sap/ui/core/UIAreaRegistry'
], function (ComponentRegistry, UIAreaRegistry) {
	"use strict";

	var coreInstance = null;

	/**
	 * @class
	 * The CoreFacade interface allows rule developers to access the metadata, models, UI areas and components of the Core.
	 *
	 * <h3>Usage</h3>
	 * The CoreFacade is passed as second argument to all rule check functions.
	 *
	 * @name sap.ui.support.CoreFacade
	 * @param {object} oCore Core object as available in core plugins
	 * @hideconstructor
	 * @public
	 */
	function CoreFacade(oCore) {
		coreInstance = oCore;

		return /** @lends sap.ui.support.CoreFacade.prototype */ {
			/**
			 * Gets the Metadata from the Core object.
			 * @public
			 */
			getMetadata: function () {
				return coreInstance.getMetadata();
			},
			/**
			 * Gets the UI areas from the Core object.
			 * @public
			 */
			getUIAreas: function () {
				return UIAreaRegistry.all();
			},
			/**
			 * Gets the Components from the Core object.
			 * @public
			 */
			getComponents: function () {
				return ComponentRegistry.all();
			},
			/**
			 * Gets the Models from the Core object.
			 * @public
			 */
			getModels: function () {
				return coreInstance.oModels;
			}
		};
	}

	return CoreFacade;

});
