/*!
* ${copyright}
*/

sap.ui.define([
	"../library",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/ui/integration/controls/LinkWithIcon",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/ToolbarSpacer",
	"sap/m/Label"
], function (
	library,
	mLibrary,
	coreLibrary,
	Control,
	Element,
	CardActions,
	BindingHelper,
	BindingResolver,
	JSONModel,
	Button,
	LinkWithIcon,
	OverflowToolbarButton,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	Label
) {
	"use strict";

	const ToolbarStyle = mLibrary.ToolbarStyle;
	const ToolbarDesign = mLibrary.ToolbarDesign;

	const AriaHasPopup = coreLibrary.aria.HasPopup;

	const ActionArea = library.CardActionArea;
	const CardActionType = library.CardActionType;

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
				disableItemsInitially: {
					type: "boolean",
					defaultValue: false
				},
				configuration: {
					type: "object"
				},
				cardActions: {
					type: "object"
				}
			},
			aggregations: {
				/**
				 * The toolbar.
				 * @private
				 * @ui5-restricted sap.ui.integration.controls.ActionsStrip
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

	ActionsStrip.prototype.onDataChanged = function () {
		if (this.getConfiguration()?.item) {
			this._updateToolbar(this._createItemsFromTemplate(this.getBindingContext().getProperty(this.getConfiguration().item?.path)));
		}
	};

	ActionsStrip.prototype._getToolbar = function () {
		var oToolbar = this.getAggregation("_toolbar");
		if (!oToolbar) {
			oToolbar = new OverflowToolbar({
				style: ToolbarStyle.Clear,
				design: ToolbarDesign.Transparent
			});
			this.setAggregation("_toolbar", oToolbar);
		}

		return oToolbar;
	};

	ActionsStrip.prototype._updateToolbar = function (aItemsConfigs) {
		if (!aItemsConfigs || !aItemsConfigs.length) {
			return;
		}

		const oToolbar = this._getToolbar();

		aItemsConfigs.forEach((oItemConfig) => {
			oToolbar.addContent(this._createItem(oItemConfig));
		});

		const bHasSpacer = oToolbar.getContent().find((oItem) => oItem instanceof ToolbarSpacer);

		if (!bHasSpacer) {
			oToolbar.insertContent(new ToolbarSpacer(), 0);
		}
	};

	ActionsStrip.prototype._createItems = function (aItems) {
		if (!aItems || !aItems.length) {
			return null;
		}

		const oCard = Element.getElementById(this.getCard());

		aItems = BindingHelper.createBindingInfos(aItems, oCard.getBindingNamespaces());

		return aItems;
	};

	ActionsStrip.prototype._createItemsFromTemplate = function (aData) {
		if (!aData || !aData.length) {
			return null;
		}

		const oItemConfiguration = this.getConfiguration().item;
		let sPath = oItemConfiguration.path + "/";

		if (!BindingHelper.isAbsolutePath(sPath)) {
			sPath = this.getBindingContext().getPath();

			if (sPath !== "/") {
				sPath +=  "/";
			}

			sPath += oItemConfiguration.path + "/";
		}

		const oParentData = this.getBindingContext().getProperty();
		this.setModel(new JSONModel(oParentData), "parent");

		return aData.map((oItemData, i) => {
			return BindingResolver.resolveValue(oItemConfiguration.template, this, sPath + i);
		});
	};

	ActionsStrip.prototype._createItem = function (oConfig) {
		let oItem;

		switch (oConfig.type) {
			case "Label":
				oItem = this._createLabel(oConfig);
				break;
			case "ToolbarSpacer":
				return new ToolbarSpacer();
			case "Link":
				oItem = this._createLink(oConfig);
				break;
			case "Button":
			default:
				oItem = this._createButton(oConfig);
		}

		oItem.setLayoutData(new OverflowToolbarLayoutData({
			group: oConfig.overflowGroup,
			priority: oConfig.overflowPriority
		}));

		const oActionsConfig = {
			area: ActionArea.ActionsStrip,
			control: oItem,
			actions: oConfig.actions,
			enabledPropertyName: "enabled"
		};

		if (this.getDisableItemsInitially()) {
			oActionsConfig.enabledPropertyValue = false;
			oItem._mActionsConfig = oActionsConfig;
			oItem._bIsDisabled = true;
		}

		if (oConfig.type !== "Label") {
			this.getCardActions().attach(oActionsConfig);
		}

		return oItem;
	};

	ActionsStrip.prototype.disableItems = function () {
		var aItems = this._getToolbar().getContent();

		// TODO: find better way to disable the items
		aItems.forEach(function (oItem) {
			if (oItem.setEnabled && !oItem._bIsDisabled && oItem.getEnabled()) {
				oItem.setEnabled(false);
				oItem._bIsDisabled = true;
			}
		});
	};

	ActionsStrip.prototype.enableItems = function () {
		var aItems = this._getToolbar().getContent(),
			mActionsConfig;

		// TODO: find better way to enable the items
		aItems.forEach((oItem) => {
			if (oItem.setEnabled && oItem._bIsDisabled) {
				mActionsConfig = oItem._mActionsConfig;
				if (mActionsConfig?.action) {
					mActionsConfig.enabledPropertyValue = true;
					this.getCardActions()._setControlEnabledState(mActionsConfig);
				} else {
					oItem.setEnabled(true);
				}

				delete oItem._bIsDisabled;
			}
		});
	};

	ActionsStrip.prototype._createLabel = function (mConfig) {
		var oLabel = new Label({
			text: mConfig.text,
			visible: mConfig.visible
		});

		return oLabel;
	};

	ActionsStrip.prototype._createLink = function (mConfig) {
		var oLink = new LinkWithIcon({
			icon: mConfig.icon,
			text: mConfig.text,
			tooltip: mConfig.tooltip,
			ariaHasPopup: mConfig.ariaHasPopup ?? this._getAriaHasPopup(mConfig),
			emphasized: mConfig.emphasized,
			visible: mConfig.visible
		});

		return oLink;
	};

	ActionsStrip.prototype._createButton = function (mConfig) {
		const vAriaHasPopup = mConfig.ariaHasPopup ?? this._getAriaHasPopup(mConfig);

		const mButtonSettings = {
			icon: mConfig.icon,
			text: mConfig.text,
			tooltip: mConfig.tooltip,
			type: mConfig.buttonType,
			ariaHasPopup: vAriaHasPopup,
			visible: mConfig.visible
		};

		// @todo this will not work well if text is set to binding which later resolves to an empty string
		if (mConfig.icon && (mConfig.preferIcon || !mConfig.text)) {
			mButtonSettings.text = mConfig.text || mConfig.tooltip;
			mButtonSettings.tooltip = mConfig.tooltip || mConfig.text;

			return new OverflowToolbarButton(mButtonSettings);
		}

		return new Button(mButtonSettings);
	};

	/**
	 * Checks the correct value for ariaHasPopup for the given item configuration.
	 * Note: Only checks the first action since we support only one action for now.
	 * Note: If custom action opens a popup - the custom action developer is responsible to add the ariaHasPopup property.
	 * @param {map} mConfig The config for the item.
	 * @returns {sap.ui.core.aria.HasPopup|null} True if the item opens a popup. False otherwise.
	 */
	ActionsStrip.prototype._getAriaHasPopup = function (mConfig) {
		const aActions = mConfig.actions;

		if (aActions?.length > 0 && aActions[0].type === CardActionType.ShowCard) {
			return AriaHasPopup.Dialog;
		}

		return null;
	};

	ActionsStrip.create = function (oConfiguration, oCard, bDisableItemsInitially) {
		if (!oConfiguration) {
			return null;
		}

		const oActionsStrip = new ActionsStrip({
			card: oCard,
			configuration: oConfiguration,
			cardActions: new CardActions({
				card: oCard
			}),
			disableItemsInitially: bDisableItemsInitially
		});

		if (Array.isArray(oConfiguration)) {
			oActionsStrip._updateToolbar(oActionsStrip._createItems(oConfiguration));
		}

		return oActionsStrip;
	};

	ActionsStrip.hasVisibleTemplateItems = function (oConfiguration, oContent) {
		const vActionsStrip = oConfiguration;

		if (!Array.isArray(vActionsStrip)) {
			//@todo fix this case
			return false;
		}

		const vResolvedConfig = BindingResolver.resolveValue(vActionsStrip, oContent);

		return vResolvedConfig.some((oItem) => !oItem.hasOwnProperty("visible") || !!oItem.visible);
	};

	ActionsStrip.prototype.hasVisibleItems = function () {
		const oToolbar = this._getToolbar(),
			aContent = oToolbar.getContent();

		return aContent.some((oItem) => !(oItem instanceof ToolbarSpacer) && oItem.getVisible());
	};

	return ActionsStrip;
});