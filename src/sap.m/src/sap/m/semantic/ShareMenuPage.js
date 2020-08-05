/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/semantic/SemanticPage", "sap/m/semantic/SemanticConfiguration", "sap/m/semantic/SemanticPageRenderer", "sap/m/semantic/SegmentedContainer", "sap/m/semantic/ShareMenu", "sap/m/ActionSheet", "sap/m/library"],
		function(SemanticPage, SemanticConfiguration, SemanticPageRenderer, SegmentedContainer, ShareMenu, ActionSheet, library) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	/**
	 * Constructor for a new ShareMenuPage
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A ShareMenuPage is a {@link sap.m.semantic.SemanticPage} with support for "share" menu in the footer.
	 *
	 * @extends sap.m.semantic.SemanticPage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.ShareMenuPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var ShareMenuPage = SemanticPage.extend("sap.m.semantic.ShareMenuPage", /** @lends sap.m.semantic.ShareMenuPage.prototype */ {
		metadata: {

			library: "sap.m",

			aggregations: {

				/**
				 * Custom share menu buttons
				 */
				customShareMenuContent: {
					type: "sap.m.Button",
					multiple: true,
					singularName: "customShareMenuContent"
				},

				/**
				 * Wrapped instance of {@link sap.m.ActionSheet}
				 */
				_actionSheet: {
					type: "sap.m.ActionSheet",
					multiple: false,
					visibility: "hidden"
				}

			},
			designtime: "sap/m/designtime/semantic/ShareMenuPage.designtime"
		},
		renderer: SemanticPageRenderer
	});

	ShareMenuPage.prototype._getSemanticPositionsMap = function (oControl, oConfig) {

		if (!this._oPositionsMap) {
			this._oPositionsMap = SemanticPage.prototype._getSemanticPositionsMap.apply(this, arguments);
			this._oPositionsMap[SemanticConfiguration.prototype._PositionInPage.shareMenu] = {
				oContainer: this._getSegmentedShareMenu().getSection("semantic"),
				sAggregation: "content"
			};
		}

		return this._oPositionsMap;
	};

	ShareMenuPage.prototype.exit = function () {

		SemanticPage.prototype.exit.apply(this, arguments);

		if (this._oSegmentedShareMenu) {
			this._oSegmentedShareMenu.destroy();
			this._oSegmentedShareMenu = null;
		}
	};

	/*

	 SHARE MENU (CUSTOM CONTENT)
	 */

	ShareMenuPage.prototype.getCustomShareMenuContent = function () {
		return this._getSegmentedShareMenu().getSection("custom").getContent();
	};

	ShareMenuPage.prototype.addCustomShareMenuContent = function (oButton, bSuppressInvalidate) {
		this._getSegmentedShareMenu().getSection("custom").addContent(oButton, bSuppressInvalidate);
		return this;
	};

	ShareMenuPage.prototype.indexOfCustomShareMenuContent = function (oButton) {
		return this._getSegmentedShareMenu().getSection("custom").indexOfContent(oButton);
	};

	ShareMenuPage.prototype.insertCustomShareMenuContent = function (oButton, iIndex, bSuppressInvalidate) {
		this._getSegmentedShareMenu().getSection("custom").insertContent(oButton, iIndex, bSuppressInvalidate);
		return this;
	};

	ShareMenuPage.prototype.removeCustomShareMenuContent = function (oButton, bSuppressInvalidate) {
		return this._getSegmentedShareMenu().getSection("custom").removeContent(oButton, bSuppressInvalidate);
	};

	ShareMenuPage.prototype.removeAllCustomShareMenuContent = function (bSuppressInvalidate) {
		return this._getSegmentedShareMenu().getSection("custom").removeAllContent(bSuppressInvalidate);
	};

	ShareMenuPage.prototype.destroyCustomShareMenuContent = function (bSuppressInvalidate) {

		var aChildren = this.getCustomShareMenuContent();

		if (!aChildren) {
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		this._getSegmentedShareMenu().getSection("custom").destroy();

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	ShareMenuPage.prototype.setSemanticRuleSet = function(sNewRuleSet) {

		var iOldRuleSet = this.getSemanticRuleSet();
		if (iOldRuleSet === sNewRuleSet) {
			return this;
		}
		this.setProperty("semanticRuleSet", sNewRuleSet, true);

		// update ruleset-specific positioning
		var oOldShareMenuConfig = SemanticConfiguration.getShareMenuConfig(iOldRuleSet),
			oShareMenuSection = this._getShareBaseButtonContainer(oOldShareMenuConfig.baseButtonPlacement).getSection("shareMenu");

		if (oShareMenuSection) { //share menu is created already
			this._moveShareMenu(oOldShareMenuConfig, SemanticConfiguration.getShareMenuConfig(this.getSemanticRuleSet()));
		}

		return this;
	};

	ShareMenuPage.prototype._moveShareMenu = function (oOldShareMenuConfig, oNewShareMenuConfig) {

		var oOldBaseButtonSection = this._getShareBaseButtonContainer(oOldShareMenuConfig.baseButtonPlacement).getSection("shareMenu"),
			aOldBaseButtonContent = oOldBaseButtonSection && oOldBaseButtonSection.removeAllContent(),
			oOldBaseButton = aOldBaseButtonContent.length && aOldBaseButtonContent[0];

		this._placeShareMenu(oOldBaseButton, oNewShareMenuConfig);
	};

	/**
	 * Create the internal action sheet of the "share" menu
	 * @returns {sap.m.IBar}
	 * @private
	 */
	ShareMenuPage.prototype._getActionSheet = function () {

		var oActionSheet = this.getAggregation("_actionSheet");
		if (!oActionSheet) {
			this.setAggregation("_actionSheet", new ActionSheet(), true);
			oActionSheet = this.getAggregation("_actionSheet");
		}

		return oActionSheet;
	};

	ShareMenuPage.prototype._getSegmentedShareMenu = function() {
		if (!this._oSegmentedShareMenu) {

			var oShareMenu = new ShareMenu(this._getActionSheet());
			var oShareMenuBtn = oShareMenu.getBaseButton();

			if (oShareMenu && oShareMenuBtn) {
				this._oSegmentedShareMenu = new SegmentedContainer(oShareMenu);
				this._oSegmentedShareMenu.addSection({sTag: "custom"});
				this._oSegmentedShareMenu.addSection({sTag: "semantic"});

				this._placeShareMenu(oShareMenuBtn, SemanticConfiguration.getShareMenuConfig(this.getSemanticRuleSet()));
			}
		}
		return this._oSegmentedShareMenu;
	};

	ShareMenuPage.prototype._placeShareMenu = function(oShareMenuBaseBtn, oShareMenuConfig) {

		var oShareMenuBtnPlacement = oShareMenuConfig.baseButtonPlacement,
			vActionSheetPlacement = oShareMenuConfig.actionSheetPlacement;

		var oDestinationContainer = this._getShareBaseButtonContainer(oShareMenuBtnPlacement),
			oDestinationSection = oDestinationContainer.getSection("shareMenu");

		if (!oDestinationSection) {
			oDestinationContainer.addSection({sTag: "shareMenu"});
			oDestinationSection = oDestinationContainer.getSection("shareMenu");
		}

		if (oShareMenuBaseBtn) {
			oDestinationSection.addContent(oShareMenuBaseBtn);
		}
		this._getActionSheet().setPlacement(vActionSheetPlacement);
	};

	ShareMenuPage.prototype._getShareBaseButtonContainer = function(vBaseButtonPlacement) {
		return (vBaseButtonPlacement === PlacementType.Bottom) ?
			this._getSegmentedFooter() : this._getSegmentedHeader();
	};

	return ShareMenuPage;
});
