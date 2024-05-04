/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/security/encodeXML",
	"sap/m/GroupHeaderListItem",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Fragment",
	"sap/ui/core/library",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/model/Sorter",
	"sap/ui/rta/Utils"
], function(
	encodeXML,
	GroupHeaderListItem,
	ManagedObject,
	DateFormat,
	Fragment,
	coreLibrary,
	Version,
	Sorter,
	Utils
) {
	"use strict";

	var {MessageType} = coreLibrary;
	var DRAFT_ACCENT_COLOR = "sapUiRtaDraftVersionAccent";
	var ACTIVE_ACCENT_COLOR = "sapUiRtaActiveVersionAccent";

	/**
	 * Controller for the <code>sap.ui.rta.toolbar.versioning.Versioning</code> controls.
	 * Contains implementation of versioning functionality.
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.103
	 * @alias sap.ui.rta.toolbar.versioning.Versioning
	 */
	var Versioning = ManagedObject.extend("sap.ui.rta.toolbar.versioning.Versioning", {
		metadata: {
			properties: {
				toolbar: {
					type: "any" // "sap.ui.rta.toolbar.Base"
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			ManagedObject.prototype.constructor.apply(this, aArgs);
			this.oTextResources = this.getToolbar().getTextResources();
		}
	});

	function versionSelected(oEvent) {
		var oVersionsBindingContext = oEvent.getSource().getBindingContext("versions");
		var sVersion = Version.Number.Original;

		if (oVersionsBindingContext) {
			// the original Version does not have a version binding Context
			sVersion = oVersionsBindingContext.getProperty("version");
		}

		this.getToolbar().fireEvent("switchVersion", {version: sVersion});
	}

	function doesActiveVersionExists(aVersions) {
		return aVersions.some(function(oVersion) {
			return oVersion.type === Version.Type.Active;
		});
	}

	// ------ formatting ------
	function formatOriginalAppHighlight(aVersions) {
		return doesActiveVersionExists(aVersions) ? MessageType.None : MessageType.Success;
	}

	function formatOriginalAppHighlightText(aVersions) {
		return doesActiveVersionExists(aVersions) ? this.oTextResources.getText("LBL_INACTIVE") : this.oTextResources.getText("LBL_ACTIVE");
	}

	function formatHighlight(sType) {
		switch (sType) {
			case Version.Type.Draft:
				return MessageType.Warning;
			case Version.Type.Active:
				return MessageType.Success;
			default:
				return MessageType.None;
		}
	}

	function formatHighlightText(sType) {
		switch (sType) {
			case Version.Type.Draft:
				return this.oTextResources.getText("TIT_DRAFT");
			case Version.Type.Active:
				return this.oTextResources.getText("LBL_ACTIVE");
			default:
				return this.oTextResources.getText("LBL_INACTIVE");
		}
	}

	function formatVersionTitle(sTitle, sType) {
		if (sType === Version.Type.Draft) {
			return this.oTextResources.getText("TIT_DRAFT");
		}
		// Version title is a string and should be displayed exactly the same as what the keyuser entered
		// The back end do not encoded it but the FeedListItem supports text with html formatted tags
		// So it need to be encoded before passing to control to make sure it is displayed correctly
		// In addition, it also helps to avoid XSS security thread
		return sTitle ? encodeXML(sTitle) : this.oTextResources.getText("TIT_VERSION_1");
	}

	function formatVersionTimeStamp(sActivatedAtTimeStamp, sImportedAtTimeStamp) {
		var sTimeStamp = sImportedAtTimeStamp || sActivatedAtTimeStamp;

		if (!sTimeStamp) {
			// in case of "Original App" and "Draft" no timestamp is set
			return "";
		}
		if (sTimeStamp.indexOf("Z") === -1) {
			sTimeStamp = `${sTimeStamp}Z`;
		}
		return DateFormat.getInstance({
			format: "yMMMdjm"
		}).format(new Date(sTimeStamp));
	}

	function getGroupHeaderFactory(oGroup) {
		return new GroupHeaderListItem({
			title: oGroup.key
				? this.oTextResources.getText("TIT_VERSION_HISTORY_PUBLISHED")
				: this.oTextResources.getText("TIT_VERSION_HISTORY_UNPUBLISHED"),
			visible: this.getToolbar().getModel("versions").getProperty("/publishVersionVisible")
		}).addStyleClass("sapUiRtaVersionHistoryGrouping").addStyleClass("sapUiRtaVersionHistory");
	}

	function setVersionButtonAccentColor(oVersionButton, sType) {
		switch (sType) {
			case Version.Type.Draft:
				oVersionButton.addStyleClass(DRAFT_ACCENT_COLOR);
				oVersionButton.removeStyleClass(ACTIVE_ACCENT_COLOR);
				break;
			case Version.Type.Active:
				oVersionButton.addStyleClass(ACTIVE_ACCENT_COLOR);
				oVersionButton.removeStyleClass(DRAFT_ACCENT_COLOR);
				break;
			default:
				oVersionButton.removeStyleClass(ACTIVE_ACCENT_COLOR);
				oVersionButton.removeStyleClass(DRAFT_ACCENT_COLOR);
		}
	}

	Versioning.prototype.formatVersionButtonText = function(aVersions, sDisplayedVersion) {
		var sText = "";
		var sType = "Active";
		aVersions ||= [];

		if (sDisplayedVersion === undefined || sDisplayedVersion === Version.Number.Original) {
			sText = this.oTextResources.getText("TIT_ORIGINAL_APP");
			sType = Version.Type.Inactive;
			if (aVersions.length === 0 || (aVersions.length === 1 && aVersions[0].type === Version.Type.Draft)) {
				sType = Version.Type.Active;
			}
		} else {
			var oDisplayedVersion = aVersions.find(function(oVersion) {
				return oVersion.version === sDisplayedVersion;
			});
			if (oDisplayedVersion) {
				sType = oDisplayedVersion.type;
				if (sDisplayedVersion === Version.Number.Draft) {
					sText = this.oTextResources.getText("TIT_DRAFT");
				} else {
					sText = oDisplayedVersion.title || this.oTextResources.getText("TIT_VERSION_1");
				}
			}
		}
		setVersionButtonAccentColor(this.getToolbar().getControl("versionButton"), sType);
		return sText;
	};

	Versioning.prototype.formatPublishVersionVisibility = function(bPublishVisible, bVersioningEnabled, sDisplayedVersion, sModeSwitcher) {
		return bPublishVisible && bVersioningEnabled && sDisplayedVersion !== Version.Number.Draft && sModeSwitcher === "adaptation";
	};

	Versioning.prototype.formatDiscardDraftVisible = function(sDisplayedVersion, bVersioningEnabled, sModeSwitcher) {
		return sDisplayedVersion === Version.Number.Draft && bVersioningEnabled && sModeSwitcher === "adaptation";
	};

	// ------ Dialog handling ------
	Versioning.prototype.showVersionHistory = function(oEvent) {
		var oVersionButton = oEvent.getSource();

		this._oVersionHistoryDialogPromise ||= Fragment.load({
			name: "sap.ui.rta.toolbar.versioning.VersionHistory",
			id: `${this.getToolbar().getId()}_fragment--sapUiRta_versionHistoryDialog`,
			controller: {
				formatVersionTitle: formatVersionTitle.bind(this),
				formatVersionTimeStamp,
				formatHighlight,
				formatHighlightText: formatHighlightText.bind(this),
				formatOriginalAppHighlight,
				formatOriginalAppHighlightText: formatOriginalAppHighlightText.bind(this),
				versionSelected: versionSelected.bind(this),
				getGroupHeaderFactory: getGroupHeaderFactory.bind(this)
			}
		}).then(function(oDialog) {
			this.getToolbar().addDependent(oDialog);
			return oDialog;
		}.bind(this));

		return this._oVersionHistoryDialogPromise.then(function(oVersionsDialog) {
			if (!oVersionsDialog.isOpen()) {
				oVersionsDialog.openBy(oVersionButton);
				if (this.getToolbar().getModel("versions").getProperty("/publishVersionVisible")) {
					var oList = this.getToolbar().getControl("versionHistoryDialog--versionList");
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

	Versioning.prototype.openActivateVersionDialog = function(sDisplayedVersion) {
		if (!this._oActivateVersionDialogPromise) {
			this._oActivateVersionDialogPromise = Fragment.load({
				name: "sap.ui.rta.toolbar.versioning.VersionTitleDialog",
				id: `${this.getToolbar().getId()}_fragment--sapUiRta_activateVersionDialog`,
				controller: {
					onConfirmVersioningDialog: function() {
						var sVersionTitle = this.getToolbar().getControl("activateVersionDialog--versionTitleInput").getValue();
						if (sVersionTitle.length > 0) {
							this.getToolbar().fireEvent("activate", {versionTitle: sVersionTitle});
							this._oActivateVersionDialog.close();
						}
					}.bind(this),
					onCancelVersioningDialog: function() {
						this._oActivateVersionDialog.close();
					}.bind(this),
					onVersionTitleLiveChange: function(oEvent) {
						var sValue = oEvent.getParameter("value");
						this.getToolbar().getControl("activateVersionDialog--confirmVersionTitleButton").setEnabled(!!sValue);
					}.bind(this)
				}
			}).then(function(oDialog) {
				this._oActivateVersionDialog = oDialog;
				oDialog.addStyleClass(Utils.getRtaStyleClassName());
				this.getToolbar().addDependent(this._oActivateVersionDialog);
			}.bind(this));
		} else {
			this.getToolbar().getControl("activateVersionDialog--versionTitleInput").setValue("");
			this.getToolbar().getControl("activateVersionDialog--confirmVersionTitleButton").setEnabled(false);
		}

		return this._oActivateVersionDialogPromise.then(function() {
			var sTitle = this.oTextResources.getText("TIT_VERSION_TITLE_DIALOG");
			if (sDisplayedVersion !== Version.Number.Draft) {
				sTitle = this.oTextResources.getText("TIT_REACTIVATE_VERSION_TITLE_DIALOG");
			}
			this._oActivateVersionDialog.setTitle(sTitle);
			return this._oActivateVersionDialog.open();
		}.bind(this));
	};

	return Versioning;
});