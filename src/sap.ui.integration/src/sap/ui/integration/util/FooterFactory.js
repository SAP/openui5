/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFactory",
	"./CardActions",
	"sap/ui/integration/library",
	"sap/m/Button",
	"sap/m/OverflowToolbarButton",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/ToolbarSpacer"
], function (
	BaseFactory,
	CardActions,
	library,
	Button,
	OverflowToolbarButton,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	ToolbarSpacer
) {
	"use strict";

	var ActionArea = library.CardActionArea;


	/**
	 * Constructor for a new <code>FooterFactory</code>.
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.util.BaseFactory
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.FooterFactory
	 */
	var FooterFactory = BaseFactory.extend("sap.ui.integration.util.FooterFactory");

	FooterFactory.prototype.create = function (mConfiguration) {
		if (!mConfiguration || !mConfiguration.toolbar) {
			return null;
		}

		//@todo what should be the default button type
		var oToolbar = new OverflowToolbar(),
			oCard = this._oCard,
			oActions = new CardActions({
				card: oCard
			}),
			bHasSpacer;

		mConfiguration = this.createBindingInfos(mConfiguration, oCard.getBindingNamespaces());

		mConfiguration.toolbar.forEach(function (mConfig) {
			if (mConfig.type === "ToolbarSpacer") {
				bHasSpacer = true;
				oToolbar.addContent(new ToolbarSpacer());
				return;
			}

			var aActions = mConfig.actions,
				oOverflow = new OverflowToolbarLayoutData({
					group: mConfig.group,
					priority: mConfig.overflowPriority
				}),
				mButtonSettings,
				oButton,
				sTooltip = mConfig.tooltip;

			if (!sTooltip && mConfig.icon) {
				sTooltip = mConfig.text;
			}

			mButtonSettings = {
				type: mConfig.buttonType,
				text: mConfig.text,
				icon: mConfig.icon,
				tooltip: sTooltip,
				ariaHasPopup: mConfig.ariaHasPopup,
				enabled: mConfig.enabled,
				visible: mConfig.visible
			};

			if (mConfig.icon) {
				oButton = new OverflowToolbarButton(mButtonSettings);
			} else {
				oButton = new Button(mButtonSettings);
			}

			oButton.setLayoutData(oOverflow);

			oActions.attach({
				area: ActionArea.Footer,
				control: oButton,
				actions: aActions,
				enabledPropertyName: "enabled"
			});

			oToolbar.addContent(oButton);
		});

		if (!bHasSpacer) {
			oToolbar.insertContent(new ToolbarSpacer(), 0);
		}

		return oToolbar;
	};

	return FooterFactory;
});
