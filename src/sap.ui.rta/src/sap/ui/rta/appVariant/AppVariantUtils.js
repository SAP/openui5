/*!
 * ${copyright}
 */

 /* global XMLHttpRequest */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/m/MessageBox",
	"sap/ui/rta/Utils",
	"sap/ui/core/BusyIndicator",
	"sap/base/util/uid",
	"sap/base/Log",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI"
],
function(
	FlexUtils,
	MessageBox,
	RtaUtils,
	BusyIndicator,
	uid,
	Log,
	PersistenceWriteAPI,
	AppVariantWriteAPI,
	ChangesWriteAPI
) {
	"use strict";
	var AppVariantUtils = {};

	// S/4Hana Cloud Platform expects an ID of 56 characters
	var HANA_CLOUD_ID_LENGTH = 56;

	AppVariantUtils._newAppVariantId = null;

	AppVariantUtils.getManifirstSupport = function(sRunningAppId) {
		var sManifirstUrl = '/sap/bc/ui2/app_index/ui5_app_mani_first_supported/?id=' + sRunningAppId;

		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", sManifirstUrl);
			xhr.send();

			xhr.onload = function() {
				if (xhr.status >= 200 && xhr.status < 400) {
					resolve(xhr.response);
				} else {
					reject({
						status : xhr.status,
						message : xhr.statusText
					});
				}
			};
		});
	};

	AppVariantUtils.isStandAloneApp = function() {
		if (sap.ushell_abap) {
			return false;
		}
		return true;
	};

	AppVariantUtils.getNewAppVariantId = function() {
		return AppVariantUtils._newAppVariantId;
	};

	AppVariantUtils.setNewAppVariantId = function(sNewAppVariantID) {
		AppVariantUtils._newAppVariantId = sNewAppVariantID;
	};

	AppVariantUtils.trimIdIfRequired = function(sId) {
		if (sId.length > HANA_CLOUD_ID_LENGTH) {
			var aIdStrings = sId.split('.');
			var sTrimmedId;
			var sGuidLength = aIdStrings[aIdStrings.length - 1].length;
			var sGuidString = aIdStrings.pop();
			sTrimmedId = aIdStrings.join(".");

			if (sTrimmedId.length > sGuidLength) {
				// If the length of GUID is smaller than the length of rest of the id(without GUID), then trim the rest of id with the length of GUID starting from right to left
				sTrimmedId = sTrimmedId.substring(0, sTrimmedId.length - sGuidLength);
			} else {
				// If the length of GUID is longer than the length of rest of the id(without GUID), then just trim the GUID so that the whole id length remains 56 characters
				return sId.substr(0, HANA_CLOUD_ID_LENGTH);
			}

			// After adjusting the id, if the last character of string has period '.', just append the guid string otherwise append period '.' in between
			if (sTrimmedId[sTrimmedId.length - 1] === '.') {
				sTrimmedId = sTrimmedId + sGuidString;
			} else {
				sTrimmedId = sTrimmedId + "." + sGuidString;
			}

			return this.trimIdIfRequired(sTrimmedId);
		}

		// No need of trimming -> less than 56 characters
		return sId;
	};

	AppVariantUtils.getId = function(sBaseAppID) {
		var sChangedId;
		var aIdStrings = sBaseAppID.split('.');

		if (aIdStrings[0] !== "customer") {
			aIdStrings[0] = "customer." + aIdStrings[0];
		}

		var bRegFound = false;
		var regex = /^id.*/i;

		aIdStrings.forEach(function(sString, index, array) {
			if (sString.match(regex)) {
				sString = sString.replace(regex, uid().replace(/-/g, "_"));
				array[index] = sString;
				bRegFound = true;
			}
		});

		sChangedId = aIdStrings.join(".");
		if (!bRegFound) {
			sChangedId = sChangedId + "." + uid().replace(/-/g, "_");
		}

		sChangedId = this.trimIdIfRequired(sChangedId);
		this.setNewAppVariantId(sChangedId);

		return sChangedId;
	};

	AppVariantUtils.createAppVariant = function(oRootControl, mPropertyBag) {
		mPropertyBag.version = "1.0.0"; // Application variant version should be 1.0.0 which is expected by backend
		return AppVariantWriteAPI.saveAs(Object.assign({selector: oRootControl}, mPropertyBag));
	};

	AppVariantUtils.getInlineChangeInput = function(sValue, sComment) {
		return {
			type: "XTIT",
			maxLength: 50,
			comment: sComment,
			value: {
				"": sValue
			}
		};
	};

	AppVariantUtils.getInlinePropertyChange = function(sPropertyName, sPropertyValue) {
		var sComment = "New " + sPropertyName + " entered by a key user via RTA tool";
		return this.getInlineChangeInput(sPropertyValue, sComment);
	};

	AppVariantUtils.getInlineChangeInputIcon = function(sIconValue) {
		return {
			icon: sIconValue
		};
	};

	AppVariantUtils.getInlineChangeRemoveInbounds = function(sInboundValue) {
		return {
			inboundId: sInboundValue
		};
	};

	AppVariantUtils.getInboundInfo = function(oInbounds) {
		var oInboundInfo = {};
		if (!oInbounds) {
			oInboundInfo.currentRunningInbound = "customer.savedAsAppVariant";
			oInboundInfo.addNewInboundRequired = true;
			return oInboundInfo;
		}

		var oParsedHash = FlexUtils.getParsedURLHash();
		var aInbounds = Object.keys(oInbounds);
		var aInboundsFound = [];

		aInbounds.forEach(function(sInboundId) {
			if ((oInbounds[sInboundId].action === oParsedHash.action) && (oInbounds[sInboundId].semanticObject === oParsedHash.semanticObject)) {
				aInboundsFound.push(sInboundId);
			}
		});

		switch (aInboundsFound.length) {
			case 0:
				oInboundInfo.currentRunningInbound = "customer.savedAsAppVariant";
				oInboundInfo.addNewInboundRequired = true;
				break;
			case 1:
				oInboundInfo.currentRunningInbound = aInboundsFound[0];
				oInboundInfo.addNewInboundRequired = false;
				break;
			default:
				oInboundInfo = undefined;
				break;
		}

		return oInboundInfo;
	};

	AppVariantUtils.getInboundPropertiesKey = function(sAppVariantId, sCurrentRunningInboundId, sPropertyName) {
		return sAppVariantId + "_sap.app.crossNavigation.inbounds." + sCurrentRunningInboundId + "." + sPropertyName;
	};

	AppVariantUtils.getInlineChangesForInboundProperties = function(sCurrentRunningInboundId, sReferenceAppId, sPropertyName, sPropertyValue) {
		var oChangeInput = {
			inboundId: sCurrentRunningInboundId,
			entityPropertyChange: {
				propertyPath: sPropertyName,
				operation: "UPSERT",
				propertyValue: {}
			},
			texts: {}
		};

		if (sPropertyName === "title" || sPropertyName === "subTitle") {
			var sKey = this.getInboundPropertiesKey(sReferenceAppId, sCurrentRunningInboundId, sPropertyName);
			oChangeInput.entityPropertyChange.propertyValue = "{{" + sKey + "}}";
			oChangeInput.texts[sKey] = this.getInlinePropertyChange(sPropertyName, sPropertyValue);
		} else if (sPropertyName === "icon") {
			oChangeInput.entityPropertyChange.propertyValue = sPropertyValue;
		}

		return oChangeInput;
	};

	AppVariantUtils.getInlineChangeForInboundPropertySaveAs = function(sCurrentRunningInboundId, sAppVariantId) {
		return {
			inboundId: sCurrentRunningInboundId,
			entityPropertyChange: {
				propertyPath: "signature/parameters/sap-appvar-id",
				operation: "UPSERT",
				propertyValue: {
					required: true,
					filter: {
						value: sAppVariantId,
						format: "plain"
					},
					launcherValue: {
						value: sAppVariantId
					}
				}
			}
		};
	};

	AppVariantUtils.getInlineChangeCreateInbound = function(sCurrentRunningInboundId) {
		var oParsedHash = FlexUtils.getParsedURLHash();
		var oProperty = {
			inbound: {}
		};

		oProperty.inbound[sCurrentRunningInboundId] = {
			semanticObject: oParsedHash.semanticObject,
			action: oParsedHash.action
		};

		return oProperty;
	};

	AppVariantUtils.createInlineChange = function(oContent, sInlineChangeType, oRootControl) {
		var oChangeSpecificData = {
			changeType: sInlineChangeType,
			content: oContent
		};
		//This API is not standard and content has to be adjusted
		if (oChangeSpecificData.content.texts) {
			oChangeSpecificData.texts = oChangeSpecificData.content.texts;
			delete oChangeSpecificData.content.texts;
		}
		return ChangesWriteAPI.create({changeSpecificData: oChangeSpecificData, selector: oRootControl});
	};

	AppVariantUtils.addChangesToPersistence = function(aAllInlineChanges, oRootControl) {
		aAllInlineChanges.forEach(function(oChange) {
			return PersistenceWriteAPI.add({
				change: oChange,
				selector: oRootControl
			});
		});

		return Promise.resolve();
	};

	AppVariantUtils.getTransportInput = function(sPackageName, sNameSpace, sName, sType) {
		return {
			getPackage : function() {
				return sPackageName;
			},
			getNamespace : function() {
				return sNameSpace;
			},
			getId : function() {
				return sName;
			},
			getDefinition : function() {
				return {
					fileType: sType
				};
			}
		};
	};

	AppVariantUtils.triggerCatalogAssignment = function(sAppVariantId, sLayer, sReferenceAppId) {
		return AppVariantWriteAPI.assignCatalogs({
			selector: {
				appId: sAppVariantId
			},
			action: "assignCatalogs",
			assignFromAppId: sReferenceAppId,
			layer: sLayer
		});
	};

	AppVariantUtils.triggerCatalogUnAssignment = function(sAppVariantId, sLayer) {
		return AppVariantWriteAPI.unassignCatalogs({
			selector: {
				appId: sAppVariantId
			},
			action: "unassignCatalogs",
			layer: sLayer
		});
	};

	AppVariantUtils.isS4HanaCloud = function(oSettings) {
		return oSettings.isAtoEnabled() && oSettings.isAtoAvailable();
	};

	AppVariantUtils.copyId = function(sId) {
		var textArea = document.createElement("textarea");
		textArea.value = sId;
		document.body.appendChild(textArea);
		textArea.select();

		document.execCommand('copy');
		document.body.removeChild(textArea);

		return true;
	};

	AppVariantUtils.getTextResources = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	};

	AppVariantUtils.getText = function(sMessageKey, sText) {
		var oTextResources = this.getTextResources();
		return sText ? oTextResources.getText(sMessageKey, sText) : oTextResources.getText(sMessageKey);
	};

	AppVariantUtils._getErrorMessageText = function(oError) {
		var sErrorMessage;

		if (oError.messages && oError.messages.length) {
			sErrorMessage = oError.messages.map(function(oError) {
				return oError.text;
			}).join("\n");
		} else if (oError.iamAppId) {
			sErrorMessage = "IAM App Id: " + oError.iamAppId;
		} else {
			sErrorMessage = oError.stack || oError.message || oError.status || oError;
		}

		return sErrorMessage;
	};

	AppVariantUtils.buildErrorInfo = function(sMessageKey, oError, sAppVariantId) {
		var sErrorMessage = this._getErrorMessageText(oError);
		var sMessage = AppVariantUtils.getText(sMessageKey) + "\n\n";

		if (sAppVariantId) {
			sMessage += AppVariantUtils.getText("MSG_APP_VARIANT_ID", sAppVariantId) + "\n";
		}

		sMessage += AppVariantUtils.getText("MSG_TECHNICAL_ERROR", sErrorMessage);
		Log.error("App variant error: ", sErrorMessage);

		return {
			text: sMessage,
			appVariantId: sAppVariantId,
			error: true
		};
	};

	/**
	 * Builds the success message text based on different platforms (i.e. S/4HANA Cloud and S/4HANA on Premise)
	 * and based on from where the 'Save As' is triggered.
	 */
	AppVariantUtils.buildSuccessInfo = function(sAppVariantId, bSaveAsTriggeredFromRtaToolbar, bIsS4HanaCloud) {
		var sSystemTag = bIsS4HanaCloud ? "CLOUD" : "ON_PREMISE";
		var sOverviewList = bSaveAsTriggeredFromRtaToolbar ? "" : "_OVERVIEW_LIST";
		var sText = bIsS4HanaCloud ? undefined : sAppVariantId;

		var sMessage = AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE") + "\n\n";
		sMessage += AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_S4HANA_" + sSystemTag + "_MESSAGE" + sOverviewList, sText);

		return {
			text: sMessage,
			appVariantId: sAppVariantId,
			copyId : !bIsS4HanaCloud
		};
	};

	/**
	 * Builds the final success message on S/4HANA Cloud.
	 */
	AppVariantUtils.buildFinalSuccessInfoS4HANACloud = function() {
		var sMessage = AppVariantUtils.getText("MSG_SAVE_APP_VARIANT_NEW_TILE_AVAILABLE");
		return { text: sMessage	};
	};

	AppVariantUtils.buildDeleteSuccessMessage = function(sAppVariantId) {
		var sMessage = AppVariantUtils.getText("DELETE_APP_VARIANT_SUCCESS_MESSAGE", sAppVariantId);
		return { text: sMessage	};
	};

	AppVariantUtils.showRelevantDialog = function(oInfo, bSuccessful) {
		BusyIndicator.hide();
		var sTitle;
		var sRightButtonText;
		var sOKButtonText;
		var sCopyIdButtonText;
		var aActions = [];

		if (bSuccessful) {
			sTitle = this.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE_TITLE");
			sRightButtonText = this.getText("SAVE_APP_VARIANT_OK_TEXT");
		} else {
			sTitle = this.getText("HEADER_SAVE_APP_VARIANT_FAILED");
			sRightButtonText = this.getText("SAVE_APP_VARIANT_CLOSE_TEXT");
		}

		if (oInfo && oInfo.copyId) {
			sCopyIdButtonText = this.getText("SAVE_APP_VARIANT_COPY_ID_TEXT");
			aActions.push(sCopyIdButtonText);
		} else if (oInfo && oInfo.deleteAppVariant) {
			sTitle = this.getText("DELETE_APP_VARIANT_INFO_MESSAGE_TITLE");
			sOKButtonText = this.getText("DELETE_APP_VARIANT_OK_TEXT");
			aActions.push(sOKButtonText);
			sRightButtonText = this.getText("DELETE_APP_VARIANT_CLOSE_TEXT");
		}

		aActions.push(sRightButtonText);

		return new Promise(function(resolve, reject) {
			var fnCallback = function (sAction) {
				if (sAction === sCopyIdButtonText) {
					AppVariantUtils.copyId(oInfo.appVariantId);
				}

				if (bSuccessful) {
					// The new app variant was saved... OK or CopyID & Close
					resolve();
				} else if (oInfo.overviewDialog) {
					// ErrorInfo - Sorry, ... is temporarily not available. => Close
					resolve(false);
				} else if (oInfo.deleteAppVariant && sAction === sOKButtonText) {
					// Do you really want to delete this app? => OK
					resolve();
				} else if (oInfo.deleteAppVariant && sAction === sRightButtonText) {
					// Do you really want to delete this app? => Close
					reject(oInfo.deleteAppVariant);
				} else if (oInfo.error) {
					// Error: Deletion/Creation failed => Close or CopyID & Close
					reject(oInfo.error);
				} else {
					resolve();
				}
			};

			MessageBox.show(oInfo.text, {
				icon: (bSuccessful || oInfo.deleteAppVariant) ? MessageBox.Icon.INFORMATION : MessageBox.Icon.ERROR,
				onClose : fnCallback,
				title: sTitle,
				actions: aActions,
				styleClass: RtaUtils.getRtaStyleClassName()
			});
		});
	};

	AppVariantUtils.closeOverviewDialog = function() {
		sap.ui.getCore().getEventBus().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");
	};

	/**
	 * Navigates to the Fiorilaunchpad
	 */
	AppVariantUtils.navigateToFLPHomepage = function() {
		var oApplication = sap.ushell.services.AppConfiguration.getCurrentApplication();
		var oComponentInstance = oApplication.componentHandle.getInstance();

		if (oComponentInstance) {
			var oUshellContainer = FlexUtils.getUshellContainer();
			var oCrossAppNav = oUshellContainer && oUshellContainer.getService("CrossApplicationNavigation");
			if (oCrossAppNav && oCrossAppNav.toExternal) {
				oCrossAppNav.toExternal({target: {shellHash: "#"}}, oComponentInstance);
			}
		}

		return Promise.resolve();
	};

	AppVariantUtils.deleteAppVariant = function(vSelector, sLayer) {
		BusyIndicator.hide();
		return AppVariantWriteAPI.deleteAppVariant({
			selector: vSelector,
			layer: sLayer
		});
	};

	AppVariantUtils.handleBeforeUnloadEvent = function () {
		// oEvent.preventDefault();
		var sMessage = AppVariantUtils.getText("MSG_DO_NOT_CLOSE_BROWSER");
		return sMessage;
	};

	AppVariantUtils.showMessage = function(sMessageKey) {
		var sMessage = AppVariantUtils.getText(sMessageKey);
		var oInfo = { text: sMessage, copyId : false};
		return AppVariantUtils.showRelevantDialog(oInfo, true);
	};

	AppVariantUtils.catchErrorDialog = function(oError, sMessageKey, sIAMId) {
		BusyIndicator.hide();
		var oErrorInfo = AppVariantUtils.buildErrorInfo(sMessageKey, oError, sIAMId);
		return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
	};

	return AppVariantUtils;
}, /* bExport= */true);