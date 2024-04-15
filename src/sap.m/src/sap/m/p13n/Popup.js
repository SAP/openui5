/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/m/MessageBox",
	"sap/ui/Device",
	"sap/m/Dialog",
	"sap/m/ResponsivePopover",
	"sap/m/p13n/Container",
	"sap/m/p13n/AbstractContainerItem",
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/syncStyleClass"
], (
	Control,
	Button,
	Bar,
	Title,
	MessageBox,
	Device,
	Dialog,
	ResponsivePopover,
	Container,
	AbstractContainerItem,
	mLibrary,
	Element,
	Library,
	coreLibrary,
	syncStyleClass
) => {
	"use strict";

	//Shortcut to sap.m.P13nPopupMode
	const P13nPopupMode = mLibrary.P13nPopupMode;

	//Shortcut to sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new <code>Popup</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control can be used to show personalization-related content in different popup controls.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.97
	 * @alias sap.m.p13n.Popup
	 */
	const Popup = Control.extend("sap.m.p13n.Popup", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Text describing the personalization popup.
				 */
				title: {
					type: "string"
				},
				/**
				 * Describes the corresponding popup mode, see also {@link sap.m.P13nPopupMode}.
				 */
				mode: {
					type: "sap.m.P13nPopupMode",
					defaultValue: P13nPopupMode.Dialog
				},
				/**
				 * Warning text which appears as a message prior to executing the rest callback.
				 * <b>Note:</b> The <code>warningText</code> may only be used in case the <code>reset</code> callback has been provided.
				 */
				warningText: {
					type: "string"
				},
				/**
				 * A callback that will be executed once a reset has been triggered.
				 * <b>Note:</b> The Reset button will only be shown in case this callback is provided.
				 */
				reset: {
					type: "function"
				}
			},
			aggregations: {
				/**
				 * The panels that are displayed by the <code>sap.m.p13n.Popup</code>.
				 */
				panels: {
					type: "sap.m.p13n.IContent",
					multiple: true
				},
				/**
				 * Additional set of <code>sap.m.Button</code> controls that are added to the existing Ok and Cancel buttons.
				 */
				additionalButtons: {
					type: "sap.m.Button",
					multiple: true
				}
			},
			events: {
				/**
				 * This event is fired after the dialog has been closed.
				 */
				close: {
					parameters: {
						/**
						 * The corresponding reason for closing the dialog (Ok & Cancel).
						 */
						reason: {
							type: "string"
						}
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", "100%");
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.close("div");
			}
		}
	});

	Popup.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);
		this._aPanels = [];
	};

	/**
	 * Checks whether there is an open <code>Popup</code> control.
	 *
	 * @public
	 * @returns {boolean} Flag that indicates if there is an open popup
	 */
	Popup.prototype.isOpen = function() {
		return !!this._bIsOpen;
	};

	/**
	 * Sets the desired popup mode, see also {@link sap.m.P13nPopupMode}.
	 *
	 * @public
	 * @param {sap.m.P13nPopupMode} sMode The mode used for the popup creation
	 * @returns {sap.m.p13n.Popup} The popup instance
	 */
	Popup.prototype.setMode = function(sMode) {
		this.setProperty("mode", sMode);
		if (this._oPopup) {
			this._oPopup.removeAllContent();
			this._oPopup.destroy();
			const oPopup = this._createContainer();
			this.addDependent(oPopup);
			this._oPopup = oPopup;
		}
		return this;
	};

	/**
	 * Set the reset functionality callback
	 * <b>Note:</b> The Reset button will only be shown in case this callback is provided.
	 *
	 * @param {function} fnReset callback that will be executed once a reset has been triggered.
	 * @returns {sap.m.p13n.Popup} The <code>Popup</code> instance
	 */
	Popup.prototype.setReset = function(fnReset) {
		if (this._oPopup) {
			const oCustomHeader = this._oPopup.getCustomHeader();

			if (oCustomHeader) {
				oCustomHeader.destroy();
			}

			this._oPopup.setCustomHeader(this._createTitle());
			this._oPopup.invalidate();
		}
		this.setProperty("reset", fnReset);
		return this;
	};

	/**
	 * Opens the <code>Popup</code> control.
	 *
	 * @public
	 * @param {sap.ui.core.Control} oSource The referenced control instance (used as anchor, for example, on popovers)
	 * @param {object} [mSettings] Configuration for the related popup container
	 * @param {sap.ui.core.CSSSize} [mSettings.contentHeight] Height configuration for the related popup container
	 * @param {sap.ui.core.CSSSize} [mSettings.contentWidth] Width configuration for the related popup container
	 */
	Popup.prototype.open = function(oSource, mSettings) {

		if (!oSource && this.getMode() === "Popover") {
			throw new Error("Please provide a source control!");
		}

		if (!this._oPopup) {
			const oPopup = this._createContainer(mSettings);
			this.addDependent(oPopup);
			this._oPopup = oPopup;
		}

		if (this.getMode() === "Dialog") {
			this._oPopup.open();
		} else {
			this._oPopup.openBy(oSource);
		}

		const oParent = this.getParent();
		if (oParent && oParent.hasStyleClass instanceof Function && oParent.hasStyleClass("sapUiSizeCompact") && !this._oPopup.hasStyleClass("sapUiSizeCompact")) {
			this._oPopup.addStyleClass("sapUiSizeCompact");
		}

		const oResetBtn = this.getResetButton();

		if (oResetBtn) {
			oResetBtn.setEnabled(mSettings?.enableReset);
		}

		this._bIsOpen = true;
	};

	/**
	 * Adds a new panel to the <code>panels</code> aggregation.
	 *
	 * @public
	 * @param {sap.m.p13n.IContent} oPanel The panel instance
	 * @param {string} [sKey] Optional key to be used for the panel registration instead of using the id
	 * @returns {sap.m.p13n.Popup} The popup instance
	 */
	Popup.prototype.addPanel = function(oPanel, sKey) {
		const oPanelTitleBindingInfo = oPanel.getBindingInfo("title");
		let oBindingInfo;
		if (oPanelTitleBindingInfo && oPanelTitleBindingInfo.parts) {
			oBindingInfo = {
				parts: oPanelTitleBindingInfo.parts
			};
		}
		if (oPanel.attachChange instanceof Function) {
			oPanel.attachChange((oEvt) => {
				this.getResetButton()?.setEnabled(true);
			});
		}
		this._getContainer().addView(new AbstractContainerItem({
			key: sKey || oPanel.getId(),
			text: oBindingInfo || (oPanel.getTitle instanceof Function ? oPanel.getTitle() : undefined), //oBindinfInfo is undefined in case no binding is provided
			content: oPanel
		}));
		this._aPanels.push(oPanel);
		return this;
	};

	/**
	 * Removes a panel instance.
	 *
	 * @public
	 * @param {sap.m.p13n.IContent} oPanel The panel instance
	 * @returns {sap.m.p13n.Popup} The popup instance
	 */
	Popup.prototype.removePanel = function(oPanel) {
		this._aPanels.splice(this._aPanels.indexOf(oPanel), 1);
		this._getContainer().removeView(this._getContainer().getView(oPanel));
		return this;
	};

	/**
	 * Removes all panels from the <code>panels</code> aggregation
	 */
	Popup.prototype.removeAllPanels = function() {
		this.getPanels().forEach((oPanel) => {
			this.removePanel(oPanel);
		});
	};

	/**
	 * Returns the current panels in the <code>panels</code> aggregation.
	 * @public
	 * @returns {sap.m.p13n.IContent[]} An array of panel instances
	 */
	Popup.prototype.getPanels = function() {
		return this._aPanels;
	};

	/**
	 * Getter for the inner <code>Reset</code> button control.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @returns {sap.m.Button} The reset button instance
	 */
	Popup.prototype.getResetButton = function() {
		return Element.getElementById(this.getId() + "-resetBtn");
	};

	Popup.prototype._createContainer = function(mDialogSettings) {
		mDialogSettings = mDialogSettings ? mDialogSettings : {};
		const oPopup = this["_create" + this.getMode()].call(this, mDialogSettings);
		oPopup.addStyleClass("sapMP13nPopup");
		oPopup.isPopupAdaptationAllowed = () => {
			return false;
		};
		return oPopup;
	};

	Popup.prototype._createResponsivePopover = function(mDialogSettings) {
		const aPanels = this.getPanels();
		const bUseContainer = aPanels.length > 1;
		const oPopover = new ResponsivePopover(this.getId() + "-responsivePopover", {
			title: this.getTitle(),
			horizontalScrolling: mDialogSettings.hasOwnProperty("horizontalScrolling") ? mDialogSettings.horizontalScrolling : false,
			verticalScrolling: !bUseContainer && !(aPanels[0] && aPanels[0].getVerticalScrolling instanceof Function && aPanels[0].getVerticalScrolling()),
			contentWidth: mDialogSettings.contentWidth ? mDialogSettings.contentWidth : "30rem",
			resizable: mDialogSettings.hasOwnProperty("resizable") ? mDialogSettings.resizable : true,
			contentHeight: mDialogSettings.contentHeight ? mDialogSettings.contentHeight : "35rem",
			placement: mDialogSettings.placement ? mDialogSettings.placement : "Bottom",
			content: bUseContainer ? this._getContainer() : aPanels[0],
			afterClose: () => {
				this._onClose(oPopover, "AutoClose");
			}
		});

		oPopover.setCustomHeader(this._createTitle());

		return oPopover;

	};

	Popup.prototype._createDialog = function(mDialogSettings) {
		const aPanels = this.getPanels();
		const bUseContainer = aPanels.length > 1;
		const oResourceBundle = Library.getResourceBundleFor("sap.m");

		let oInitialFocusedControl;
		if (aPanels.length > 0) {
			const oContent = aPanels[0];
			oInitialFocusedControl = oContent.getInitialFocusedControl && oContent.getInitialFocusedControl();
			if (!oInitialFocusedControl && bUseContainer) {
				// focus at least the iconTabBar first item
				oInitialFocusedControl = this._getContainer()._getTabBar().getItems()[0];
			}
		}

		const oContainer = new Dialog(this.getId() + "-dialog", {
			initialFocus: oInitialFocusedControl,
			title: this.getTitle(),
			horizontalScrolling: mDialogSettings.hasOwnProperty("horizontalScrolling") ? mDialogSettings.horizontalScrolling : false,
			verticalScrolling: !bUseContainer && !(aPanels[0] && aPanels[0].getVerticalScrolling instanceof Function && aPanels[0].getVerticalScrolling()),
			contentWidth: mDialogSettings.contentWidth ? mDialogSettings.contentWidth : "40rem",
			contentHeight: mDialogSettings.contentHeight ? mDialogSettings.contentHeight : "55rem",
			draggable: true,
			resizable: true,
			stretch: Device.system.phone,
			content: bUseContainer ? this._getContainer() : aPanels[0],
			escapeHandler: () => {
				this._onClose(oContainer, "Escape");
			},
			buttons: [
				new Button(this.getId() + this._getIdPrefix() + "-confirmBtn", {
					text: mDialogSettings.confirm && mDialogSettings.confirm.text ? mDialogSettings.confirm.text : oResourceBundle.getText("p13n.POPUP_OK"),
					type: "Emphasized",
					press: () => {
						this._onClose(oContainer, "Ok");
					}

				}), new Button(this.getId() + this._getIdPrefix() + "-cancelBtn", {
					text: oResourceBundle.getText("p13n.POPUP_CANCEL"),
					press: () => {
						this._onClose(oContainer, "Cancel");
					}
				})
			]
		});

		oContainer.setCustomHeader(this._createTitle());

		this.getAdditionalButtons().forEach((oButton) => {
			oContainer.addButton(oButton);
		});

		return oContainer;
	};

	Popup.prototype._getIdPrefix = () => {
		return "";
	};

	Popup.prototype._createTitle = function() {

		const fnReset = this.getReset();
		const sTitle = this.getTitle();
		const sWarningText = this.getWarningText();
		const oPopup = this;

		let oBar;

		if (fnReset instanceof Function) {

			oBar = new Bar({
				contentLeft: [
					new Title({
						text: sTitle,
						level: TitleLevel.H1
					})
				]
			});

			oBar.addContentRight(new Button(this.getId() + "-resetBtn", {
				text: Library.getResourceBundleFor("sap.m").getText("p13n.POPUP_RESET"),
				press: function(oEvt) {

					const oDialog = oEvt.getSource().getParent().getParent();
					const oControl = oDialog.getParent();

					const sResetText = sWarningText;
					MessageBox.warning(sResetText, {
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						emphasizedAction: MessageBox.Action.OK,
						onClose: (sAction) => {
							if (sAction === MessageBox.Action.OK) {
								// --> focus "OK" button after 'reset' has been triggered
								oDialog.getButtons()[0].focus();
								oEvt.getSource().setEnabled(false);
								oPopup._resetPanels();
								fnReset(oControl);
							}
						}
					});
				}
			}));

		}

		return oBar;

	};

	/**
	 * Trigger the <code>#onReset</code> method on the aggregated panels to apply certain updates such as clearing search values.
	 *
	 * @private
	 */
	Popup.prototype._resetPanels = function() {
		this.getPanels().forEach((oPanel) => {
			if (oPanel.onReset instanceof Function) {
				oPanel.onReset();
			}
		});
	};

	Popup.prototype._getContainer = function(oSource) {
		if (!this._oContainer) {
			this._oContainer = new Container();
		}

		if (this._oContainer.getViews().length > 1) {
			this._oContainer.switchView(this._oContainer.getViews()[1].getKey());
		}

		return this._oContainer;
	};

	Popup.prototype._onClose = function(oContainer, sReason) {

		oContainer.close();

		this._bIsOpen = false;

		this.fireClose({
			reason: sReason
		});
	};

	Popup.prototype.exit = function() {
		Control.prototype.exit.apply(this, arguments);
		if (this._oPopup) {
			this._oPopup.destroy();
		}
		this._aPanels = null;
	};

	return Popup;

});