/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', "sap/m/semantic/SemanticPage", "sap/m/semantic/SemanticType", "sap/m/semantic/SemanticPageRenderer", "sap/m/semantic/SemanticPageSegmentedContainer", "sap/m/ActionSheet", "sap/m/OverflowToolbarLayoutData", "sap/m/Button"], function(jQuery, SemanticPage, SemanticType, SemanticPageRenderer, SegmentedContainer, ActionSheet, OverflowToolbarLayoutData, Button) {
	"use strict";

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
	 */
	var ShareMenuPage = SemanticPage.extend("sap.m.semantic.ShareMenuPage", /** @lends sap.m.semantic.ShareMenuPage.prototype */ {
		metadata: {

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

			}
		},
		renderer: SemanticPageRenderer.render
	});

	ShareMenuPage._PositionInPage = jQuery.extend({ shareMenu: "shareMenu" }, SemanticPage._PositionInPage);

	ShareMenuPage.prototype.init = function () {
		SemanticPage.prototype.init.apply(this, arguments);

		this._oWrappedShareMenu = this._createWrappedShareMenu();

		if (!this._oShareMenuBtn) {
			this._oShareMenuBtn = this._oWrappedShareMenu.createShareButton();
		}

		this._oActionSheet = null;

		this._oSegmentedShareMenu = new SegmentedContainer(this._oWrappedShareMenu);
		this._oSegmentedShareMenu.addSection({sTag: "custom"});
		this._oSegmentedShareMenu.addSection({sTag: "semantic"});

		this._oWrappedFooter.addSection({
			sTag: "shareMenu",
			aContent: [this._oShareMenuBtn]
		});

		this._oPositionsMap[ShareMenuPage._PositionInPage.shareMenu] = {
			oContainer: this._oSegmentedShareMenu.getSectionComposite("semantic"),
			sAggregation: "content"
		};

	};

	ShareMenuPage.prototype.exit = function () {

		SemanticPage.prototype.exit.apply(this, arguments);

		if (this._oActionSheet) {
			this._oActionSheet.destroy();
			this._oActionSheet = null;
		}

		if (this._oShareMenuBtn) {
			this._oShareMenuBtn.destroy();
			this._oShareMenuBtn = null;
		}
	};

	/*

	 SHARE MENU (CUSTOM CONTENT)
	 */

	ShareMenuPage.prototype.getCustomShareMenuContent = function () {
		return this._oSegmentedShareMenu.getSectionComposite("custom").getContent();
	};

	ShareMenuPage.prototype.addCustomShareMenuContent = function (oButton, bSuppressInvalidate) {
		this._oSegmentedShareMenu.getSectionComposite("custom").addContent(oButton, bSuppressInvalidate);
		return this;
	};

	ShareMenuPage.prototype.indexOfCustomShareMenuContent = function (oButton) {
		return this._oSegmentedShareMenu.getSectionComposite("custom").indexOfContent(oButton);
	};

	ShareMenuPage.prototype.insertCustomShareMenuContent = function (oButton, iIndex, bSuppressInvalidate) {
		this._oSegmentedShareMenu.getSectionComposite("custom").insertContent(oButton, iIndex, bSuppressInvalidate);
		return this;
	};

	ShareMenuPage.prototype.removeCustomShareMenuContent = function (oButton, bSuppressInvalidate) {
		return this._oSegmentedShareMenu.getSectionComposite("custom").removeContent(oButton, bSuppressInvalidate);
	};

	ShareMenuPage.prototype.removeAllCustomShareMenuContent = function (bSuppressInvalidate) {
		return this._oSegmentedShareMenu.getSectionComposite("custom").removeAllContent(bSuppressInvalidate);
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

		this._oSegmentedShareMenu.getSectionComposite("custom").destroy();

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Create the internal action sheet of the "share" menu
	 * @returns {sap.m.IBar}
	 * @private
	 */
	ShareMenuPage.prototype._getActionSheet = function () {

		var oActionSheet = this.getAggregation("_actionSheet");
		if (!oActionSheet) {
			this.setAggregation("_actionSheet", new ActionSheet(
					{placement: sap.m.PlacementType.Top}));
			oActionSheet = this.getAggregation("_actionSheet");
		}

		return oActionSheet;
	};


	SemanticPage.prototype._createWrappedShareMenu = function () {
		var that = this,
				buttonsCount = 0,
				oLastButton,
				onButtonPress;

		var shareMenuAsAnActionSheet = function () {
			that._oActionSheet.openBy(that._oShareMenuBtn);
		};

		this._oShareMenuBtn = new Button({
			visible: false
		});

		function createActionSheet() {

			that._oActionSheet = that._getActionSheet();

			that._oShareMenuBtn.detachPress(onButtonPress);
			that._oShareMenuBtn.attachPress(shareMenuAsAnActionSheet);
			that._oShareMenuBtn.setIcon("sap-icon://action");
			that._oShareMenuBtn.setText("");
			that._oShareMenuBtn.setLayoutData(new OverflowToolbarLayoutData({
				moveToOverflow: false,
				stayInOverflow: false
			}));
		}

		function applyShareMenuAsAButtonSettings(oButton) {
			that._oShareMenuBtn.setIcon(oButton.getIcon());
			that._oShareMenuBtn.setText("");

			onButtonPress = function () {
				oButton.firePress();
			};

			that._oShareMenuBtn.attachPress(onButtonPress);
			that._oShareMenuBtn.detachPress(shareMenuAsAnActionSheet);
			that._oShareMenuBtn.setVisible(true);
			that._oShareMenuBtn.setLayoutData(oButton.getLayoutData());
			oLastButton = oButton;
		}

		return {
			createShareButton: function () {
				return this._oShareMenuBtn;
			},

			getContent: function () {

				if (!that._oActionSheet && (buttonsCount == 1)) {
					return [oLastButton];
				}

				if (that._oActionSheet) {
					return that._oActionSheet.getAggregation("buttons");
				}

				return [];
			},

			addContent: function (oButton, bSuppressInvalidate) {
				buttonsCount++;
				if (buttonsCount === 1) {
					applyShareMenuAsAButtonSettings(oButton);
				}

				if (buttonsCount > 1) {
					if (!that._oActionSheet) {
						createActionSheet();
						that._oActionSheet.addButton(oLastButton);
					}
					that._oActionSheet.addButton(oButton, bSuppressInvalidate);
				}
			},

			removeContent: function (oButton, bSuppressInvalidate) {
				buttonsCount--;
				if (that._oActionSheet) {
					that._oActionSheet.removeButton(oButton, bSuppressInvalidate);

					if (that._oActionSheet.getAggregation("buttons").length === 1) {
						var oLastButton = that._oActionSheet.getAggregation("buttons")[0];
						applyShareMenuAsAButtonSettings(oLastButton);
						that._oActionSheet.removeButton(oLastButton, bSuppressInvalidate);
					}

					if (that._oActionSheet.getAggregation("buttons").length === 0) {
						if (that._oActionSheet) {
							that.setAggregation("_actionSheet", null);
							that._oActionSheet.destroy();
							that._oActionSheet = null;
						}
					}
				}

				if (buttonsCount === 0) {
					that._oShareMenuBtn.setVisible(false);
				}
				return oButton;
			},

			removeAllContent: function (bSuppressInvalidate) {
				var result;
				if (that._oActionSheet) {
					result = that._oActionSheet.removeAllButtons();
					that._oActionSheet.destroy(bSuppressInvalidate);
					that._oActionSheet = null;
				} else if (buttonsCount == 1) {
					result = [that._oShareMenuBtn];
				}
				that._oShareMenuBtn.setVisible(false);
				buttonsCount = 0;
				return result;
			},

			indexOfContent: function (oButton) {
				if (!that._oActionSheet) {
					return -1;
				}
				return that._oActionSheet.indexOfAggregation("buttons", oButton);
			},

			insertContent: function (oButton, iIndex, bSuppressInvalidate) {
				buttonsCount++;
				if (buttonsCount === 1) {
					applyShareMenuAsAButtonSettings(oButton);
				}

				if (buttonsCount > 1) {
					if (!that._oActionSheet) {
						createActionSheet();
						that._oActionSheet.insertButton(oLastButton, 0, bSuppressInvalidate);
					}
					that._oActionSheet.insertButton(oButton, iIndex, bSuppressInvalidate);
				}
			}
		};
	};


	return ShareMenuPage;
}, /* bExport= */ false);