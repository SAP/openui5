/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/Device",
	"./Base"
],
function(
	Fragment,
	Device,
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
				saveAs: {},
				activateDraft: {},
				discardDraft: {}
			},
			properties: {
				/** Determines whether publish button is visible */
				publishVisible: {
					type: "boolean",
					defaultValue: false
				},

				/** Determines whether the version label and draft buttons are visible */
				versioningVisible: {
					type: "boolean",
					defaultValue: false
				},

				/** Determines whether draft buttons are enabled */
				draftEnabled: {
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

	Adaptation.prototype.onBeforeRendering = function () {
		if (!Device.media.hasRangeSet(DEVICE_SET)) {
			Device.media.initRangeSet(DEVICE_SET, [900, 1200], "px", [Adaptation.modes.MOBILE, Adaptation.modes.TABLET, Adaptation.modes.DESKTOP]);
		}
		this._onSizeChanged(Device.media.getCurrentRange(DEVICE_SET));

		Base.prototype.onBeforeRendering.apply(this, arguments);
	};

	Adaptation.prototype.exit = function() {
		Device.media.detachHandler(this._onSizeChanged, this, DEVICE_SET);
		Base.prototype.exit.apply(this, arguments);
	};

	function _setButtonProperties(sButtonName, sIcon, sTextKey, sToolTipKey) {
		var oButton = this.getControl(sButtonName);
		var sText = sTextKey ? this.getTextResources().getText(sTextKey) : "";
		var sToolTip = sToolTipKey ? this.getTextResources().getText(sToolTipKey) : "";
		oButton.setText(sText || "");
		oButton.setTooltip(sToolTip || "");
		oButton.setIcon(sIcon || "");
	}

	Adaptation.prototype._showButtonIcon = function(sButtonName, sIcon, sToolTipKey) {
		_setButtonProperties.call(this, sButtonName, sIcon, "", sToolTipKey);
	};

	Adaptation.prototype._showButtonText = function(sButtonName, sTextKey) {
		_setButtonProperties.call(this, sButtonName, "", sTextKey, "");
	};

	Adaptation.prototype._switchToIcons = function() {
		this.getControl("draftLabel").setVisible(false);
		this.getControl("iconBox").setVisible(false);
		this.getControl("iconSpacer").setVisible(false);
		this._showButtonIcon("adaptationSwitcherButton", "sap-icon://wrench", "BTN_ADAPTATION");
		this._showButtonIcon("navigationSwitcherButton", "sap-icon://explorer", "BTN_NAVIGATION");
		this._showButtonIcon("exit", "sap-icon://decline", "BTN_EXIT");
	};

	Adaptation.prototype._switchToTexts = function () {
		this._setDraftLabelVisibility();
		this.getControl("iconBox").setVisible(true);
		this.getControl("iconSpacer").setVisible(true);
		this._showButtonText("adaptationSwitcherButton", "BTN_ADAPTATION");
		this._showButtonText("navigationSwitcherButton", "BTN_NAVIGATION");
		this._showButtonText("exit", "BTN_EXIT");
	};

	Adaptation.prototype._onSizeChanged = function(mParams) {
		var sMode = mParams.name;
		this.sMode = sMode;

		switch (sMode) {
			case Adaptation.modes.MOBILE:
				this._switchToIcons();
				break;
			case Adaptation.modes.TABLET:
				this._switchToTexts();
				break;
			case Adaptation.modes.DESKTOP:
				this._switchToTexts();
				break;
			default:
			// no default
		}
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
		return Fragment.load({
			name: "sap.ui.rta.toolbar.Adaptation",
			id: this.getId() + "_fragment",
			controller: {
				activateDraft: this._openVersionTitleDialog.bind(this),
				discardDraft: this.eventHandler.bind(this, "DiscardDraft"),
				modeChange: this.eventHandler.bind(this, "ModeChange"),
				undo: this.eventHandler.bind(this, "Undo"),
				redo: this.eventHandler.bind(this, "Redo"),
				manageApps: this.eventHandler.bind(this, "ManageApps"),
				appVariantOverview: this.eventHandler.bind(this, "AppVariantOverview"),
				restore: this.eventHandler.bind(this, "Restore"),
				publish: this.eventHandler.bind(this, "Transport"),
				saveAs: this.eventHandler.bind(this, "SaveAs"),
				exit: this.eventHandler.bind(this, "Exit")
			}
		}).then(function (aControls) {
			this.getControl("publish").setVisible(this.getPublishVisible());
			this.getControl("modeSwitcher").setSelectedKey(this.getModeSwitcher());
			return aControls;
		}.bind(this));
	};

	function _resetDialog() {
		this.getControl("versionTitleInput").setValue("");
		this.getControl("confirmVersionTitleButton").setEnabled(false);
		return Promise.resolve(this._oDialog);
	}

	function _createDialog() {
		return Fragment.load({
			name : "sap.ui.rta.toolbar.VersionTitleDialog",
			id: this.getId() + "_fragment",
			controller : {
				onConfirmVersioningDialog: function () {
					var sVersionTitle = this.getControl("versionTitleInput").getValue();
					this.fireEvent("activateDraft", {versionTitle : sVersionTitle});
					this._oDialog.close();
				}.bind(this),
				onCancelVersioningDialog: function () {
					this._oDialog.close();
				}.bind(this),
				onVersionTitleLiveChange: function (oEvent) {
					var sValue = oEvent.getParameter("value");
					this.getControl("confirmVersionTitleButton").setEnabled(!!sValue);
				}.bind(this)
			}
		}).then(function (oDialog) {
			this._oDialog = oDialog;
			this.addDependent(this._oDialog);
		}.bind(this));
	}

	Adaptation.prototype.getControl = function(sName) {
		return sap.ui.getCore().byId(this.getId() + "_fragment--sapUiRta_" + sName);
	};

	Adaptation.prototype._openVersionTitleDialog = function () {
		var oDialogPromise;

		if (this._oDialog) {
			oDialogPromise = _resetDialog.call(this);
		} else {
			oDialogPromise = _createDialog.call(this);
		}

		return oDialogPromise.then(function () {
			return this._oDialog.open();
		}.bind(this));
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

	Adaptation.prototype._setDraftLabelVisibility = function () {
		var bLabelVisible = this.getVersioningVisible() && this.sMode === Adaptation.modes.DESKTOP;
		this.getControl("draftLabel").setVisible(bLabelVisible);
	};

	Adaptation.prototype.setVersioningVisible = function (bVisible) {
		this.setProperty("versioningVisible", bVisible, true);
		this._setDraftLabelVisibility();
		this.getControl("activateDraft").setVisible(bVisible);
		this.getControl("discardDraft").setVisible(bVisible);
		return bVisible;
	};

	Adaptation.prototype.setDraftEnabled = function (bEnabled) {
		this.setProperty("draftEnabled", bEnabled, true);
		this.getControl("activateDraft").setEnabled(bEnabled);
		this.getControl("discardDraft").setEnabled(bEnabled);
		return bEnabled;
	};

	/* Methods propagation */
	Adaptation.prototype.show = function () { return Base.prototype.show.apply(this, arguments); };
	Adaptation.prototype.hide = function () { return Base.prototype.hide.apply(this, arguments); };

	return Adaptation;
}, true);
