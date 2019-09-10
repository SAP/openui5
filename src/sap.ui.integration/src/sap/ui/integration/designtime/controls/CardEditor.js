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
		init: function() {
			this.addDefaultConfig(oDefaultCardConfig);
			return BaseEditor.prototype.init.apply(this, arguments);
		},
		renderer: BaseEditor.getMetadata().getRenderer()
	});

	return CardEditor;
});
