/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/integration/controls/ActionsStrip",
	"sap/ui/integration/controls/Paginator",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver"
], function (
	Control,
	Core,
	ActionsStrip,
	Paginator,
	BindingHelper,
	BindingResolver
) {
	"use strict";

	/**
	 * Constructor for a new <code>Footer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.93
	 * @alias sap.ui.integration.cards.Footer
	 */
	var Footer = Control.extend("sap.ui.integration.cards.Footer", {
		metadata: {
			properties: {
				/**
				 * Footer configuration from the manifest
				 */
				configuration: {
					type: "object"
				}
			},
			aggregations: {

				actionsStrip: {
					type: "sap.ui.integration.controls.ActionsStrip",
					multiple: false
				},

				paginator: {
					type: "sap.ui.integration.controls.Paginator",
					multiple: false
				}
			},

			associations: {

				/**
				 * Association with the parent Card that contains this filter.
				 */
				card: {
					type: "sap.ui.integration.widgets.Card",
					multiple: false
				}
			}

		},

		renderer: {
			apiVersion: 2,
			render: function (oRM, oFooter) {
				var oActionsStrip = oFooter.getActionsStrip(),
					oPaginator = oFooter.getPaginator();

				oRM.openStart("div", oFooter).class("sapFCardFooter");

				if (oActionsStrip) {
					oRM.class("sapFCardFooterWithActionsStrip");
				}

				if (oFooter.getCardInstance().isLoading() && oFooter._hasBinding()) {
					oRM.class("sapFCardFooterLoading");
				}

				oRM.openEnd();

				if (oPaginator) {
					oRM.renderControl(oPaginator);
				}

				if (oActionsStrip) {
					oRM.renderControl(oActionsStrip);
				}

				oRM.close("div");
			}
		}
	});

	Footer.prototype._hasBinding = function () {
		var oConfiguration = BindingHelper.createBindingInfos(this.getConfiguration(), this.getCardInstance().getBindingNamespaces());

		// to do: if more precise check is needed search recursively
		return (oConfiguration.actionsStrip || []).some(function (oButtonConfig) {
			for (var sKey in oButtonConfig) {
				if (BindingResolver.isBindingInfo(oButtonConfig[sKey])) {
					return true;
				}
			}

			return false;
		});
	};

	/**
	 * Gets the card instance of which this element is part of.
	 * @ui5-restricted
	 * @private
	 * @returns {sap.ui.integration.widgets.Card} The card instance.
	 */
	Footer.prototype.getCardInstance = function () {
		return Core.byId(this.getCard());
	};

	Footer.prototype.setEnabled = function (bValue) {
		var oActionsStrip = this.getActionsStrip();
		if (!oActionsStrip) {
			return;
		}

		if (bValue) {
			oActionsStrip.enableItems();
		} else {
			oActionsStrip.disableItems();
		}
	};

	Footer.create = function (oCard, oConfiguration) {
		return new Footer({
			configuration: oConfiguration,
			card: oCard,
			actionsStrip: ActionsStrip.create(oCard, oConfiguration.actionsStrip, true),
			paginator: Paginator.create(oCard, oConfiguration.paginator)
		});
	};

	return Footer;
});