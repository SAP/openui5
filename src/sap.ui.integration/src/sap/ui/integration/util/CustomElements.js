/*!
* ${copyright}
*/

/* global Reflect, HTMLElement, CustomEvent */

sap.ui.define([
	"./CustomElementBase"
], function (
	CustomElementBase
) {
	"use strict";

	/**
	 * Dynamically creates a new class that extends sap.ui.integration.util.CustomElementBase and registers it customElement.
	 *
	 * @param {string} sCustomElementName The name of the custom html element (e.g: "ui-integration-card").
	 * @param {sap.ui.core.Control} ControlClass A UI5 class that will be wrapped in the custom html element.
	 */
	function extendCustomElementBase(sCustomElementName, ControlClass) {

		/**
		 * Dynamically created class. For example "ui-integration-card".
		 *
		 * @class
		 * @extends sap.ui.integration.util.CustomElementBase
		 *
		 */
		function UiIntegrationControl() {
			return CustomElementBase.apply(this, arguments);
		}

		UiIntegrationControl.prototype = Object.create(CustomElementBase.prototype);
		UiIntegrationControl.prototype.constructor = UiIntegrationControl;
		Object.assign(UiIntegrationControl, CustomElementBase);

		// TO DO: Improve this by loading dependencies from the library.js or separating all custom elements into files
		var aDependencies = [];

		if (sCustomElementName === "ui-integration-card") {
			aDependencies.push("ui-integration-host-configuration");
		}

		UiIntegrationControl.define(sCustomElementName, ControlClass, aDependencies);
	}

	return {
		registerTag: function registerTag(sTagName, ControlClass) {
			extendCustomElementBase(sTagName, ControlClass);
		}
	};
});