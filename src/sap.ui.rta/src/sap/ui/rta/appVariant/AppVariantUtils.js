/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/Utils",
	"sap/m/MessageBox",
	"sap/ui/rta/Utils"],
	function(
		DescriptorVariantFactory,
		DescriptorInlineChangeFactory,
		LrepConnector,
		FlexUtils,
		MessageBox,
		RtaUtils) {

		"use strict";
		var AppVariantUtils = {};

		// S/4 Hana expects us to pass an ID of 56 characters
		var HANA_CLOUD_ID_LENGTH = 56;

		AppVariantUtils.newAppVariantId = "";

		AppVariantUtils.getManifirstSupport = function(sRunningAppId) {
	        var sRoute = '/sap/bc/ui2/app_index/ui5_app_mani_first_supported/?id=' + sRunningAppId;
			var oLREPConnector = LrepConnector.createConnector();
			return oLREPConnector.send(sRoute, 'GET');
		};

		AppVariantUtils.isStandAloneApp = function() {
			if (sap.ushell_abap) {
				return false;
			} else {
				return true;
			}
		};

		AppVariantUtils.getNewAppVariantId = function() {
			return AppVariantUtils.newAppVariantId;
		};

		AppVariantUtils.setNewAppVariantId = function(sNewAppVariantID) {
			AppVariantUtils.newAppVariantId = sNewAppVariantID;
		};

		AppVariantUtils.trimIdIfRequired = function(sId) {
			return sId.substr(0, HANA_CLOUD_ID_LENGTH);
		};

		AppVariantUtils.getId = function(sBaseAppID) {
			var sChangedId;
			var aIdStrings = sBaseAppID.split('.');

			if (aIdStrings[0] !== "customer") {
				aIdStrings[0] = "customer." + aIdStrings[0];
			}

			var bRegFound = false;
			aIdStrings.forEach(function(sString, index, array) {
				var regex = /^id.*/i;
				if (sString.match(regex)) {
					sString = sString.replace(regex, jQuery.sap.uid().replace(/-/g, "_"));
					array[index] = sString;
					bRegFound = true;
				}
			});

			sChangedId = aIdStrings.join(".");
			if (!bRegFound) {
				sChangedId = sChangedId + "." + jQuery.sap.uid().replace(/-/g, "_");
			}

			sChangedId = this.trimIdIfRequired(sChangedId);
			this.setNewAppVariantId(sChangedId);

			return sChangedId;
		};

		AppVariantUtils.createDescriptorVariant = function(mParameters){
			mParameters.layer = FlexUtils.getCurrentLayer(false);
			return DescriptorVariantFactory.createNew(mParameters);
		};

		AppVariantUtils.getInlineChangeInput = function(sValue, sComment){
			return {
				"type": "XTIT",
				"maxLength": 50,
				"comment": sComment,
				"value": {
					"": sValue
				}
			};
		};

		AppVariantUtils.getInlinePropertyChange = function(sPropertyName, sPropertyValue){
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
				"inboundId": sInboundValue
			};
		};

		AppVariantUtils.getURLParsedHash = function() {
			var oURLParser = sap.ushell.Container.getService("URLParsing");
			if (oURLParser.parseShellHash && oURLParser.getHash){
				return oURLParser.parseShellHash(oURLParser.getHash(window.location.href));
			}
		};

		AppVariantUtils.getInboundInfo = function(oInbounds) {
			var oInboundInfo = {};
			var oParsedHash = this.getURLParsedHash();
			var aInbounds = Object.keys(oInbounds);
			var aInboundsFound = [];

			if (aInbounds.length) {
				aInbounds.forEach(function(sInboundId) {
					if ((oInbounds[sInboundId].action === oParsedHash.action) && (oInbounds[sInboundId].semanticObject === oParsedHash.semanticObject)) {
						aInboundsFound.push(sInboundId);
					}
				});
			}

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

		AppVariantUtils.getInlineChangesForInboundProperties = function(sCurrentRunningInboundId, sAppVariantId, sPropertyName, sPropertyValue) {
			var oChangeInput = {
				"inboundId": sCurrentRunningInboundId,
				"entityPropertyChange": {
					"propertyPath": sPropertyName,
					"operation": "UPSERT",
					"propertyValue": {}
				},
				"texts": {}
			};

			if (sPropertyName === "title" || sPropertyName === "subTitle") {
				var sKey = this.getInboundPropertiesKey(sAppVariantId, sCurrentRunningInboundId, sPropertyName);
				oChangeInput.entityPropertyChange.propertyValue = "{{" + sKey + "}}";
				oChangeInput.texts[sKey] = this.getInlinePropertyChange(sPropertyName, sPropertyValue);
			} else if (sPropertyName === "icon") {
				oChangeInput.entityPropertyChange.propertyValue = sPropertyValue;
			}

			return oChangeInput;
		};

		AppVariantUtils.getInlineChangeForInboundPropertySaveAs = function(sCurrentRunningInboundId) {
			return {
				"inboundId": sCurrentRunningInboundId,
				"entityPropertyChange": {
					"propertyPath": "signature/parameters/sap-appvar-id",
					"operation": "UPSERT",
					"propertyValue": {
						"required": true,
						"filter": {
							"value": this.getNewAppVariantId(),
							"format": "plain"
						},
						"launcherValue": {
							"value": this.getNewAppVariantId()
						}
					}
				}
			};
		};

		AppVariantUtils.getInlineChangeCreateInbound = function(sCurrentRunningInboundId) {
			var oParsedHash = this.getURLParsedHash();
			var oProperty = {
				"inbound": {}
			};

			oProperty.inbound[sCurrentRunningInboundId] = {
				"semanticObject": oParsedHash.semanticObject,
                "action": oParsedHash.action
			};

			return oProperty;
		};

		AppVariantUtils.createInlineChange = function(mParameters, sChange){
			var mTexts;
			if (sChange === "title"){
				return DescriptorInlineChangeFactory.create_app_setTitle(mParameters);
			} else if (sChange === "description" ){
				return DescriptorInlineChangeFactory.create_app_setDescription(mParameters);
			} else if (sChange === "subTitle" ){
				return DescriptorInlineChangeFactory.create_app_setSubTitle(mParameters);
			} else if (sChange === "icon" ){
				return DescriptorInlineChangeFactory.create_ui_setIcon(mParameters);
			} else if (sChange === "inbound" ){
				return DescriptorInlineChangeFactory.create_app_changeInbound(mParameters);
			} else if (sChange === "createInbound" ){
				return DescriptorInlineChangeFactory.create_app_addNewInbound(mParameters);
			} else if (sChange === "inboundTitle" ){
				mTexts = mParameters.texts;
				delete mParameters.texts;
				return DescriptorInlineChangeFactory.create_app_changeInbound(mParameters, mTexts);
			} else if (sChange === "inboundSubtitle" ){
				mTexts = mParameters.texts;
				delete mParameters.texts;
				return DescriptorInlineChangeFactory.create_app_changeInbound(mParameters, mTexts);
			} else if (sChange === "inboundIcon" ){
				delete mParameters.texts;
				return DescriptorInlineChangeFactory.create_app_changeInbound(mParameters);
			} else if (sChange === "removeInbound"){
				return DescriptorInlineChangeFactory.create_app_removeAllInboundsExceptOne(mParameters);
			}
		};

		AppVariantUtils.getTransportInput = function(sPackageName, sNameSpace, sName, sType) {
			return {
				getPackage : function(){
					return sPackageName;
				},
				getNamespace : function(){
					return sNameSpace;
				},
				getId : function(){
					return sName;
				},
				getDefinition : function(){
					return {
						fileType: sType
					};
				}
			};
		};

		AppVariantUtils.triggerCatalogAssignment = function(sAppVariantId, sOriginalId) {
			var sRoute = '/sap/bc/lrep/appdescr_variants/' + sAppVariantId + '?action=assignCatalogs&assignFromAppId=' + sOriginalId;
			var oLREPConnector = LrepConnector.createConnector();
			return oLREPConnector.send(sRoute, 'POST');
		};

		AppVariantUtils.showTechnicalError = function(oMessageType, sTitleKey, sMessageKey, vError) {
			var oTextResources = this.getTextResources();
			var sErrorMessage = "";
			if (vError.messages && vError.messages.length) {
				if (vError.messages.length > 1) {
					vError.messages.forEach(function(oError) {
						sErrorMessage += oError.text + "\n";
					});
				} else {
					sErrorMessage += vError.messages[0].text;
				}
			} else {
				sErrorMessage += vError.stack || vError.message || vError.status || vError;
			}

			var sTitle = oTextResources.getText(sTitleKey);
			var sMessage = oTextResources.getText(sMessageKey, sErrorMessage);

			return new Promise(function(resolve) {
				MessageBox.error(sMessage, {
					icon: oMessageType,
					title: sTitle,
					onClose: function() {
						resolve(false);
					},
					styleClass: RtaUtils.getRtaStyleClassName()
				});
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
		};

		AppVariantUtils.getTextResources = function() {
			return sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		};

		return AppVariantUtils;
}, /* bExport= */true);