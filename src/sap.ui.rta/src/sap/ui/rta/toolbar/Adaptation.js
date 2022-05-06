/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/GroupHeaderListItem",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Fragment",
	"sap/ui/core/library",
	"sap/ui/fl/write/api/Version",
	"sap/ui/rta/Utils",
	"sap/ui/rta/toolbar/translation/Translation",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/model/Sorter",
	"sap/ui/Device"
], function(
	GroupHeaderListItem,
	DateFormat,
	Fragment,
	coreLibrary,
	Version,
	Utils,
	Translation,
	AppVariantFeature,
	Base,
	Sorter,
	Device
) {
	"use strict";

	var MessageType = coreLibrary.MessageType;

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
			library: "sap.ui.rta",
			events: {
				/**
				 * Events are fired when the Toolbar Buttons are pressed
				 */
				undo: {},
				redo: {},
				exit: {},
				save: {},
				restore: {},
				transport: {},
				publishVersion: {},
				modeChange: {},
				activate: {},
				discardDraft: {},
				switchVersion: {},
				openChangeCategorySelectionPopover: {}
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
		this._pFragmentLoaded = Base.prototype.init.apply(this, arguments).then(function() {
			if (!Device.media.hasRangeSet(DEVICE_SET)) {
				Device.media.initRangeSet(DEVICE_SET, [900, 1200], "px", [Adaptation.modes.MOBILE, Adaptation.modes.TABLET, Adaptation.modes.DESKTOP]);
			}
			Device.media.attachHandler(this._onSizeChanged, this, DEVICE_SET);
		}.bind(this));
	};

	Adaptation.prototype.onFragmentLoaded = function() {
		return this._pFragmentLoaded;
	};

	Adaptation.prototype.exit = function() {
		Device.media.detachHandler(this._onSizeChanged, this, DEVICE_SET);
		Base.prototype.exit.apply(this, arguments);
	};

	Adaptation.prototype.show = function() {
		this._onSizeChanged(Device.media.getCurrentRange(DEVICE_SET), true);
		return Base.prototype.show.apply(this, arguments);
	};

	function setButtonProperties(sButtonName, sIcon, sTextKey, sToolTipKey) {
		var oButton = this.getControl(sButtonName);
		var sText = sTextKey ? this.getTextResources().getText(sTextKey) : "";
		var sToolTip = sToolTipKey ? this.getTextResources().getText(sToolTipKey) : "";
		oButton.setText(sText || "");
		oButton.setTooltip(sToolTip || "");
		oButton.setIcon(sIcon || "");
	}

	Adaptation.prototype.formatPublishVersionVisibility = function (bPublishVisible, bVersioningEnabled, sDisplayedVersion, sModeSwitcher) {
		return bPublishVisible && bVersioningEnabled && sDisplayedVersion !== Version.Number.Draft && sModeSwitcher === "adaptation";
	};


	Adaptation.prototype.formatDiscardDraftVisible = function (sDisplayedVersion, bVersioningEnabled, sModeSwitcher) {
		return sDisplayedVersion === Version.Number.Draft && bVersioningEnabled && sModeSwitcher === "adaptation";
	};

	Adaptation.prototype.formatVersionButtonText = function (aVersions, sDisplayedVersion) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		var sText = "";
		var sType = "Active";
		aVersions = aVersions || [];

		if (sDisplayedVersion === undefined || sDisplayedVersion === Version.Number.Original) {
			sText = oTextResources.getText("TIT_ORIGINAL_APP");
			sType = "inactive";
			if (aVersions.length === 0 || (aVersions.length === 1 && aVersions[0].type === "draft")) {
				sType = "active";
			}
		} else {
			var oDisplayedVersion = aVersions.find(function (oVersion) {
				return oVersion.version === sDisplayedVersion;
			});
			if (oDisplayedVersion) {
				sType = oDisplayedVersion.type;
				if (sDisplayedVersion === Version.Number.Draft) {
					sText = oTextResources.getText("TIT_DRAFT");
				} else {
					sText = oDisplayedVersion.title || oTextResources.getText("TIT_VERSION_1");
				}
			}
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

	Adaptation.prototype.formatVersionTimeStamp = function (sTimeStamp) {
		if (!sTimeStamp) {
			// in case of "Original App" and "Draft" no timestamp is set
			return "";
		}

		return DateFormat.getInstance({
			format: "yMMMdjm"
		}).format(new Date(sTimeStamp));
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

	Adaptation.prototype.versionSelected = function (oEvent) {
		var oVersionsBindingContext = oEvent.getSource().getBindingContext("versions");
		var sVersion = Version.Number.Original;

		if (oVersionsBindingContext) {
			// the original Version does not have a version binding Context
			sVersion = oVersionsBindingContext.getProperty("version");
		}

		this.fireEvent("switchVersion", {version: sVersion});
	};

	Adaptation.prototype.showVersionHistory = function (oEvent) {
		var oVersionButton = oEvent.getSource();

		if (!this.oVersionDialogPromise) {
			this.oVersionDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.VersionHistory",
				id: this.getId() + "_fragment--sapUiRta_versionHistoryDialog",
				controller: {
					formatVersionTitle: this.formatVersionTitle.bind(this),
					formatVersionTimeStamp: this.formatVersionTimeStamp.bind(this),
					formatVersionTableVisibility: this.formatVersionTableVisibility.bind(this),
					formatHighlight: this.formatHighlight.bind(this),
					formatHighlightText: this.formatHighlightText.bind(this),
					formatOriginalAppHighlight: this.formatOriginalAppHighlight.bind(this),
					formatOriginalAppHighlightText: this.formatOriginalAppHighlightText.bind(this),
					versionSelected: this.versionSelected.bind(this),
					getGroupHeaderFactory: this.getGroupHeaderFactory.bind(this)
				}
			}).then(function(oDialog) {
				oVersionButton.addDependent(oDialog);
				return oDialog;
			});
		}

		return this.oVersionDialogPromise.then(function (oVersionsDialog) {
			if (!oVersionsDialog.isOpen()) {
				oVersionsDialog.openBy(oVersionButton);
				if (this.getModel("controls").getProperty("/publishVisible")) {
					var oList = this.getControl("versionHistoryDialog--versionList");
					var oSorter = new Sorter({
						path: "isPublished",
						group: true
					});
					oList.getBinding("items").sort(oSorter);
				}
			} else {
				oVersionsDialog.close();
			}
		}.bind(this));
	};

	Adaptation.prototype.getGroupHeaderFactory = function (oGroup) {
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		return new GroupHeaderListItem({
			title: oGroup.key ? oTextResources.getText("TIT_VERSION_HISTORY_PUBLISHED") : oTextResources.getText("TIT_VERSION_HISTORY_UNPUBLISHED"),
			upperCase: false,
			visible: this.getModel("controls").getProperty("/publishVisible")
		}).addStyleClass("sapUiRtaVersionHistoryGrouping").addStyleClass("sapUiRtaVersionHistory");
	};

	Adaptation.prototype.showRestore = function (bVersioningEnabled) {
		return !bVersioningEnabled;
	};

	Adaptation.prototype._showButtonIcon = function(sButtonName, sIcon, sToolTipKey) {
		setButtonProperties.call(this, sButtonName, sIcon, "", sToolTipKey);
	};

	Adaptation.prototype._showButtonText = function(sButtonName, sTextKey) {
		setButtonProperties.call(this, sButtonName, "", sTextKey, "");
	};

	Adaptation.prototype._switchToIcons = function() {
		var oIconBox = this.getControl("iconBox");
		var oIconSpacer = this.getControl("iconSpacer");

		oIconBox.setVisible(false);
		oIconSpacer.setVisible(false);
		this._showButtonIcon("adaptationSwitcherButton", "sap-icon://wrench", "BTN_ADAPTATION");
		this._showButtonIcon("navigationSwitcherButton", "sap-icon://explorer", "BTN_NAVIGATION");
		this._showButtonIcon("visualizationSwitcherButton", "sap-icon://show", "BTN_VISUALIZATION");
		this._showButtonIcon("exit", "sap-icon://decline", "BTN_EXIT");
	};

	Adaptation.prototype._switchToTexts = function () {
		var oIconBox = this.getControl("iconBox");
		var oIconSpacer = this.getControl("iconSpacer");

		oIconBox.setVisible(true);
		oIconSpacer.setVisible(true);
		this._showButtonText("adaptationSwitcherButton", "BTN_ADAPTATION");
		this._showButtonText("navigationSwitcherButton", "BTN_NAVIGATION");
		this._showButtonText("visualizationSwitcherButton", "BTN_VISUALIZATION");
		this._showButtonText("exit", "BTN_EXIT");
	};

	Adaptation.prototype._onSizeChanged = function(mParams, bInitial) {
		if (mParams) {
			var sMode = mParams.name;
			this.sMode = sMode;

			switch (sMode) {
				case Adaptation.modes.MOBILE:
					this._switchToIcons();
					break;
				case Adaptation.modes.TABLET:
				case Adaptation.modes.DESKTOP:
					// this is already defined in the view
					if (!bInitial) {
						this._switchToTexts();
					}
					break;
				default:
				// no default
			}
		}
	};

	/**
	 * Loads and creates the Fragment of the Toolbar
	 *
	 * @returns {Promise<sap.ui.core.Control[]>} Returns the controls in a structure described above.
	 */
	Adaptation.prototype.buildControls = function () {
		return Fragment.load({
			name: "sap.ui.rta.toolbar.Adaptation",
			id: this.getId() + "_fragment",
			controller: {
				activate: this._openVersionTitleDialog.bind(this),
				discardDraft: this.eventHandler.bind(this, "DiscardDraft"),
				formatDiscardDraftVisible: this.formatDiscardDraftVisible.bind(this),
				formatPublishVersionVisibility: this.formatPublishVersionVisibility.bind(this),
				modeChange: this.eventHandler.bind(this, "ModeChange"),
				openDownloadTranslationDialog: onOpenDownloadTranslationDialog.bind(this),
				openUploadTranslationDialog: onOpenUploadTranslationDialog.bind(this),
				undo: this.eventHandler.bind(this, "Undo"),
				redo: this.eventHandler.bind(this, "Redo"),
				openChangeCategorySelectionPopover: this.eventHandler.bind(this, "OpenChangeCategorySelectionPopover"),
				manageApps: onManageAppsPressed.bind(this),
				appVariantOverview: onOverviewPressed.bind(this),
				saveAs: onSaveAsPressed.bind(this),
				formatSaveAsEnabled: formatSaveAsEnabled,
				restore: this.eventHandler.bind(this, "Restore"),
				publish: this.eventHandler.bind(this, "Transport"),
				publishVersion: this.eventHandler.bind(this, "PublishVersion"),
				exit: this.eventHandler.bind(this, "Exit"),
				formatVersionButtonText: this.formatVersionButtonText.bind(this),
				showVersionHistory: this.showVersionHistory.bind(this),
				showRestore: this.showRestore.bind(this)
			}
		});
	};

	function onOpenDownloadTranslationDialog() {
		var mPropertyBag = {
			layer: this.getRtaInformation().flexSettings.layer,
			selector: this.getRtaInformation().rootControl
		};
		this.addExtension("translation", Translation).openDownloadTranslationDialog(mPropertyBag);
	}

	function onOpenUploadTranslationDialog() {
		this.addExtension("translation", Translation).openUploadTranslationDialog();
	}

	function formatSaveAsEnabled(bGeneralSaveAsEnabled, sDisplayedVersion) {
		return bGeneralSaveAsEnabled && sDisplayedVersion !== Version.Number.Draft;
	}

	function onSaveAsPressed() {
		AppVariantFeature.onSaveAs(true, true, this.getRtaInformation().flexSettings.layer, null);
	}

	function onOverviewPressed(oEvent) {
		var oItem = oEvent.getParameter("item");
		var bTriggeredForKeyUser = oItem.getId().endsWith("keyUser");
		return AppVariantFeature.onGetOverview(bTriggeredForKeyUser, this.getRtaInformation().flexSettings.layer);
	}

	function onManageAppsPressed() {
		AppVariantFeature.onGetOverview(true, this.getRtaInformation().flexSettings.layer);
	}

	function resetDialog() {
		this.getControl("versionTitleInput").setValue("");
		this.getControl("confirmVersionTitleButton").setEnabled(false);
		return Promise.resolve(this._oDialog);
	}

	function createDialog() {
		return Fragment.load({
			name: "sap.ui.rta.toolbar.VersionTitleDialog",
			id: this.getId() + "_fragment",
			controller: {
				onConfirmVersioningDialog: function () {
					var sVersionTitle = this.getControl("versionTitleInput").getValue();
					this.fireEvent("activate", {versionTitle: sVersionTitle});
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
			oDialog.addStyleClass(Utils.getRtaStyleClassName());
			this.addDependent(this._oDialog);
		}.bind(this));
	}

	Adaptation.prototype.getControl = function(sName) {
		return sap.ui.getCore().byId(this.getId() + "_fragment--sapUiRta_" + sName);
	};

	Adaptation.prototype._openVersionTitleDialog = function (sDisplayedVersion) {
		var oDialogPromise;

		if (this._oDialog) {
			oDialogPromise = resetDialog.call(this);
		} else {
			oDialogPromise = createDialog.call(this);
		}

		return oDialogPromise.then(function () {
			var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			var sTitle = oTextResources.getText("TIT_VERSION_TITLE_DIALOG");
			if (sDisplayedVersion !== Version.Number.Draft) {
				sTitle = oTextResources.getText("TIT_REACTIVATE_VERSION_TITLE_DIALOG");
			}
			this._oDialog.setTitle(sTitle);
			return this._oDialog.open();
		}.bind(this));
	};

	Adaptation.prototype.setVersionButtonAccentColor = function (sType) {
		var oVersionButton = this.getControl("versionButton");
		switch (sType) {
			case "draft":
				oVersionButton.addStyleClass(DRAFT_ACCENT_COLOR);
				oVersionButton.removeStyleClass(ACTIVE_ACCENT_COLOR);
				break;
			case "active":
				oVersionButton.addStyleClass(ACTIVE_ACCENT_COLOR);
				oVersionButton.removeStyleClass(DRAFT_ACCENT_COLOR);
				break;
			default:
				oVersionButton.removeStyleClass(ACTIVE_ACCENT_COLOR);
				oVersionButton.removeStyleClass(DRAFT_ACCENT_COLOR);
		}
	};

	return Adaptation;
});
