/*!
* ${copyright}
*/

sap.ui.define([
	"../library",
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/util/BindingHelper",
	"sap/m/Button",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/ToolbarSpacer"
], function (
	library,
	mLibrary,
	Core,
	Control,
	CardActions,
	BindingHelper,
	Button,
	OverflowToolbarButton,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	ToolbarSpacer
) {
	"use strict";

	var ToolbarStyle = mLibrary.ToolbarStyle;

	var ActionArea = library.CardActionArea;

	/**
	 * Constructor for a new ActionsStrip.
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
	 * @alias sap.ui.integration.controls.ActionsStrip
	 */
	var ActionsStrip = Control.extend("sap.ui.integration.controls.ActionsStrip", {
		metadata: {
			library: "sap.ui.integration",
			properties: {

			},
			aggregations: {
				/**
				 * The toolbar.
				 * @private
				 */
				_toolbar: {
					type: "sap.m.OverflowToolbar",
					multiple: false
				}
			},
			associations : {
				/**
				 * The card.
				 */
				card: {
					type : "sap.ui.integration.widgets.Card",
					multiple: false
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl)
					.class("sapUiIntActionsStrip")
					.openEnd();

				oRm.renderControl(oControl._getToolbar());

				oRm.close("div");
			}
		}
	});

	ActionsStrip.prototype._getToolbar = function () {
		var oToolbar = this.getAggregation("_toolbar");
		if (!oToolbar) {
			oToolbar = new OverflowToolbar({
				style: ToolbarStyle.Clear
			});
			this.setAggregation("_toolbar", oToolbar);
		}

		return oToolbar;
	};

	ActionsStrip.prototype._initButtons = function (aButtons) {
		if (!aButtons || !aButtons.length) {
			return null;
		}

		var oToolbar = this._getToolbar(),
			oCard = Core.byId(this.getCard()),
			oActions = new CardActions({
				card: oCard
			}),
			bHasSpacer = false;

		aButtons = BindingHelper.createBindingInfos(aButtons, oCard.getBindingNamespaces());

		aButtons.forEach(function (mConfig) {
			if (mConfig.type === "ToolbarSpacer") {
				bHasSpacer = true;
				oToolbar.addContent(new ToolbarSpacer());
				return;
			}

			var aActions = mConfig.actions,
				oOverflow = new OverflowToolbarLayoutData({
					group: mConfig.overflowGroup,
					priority: mConfig.overflowPriority
				}),
				oButton;

			if (mConfig.icon) {
				oButton = new OverflowToolbarButton({
					icon: mConfig.icon,
					text: mConfig.text || mConfig.tooltip,
					tooltip: mConfig.tooltip || mConfig.text,
					type: mConfig.buttonType,
					ariaHasPopup: mConfig.ariaHasPopup,
					visible: mConfig.visible
				});
			} else {
				oButton = new Button({
					text: mConfig.text,
					tooltip: mConfig.tooltip,
					type: mConfig.buttonType,
					ariaHasPopup: mConfig.ariaHasPopup,
					visible: mConfig.visible
				});
			}

			oButton.setLayoutData(oOverflow);

			oActions.attach({
				area: ActionArea.ActionsStrip,
				control: oButton,
				actions: aActions,
				enabledPropertyName: "enabled"
			});

			oToolbar.addContent(oButton);
		});

		if (!bHasSpacer) {
			oToolbar.insertContent(new ToolbarSpacer(), 0);
		}
	};

	ActionsStrip.create = function (oCard, aButtons) {
		var oActionsStrip = new ActionsStrip({
			card: oCard
		});
		oActionsStrip._initButtons(aButtons);

		return oActionsStrip;
	};

	return ActionsStrip;
});