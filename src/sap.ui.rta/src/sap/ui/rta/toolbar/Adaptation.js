/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/ui/Device",
	"./Base",
	"sap/ui/core/MessageType"
],
function(
	Fragment,
	Device,
	Base,
	MessageType
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

				/** Defines value of the switcher SegmentedButton */
				modeSwitcher: {
					type: "string",
					defaultValue: "adaptation"
				},

				/** Determines the visibility of the 'saveAs', 'manageApps' and 'appVariantsOverview' buttons */
				appVariantsVisible: {
					type: "boolean",
					defaultValue: false
				},

				/** Determines the enablement of the 'saveAs', 'manageApps' and 'appVariantsOverview' buttons */
				appVariantsEnabled: {
					type: "boolean",
					defaultValue: false
				},

				/** Determines if the 'appVariantOverview' or the 'manageApps' should be visible */
				extendedManageAppVariants: {
					type: "boolean",
					defaultValue: false
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

	var DRAFT_ACCENT_COLOR = "sapUiRtaDraftVersionAccent";
	var ACTIVE_ACCENT_COLOR = "sapUiRtaActiveVersionAccent";

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

	Adaptation.prototype.formatVersionButtonText = function (bDraftAvailable, aVersions) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sText = "";
		var sType = "Active";

		if (aVersions.length > 0) {
			sType = aVersions[0].type;
			if (bDraftAvailable) {
				sText = oTextResources.getText("TIT_DRAFT");
			} else {
				sText = aVersions[0].title || oTextResources.getText("TIT_VERSION_1");
			}
		} else {
			sText = oTextResources.getText("TIT_ORIGINAL_APP");
		}

		this.setVersionButtonAccentColor(sType);
		return sText;
	};

	Adaptation.prototype.formatVersionTableVisibility = function (nVersionsLength) {
		return nVersionsLength > 0;
	};

	Adaptation.prototype.formatVersionTitle = function (sTitle, sType) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		if (sType === "draft") {
			return oTextResources.getText("TIT_DRAFT");
		}

		return sTitle || oTextResources.getText("TIT_VERSION_1");
	};

	Adaptation.prototype.formatHighlight = function (sType) {
		switch (sType) {
			case "draft":
				return MessageType.Warning;
			case "active":
				return MessageType.Success;
			default:
				return MessageType.None;
		}
	};

	Adaptation.prototype.formatHighlightText = function (sType) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		switch (sType) {
			case "draft":
				return oTextResources.getText("TIT_DRAFT");
			case "active":
				return oTextResources.getText("LBL_ACTIVE");
			default:
				return oTextResources.getText("LBL_INACTIVE");
		}
	};

	function doesActiveVersionExists (aVersions) {
		return aVersions.some(function (oVersion) {
			return oVersion.type === "active";
		});
	}

	Adaptation.prototype.formatOriginalAppHighlight = function (aVersions) {
		return doesActiveVersionExists(aVersions) ? MessageType.None : MessageType.Success;
	};


	Adaptation.prototype.formatOriginalAppHighlightText = function (aVersions) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		return doesActiveVersionExists(aVersions) ? oTextResources.getText("LBL_INACTIVE") : oTextResources.getText("LBL_ACTIVE");
	};

	Adaptation.prototype.showVersionHistory = function (oEvent) {
		var oVersionButton = oEvent.getSource();

		if (!this.oVersionDialogPromise) {
			this.oVersionDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.VersionHistory",
				id: this.getId() + "_versionHistoryDialog",
				controller: {
					formatVersionTitle: this.formatVersionTitle.bind(this),
					formatVersionTableVisibility: this.formatVersionTableVisibility.bind(this),
					formatHighlight: this.formatHighlight.bind(this),
					formatHighlightText: this.formatHighlightText.bind(this),
					formatOriginalAppHighlight: this.formatOriginalAppHighlight.bind(this),
					formatOriginalAppHighlightText: this.formatOriginalAppHighlightText.bind(this)
				}
			}).then(function (oVersionsDialog) {
				oVersionButton.addDependent(oVersionsDialog);
				return oVersionsDialog;
			});
		}

		return this.oVersionDialogPromise.then(function (oVersionsDialog) {
			if (!oVersionsDialog.isOpen()) {
				oVersionsDialog.openBy(oVersionButton);
			} else {
				oVersionsDialog.close();
			}
		});
	};

	Adaptation.prototype._showButtonIcon = function(sButtonName, sIcon, sToolTipKey) {
		_setButtonProperties.call(this, sButtonName, sIcon, "", sToolTipKey);
	};

	Adaptation.prototype._showButtonText = function(sButtonName, sTextKey) {
		_setButtonProperties.call(this, sButtonName, "", sTextKey, "");
	};

	Adaptation.prototype._switchToIcons = function() {
		this.getControl("iconBox").setVisible(false);
		this.getControl("iconSpacer").setVisible(false);
		this._showButtonIcon("adaptationSwitcherButton", "sap-icon://wrench", "BTN_ADAPTATION");
		this._showButtonIcon("navigationSwitcherButton", "sap-icon://explorer", "BTN_NAVIGATION");
		this._showButtonIcon("exit", "sap-icon://decline", "BTN_EXIT");
	};

	Adaptation.prototype._switchToTexts = function () {
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
				exit: this.eventHandler.bind(this, "Exit"),
				formatVersionButtonText: this.formatVersionButtonText.bind(this),
				showVersionHistory: this.showVersionHistory.bind(this)
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
			name: "sap.ui.rta.toolbar.VersionTitleDialog",
			id: this.getId() + "_fragment",
			controller: {
				onConfirmVersioningDialog: function () {
					var sVersionTitle = this.getControl("versionTitleInput").getValue();
					this.fireEvent("activateDraft", {versionTitle: sVersionTitle});
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

	Adaptation.prototype.setVersionButtonAccentColor = function (sType) {
		var oVersionButton = this.getControl("versionButton");
		if (sType === "draft") {
			oVersionButton.addStyleClass(DRAFT_ACCENT_COLOR);
			oVersionButton.removeStyleClass(ACTIVE_ACCENT_COLOR);
		} else {
			oVersionButton.addStyleClass(ACTIVE_ACCENT_COLOR);
			oVersionButton.removeStyleClass(DRAFT_ACCENT_COLOR);
		}
	};

	Adaptation.prototype.setAppVariantsVisible = function (bVisible) {
		this.setProperty("appVariantsVisible", bVisible, true);

		this.getControl("saveAs").setVisible(bVisible);

		var bExtendedManageAppVariants = this.getExtendedManageAppVariants();
		this.getControl("appVariantOverview").setVisible(bVisible && bExtendedManageAppVariants);
		this.getControl("manageApps").setVisible(bVisible && !bExtendedManageAppVariants);
	};

	Adaptation.prototype.setAppVariantsEnabled = function (bEnabled) {
		this.setProperty("appVariantsEnabled", bEnabled, true);
		this.getControl("saveAs").setEnabled(bEnabled);
		this.getControl("appVariantOverview").setEnabled(bEnabled);
		this.getControl("manageApps").setEnabled(bEnabled);
	};

	Adaptation.prototype.setExtendedManageAppVariants = function (bExtended) {
		this.setProperty("extendedManageAppVariants", bExtended, true);

		var bVisible = this.getAppVariantsVisible();
		this.getControl("appVariantOverview").setVisible(bVisible && bExtended);
		this.getControl("manageApps").setVisible(bVisible && !bExtended);
	};

	/* Methods propagation */
	Adaptation.prototype.show = function () { return Base.prototype.show.apply(this, arguments); };
	Adaptation.prototype.hide = function () { return Base.prototype.hide.apply(this, arguments); };

	return Adaptation;
}, true);
