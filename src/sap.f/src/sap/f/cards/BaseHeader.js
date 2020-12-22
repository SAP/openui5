/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control"
], function (
	Control
) {
	"use strict";

	/**
	 * Constructor for a new <code>BaseHeader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides basic functionality for header controls that can be used in <code>sap.f.Card</code.
	 *
	 * @extends sap.ui.core.Control
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.86
	 * @alias sap.f.cards.BaseHeader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BaseHeader = Control.extend("sap.f.cards.BaseHeader", {
		metadata: {
			library: "sap.f",
			"abstract" : true,
			aggregations: {

				/**
				 * Defines the toolbar.
				 * @experimental Since 1.86
				 * @since 1.86
				 */
				toolbar: { type: "sap.ui.core.Control", multiple: false }

			}
		}
	});

	BaseHeader.prototype.onBeforeRendering = function () {
		var oToolbar = this.getToolbar();

		if (oToolbar) {
			oToolbar.addStyleClass("sapFCardHeaderToolbar");
		}
	};

	return BaseHeader;
});
