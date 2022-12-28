/*!
 * ${copyright}
 */

sap.ui.define([
	"require",
	"sap/ui/core/Fragment",
	"sap/ui/core/Popup",
	"sap/ui/core/IconPool",
	"sap/ui/fl/write/api/Version",
	"sap/ui/rta/toolbar/contextBased/SaveAsAdaptation",
	"sap/ui/rta/toolbar/contextBased/ManageAdaptations",
	"sap/ui/rta/toolbar/translation/Translation",
	"sap/ui/rta/toolbar/versioning/Versioning",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/toolbar/Base",
	"sap/ui/rta/Utils",
	"sap/ui/Device",
	"./AdaptationRenderer"
], function(
	require,
	Fragment,
	Popup,
	IconPool,
	Version,
	SaveAsAdaptation,
	ManageAdaptations,
	Translation,
	Versioning,
	AppVariantFeature,
	Base,
	Utils,
	Device,
	AdaptationRenderer
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
		renderer: AdaptationRenderer,
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

	Adaptation.prototype.init = function() {
		this._pFragmentLoaded = Base.prototype.init.apply(this, arguments).then(function() {
			if (!Device.media.hasRangeSet(DEVICE_SET)) {
				Device.media.initRangeSet(DEVICE_SET, [900, 1200], "px", [Adaptation.modes.MOBILE, Adaptation.modes.TABLET, Adaptation.modes.DESKTOP]);
			}
			Device.media.attachHandler(this._onSizeChanged, this, DEVICE_SET);
		}.bind(this));

		IconPool.registerFont({
			collectionName: "BusinessSuiteInAppSymbols",
			fontFamily: "BusinessSuiteInAppSymbols",
			fontURI: require.toUrl("sap/ushell/themes/base/fonts/"),
			lazy: true
		});
	};

	Adaptation.prototype._hideElementsOnIntersection = function(aEntries) {
		if (aEntries[0].intersectionRatio === 0) {
			this._observeActionToolbarIntersection();
			return;
		}
		// Actions toolbar is no longer fully visible
		if (aEntries[0].intersectionRatio < 1) {
			if (!this._mSizeLimits.switchToIcons) {
				var iHiddenWidth = aEntries[0].boundingClientRect.width - aEntries[0].intersectionRect.width;
				this._mSizeLimits.switchToIcons = window.innerWidth + iHiddenWidth;
				this._switchToIcons();
			}
		}
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
		return this.getExtension("versioning", Versioning).formatPublishVersionVisibility(bPublishVisible, bVersioningEnabled, sDisplayedVersion, sModeSwitcher);
	};

	Adaptation.prototype.formatDiscardDraftVisible = function (sDisplayedVersion, bVersioningEnabled, sModeSwitcher) {
		return this.getExtension("versioning", Versioning).formatDiscardDraftVisible(sDisplayedVersion, bVersioningEnabled, sModeSwitcher);
	};

	Adaptation.prototype.formatVersionButtonText = function (aVersions, sDisplayedVersion) {
		return this.getExtension("versioning", Versioning).formatVersionButtonText(aVersions, sDisplayedVersion);
	};

	Adaptation.prototype.showVersionHistory = function(oEvent) {
		return this.getExtension("versioning", Versioning).showVersionHistory(oEvent);
	};

	Adaptation.prototype._openVersionTitleDialog = function (sDisplayedVersion) {
		return this.getExtension("versioning", Versioning).openActivateVersionDialog(sDisplayedVersion);
	};

	Adaptation.prototype.showActionsMenu = function(oEvent) {
		var oButton = oEvent.getSource();
		if (!this._oActionsMenuFragment) {
			return Fragment.load({
				id: this.getId() + "_actionsMenu_fragment",
				name: "sap.ui.rta.toolbar.ActionsMenu",
				controller: {
					openDownloadTranslationDialog: onOpenDownloadTranslationDialog.bind(this),
					openUploadTranslationDialog: onOpenUploadTranslationDialog.bind(this),
					manageApps: onManageAppsPressed.bind(this),
					overviewForKeyUser: onOverviewForKeyUserPressed.bind(this),
					overviewForDeveloper: onOverviewForDeveloperPressed.bind(this),
					restore: this.eventHandler.bind(this, "Restore"),
					formatSaveAsEnabled: formatSaveAsEnabled,
					saveAs: onSaveAsPressed.bind(this)
				}
			}).then(function(oMenu) {
				oMenu.addStyleClass(Utils.getRtaStyleClassName());
				this.addDependent(oMenu);
				oMenu.openBy(oButton, true, Popup.Dock.CenterTop, Popup.Dock.CenterBottom);
				this._oActionsMenuFragment = oMenu;
			}.bind(this));
		}
		this._oActionsMenuFragment.openBy(oButton, true, Popup.Dock.CenterTop, Popup.Dock.CenterBottom);
		return Promise.resolve();
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
	};

	Adaptation.prototype._switchToTexts = function () {
		var oIconBox = this.getControl("iconBox");
		var oIconSpacer = this.getControl("iconSpacer");

		oIconBox.setVisible(true);
		oIconSpacer.setVisible(true);
		this._showButtonText("adaptationSwitcherButton", "BTN_ADAPTATION");
		this._showButtonText("navigationSwitcherButton", "BTN_NAVIGATION");
		this._showButtonText("visualizationSwitcherButton", "BTN_VISUALIZATION");
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
				undo: this.eventHandler.bind(this, "Undo"),
				redo: this.eventHandler.bind(this, "Redo"),
				openChangeCategorySelectionPopover: this.eventHandler.bind(this, "OpenChangeCategorySelectionPopover"),
				saveAsAdaptation: onSaveAsAdaptation.bind(this),
				manageAdaptations: onManageAdaptations.bind(this),
				publishVersion: this.eventHandler.bind(this, "PublishVersion"),
				save: this.eventHandler.bind(this, "Save"),
				exit: this.eventHandler.bind(this, "Exit"),
				formatVersionButtonText: this.formatVersionButtonText.bind(this),
				showVersionHistory: this.showVersionHistory.bind(this),
				showActionsMenu: this.showActionsMenu.bind(this)
			}
		});
	};

	function onOpenDownloadTranslationDialog() {
		var mPropertyBag = {
			layer: this.getRtaInformation().flexSettings.layer,
			selector: this.getRtaInformation().rootControl
		};
		this.getExtension("translation", Translation).openDownloadTranslationDialog(mPropertyBag);
	}

	function onOpenUploadTranslationDialog() {
		this.getExtension("translation", Translation).openUploadTranslationDialog();
	}

	function formatSaveAsEnabled(bGeneralSaveAsEnabled, sDisplayedVersion) {
		return bGeneralSaveAsEnabled && sDisplayedVersion !== Version.Number.Draft;
	}

	function onSaveAsPressed() {
		AppVariantFeature.onSaveAs(true, true, this.getRtaInformation().flexSettings.layer, null);
	}

	function onSaveAsAdaptation() {
		this.getExtension("contextBasedSaveAs", SaveAsAdaptation).openAddAdaptationDialog(this.getRtaInformation().flexSettings.layer);
	}

	function onManageAdaptations() {
		this.getExtension("contextBasedManage", ManageAdaptations).openManageAdaptationDialog();
	}

	function onOverviewForKeyUserPressed() {
		return AppVariantFeature.onGetOverview(true, this.getRtaInformation().flexSettings.layer);
	}

	function onOverviewForDeveloperPressed() {
		return AppVariantFeature.onGetOverview(false, this.getRtaInformation().flexSettings.layer);
	}

	function onManageAppsPressed() {
		AppVariantFeature.onGetOverview(true, this.getRtaInformation().flexSettings.layer);
	}

	Adaptation.prototype.getControl = function(sName) {
		var oControl = sap.ui.getCore().byId(this.getId() + "_fragment--sapUiRta_" + sName);
		// Control is inside the ActionsMenu
		if (!oControl && this._oActionsMenuFragment) {
			oControl = sap.ui.getCore().byId(this._oActionsMenuFragment.getId().replace("sapUiRta_actions", "sapUiRta_") + sName);
		}
		return oControl;
	};

	return Adaptation;
});
