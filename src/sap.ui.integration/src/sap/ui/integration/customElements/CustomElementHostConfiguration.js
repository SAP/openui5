/*!
* ${copyright}
*/

sap.ui.require([
	"sap/ui/integration/customElements/CustomElementBase",
	"sap/ui/integration/host/HostConfiguration"
], function (
	CustomElementBase,
	HostConfiguration
) {
	"use strict";

	/**
	 * Constructor for a new <code>CustomElementHostConfiguration</code>.
	 *
	 * @class
	 * @extends sap.ui.integration.customElements.CustomElementBase
	 * @alias sap.ui.integration.customElements.CustomElementHostConfiguration
	 * @private
	 */
	var CustomElementHostConfiguration = CustomElementBase.extend(HostConfiguration);

	CustomElementBase.define("ui-integration-host-configuration", CustomElementHostConfiguration, []);
});