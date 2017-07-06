/*!
 * ${copyright}
 */

/*!
 * An interface to the core to be used by rules
 */
sap.ui.define([],
	function () {
		"use strict";

		var coreInstance = null;

		/**
		 * @constructor
		 * <h3>Overview</h3>
		 * The CoreFacade interface gives access to the Metadata, Models, UI areas and Components of the Core object.
		 * <h3>Usage</h3>
		 * The CoreFacade is passed to all rule check functions as an object. This helps rule developers to access the core state.
		 * @name sap.ui.support.CoreFacade
		 * @alias sap.ui.support.CoreFacade
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @public
		 *
		 * @param {Object} oCore Core object as available in core plugins
		 * @returns {Object} Instance of the <code>CoreFacade</code>
		 */
		function CoreFacade(oCore) {
			coreInstance = oCore;

			return {
				/**
				 * Gets the Metadata from the Core object.
				 * @returns {Object} Core metadata
				 */
				getMetadata: function () {
					return coreInstance.getMetadata();
				},
				/**
				 * Gets the UI areas from the Core object.
				 * @returns {Object} UI areas
				 */
				getUIAreas: function () {
					return coreInstance.mUIAreas;
				},
				/**
				 * Gets the Components from the Core object.
				 * @returns {Object} Components
				 */
				getComponents: function () {
					return coreInstance.mObjects.component;
				},
				/**
				 * Gets the Models from the Core object.
				 * @returns {Object} Models
				 */
				getModels: function () {
					return coreInstance.oModels;
				}
			};
		}

		return CoreFacade;

	}, true);
