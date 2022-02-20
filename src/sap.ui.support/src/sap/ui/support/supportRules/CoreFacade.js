/*!
 * ${copyright}
 */

/*!
 * An interface to the core to be used by rules
 */
sap.ui.define([
	'sap/ui/core/Component',
	'sap/ui/core/UIArea'
],
	function (Component, UIArea) {
		"use strict";

		var coreInstance = null;

		/**
		 * @class
		 *
		 * <h3>Overview</h3>
		 * The CoreFacade interface gives access to the Metadata, Models, UI areas and Components of the Core object.
		 *
		 * <h3>Usage</h3>
		 * The CoreFacade is passed to all rule check functions as an object. This helps rule developers to access the core state.
		 *
		 * @name sap.ui.support.CoreFacade
		 * @param {object} oCore Core object as available in core plugins
		 * @returns {object} Instance of the <code>CoreFacade</code>
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
					return UIArea.registry.all();
				},
				/**
				 * Gets the Components from the Core object.
				 * @public
				 */
				getComponents: function () {
					return Component.registry.all();
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

	}, true);
