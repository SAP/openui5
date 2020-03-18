/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/core/ComponentContainer"
], function (
	BaseContent,
	ComponentContainer
) {
	"use strict";

	/**
	 * Constructor for a new <code>Component</code> Card Content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that allows a Component to be put inside a card content
	 *
	 * @extends sap.ui.integration.cards.BaseContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @experimental
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.cards.ComponentContent
	 */
	var ComponentContent = BaseContent.extend("sap.ui.integration.cards.ComponentContent", {
		renderer: {}
	});

	ComponentContent.prototype.setConfiguration = function (oConfiguration) {
		BaseContent.prototype.setConfiguration.apply(this, arguments);

		if (!oConfiguration) {
			return;
		}

		var oContainer = new ComponentContainer({
			manifest: oConfiguration,
			async: true,
			componentCreated: function (oEvent) {
				var oComponent = oEvent.getParameter("component"),
					oCard = this.getParent();

				if (oComponent.onCardReady) {
					oComponent.onCardReady(oCard);
				}

				// TODO _updated event is always needed, so that the busy indicator knows when to stop. We should review this for contents which do not have data.
				this.fireEvent("_actionContentReady");
				this.fireEvent("_updated");
			}.bind(this),
			componentFailed: function () {
				this.fireEvent("_actionContentReady");
				this._handleError("Card content failed to create component");
			}.bind(this)
		});

		this.setAggregation("_content", oContainer);
	};

	return ComponentContent;
});
