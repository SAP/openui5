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
		 * <h3>Overview</h3>
		 * The CoreFacade interface gives access to the Metadata, Models, UI areas and Components of the Core object.
		 * <h3>Usage</h3>
		 * The CoreFacade is passed to all rule check functions as an object. This helps rule developers to access the core state.
		 *
		 * @public
		 * @constructor
		 * @namespace
		 * @name sap.ui.support.CoreFacade
		 * @memberof sap.ui.support
		 * @author SAP SE
		 * @version ${version}
		 * @param {object} oCore Core object as available in core plugins
		 * @returns {object} Instance of the <code>CoreFacade</code>
		 */
		function CoreFacade(oCore) {
			coreInstance = oCore;

			return {
				/**
				 * Gets the Metadata from the Core object.
				 * @public
				 * @method
				 * @name sap.ui.support.CoreFacade.getMetadata
				 * @memberof sap.ui.support.CoreFacade
				 */
				getMetadata: function () {
					return coreInstance.getMetadata();
				},
				/**
				 * Gets the UI areas from the Core object.
				 * @public
				 * @method
				 * @name sap.ui.support.CoreFacade.getUIAreas
				 * @memberof sap.ui.support.CoreFacade
				 */
				getUIAreas: function () {
					return coreInstance.mUIAreas;
				},
				/**
				 * Gets the Components from the Core object.
				 * @public
				 * @method
				 * @name sap.ui.support.CoreFacade.getComponents
				 * @memberof sap.ui.support.CoreFacade
				 */
				getComponents: function () {
					return coreInstance.mObjects.component;
				},
				/**
				 * Gets the Models from the Core object.
				 * @public
				 * @method
				 * @name sap.ui.support.CoreFacade.getModels
				 * @memberof sap.ui.support.CoreFacade
				 */
				getModels: function () {
					return coreInstance.oModels;
				}
			};
		}

		return CoreFacade;

	}, true);
