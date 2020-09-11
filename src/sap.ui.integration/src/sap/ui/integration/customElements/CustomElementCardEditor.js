/*!
* ${copyright}
*/

sap.ui.require([
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/customElements/CustomElementBase"
], function (
	CardEditor,
	CustomElementBase
) {
	"use strict";

	/**
	 * Constructor for a new <code>CustomElementCardEditor</code>.
	 *
	 * @class
	 * @extends sap.ui.integration.customElements.CustomElementBase
	 * @alias sap.ui.integration.customElements.CustomElementCardEditor
	 * @private
	 */
	var CustomElementCardEditor = CustomElementBase.extend(CardEditor, {

	});
	CustomElementCardEditor.prototype.getCurrentSettings = function () {
		return this._getControl().getCurrentSettings();
	};
	var aDependencies = ["ui-integration-card"];
	CustomElementBase.define("ui-integration-card-editor", CustomElementCardEditor, aDependencies);
});
