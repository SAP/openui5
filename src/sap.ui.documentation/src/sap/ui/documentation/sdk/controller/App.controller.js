/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/ResizeHandler",
		"sap/ui/Device",
		"sap/ui/core/Component",
		"sap/ui/core/Fragment",
		"sap/ui/documentation/library",
		"sap/ui/core/IconPool",
		"sap/m/SplitAppMode",
		"sap/m/MessageBox"
	], function (BaseController, JSONModel, ResizeHandler, Device, Component, Fragment, library, IconPool, SplitAppMode, MessageBox) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.App", {
			onInit : function () {
				var oVersionInfo = sap.ui.getVersionInfo(),
					sVersion = oVersionInfo.version,
					oViewModel = new JSONModel({
						busy : false,
						delay : 0,
						bPhoneSize: false,
						bLandscape: Device.orientation.landscape,
						bHasMaster: false,
						bSearchMode: false,
						version: jQuery.sap.Version(sap.ui.version).getMajor() + "." + jQuery.sap.Version(sap.ui.version).getMinor(),
						fullVersion: sap.ui.version,
						isOpenUI5: oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav),
						isSnapshotVersion: oVersionInfo && oVersionInfo.gav && /snapshot/i.test(oVersionInfo.gav),
						isDevVersion: sVersion.indexOf("SNAPSHOT") > -1 || (sVersion.split(".").length > 1 && parseInt(sVersion.split(".")[1], 10) % 2 === 1)
					});
				this.MENU_LINKS_MAP = {
					"Legal": "https://www.sap.com/corporate/en/legal/impressum.html",
					"Privacy": "https://www.sap.com/corporate/en/legal/privacy.html",
					"Terms of Use": "https://www.sap.com/corporate/en/legal/terms-of-use.html",
					"Copyright": "https://www.sap.com/corporate/en/legal/copyright.html",
					"Trademark": "https://www.sap.com/corporate/en/legal/copyright.html#trademark",
					"Disclaimer": "http://help-legacy.sap.com/disclaimer-full"
				};
				this.FEEDBACK_SERVICE_URL = "https://feedback-sapuisofiaprod.hana.ondemand.com:443/api/v2/apps/5bb7d7ff-bab9-477a-a4c7-309fa84dc652/posts";
				this.OLD_DOC_LINK_SUFFIX = ".html";

				// Cache view reference
				this._oView = this.getView();

				this.setModel(oViewModel, "appView");

				this.oTabNavigation = this._oView.byId("tabHeader");
				this.oHeader = this._oView.byId("headerToolbar");
				this.oRouter = this.getRouter();

				ResizeHandler.register(this.oHeader, this.onHeaderResize.bind(this));
				this.oRouter.attachRouteMatched(this.onRouteChange.bind(this));

				this.getRouter().getRoute("topicIdLegacyRoute").attachPatternMatched(this._onTopicOldRouteMatched, this);
				this.getRouter().getRoute("apiIdLegacyRoute").attachPatternMatched(this._onApiOldRouteMatched, this);

				this.oRouter.getRoute("entitySamplesLegacyRoute").attachPatternMatched(this._onEntityOldRouteMatched, this);
				this.oRouter.getRoute("entityAboutLegacyRoute").attachPatternMatched(this._onEntityOldRouteMatched, this);
				this.oRouter.getRoute("entityPropertiesLegacyRoute").attachPatternMatched({entityType: "properties"}, this._forwardToAPIRef, this);
				this.oRouter.getRoute("entityAggregationsLegacyRoute").attachPatternMatched({entityType: "aggregations"}, this._forwardToAPIRef, this);
				this.oRouter.getRoute("entityAssociationsLegacyRoute").attachPatternMatched({entityType: "associations"}, this._forwardToAPIRef, this);
				this.oRouter.getRoute("entityEventsLegacyRoute").attachPatternMatched({entityType:"events"}, this._forwardToAPIRef, this);
				this.oRouter.getRoute("entityMethodsLegacyRoute").attachPatternMatched({entityType:"methods"}, this._forwardToAPIRef, this);

				// apply content density mode to root view
				this._oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

				// register Feedback rating icons
				this._registerFeedbackRatingIcons();
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			onAfterRendering: function() {
				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			onExit: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			_onTopicOldRouteMatched: function(oEvent) {

				var sId = oEvent.getParameter("arguments").id;
				if (sId) {
					sId = this._trimOldDocSuffix(sId);
				}
				this.getRouter().navTo("topicId", {id: sId});
			},

			_onApiOldRouteMatched: function(oEvent) {

				var sId = oEvent.getParameter("arguments").id,
					sEntityType,
					sEntityId,
					aSplit;

				if (sId) {

					aSplit = sId.split("#");
					if (aSplit.length === 2) {
						sId = aSplit[0];
						sEntityType = aSplit[1];

						aSplit = sEntityType.split(":");
						if (aSplit.length === 2) {
							sEntityType = aSplit[0];
							sEntityId = aSplit[1];
						}
					}

					sId = this._trimOldDocSuffix(sId);

					if (sEntityType === 'event') { // legacy keyword is singular
						sEntityType = "events";
					}
				}

				this.getRouter().navTo("apiId", {id: sId, entityType: sEntityType, entityId: sEntityId});
			},

			_trimOldDocSuffix: function(sLink) {
				if (sLink && sLink.endsWith(this.OLD_DOC_LINK_SUFFIX)) {
					sLink = sLink.slice(0, -this.OLD_DOC_LINK_SUFFIX.length);
				}
				return sLink;
			},

			_forwardToAPIRef: function(oEvent, oData) {
				oData || (oData = {});
				oData['id'] = oEvent.getParameter("arguments").id;
				this.oRouter.navTo("apiId", oData);
			},

			_onEntityOldRouteMatched: function(oEvent) {
				this.oRouter.navTo("entity", {
					id: oEvent.getParameter("arguments").id
				});
			},

			onRouteChange: function (oEvent) {

				if (!this.oRouter.getRoute(oEvent.getParameter("name"))._oConfig.target) {
					return;
				}

				var sRouteName = oEvent.getParameter("name"),
					sTabId = this.oRouter.getRoute(sRouteName)._oConfig.target[0] + "Tab",
					oTabToSelect = this._oView.byId(sTabId),
					sKey = oTabToSelect ? oTabToSelect.getKey() : "home",
					bPhone = Device.system.phone,
					oViewModel = this.getModel("appView"),
					bHasMaster = this.getOwnerComponent().getConfigUtil().hasMasterView(sRouteName),
					oMasterView,
					sMasterViewId;

				this.oTabNavigation.setSelectedKey(sKey);

				oViewModel.setProperty("/bHasMaster", bHasMaster);

				this._toggleTabHeaderClass();

				if (bPhone && bHasMaster) { // on phone we need the id of the master view (for mavigation)
					oMasterView = this.getOwnerComponent().getConfigUtil().getMasterView(sRouteName);
					sMasterViewId = oMasterView && oMasterView.getId();
					oViewModel.setProperty("/sMasterViewId", sMasterViewId);
				}

				// hide master on route change
				this.getView().byId("splitApp").hideMaster();
				oViewModel.setProperty("/bIsShownMaster", false);
			},

			toggleMaster: function(oEvent) {
				var bPressed = oEvent.getParameter("pressed"),
					bPhone = Device.system.phone,
					oSplitApp = this.getView().byId("splitApp"),
					isShowHideMode = oSplitApp.getMode() === SplitAppMode.ShowHideMode,
					isHideMode = oSplitApp.getMode() === SplitAppMode.HideMode,
					sMasterViewId = this.getModel("appView").getProperty("/sMasterViewId"),
					fnToggle;

				if (!bPhone && (isShowHideMode || isHideMode)) {
					fnToggle = (bPressed) ? oSplitApp.showMaster : oSplitApp.hideMaster;
					fnToggle.call(oSplitApp);
					return;
				}

				/* on phone there is no master-detail pair, but a single navContainer => so navigate within this navContainer: */
				if (bPhone) {
					if (bPressed) {
						oSplitApp.to(sMasterViewId);
					} else {
						oSplitApp.backDetail();
					}
				}
			},

			navigateToSection : function (oEvent) {
				var sKey = oEvent.getParameter("key");

				oEvent.preventDefault();
				if (sKey && sKey !== "home") {
					this.getRouter().navTo(sKey, {}, true);
				} else {
					this.getRouter().navTo("", {}, true);
					this.oTabNavigation.setSelectedKey("home");
				}
			},

			handleMenuItemClick: function (oEvent) {
				var sTargetText = oEvent.getParameter("item").getText(),
					sTarget = this.MENU_LINKS_MAP[sTargetText];

				if (sTargetText === "About") {
					this.aboutDialogOpen();
				} else if (sTargetText === "Feedback") {
					this.feedbackDialogOpen();
				} else if (sTarget) {
					sap.m.URLHelper.redirect(sTarget, true);
				}
			},

			aboutDialogOpen: function () {
				if (!this._oAboutDialog) {
					this._oAboutDialog = new sap.ui.xmlfragment("aboutDialogFragment", "sap.ui.documentation.sdk.view.AboutDialog", this);
					this._oView.addDependent(this._oAboutDialog);
				}
				this._oAboutDialog.open();
			},

			aboutDialogClose: function (oEvent) {
				this._oAboutDialog.close();
			},

			onAboutVersionDetails: function (oEvent) {
				var oViewModel = this.getModel("appView"),
					oViewModelData = oViewModel.getData(),
					that = this;

				library._loadAllLibInfo("", "_getLibraryInfo","", function(aLibs, oLibInfos) {
					var data = {};
					var oLibInfo = library._getLibraryInfoSingleton();

					for (var i = 0, l = aLibs.length; i < l; i++) {
						aLibs[i] = oLibInfos[aLibs[i]];
						aLibs[i].libDefaultComponent = oLibInfo._getDefaultComponent(aLibs[i]);
					}

					data.libs = aLibs;
					oViewModelData.oVersionInfo = data;
					oViewModel.setData(oViewModelData);
					that.setModel(oViewModel, "appView");
				});

				var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon"),
					oDetailPage = Fragment.byId("aboutDialogFragment", "aboutDetail");
				oNavCon.to(oDetailPage);
			},

			onAboutThirdParty: function (oEvent) {
				var oViewModel = this.getModel("appView"),
					oViewModelData = oViewModel.getData(),
					that = this;

				library._loadAllLibInfo("", "_getThirdPartyInfo", function(aLibs, oLibInfos){
					if (!aLibs){
						return;
					}
					var data = {};
					data.thirdparty = [];
					for (var j = 0; j < aLibs.length; j++) {
						var oData = oLibInfos[aLibs[j]];
						for (var i = 0; i < oData.libs.length; i++) {
							var oOpenSourceLib = oData.libs[i];
							oOpenSourceLib._lib = aLibs[j];
							data.thirdparty.push(oOpenSourceLib);
						}
					}

					data.thirdparty.sort(function(a,b){
						var aName = (a.displayName || "").toUpperCase();
						var bName = (b.displayName || "").toUpperCase();

						if (aName > bName){
							return 1;
						} else if (aName < bName){
							return -1;
						} else {
							return 0;
						}
					});

					oViewModelData.oThirdPartyInfo = data;
					oViewModel.setData(oViewModelData);
					that.setModel(oViewModel, "appView");
				});

				var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon"),
					oDetailPage = Fragment.byId("aboutDialogFragment", "aboutThirdParty");
				oNavCon.to(oDetailPage);
			},

			onReleaseDialogOpen: function (oEvent) {
				var oLibInfo = library._getLibraryInfoSingleton(),
					sVersion = oEvent.getSource().data("version"),
					sLibrary = oEvent.getSource().data("library"),
					oNotesModel = new JSONModel(),
					oDialogModel = new JSONModel(),
					that = this;

				if (!this._oReleaseDialog) {
					this._oReleaseDialog = new sap.ui.xmlfragment("releaseDialogFragment", "sap.ui.documentation.sdk.view.ReleaseDialog", this);
					this._oView.addDependent(this._oReleaseDialog);
				}

				if (!this._oNotesView) {
					this._oNotesView = sap.ui.view({id:"notesView", viewName:"sap.ui.documentation.sdk.view.ReleaseNotesView", type:"Template"});
					this._oNotesView.setModel(oNotesModel);
				}

				oLibInfo._getReleaseNotes(sLibrary, sVersion, function(oRelNotes, sVersion) {
					var oDialogData = {};

					if (oRelNotes && oRelNotes[sVersion] && oRelNotes[sVersion].notes && oRelNotes[sVersion].notes.length > 0) {
						that._oNotesView.getModel().setData(oRelNotes);
						that._oNotesView.bindObject("/" + sVersion);
					} else {
						oDialogData.noDataMessage = "No changes for this library!";
					}
					oDialogData.library = sLibrary;
					oDialogModel.setData(oDialogData);
				});

				this._oReleaseDialog.setModel(oDialogModel);
				this._oReleaseDialog.addContent(this._oNotesView);
				this._oReleaseDialog.open();
			},

			onReleaseDialogClose: function (oEvent) {
				this._oReleaseDialog.close();
			},

			onAboutNavBack: function (oEvent) {
				var oNavCon = Fragment.byId("aboutDialogFragment", "aboutNavCon");
				oNavCon.back();
			},

			/**
			 * Opens a dialog to give feedback on the demo kit
			 */
			feedbackDialogOpen: function () {
				var that = this;

				if (!this._oFeedbackDialog) {
					this._oFeedbackDialog = new sap.ui.xmlfragment("feedbackDialogFragment", "sap.ui.documentation.sdk.view.FeedbackDialog", this);
					this._oView.addDependent(this._oFeedbackDialog);

					this._oFeedbackDialog.textInput = Fragment.byId("feedbackDialogFragment", "feedbackInput");
					this._oFeedbackDialog.contextCheckBox = Fragment.byId("feedbackDialogFragment", "pageContext");
					this._oFeedbackDialog.contextData = Fragment.byId("feedbackDialogFragment", "contextData");
					this._oFeedbackDialog.ratingStatus = Fragment.byId("feedbackDialogFragment", "ratingStatus");
					this._oFeedbackDialog.ratingStatus.value = 0;
					this._oFeedbackDialog.sendButton = Fragment.byId("feedbackDialogFragment", "sendButton");
					this._oFeedbackDialog.ratingBar = [
						{
							button : Fragment.byId("feedbackDialogFragment", "excellent"),
							status : "Excellent"
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "good"),
							status : "Good"
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "average"),
							status : "Average"
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "poor"),
							status : "Poor"
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "veryPoor"),
							status : "Very Poor"
						}
					];
					this._oFeedbackDialog.reset = function () {
						this.sendButton.setEnabled(false);
						this.textInput.setValue("");
						this.contextCheckBox.setSelected(true);
						this.ratingStatus.setText("");
						this.ratingStatus.setState("None");
						this.ratingStatus.value = 0;
						this.contextData.setVisible(false);
						this.ratingBar.forEach(function(oRatingBarElement){
							if (oRatingBarElement.button.getPressed()) {
								oRatingBarElement.button.setPressed(false);
							}
						});
					};
					this._oFeedbackDialog.updateContextData = function() {
						if (this.contextCheckBox.getSelected()) {
							this.contextData.setValue("Location: " + that._getCurrentPageRelativeURL() + "\n" + that._getUI5Distribution() + " Version: " + sap.ui.getVersionInfo().version);
						} else {
							this.contextData.setValue(that._getUI5Distribution() + " Version: " + sap.ui.getVersionInfo().version);
						}
					};

					this._oFeedbackDialog.updateContextData();
				}
				this._oFeedbackDialog.updateContextData();
				if (!this._oFeedbackDialog.isOpen()) {
					jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oFeedbackDialog);
					this._oFeedbackDialog.open();
				}
			},

			/**
			 * Event handler for the send feedback button
			 */
			onFeedbackDialogSend: function() {
				var data = {};

				if (this._oFeedbackDialog.contextCheckBox.getSelected()) {
					data = {
						"texts": {
							"t1": this._oFeedbackDialog.textInput.getValue()
						},
						"ratings":{
							"r1": {"value" : this._oFeedbackDialog.ratingStatus.value}
						},
						"context": {"page": this._getCurrentPageRelativeURL(), "attr1": this._getUI5Distribution() + ":" + sap.ui.version}
					};
				} else {
					data = {
						"texts": {
							"t1": this._oFeedbackDialog.textInput.getValue()
						},
						"ratings":{
							"r1": {"value" : this._oFeedbackDialog.ratingStatus.value}
						},
						"context": {"attr1": this._getUI5Distribution() + ":" + sap.ui.version}
					};
				}

				// send feedback
				this._oFeedbackDialog.setBusyIndicatorDelay(0);
				this._oFeedbackDialog.setBusy(true);

				jQuery.ajax({
					url: this.FEEDBACK_SERVICE_URL,
					type: "POST",
					contentType: "application/json",
					data: JSON.stringify(data)
				}).
				done(
					function () {
						MessageBox.success("Your feedback has been sent.", {title: "Thank you!"});
						this._oFeedbackDialog.reset();
						this._oFeedbackDialog.close();
						this._oFeedbackDialog.setBusy(false);
					}.bind(this)
				).
				fail(
					function (oRequest, sStatus, sError) {
						var sErrorDetails = sError; // + "\n" + oRequest.responseText;
						MessageBox.error("An error occurred sending your feedback:\n" + sErrorDetails, {title: "Sorry!"});
						this._oFeedbackDialog.setBusy(false);
					}.bind(this)
				);

			},

			/**
			 * Event handler for the cancel feedback button
			 */
			onFeedbackDialogCancel: function () {
				this._oFeedbackDialog.reset();
				this._oFeedbackDialog.close();
			},

			/**
			 * Event handler for the toggle context link
			 */
			onShowHideContextData: function () {
				this._oFeedbackDialog.contextData.setVisible(!this._oFeedbackDialog.contextData.getVisible());
			},

			/**
			 * Event handler for the context selection checkbox
			 */
			onContextSelect: function() {
				this._oFeedbackDialog.updateContextData();
			},

			/**
			 * Event handler for the rating to update the label and the data
			 * @param {sap.ui.base.Event}
			 */
			onPressRatingButton: function(oEvent) {
				var that = this;
				var oPressedButton = oEvent.getSource();

				that._oFeedbackDialog.ratingBar.forEach(function(oRatingBarElement) {
					if (oPressedButton !== oRatingBarElement.button) {
						oRatingBarElement.button.setPressed(false);
					} else {
						if (!oRatingBarElement.button.getPressed()) {
							setRatingStatus("None", "", 0);
						} else {
							switch (oRatingBarElement.status) {
								case "Excellent":
									setRatingStatus("Success", oRatingBarElement.status, 5);
									break;
								case "Good":
									setRatingStatus("Success", oRatingBarElement.status, 4);
									break;
								case "Average":
									setRatingStatus("None", oRatingBarElement.status, 3);
									break;
								case "Poor":
									setRatingStatus("Warning", oRatingBarElement.status, 2);
									break;
								case "Very Poor":
									setRatingStatus("Error", oRatingBarElement.status, 1);
							}
						}
					}
				});

				function setRatingStatus(sState, sText, iValue) {
					that._oFeedbackDialog.ratingStatus.setState(sState);
					that._oFeedbackDialog.ratingStatus.setText(sText);
					that._oFeedbackDialog.ratingStatus.value = iValue;
					if (iValue) {
						that._oFeedbackDialog.sendButton.setEnabled(true);
					} else {
						that._oFeedbackDialog.sendButton.setEnabled(false);
					}
				}
			},

			//onFeedbackInput : function() {
			//	if (this._oFeedbackDialog.textInput.getValue() || this._oFeedbackDialog.ratingStatus.value) {
			//		this._oFeedbackDialog.sendButton.setEnabled(true);
			//	} else {
			//		this._oFeedbackDialog.sendButton.setEnabled(false);
			//	}
			//},

			onSearch : function (oEvent) {
				var sQuery = oEvent.getParameter("query");
				if (!sQuery) {
					return;
				}
				this.getRouter().navTo("search", {searchParam: sQuery}, false);
			},

			onHeaderResize: function (oEvent) {
				var iWidth = oEvent.size.width,
					bPhoneSize = Device.system.phone || iWidth < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];

				this.getModel("appView").setProperty("/bPhoneSize", bPhoneSize);

				this._toggleTabHeaderClass();
			},

			_onOrientationChange: function() {
				this.getModel("appView").setProperty("/bLandscape", Device.orientation.landscape);

				this._toggleTabHeaderClass();
			},

			onToggleSearchMode : function(oEvent) {
				var bSearchMode = oEvent.getParameter("isOpen"),
				oViewModel = this.getModel("appView");

				oViewModel.setProperty("/bSearchMode", bSearchMode);

				this._toggleTabHeaderClass();
			},

			/**
			 * Register Feedback rating icons
			 * @private
			 */
			_registerFeedbackRatingIcons: function () {
				IconPool.addIcon("icon-face-very-bad", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E086",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-bad", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E087",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-neutral", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E089",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-happy", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E08B",
					suppressMirroring: true
				});
				IconPool.addIcon("icon-face-very-happy", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E08C",
					suppressMirroring: true
				});
			},

			_getUI5Distribution: function () {
				var oVersionInfo = sap.ui.getVersionInfo();
				var sUI5Distribution = "SAPUI5";
				if (oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav)) {
					sUI5Distribution = "OpenUI5";
				}
				return sUI5Distribution;
			},

			_getCurrentPageRelativeURL: function () {
				var parser = window.location;
				return parser.pathname + parser.hash + parser.search;
			},

			_isToggleButtonVisible: function() {
				var oViewModel = this.getModel("appView"),
					bHasMaster = oViewModel.getProperty("/bHasMaster"),
					bPhoneSize = oViewModel.getProperty("/bPhoneSize"),
					bLandscape = oViewModel.getProperty("/bLandscape"),
					bSearchMode = oViewModel.getProperty("/bSearchMode");

				return bHasMaster && (bPhoneSize || !bLandscape) && !bSearchMode;
			},

			_toggleTabHeaderClass: function() {
				var th = this.getView().byId("tabHeader");
				if (this._isToggleButtonVisible()) {
					th.addStyleClass("tabHeaderNoLeftMargin");
				} else {
					th.removeStyleClass("tabHeaderNoLeftMargin");
				}
			}

		});

	}
);
