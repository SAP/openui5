
/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/m/Button'
], function(Button) {
	"use strict";

	/**
	 * @class
	 * Defines a responsive action button that it slightly larger on medium size devices and big on large devices
	 * @extends sap.m.Button
	 */
	var ActionButton = Button.extend("sap.ui.documentation.sdk.controls.ActionButton", {
		/**
		 * Add a custom CSS class as we do not have our own renderer for this inherited control
		 * The control is kept for flexibility, it could be achieved with a style class on a normal button
		 */
		onAfterRendering: function () {
			this.$().addClass("sapUiDocActionButton");
		},

		renderer: Button.prototype.getRenderer().render
	});

	return ActionButton;
});