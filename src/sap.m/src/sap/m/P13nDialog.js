/*
 * ! ${copyright}
 */

// Provides control sap.m.P13nDialog.
sap.ui.define([
	'jquery.sap.global', './Dialog', './IconTabBar', './IconTabFilter', './P13nDialogRenderer', './library', 'sap/ui/core/EnabledPropagator', 'jquery.sap.xml'
], function(jQuery, Dialog, IconTabBar, IconTabFilter, P13nDialogRenderer, library, EnabledPropagator/* , jQuerySap */) {
	"use strict";

	/**
	 * Constructor for a new P13nDialog.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The P13nDialog control provides dialog that contains one or more panels. On each of the panels, one or more changes with regards to a
	 *        table can be processed. For example, a panel to set a column to invisible, change the order of the columns or a panel to sort or filter
	 *        tables.
	 * @extends sap.m.Dialog
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @since 1.26
	 * @alias sap.m.P13nDialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nDialog = Dialog.extend("sap.m.P13nDialog", /** @lends sap.m.P13nDialog.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {
				/**
				 * tbd
				 */
				initialVisiblePanelType: {
					type: "sap.m.P13nPanelType",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * This property determines whether the 'Reset' button is shown inside the dialog. If this property is set to true, clicking the
				 * 'Reset' button will trigger the 'reset' event sending a notification that model data must be reset.
				 */
				showReset: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				}
			},
			aggregations: {

				/**
				 * The dialog panels displayed in the dialog.
				 */
				panels: {
					type: "sap.m.P13nPanel",
					multiple: true,
					singularName: "panel",
					bindable: "bindable"
				}
			},
			events: {

				/**
				 * Event fired if the 'ok' button in P13nDialog is clicked.
				 */
				ok: {},
				/**
				 * Event fired if the 'cancel' button in P13nDialog is clicked.
				 */
				cancel: {},
				/**
				 * Event fired if the 'reset' button in P13nDialog is clicked.
				 */
				reset: {}
			}
		}
	});

	EnabledPropagator.apply(P13nDialog.prototype, [
		true
	]);

	P13nDialog.prototype.init = function(oEvent) {
		this.addStyleClass("sapMP13nDialog");
		Dialog.prototype.init.apply(this, arguments);
		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this._initDialog();
	};

	P13nDialog.prototype._initDialog = function() {
		var that = this;
		this.setContentWidth("50rem");
		this.setContentHeight("40rem");
		this.setTitle(this._oResourceBundle.getText("P13NDIALOG_VIEW_SETTINGS"));
		this.addButton(new sap.m.Button({
			text: this._oResourceBundle.getText("P13NDIALOG_OK"),
			press: function() {
				// TODO: current implementation finds only the first invalid panel. Should go through all panels and put all
				// error messages together
				var oPanel = null;
				var fCallbackOK = function() {
					oPanel.onAfterNavigation();
					that.fireOk();
				};
				that.getContent().some(function(_oPanel) {
					if (!_oPanel.onBeforeNavigation()) {
						oPanel = _oPanel;
						return true;
					}
				});
				if (!oPanel) {
					that.fireOk();
					return;
				}
				that.showValidationDialog(fCallbackOK, null);
			}
		}));
		this.addButton(new sap.m.Button({
			text: this._oResourceBundle.getText("P13NDIALOG_CANCEL"),
			press: function() {
				that.fireCancel();
			}
		}));
		this._oResetButton = new sap.m.Button({
			text: this._oResourceBundle.getText("P13NDIALOG_RESET"),
			visible: this.getShowReset(),
			press: function() {
				that.fireReset({});
			}
		});
		this.addButton(this._oResetButton);
	};

	P13nDialog.prototype.setShowReset = function(bShow) {
		this._oResetButton.setVisible(bShow);
	};

	/*
	 * Adds some DialogItem <code>oDialogItem</code> to the aggregation named <code>DialogItems</code>. @param {sap.m.P13nPanel} oDialogItem The
	 * DialogItem to add; if empty, nothing is added. @returns {P13nDialog} <code>this</code> to allow method chaining. @public @name
	 * P13nDialog#addDialogItem @function
	 */
	P13nDialog.prototype.addPanel = function(oPanel) {
		this.addAggregation("content", oPanel);

		var oButton = this._mapPanelToButton(oPanel);
		oPanel.data(P13nDialogRenderer.CSS_CLASS + "Button", oButton);
		if (this._getSegmentedButton()) {
			this._getSegmentedButton().addButton(oButton);
		}
		this._setDialogTitleFor(oPanel, this.getContent().length);
		// TODO: workaround because SegmentedButton does not raise event when we set the "selectedButton"
		this._setVisibilityOfPanel(oPanel);

		return this;
	};

	/*
	 * Inserts an item into the aggregation named <code>items</code>. @param {sap.m.P13nPanel} oItem The item to insert; if empty, nothing is
	 * inserted. @param {int} iIndex The <code>0</code>-based index the item should be inserted at; for a negative value of <code>iIndex</code>,
	 * the item is inserted at position 0; for a value greater than the current size of the aggregation, the item is inserted at the last position.
	 * @returns {P13nDialog} <code>this</code> to allow method chaining. @public @name P13nDialog#insertItem @function
	 */
	P13nDialog.prototype.insertPanel = function(oPanel, iIndex) {
		this.insertAggregation("content", oPanel, iIndex);

		var oButton = this._mapPanelToButton(oPanel);
		oPanel.data(P13nDialogRenderer.CSS_CLASS + "Button", oButton);
		if (this._getSegmentedButton()) {
			this._getSegmentedButton().insertButton(oButton, iIndex);
		}
		this._setDialogTitleFor(oPanel, this.getContent().length);
		// TODO: workaround because SegmentedButton does not raise event when we set the "selectedButton"
		this._setVisibilityOfPanel(oPanel);

		return this;
	};

	/*
	 * Removes an item from the aggregation named <code>items</code>. @param {int | string | sap.m.P13nPanel} vItem The item to remove or its index
	 * or id. @returns {sap.m.P13nPanel} The removed item or null. @public @name P13nDialog#removeItem @function
	 */
	P13nDialog.prototype.removePanel = function(vPanel) {
		vPanel = this.removeAggregation("content", vPanel);
		if (this._getSegmentedButton()) {
			this._getSegmentedButton().removeButton(vPanel && vPanel.data(P13nDialogRenderer.CSS_CLASS + "Button"));
		}
		return vPanel;
	};

	/*
	 * Removes all the controls in the aggregation named <code>items</code>. Additionally unregisters them from the hosting UIArea and clears the
	 * selection. @returns {sap.m.P13nPanel[]} An array of the removed items (might be empty). @public @name P13nDialog#removeAllItems @function
	 */
	P13nDialog.prototype.removeAllPanels = function() {
		var aPanels = this.removeAllAggregation("content");
		if (this._getSegmentedButton()) {
			this._getSegmentedButton().removeAllButtons();
		}
		return aPanels;
	};

	/**
	 * Getter for the control's TabBar.
	 * 
	 * @returns {sap.m.IconTabBar}
	 * @private
	 */
	P13nDialog.prototype._getSegmentedButton = function() {
		if (this.getContent().length < 2) {
			return null;
		}
		var that = this;
		if (!this.getSubHeader() || !this.getSubHeader().getContentLeft().length) {
			this.setSubHeader(new sap.m.Bar({
				contentLeft: [
					new sap.m.SegmentedButton({
						select: function(oEvent) {
							var oButton_ = oEvent.getParameter("button");
							that._switchPanel(oButton_);
						},
						width: '100%'
					})
				]
			}));
			// Add button of first panel first
			this._getSegmentedButton().addButton(this._getButtonByPanel(this.getContent()[0]));
		}
		return this.getSubHeader().getContentLeft()[0];
	};

	P13nDialog.prototype.showValidationDialog = function(fCallbackOK, fCallbackCancel) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.show(sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_MESSAGE"), {
			icon: sap.m.MessageBox.Icon.WARNING,
			title: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VALIDATION_TITLE"),
			actions: [
				sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL
			],
			onClose: function(oAction) {
				// CANCLE: Stay on the current panel. There is incorrect entry and user decided to correct this.
				// OK: Go to the chosen panel. Though the current panel has incorrect entry the user decided to
				// leave the current panel. Delete incorrect condition set.
				if (oAction === sap.m.MessageBox.Action.OK) {
					fCallbackOK();
				} else if (oAction === sap.m.MessageBox.Action.OK) {
					fCallbackCancel();
				}
			},
			styleClass: !!this.$().closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : ""
		});
	};

	/*
	 * Map an item type of sap.m.P13nPanel to an item type of sap.m.IconTabBarFilter. @param {sap.m.P13nPanel} oItem @returns {sap.m.IconTabFilter |
	 * null} @private @name P13nDialog#_mapItemToTabBarItem @function
	 */
	P13nDialog.prototype._mapPanelToButton = function(oPanel) {
		if (!oPanel) {
			return null;
		}

		var oButton = new sap.m.Button({
			type: sap.m.ButtonType.Default,
			text: oPanel.getBindingPath("title") ? "{" + oPanel.getBindingPath("title") + "}" : oPanel.getTitle()
		});
		oButton.addDelegate({
			ontap: function(oEvent) {
				var oButtonClicked = oEvent.srcControl;
				var oPanelVisible = this.getVisiblePanel();

				if (oPanelVisible && oPanelVisible.onBeforeNavigation && !oPanelVisible.onBeforeNavigation()) {
					oEvent.stopImmediatePropagation(true);
					var that = this;
					var fCallbackOK = function() {
						oPanelVisible.onAfterNavigation();
						if (that._getSegmentedButton()) {
							that._getSegmentedButton().setSelectedButton(oButtonClicked);
						}
						that._switchPanel(oButtonClicked);
					};
					this.showValidationDialog(fCallbackOK, null);
				}
			}
		}, true, this);

		oButton.setModel(oPanel.getModel());
		return oButton;
	};

	/**
	 * Switch panel.
	 * 
	 * @private
	 */
	P13nDialog.prototype._switchPanel = function(oButton) {
		var oPanel = this._getPanelByButton(oButton);
		this.setVerticalScrolling(oPanel.getVerticalScrolling());
		this.getContent().forEach(function(oPanel_) {
			if (oPanel_ === oPanel) {
				oPanel_.setVisible(true);
			} else {
				oPanel_.setVisible(false);
			}
		}, this);
		this.invalidate();
		this.rerender();
	};

	/**
	 * Returns visible panel.
	 * 
	 * @returns {sap.m.P13nPanel || null}
	 * @public
	 */
	P13nDialog.prototype.getVisiblePanel = function() {
		var oPanel = null;
		this.getContent().some(function(oPanel_) {
			if (oPanel_.getVisible()) {
				oPanel = oPanel_;
				return true;
			}
		});
		return oPanel;
	};

	/**
	 * Returns panel.
	 * 
	 * @private
	 */
	P13nDialog.prototype._getPanelByButton = function(oButton) {
		for (var i = 0, aPanels = this.getContent(), iPanelsLength = aPanels.length; i < iPanelsLength; i++) {
			if (aPanels[i].data(P13nDialogRenderer.CSS_CLASS + "Button") === oButton) {
				return aPanels[i];
			}
		}
		return null;
	};

	/**
	 * Returns button.
	 * 
	 * @private
	 */
	P13nDialog.prototype._getButtonByPanel = function(oPanel) {
		if (!oPanel) {
			return null;
		}
		return oPanel.data(P13nDialogRenderer.CSS_CLASS + "Button");
	};

	/**
	 * Set all panels to bVisible except of oPanel
	 * 
	 * @private
	 */
	P13nDialog.prototype._setVisibilityOfOtherPanels = function(oPanel, bVisible) {
		for (var i = 0, aPanels = this.getContent(), iPanelsLength = aPanels.length; i < iPanelsLength; i++) {
			if (aPanels[i] === oPanel) {
				continue;
			}
			aPanels[i].setVisible(bVisible);
		}
		return null;
	};

	/**
	 * Sets property 'visible' for oPanel regarding the 'initialVisiblePanelType' property and number of content objects.
	 * 
	 * @private
	 */
	P13nDialog.prototype._setVisibilityOfPanel = function(oPanel) {
		var bVisible = this.getInitialVisiblePanelType() === oPanel.getType() || this.getContent().length === 1;
		oPanel.setVisible(bVisible);
		if (bVisible) {
			this._setVisibilityOfOtherPanels(oPanel, false);
			var oButton = oPanel.data(P13nDialogRenderer.CSS_CLASS + "Button");
			if (this._getSegmentedButton()) {
				this._getSegmentedButton().setSelectedButton(oButton);
			}
			this.setVerticalScrolling(oPanel.getVerticalScrolling());
		}
	};

	P13nDialog.prototype.onBeforeRendering = function() {
		if (this.getVisiblePanel()) {
			this.setInitialVisiblePanelType(this.getVisiblePanel().getType());
		}
		Dialog.prototype.onBeforeRendering.apply(this, arguments);
	};

	/**
	 * Sets title of dialog in regard to oPanel.
	 * 
	 * @private
	 */
	P13nDialog.prototype._setDialogTitleFor = function(oPanel, iPanelCount) {
		if (iPanelCount > 1) {
			this.setTitle(this._oResourceBundle.getText("P13NDIALOG_VIEW_SETTINGS"));
			return;
		}
		switch (oPanel.getType()) {
			case sap.m.P13nPanelType.filter:
				this.setTitle(this._oResourceBundle.getText("P13NDIALOG_TITLE_FILTER"));
				break;
			case sap.m.P13nPanelType.sort:
				this.setTitle(this._oResourceBundle.getText("P13NDIALOG_TITLE_SORT"));
				break;
			case sap.m.P13nPanelType.group:
				this.setTitle(this._oResourceBundle.getText("P13NDIALOG_TITLE_GROUP"));
				break;
			case sap.m.P13nPanelType.columns:
				this.setTitle(this._oResourceBundle.getText("P13NDIALOG_TITLE_COLUMNS"));
				break;
			default:
				this.setTitle(this._oResourceBundle.getText("P13NDIALOG_VIEW_SETTINGS"));
		}
	};

	/**
	 * Cleans up before destruction.
	 * 
	 * @private
	 */
	P13nDialog.prototype.exit = function() {
		Dialog.prototype.exit.apply(this, arguments);
	};

	return P13nDialog;

}, /* bExport= */true);
