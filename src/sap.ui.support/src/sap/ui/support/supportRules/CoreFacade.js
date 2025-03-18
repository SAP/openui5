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
	 * The CoreFacade interface allows rule developers to access the metadata, models, UI areas and components of the Core.
	 *
	 * <h3>Usage</h3>
	 * The CoreFacade is passed as second argument to all rule check functions.
	 *
	 * @class
	 * @name sap.ui.support.CoreFacade
	 * @param {object} oCore Core object as available in core plugins
	 * @hideconstructor
	 * @public
	 */
	function CoreFacade(oCore) {
		coreInstance = oCore;

		return (
			/** @lends sap.ui.support.CoreFacade.prototype */ {
				/**
				 * Gets the UI areas from the Core object.
				 *
				 * @public
				 * @returns {Object<sap.ui.core.ID,sap.ui.core.UIArea>} Object with all UIAreas, keyed by their ID
				 */
				getUIAreas: function () {
					return UIAreaRegistry.all();
				},

				/**
				 * Gets the Components from the Core object.
				 *
				 * @public
				 * @returns {Object<sap.ui.core.ID,sap.ui.core.Component>} Object with all components, keyed by their ID
				 */
				getComponents: function () {
					return ComponentRegistry.all();
				}
			}
		);
	}

	return CoreFacade;

});
