/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/base/util/merge",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/integration/controls/ActionsStrip",
	"sap/ui/integration/util/BindingHelper",
	"sap/m/library",
	"sap/m/Button"
], function (
	Control,
	merge,
	Element,
	Library,
	ActionsStrip,
	BindingHelper,
	mLibrary,
	Button
) {
	"use strict";

	const ButtonType = mLibrary.ButtonType;

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
	 * @ui5-restricted
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
				},
				showCloseButton: {
					type: "boolean"
				}
			},
			aggregations: {
				actionsStrip: {
					type: "sap.ui.integration.controls.ActionsStrip",
					multiple: false
				},
				_showMore: {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				},
				_closeButton: {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
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
				oRM.openStart("div", oFooter).class("sapFCardFooter");

				if (oFooter.getCardInstance().isLoading() && oFooter._hasBinding()) {
					oRM.class("sapFCardFooterLoading");
				}

				oRM.openEnd();

				const oActionsStrip = oFooter.getActionsStrip();

				if (oActionsStrip) {
					oRM.renderControl(oActionsStrip);
				}

				const oShowMore = oFooter.getAggregation("_showMore");

				if (oShowMore) {
					oRM.renderControl(oShowMore);
				}

				const oCloseButton = oFooter.getAggregation("_closeButton");

				if (oCloseButton) {
					oRM.renderControl(oCloseButton);
				}

				oRM.close("div");
			}
		}
	});

	Footer.create = function ({ card, configuration, paginator, showCloseButton }) {
		const oFooter = new Footer({
			configuration: BindingHelper.createBindingInfos(configuration, card.getBindingNamespaces()),
			card,
			showCloseButton,
			actionsStrip: ActionsStrip.create(configuration.actionsStrip, card, true),
			visible: configuration.visible
		});

		oFooter.setPaginator(paginator);

		return oFooter;
	};

	Footer.prototype.onBeforeRendering = function () {
		if (this._oPaginator && !this._oPaginator.getActive()) {
			this._createShowMore();
		} else {
			this.destroyAggregation("_showMore");
		}

		if (this.getShowCloseButton()) {
			this._createCloseButton();
		} else {
			this.destroyAggregation("_closeButton");
		}
	};

	Footer.prototype.onDataChanged = function () {
		if (this.getActionsStrip()) {
			this.getActionsStrip().onDataChanged();
		}
	};

	Footer.prototype._hasBinding = function () {
		var oConfiguration = BindingHelper.createBindingInfos(this.getConfiguration(), this.getCardInstance().getBindingNamespaces());

		// to do: if more precise check is needed search recursively
		return (oConfiguration.actionsStrip || []).some(function (oButtonConfig) {
			for (var sKey in oButtonConfig) {
				if (BindingHelper.isBindingInfo(oButtonConfig[sKey])) {
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
		return Element.getElementById(this.getCard());
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

	/**
	 * @ui5-restricted
	 * @private
	 * @returns {object} Footer configuration with static values.
	 */
	Footer.prototype.getStaticConfiguration = function () {
		var oConfiguration = merge({}, this.getConfiguration());

		if (this._oPaginator) {
			oConfiguration.paginator = this._oPaginator.getStaticConfiguration();
		}

		return oConfiguration;
	};

	Footer.prototype.setPaginator = function (oPaginator) {
		this._oPaginator = oPaginator;
	};

	Footer.prototype._createShowMore = function () {
		let oMore = this.getAggregation("_showMore");

		if (!oMore) {
			const oPaginator = this._oPaginator;

			oMore = new Button({
				text: Library.getResourceBundleFor("sap.ui.integration").getText("CARD_FOOTER_SHOW_MORE"),
				type: ButtonType.Transparent,
				press: () => {
					oPaginator.openDialog();
				},
				visible: oPaginator.getPageCount() > 1
			}).addStyleClass("sapFCardFooterShowMoreButton");

			oPaginator.attachEvent("_ready", () => {
				oMore.setVisible(oPaginator.getPageCount() > 1);
			});

			this.setAggregation("_showMore", oMore);
		}

		return oMore;
	};

	Footer.prototype._createCloseButton = function () {
		let oButton = this.getAggregation("_closeButton");

		if (!oButton) {
			oButton = new Button({
				text: Library.getResourceBundleFor("sap.ui.integration").getText("CARD_DIALOG_CLOSE_BUTTON"),
				type: ButtonType.Emphasized,
				press: this.getCardInstance().hide.bind(this.getCardInstance())
			});

			this.setAggregation("_closeButton", oButton);
		}

		return oButton;
	};

	return Footer;
});