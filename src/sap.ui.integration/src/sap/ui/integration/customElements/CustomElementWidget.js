/*!
* ${copyright}
*/

sap.ui.require([
	"sap/ui/integration/customElements/CustomElementBase",
	"sap/ui/integration/Widget"
], function (
	CustomElementBase,
	Widget
) {
	"use strict";

	/**
	 * Constructor for a new <code>CustomElementWidget</code>.
	 *
	 * @class
	 * @extends sap.ui.integration.customElements.CustomElementBase
	 * @alias sap.ui.integration.customElements.CustomElementWidget
	 * @private
	 */
	var CustomElementWidget = CustomElementBase.extend(Widget);

	/* Public methods */

	/**
	 * Loads the module designtime/Widget.designtime or the module given in
	 * "sap.widget": {
	 *    "designtime": "designtime/Own.designtime"
	 * }
	 * This file should contain the designtime configuration for the widget.
	 *
	 * Returns a promise that resolves with an object
	 * {
	 *    configuration: the current configuration
	 *    designtime: the designtime modules response
	 *    manifest: the complete manifest json
	 * }
	 * The promise is rejected if the module cannot be loaded with an object:
	 * {
	 *     error: "Widget.designtime not found"
	 * }
	 *
	 * @public
	 * @returns {Promise} Promise resolves after the designtime configuration is loaded.
	 */
	CustomElementWidget.prototype.loadDesigntime = function () {
		return this._getControl().loadDesigntime();
	};

	CustomElementBase.define("ui-integration-widget", CustomElementWidget, []);
});