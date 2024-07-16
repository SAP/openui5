/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/m/MessageBox",
	"sap/ui/rta/Utils",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/EventBus",
	"sap/ui/core/Lib",
	"sap/base/util/uid",
	"sap/base/Log",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/_internal/connectors/LrepConnector"
], function(
	FlexUtils,
	MessageBox,
	RtaUtils,
	BusyIndicator,
	EventBus,
	Lib,
	uid,
	Log,
	PersistenceWriteAPI,
	AppVariantWriteAPI,
	ChangesWriteAPI,
	LrepConnector
) {
	"use strict";
	var AppVariantUtils = {};

	// S/4Hana Cloud Platform expects an ID of 56 characters
	var HANA_CLOUD_ID_LENGTH = 56;

	AppVariantUtils._newAppVariantId = null;

	AppVariantUtils.getManifirstSupport = function(sRunningAppId) {
		return LrepConnector.appVariant.getManifirstSupport({appId: sRunningAppId});
	};

	AppVariantUtils.getNewAppVariantId = function() {
		return AppVariantUtils._newAppVariantId;
	};

	AppVariantUtils.setNewAppVariantId = function(sNewAppVariantID) {
		AppVariantUtils._newAppVariantId = sNewAppVariantID;
	};

	AppVariantUtils.trimIdIfRequired = function(sId) {
		if (sId.length > HANA_CLOUD_ID_LENGTH) {
			var aIdStrings = sId.split(".");
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
			if (sTrimmedId[sTrimmedId.length - 1] === ".") {
				sTrimmedId = sTrimmedId + sGuidString;
			} else {
				sTrimmedId = `${sTrimmedId}.${sGuidString}`;
			}

			return this.trimIdIfRequired(sTrimmedId);
		}

		// No need of trimming -> less than 56 characters
		return sId;
	};

	AppVariantUtils.getId = function(sBaseAppID) {
		var sChangedId;
		var aIdStrings = sBaseAppID.split(".");

		if (aIdStrings[0] !== "customer") {
			aIdStrings[0] = `customer.${aIdStrings[0]}`;
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
			sChangedId = `${sChangedId}.${uid().replace(/-/g, "_")}`;
		}

		sChangedId = this.trimIdIfRequired(sChangedId);
		this.setNewAppVariantId(sChangedId);

		return sChangedId;
	};

	AppVariantUtils.createAppVariant = function(vSelector, mPropertyBag) {
		mPropertyBag.version = "1.0.0"; // Application variant version should be 1.0.0 which is expected by backend
		return AppVariantWriteAPI.saveAs(Object.assign({selector: vSelector}, mPropertyBag));
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

	AppVariantUtils.prepareTextsChange = function(sPropertyName, sPropertyValue) {
		var sComment = `New ${sPropertyName} entered by a key user via RTA tool`;
		return this.getInlineChangeInput(sPropertyValue, sComment);
	};

	AppVariantUtils.getInlineChangeInputIcon = function(sIconValue) {
		return {
			content: {
				icon: sIconValue
			}
		};
	};

	AppVariantUtils.prepareRemoveAllInboundsExceptOneChange = function(sInboundValue) {
		return {
			content: {
				inboundId: sInboundValue
			}
		};
	};

	AppVariantUtils.getInboundInfo = function(oInbounds) {
		var oInboundInfo = {};
		if (!oInbounds) {
			oInboundInfo.currentRunningInbound = "customer.savedAsAppVariant";
			oInboundInfo.addNewInboundRequired = true;
			return Promise.resolve(oInboundInfo);
		}

		return FlexUtils.getUShellService("URLParsing")
		.then(function(oURLParsingService) {
			return FlexUtils.getParsedURLHash(oURLParsingService);
		})
		.then(function(oParsedHash) {
			var aInbounds = Object.keys(oInbounds);
			var aInboundsFound = [];

			// This will only happen if app variants are created on top of app variants
			if (aInbounds.length === 1 && aInbounds[0] === "customer.savedAsAppVariant") {
				return {
					currentRunningInbound: "customer.savedAsAppVariant",
					addNewInboundRequired: false
				};
			}

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
					[oInboundInfo.currentRunningInbound] = aInboundsFound;
					oInboundInfo.addNewInboundRequired = false;
					break;
				default:
					oInboundInfo.currentRunningInbound = "customer.savedAsAppVariant";
					oInboundInfo.addNewInboundRequired = true;
					break;
			}

			return oInboundInfo;
		});
	};

	AppVariantUtils.getInboundPropertiesKey = function(sAppVariantId, sCurrentRunningInboundId, sPropertyName) {
		return `${sAppVariantId}_sap.app.crossNavigation.inbounds.${sCurrentRunningInboundId}.${sPropertyName}`;
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

	/**
	 * Collects the inbound properties and adds to the change content
	 *
	 * @param {string} sCurrentRunningInboundId - Identifier of current running inbound
	 * @param {string} sAppVariantId - App Variant Identifier
	 * @param {object} oAppVariantSpecificData - App Variant specific data (e.g. reference App Id)
	 * @returns {Promise<object>} resolving to property object containing inbound properties
	 */
	AppVariantUtils.prepareAddNewInboundChange = function(sCurrentRunningInboundId, sAppVariantId, oAppVariantSpecificData) {
		return FlexUtils.getUShellService("URLParsing")
		.then(function(oURLParsingService) {
			return FlexUtils.getParsedURLHash(oURLParsingService);
		})
		.then(function(oParsedHash) {
			var oProperty = {
				content: {
					inbound: {}
				},
				texts: {}
			};

			var sInboundTitleKey = this.getInboundPropertiesKey(oAppVariantSpecificData.referenceAppId, sCurrentRunningInboundId, "title");
			var sInboundSubTitleKey = this.getInboundPropertiesKey(oAppVariantSpecificData.referenceAppId, sCurrentRunningInboundId, "subTitle");

			// Filling change content
			oProperty.content.inbound[sCurrentRunningInboundId] = {
				semanticObject: oParsedHash.semanticObject,
				action: oParsedHash.action,
				title: `{{${sInboundTitleKey}}}`,
				subTitle: `{{${sInboundSubTitleKey}}}`,
				icon: oAppVariantSpecificData.icon,
				signature: {
					parameters: {
						"sap-appvar-id": {
							required: true,
							filter: {
								value: sAppVariantId,
								format: "plain"
							},
							launcherValue: {
								value: sAppVariantId
							}
						}
					},
					additionalParameters: "ignored"
				}
			};

			// Filling change texts
			oProperty.texts[sInboundTitleKey] = this.prepareTextsChange("title", oAppVariantSpecificData.title);
			oProperty.texts[sInboundSubTitleKey] = this.prepareTextsChange("subTitle", oAppVariantSpecificData.subTitle);

			return oProperty;
		}.bind(this));
	};

	AppVariantUtils.prepareChangeInboundChange = function(sCurrentRunningInboundId, sAppVariantId, oAppVariantSpecificData) {
		var oProperty = {
			content: {},
			texts: {}
		};

		var sInboundTitleKey = this.getInboundPropertiesKey(oAppVariantSpecificData.referenceAppId, sCurrentRunningInboundId, "title");
		var sInboundSubTitleKey = this.getInboundPropertiesKey(oAppVariantSpecificData.referenceAppId, sCurrentRunningInboundId, "subTitle");

		// Filling change content
		oProperty.content = {
			inboundId: sCurrentRunningInboundId,
			entityPropertyChange: [{
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
			}, {
				propertyPath: "title",
				operation: "UPSERT",
				propertyValue: `{{${sInboundTitleKey}}}`
			}, {
				propertyPath: "subTitle",
				operation: "UPSERT",
				propertyValue: `{{${sInboundSubTitleKey}}}`
			}, {
				propertyPath: "icon",
				operation: "UPSERT",
				propertyValue: oAppVariantSpecificData.icon
			}]
		};

		// Filling change texts
		oProperty.texts[sInboundTitleKey] = this.prepareTextsChange("title", oAppVariantSpecificData.title);
		oProperty.texts[sInboundSubTitleKey] = this.prepareTextsChange("subTitle", oAppVariantSpecificData.subTitle);

		return oProperty;
	};

	AppVariantUtils.createInlineChange = function(oPropertyChange, sInlineChangeType, vSelector) {
		var oChangeSpecificData = {
			changeType: sInlineChangeType,
			content: oPropertyChange.content
		};

		if (oPropertyChange.texts) {
			oChangeSpecificData.texts = oPropertyChange.texts;
		}

		return ChangesWriteAPI.create({changeSpecificData: oChangeSpecificData, selector: vSelector});
	};

	AppVariantUtils.addChangesToPersistence = function(aAllInlineChanges, vSelector) {
		PersistenceWriteAPI.add({
			flexObjects: aAllInlineChanges,
			selector: vSelector
		});
		return Promise.resolve();
	};

	AppVariantUtils.getTransportInput = function(sPackageName, sNameSpace, sName, sType) {
		return {
			getPackage() {
				return sPackageName;
			},
			getNamespace() {
				return sNameSpace;
			},
			getId() {
				return sName;
			},
			getDefinition() {
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

		document.execCommand("copy");
		document.body.removeChild(textArea);

		return true;
	};

	AppVariantUtils.getTextResources = function() {
		return Lib.getResourceBundleFor("sap.ui.rta");
	};

	AppVariantUtils.getText = function(sMessageKey, sText) {
		var oTextResources = this.getTextResources();
		return sText ? oTextResources.getText(sMessageKey, [sText]) : oTextResources.getText(sMessageKey);
	};

	AppVariantUtils._getErrorMessageText = function(oError) {
		var sErrorMessage;

		if (oError.messages && oError.messages.length) {
			sErrorMessage = oError.messages.map(function(oError) {
				return oError.text;
			}).join("\n");
		} else if (oError.userMessage) {
			sErrorMessage = oError.userMessage;
		} else if (oError.iamAppId) {
			sErrorMessage = `IAM App Id: ${oError.iamAppId}`;
		} else {
			sErrorMessage = oError.stack || oError.message || oError.status || oError;
		}

		return sErrorMessage;
	};

	AppVariantUtils.buildWarningInfo = function(sMessageKey, sAppVariantId) {
		let sMessage = `${AppVariantUtils.getText(sMessageKey)}\n\n`;

		if (sAppVariantId) {
			sMessage += `${AppVariantUtils.getText("MSG_APP_VARIANT_ID", sAppVariantId)}\n`;
		}

		return {
			text: sMessage,
			appVariantId: sAppVariantId,
			warning: true
		};
	};

	AppVariantUtils.buildErrorInfo = function(sMessageKey, oError, sAppVariantId) {
		var sErrorMessage = this._getErrorMessageText(oError);
		var sMessage = `${AppVariantUtils.getText(sMessageKey)}\n\n`;

		if (sAppVariantId) {
			sMessage += `${AppVariantUtils.getText("MSG_APP_VARIANT_ID", sAppVariantId)}\n`;
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

		var sMessage = `${AppVariantUtils.getText("SAVE_APP_VARIANT_SUCCESS_MESSAGE")}\n\n`;
		sMessage += AppVariantUtils.getText(`SAVE_APP_VARIANT_SUCCESS_S4HANA_${sSystemTag}_MESSAGE${sOverviewList}`, sText);

		return {
			text: sMessage,
			appVariantId: sAppVariantId,
			copyId: !bIsS4HanaCloud
		};
	};

	AppVariantUtils.buildFinalSuccessInfoS4HANACloud = function() {
		var sMessage = AppVariantUtils.getText("MSG_SAVE_APP_VARIANT_NEW_TILE_AVAILABLE");
		return { text: sMessage	};
	};

	AppVariantUtils.buildDeleteSuccessMessage = function(sAppVariantId, bIsS4HanaCloud) {
		var sMessageTitle = bIsS4HanaCloud ? "DELETE_APP_VARIANT_SUCCESS_MESSAGE_CLOUD" : "DELETE_APP_VARIANT_SUCCESS_MESSAGE";
		var sMessage = AppVariantUtils.getText(sMessageTitle, sAppVariantId);
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
			var fnCallback = function(sAction) {
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
				} else if (oInfo.error || oInfo.warning) {
					// Error: Deletion/Creation failed => Close or CopyID & Close
					reject(oInfo.error || oInfo.warning);
				} else {
					resolve();
				}
			};
			let oIcon = MessageBox.Icon.NONE;
			if (bSuccessful || oInfo.deleteAppVariant) {
				oIcon = MessageBox.Icon.INFORMATION;
			} else if (oInfo.warning) {
				oIcon = MessageBox.Icon.WARNING;
			} else {
				oIcon = MessageBox.Icon.ERROR;
			}
			MessageBox.show(oInfo.text, {
				icon: oIcon,
				onClose: fnCallback,
				title: sTitle,
				actions: aActions,
				styleClass: RtaUtils.getRtaStyleClassName()
			});
		});
	};

	AppVariantUtils.closeOverviewDialog = function() {
		EventBus.getInstance().publish("sap.ui.rta.appVariant.manageApps.controller.ManageApps", "navigate");
	};

	/**
	 * Navigates to the Fiorilaunchpad
	 * @returns {Promise} resolving when the navigation is triggered if ushell is available
	 */
	AppVariantUtils.navigateToFLPHomepage = function() {
		var oUshellContainer = FlexUtils.getUshellContainer();
		var oComponentInstance;
		if (oUshellContainer) {
			return oUshellContainer.getServiceAsync("AppLifeCycle")
			.then(function(oAppConfiguration) {
				var oApplication = oAppConfiguration.getCurrentApplication();
				oComponentInstance = oApplication.componentInstance;
				if (oComponentInstance) {
					return oUshellContainer.getServiceAsync("Navigation");
				}
				return undefined;
			})
			.then(function(oCrossAppNav) {
				if (oCrossAppNav && oCrossAppNav.navigate) {
					oCrossAppNav.navigate({target: {shellHash: "#"}}, oComponentInstance);
				}
			})
			.catch(function(vError) {
				throw new Error(`Error navigating to FLP Homepage: ${vError}`);
			});
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

	AppVariantUtils.handleBeforeUnloadEvent = function() {
		return AppVariantUtils.getText("MSG_DO_NOT_CLOSE_BROWSER");
	};

	AppVariantUtils.showMessage = function(sMessageKey) {
		var sMessage = AppVariantUtils.getText(sMessageKey);
		var oInfo = { text: sMessage, copyId: false};
		return AppVariantUtils.showRelevantDialog(oInfo, true);
	};

	AppVariantUtils.catchErrorDialog = function(oError, sMessageKey, sIAMId) {
		BusyIndicator.hide();
		var oErrorInfo = AppVariantUtils.buildErrorInfo(sMessageKey, oError, sIAMId);
		return AppVariantUtils.showRelevantDialog(oErrorInfo, false);
	};

	return AppVariantUtils;
});