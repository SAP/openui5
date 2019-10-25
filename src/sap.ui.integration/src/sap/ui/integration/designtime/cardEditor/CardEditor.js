/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"./config/index"
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
	var CardEditor = BaseEditor.extend("sap.ui.integration.designtime.cardEditor.CardEditor", {
		constructor: function() {
			BaseEditor.prototype.constructor.apply(this, arguments);
			this.addDefaultConfig(oDefaultCardConfig);
		},
		renderer: BaseEditor.getMetadata().getRenderer()
	});

	return CardEditor;
});
