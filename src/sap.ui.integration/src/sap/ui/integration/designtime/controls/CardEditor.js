/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/controls/BaseEditor",
	"./DefaultCardConfig"
], function (
	BaseEditor,
	oDefaultCardConfig
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var CardEditor = BaseEditor.extend("sap.ui.integration.designtime.controls.CardEditor", {
		constructor: function() {
			var vReturn = BaseEditor.prototype.constructor.apply(this, arguments);
			this.addDefaultConfig(oDefaultCardConfig);
			return vReturn;
		},
		renderer: BaseEditor.getMetadata().getRenderer()
	});

	return CardEditor;
});
