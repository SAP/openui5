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
		 * Constructor for facade to given core object
		 *
		 * @returns {object} Core facade
		 * @param {object} oCore Core object as available in plugin
		 */
		function CoreFacade(oCore) {
			coreInstance = oCore;

			return {
				/**
				 * @returns {object} Core metadata
				 */
				getMetadata: function () {
					return coreInstance.getMetadata();
				},
				/**
				 * @returns {object} UI areas
				 */
				getUIAreas: function () {
					return coreInstance.mUIAreas;
				},
				/**
				 * @returns {object} Components
				 */
				getComponents: function () {
					return coreInstance.mObjects.component;
				},
				/**
				 * @returns {object} Models
				 */
				getModels: function () {
					return coreInstance.oModels;
				}
			};
		}

		return CoreFacade;

	}, true);
