/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/MenuButton",
	"sap/m/MenuItem",
	"sap/m/Menu",
	"sap/m/HBox",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/Device",
	"sap/m/FlexItemData",
	"./Base"
],
function(
	ToolbarSpacer,
	Button,
	SegmentedButton,
	SegmentedButtonItem,
	MenuButton,
	MenuItem,
	Menu,
	HBox,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	Device,
	FlexItemData,
	Base
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Adaptation control
	 *
	 * @class
	 * Contains implementation of Adaptation toolbar
	 * @extends sap.ui.rta.toolbar.Base
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Adaptation
	 * @experimental Since 1.48. This class is experimental. API might be changed in future.
	 */
	var Adaptation = Base.extend("sap.ui.rta.toolbar.Adaptation", {
		renderer: "sap.ui.rta.toolbar.AdaptationRenderer",
		animation: true,
		metadata: {
			events: {
				/**
				 * Events are fired when the Toolbar Buttons are pressed
				 */
				undo: {},
				redo: {},
				exit: {},
				restore: {},
				transport: {},
				modeChange: {},
				manageApps: {},
				appVariantOverview: {},
				saveAs: {}
			},
			properties: {
				/** Determines whether publish button is visible */
				publishVisible: {
					type: "boolean",
					defaultValue: false
				},

				/** Determines whether draft buttons are visible */
				draftVisible: {
					type: "boolean",
					defaultValue: false
				},

				/** Defines value of the switcher SegmentedButton */
				modeSwitcher: {
					type: "string",
					defaultValue: "adaptation"
				}
			}
		}
	});

	Adaptation.modes = {
		MOBILE: "sapUiRtaToolbarMobile",
		TABLET: "sapUiRtaToolbarTablet",
		DESKTOP: "sapUiRtaToolbarDesktop"
	};

	var DEVICE_SET = "sapUiRtaToolbar";

	Adaptation.prototype.init = function() {
		Device.media.attachHandler(this._onSizeChanged, this, DEVICE_SET);

		Base.prototype.init.apply(this, arguments);
	};

	Adaptation.prototype.onAfterRendering = function () {
		if (!Device.media.hasRangeSet(DEVICE_SET)) {
			Device.media.initRangeSet(DEVICE_SET, [600, 900], "px", [Adaptation.modes.MOBILE, Adaptation.modes.TABLET, Adaptation.modes.DESKTOP]);
		}
		this._onSizeChanged(Device.media.getCurrentRange(DEVICE_SET));

		Base.prototype.onAfterRendering.apply(this, arguments);
	};

	Adaptation.prototype.exit = function() {
		Device.media.detachHandler(this._onSizeChanged, this, DEVICE_SET);
		Base.prototype.exit.apply(this, arguments);
	};

	Adaptation.prototype._onSizeChanged = function(mParams) {
		function setLayoutPriority(aControls, sFrom, sTo) {
			var aControlsToChange = aControls.filter(function(oControl) {
				return oControl.getLayoutData() && oControl.getLayoutData().getPriority() === sFrom;
			});
			aControlsToChange.forEach(function(oControl) {
				oControl.getLayoutData().setPriority(sTo);
			});
		}

		var sMode = mParams.name;
		this.sMode = sMode;

		var oSaveButton = this.getControl("exit");
		var oOverflowToolbarContent = this.getControl("overflowToolbar").getContent();
		var bShowAppVariantButton = false;
		switch (sMode) {
			case Adaptation.modes.MOBILE:
				bShowAppVariantButton = false;
				oSaveButton.setIcon("sap-icon://decline");
				oSaveButton.setText("");
				setLayoutPriority(oOverflowToolbarContent, "Low", "AlwaysOverflow");
				replaceIconAndTextForAppVariantsButton.call(this, bShowAppVariantButton);
				this._setWidthOfHBoxes(false);
				break;
			case Adaptation.modes.TABLET:
				bShowAppVariantButton = false;
				oSaveButton.setIcon("");
				oSaveButton.setText(this.getTextResources().getText("BTN_EXIT"));
				setLayoutPriority(oOverflowToolbarContent, "Low", "AlwaysOverflow");
				replaceIconAndTextForAppVariantsButton.call(this, bShowAppVariantButton);
				this._setWidthOfHBoxes(false);
				break;
			case Adaptation.modes.DESKTOP:
				bShowAppVariantButton = true;
				oSaveButton.setIcon("");
				oSaveButton.setText(this.getTextResources().getText("BTN_EXIT"));
				setLayoutPriority(oOverflowToolbarContent, "AlwaysOverflow", "Low");
				replaceIconAndTextForAppVariantsButton.call(this, bShowAppVariantButton);
				this._setWidthOfHBoxes(true);
				break;
			default:
				// no default
		}
	};

	function calculateAndSetWidthOfBothBoxes(bCalculateWidth) {
		var oContent = this.getItems();

		if (bCalculateWidth) {
			var iWidth = this.getControl("modeSwitcher").$().outerWidth();
			var iHalfWidthOfModeSwitcher = iWidth && Math.floor(iWidth / 2);

			if (!iHalfWidthOfModeSwitcher) {
				oContent[1].setWidth("50%");
			} else {
				oContent[1].setWidth("calc(50% + " + iHalfWidthOfModeSwitcher + "px)");
			}
		} else {
			// for TABLET and MOBILE modes width is fixed
			oContent[1].setWidth("100%");
		}
	}

	function replaceIconAndTextForAppVariantsButton(bShowIcon) {
		var oManageAppsButton = this.getControl("manageApps");
		var oAppVariantOverviewButton = this.getControl("appVariantOverview");
		if (bShowIcon) {
			oManageAppsButton.setIcon("sap-icon://dimension");
			oManageAppsButton.setText("");
			oAppVariantOverviewButton.setIcon("sap-icon://dimension");
			oAppVariantOverviewButton.setText("");
		} else {
			oManageAppsButton.setIcon("");
			oManageAppsButton.setText(this.getTextResources().getText("BTN_MANAGE_APPS_TXT"));
			oAppVariantOverviewButton.setIcon("");
			oAppVariantOverviewButton.setText(this.getTextResources().getText("BTN_MANAGE_APPS_TXT"));
		}
	}

	Adaptation.prototype._setWidthOfHBoxes = function(bCalculateWidth) {
		// in DESKTOP mode, as the mode switcher segmented buttons are of dynamic size (depending on text), we have to adjust the width of the two hboxes
		// we add/subtract half the size of the mode switcher to the HBoxes
		if (bCalculateWidth) {
			var oModeSwitcherDomRef = this.getControl("modeSwitcher").getDomRef();

			// if the domRef is not there it is (still) in the overflow of the toolbar, so we have to wait until it is rendered
			if (!oModeSwitcherDomRef) {
				this._oDelegate = {
					onAfterRendering: function() {
						calculateAndSetWidthOfBothBoxes.call(this, bCalculateWidth);
						this.getControl("modeSwitcher").removeEventDelegate(this._oDelegate, this);
					}
				};
				this.getControl("modeSwitcher").addEventDelegate(this._oDelegate, this);
				calculateAndSetWidthOfBothBoxes.call(this, bCalculateWidth);
			} else {
				calculateAndSetWidthOfBothBoxes.call(this, bCalculateWidth);
			}
		} else {
			calculateAndSetWidthOfBothBoxes.call(this, bCalculateWidth);
		}
	};

	/**
	 * In Adaptation scenario we need to get the children of the container in the content aggregation
	 *
	 * @param {string} sName name of the control
	 * @returns {sap.ui.core.Control} Returns the control;
	 */
	Adaptation.prototype.getControl = function(sName) {
		return this._mControls[sName];
	};

	/**
	 * format of the controls that get added here:
	 * 	HBox (this)
	 * 		HBox
	 * 			place for Icon in Fiori Toolbar
	 * 		HBox
	 * 			OverflowToolbar
	 * 				Segmented Button, Buttons for Undo, Redo, manageApps, appVariantOverview, restore, publish, saveAs
	 * 			Save & Exit Button
	 *
	 * @returns {sap.ui.core.Control[]} Returns the controls in a structure described above.
	 */
	Adaptation.prototype.buildControls = function () {
		this._mControls = {};
		return [
			new HBox({
				alignItems: "Center",
				layoutData: new FlexItemData({
					baseSize: "0",
					growFactor: 1,
					minWidth: "0"
				})
			}),
			new HBox({
				alignItems: "Center",
				items: [
					this._mControls["overflowToolbar"] = new OverflowToolbar({
						content: [
							this._mControls["modeSwitcher"] = new SegmentedButton({
								width: "auto",
								selectedKey: this.getModeSwitcher(),
								items: [
									new SegmentedButtonItem({
										text: this.getTextResources().getText("BTN_ADAPTATION"),
										tooltip: this.getTextResources().getText("BTN_ADAPTATION"),
										width: "auto",
										key: "adaptation"
									}),
									new SegmentedButtonItem({
										text: this.getTextResources().getText("BTN_NAVIGATION"),
										tooltip: this.getTextResources().getText("BTN_NAVIGATION"),
										width: "auto",
										key: "navigation"
									})
								],
								selectionChange: this.eventHandler.bind(this, "ModeChange"),
								layoutData: new OverflowToolbarLayoutData({
									priority: "High"
								})
							}),
							new ToolbarSpacer(),
							this._mControls["undo"] = new Button({
								type: "Transparent",
								icon: "sap-icon://undo",
								enabled: false,
								tooltip: this.getTextResources().getText("BTN_UNDO"),
								press: this.eventHandler.bind(this, "Undo"),
								layoutData: new OverflowToolbarLayoutData({
									priority: "NeverOverflow"
								})
							}),
							this._mControls["redo"] = new Button({
								type:"Transparent",
								icon: "sap-icon://redo",
								iconFirst: false,
								enabled: false,
								tooltip: this.getTextResources().getText("BTN_REDO"),
								press: this.eventHandler.bind(this, "Redo"),
								layoutData: new OverflowToolbarLayoutData({
									priority: "NeverOverflow"
								})
							}),
							this._mControls["manageApps"] = new Button({
								type:"Transparent",
								icon: "sap-icon://dimension",
								enabled: false,
								visible: false,
								tooltip: this.getTextResources().getText("BTN_MANAGE_APPS_TXT"),
								press: this.eventHandler.bind(this, "ManageApps"),
								layoutData: new OverflowToolbarLayoutData({
									priority: "Low"
								})
							}),
							this._mControls["appVariantOverview"] = new MenuButton({
								type:"Transparent",
								icon: "sap-icon://dimension",
								enabled: false,
								visible: false,
								tooltip: this.getTextResources().getText("BTN_MANAGE_APPS_TXT"),
								menu: new Menu({
									itemSelected: this.eventHandler.bind(this, "AppVariantOverview"),
									items: [
										new MenuItem("keyUser", {
											text: this.getTextResources().getText("MENU_ITEM_KEY_USER")
										}),
										new MenuItem("developer", {
											text: this.getTextResources().getText("MENU_ITEM_SAP_DEVELOPER")
										})
									]
								}),
								layoutData: new OverflowToolbarLayoutData({
									priority: "Low"
								})
							}),
							this._mControls["restore"] = new Button({
								type: "Transparent",
								text: this.getTextResources().getText("BTN_RESTORE"),
								visible: true,
								enabled: false,
								tooltip: this.getTextResources().getText("BTN_RESTORE"),
								press: this.eventHandler.bind(this, "Restore"),
								layoutData: new OverflowToolbarLayoutData({
									priority: "Low"
								})
							}),
							this._mControls["publish"] = new Button({
								type: "Transparent",
								enabled: false,
								visible: this.getPublishVisible(),
								text: this.getTextResources().getText("BTN_PUBLISH"),
								tooltip: this.getTextResources().getText("BTN_PUBLISH"),
								press: this.eventHandler.bind(this, "Transport"), // Fixme: rename event
								layoutData: new OverflowToolbarLayoutData({
									priority: "Low"
								})
							}),
							this._mControls["saveAs"] = new Button({
								type: "Transparent",
								text: this.getTextResources().getText("BTN_SAVE_AS"),
								enabled: false,
								visible: false,
								tooltip: this.getTextResources().getText("TOOLTIP_SAVE_AS"),
								press: this.eventHandler.bind(this, "SaveAs"),
								layoutData: new OverflowToolbarLayoutData({
									priority: "Low"
								})
							})
						],
						layoutData: new FlexItemData({
							growFactor: 1,
							minWidth: "0"
						})
					}),
					this._mControls["exit"] = new Button({
						type:"Transparent",
						text: this.getTextResources().getText("BTN_EXIT"),
						tooltip: this.getTextResources().getText("BTN_EXIT"),
						press: this.eventHandler.bind(this, "Exit"),
						icon: "sap-icon://decline"
					})
				],
				layoutData: new FlexItemData({
					growFactor: 0
				})
			})
		];
	};

	Adaptation.prototype.setUndoRedoEnabled = function (bCanUndo, bCanRedo) {
		this.getControl("undo").setEnabled(bCanUndo);
		this.getControl("redo").setEnabled(bCanRedo);
	};

	Adaptation.prototype.setPublishEnabled = function (bEnabled) {
		this.getControl("publish").setEnabled(bEnabled);
	};

	Adaptation.prototype.setRestoreEnabled = function (bEnabled) {
		this.getControl("restore").setEnabled(bEnabled);
	};

	/* Methods propagation */
	Adaptation.prototype.show = function () { return Base.prototype.show.apply(this, arguments); };
	Adaptation.prototype.hide = function () { return Base.prototype.hide.apply(this, arguments); };

	return Adaptation;
}, true);
