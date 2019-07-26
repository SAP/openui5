/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/documentation/sdk/controller/BaseController",
    "sap/ui/documentation/sdk/controller/util/SearchUtil",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/ResizeHandler",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "sap/ui/documentation/library",
    "sap/ui/core/IconPool",
    "sap/m/MessageBox",
    "sap/m/library",
    "sap/base/Log",
    "sap/base/util/Version",
	"sap/ui/core/syncStyleClass",
	"sap/ui/documentation/sdk/controls/WebPageTitleUtil"
], function(
    jQuery,
	BaseController,
	SearchUtil,
	JSONModel,
	ResizeHandler,
	Device,
	Fragment,
	library,
	IconPool,
	MessageBox,
	mobileLibrary,
	Log,
	Version,
	syncStyleClass,
	WebPageTitleUtil
) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		var MAIN_WEB_PAGE_TITLE = "Demo Kit - SAPUI5 SDK";

		var WEB_PAGE_TITLE = {
			home: "Home - " + MAIN_WEB_PAGE_TITLE,
			topic: "Documentation - " + MAIN_WEB_PAGE_TITLE,
			api: "API Reference - " + MAIN_WEB_PAGE_TITLE,
			controls: "Samples - " + MAIN_WEB_PAGE_TITLE,
			demoapps: "Demo Apps - " + MAIN_WEB_PAGE_TITLE,
			tools: "Tools - " + MAIN_WEB_PAGE_TITLE
		};

		// shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper,
			sNeoAppJsonPath = "/neo-app.json", /* Load neo-app.json always from root URL */
			ABOUT_TEXT = "About",
			FEEDBACK_TEXT = "Feedback",
			CHANGE_VERSION_TEXT = "Change version";

		return BaseController.extend("sap.ui.documentation.sdk.controller.App", {
			onInit : function () {
				BaseController.prototype.onInit.call(this);

				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					bPhoneSize: false,
					bShowVersionSwitchInHeader: false,
					bShowVersionSwitchInMenu: false,
					bLandscape: Device.orientation.landscape,
					bHasMaster: false,
					bSearchMode: false,
					bHideTopicSection: !!window['sap-ui-documentation-hideTopicSection'],
					bHideApiSection: !!window['sap-ui-documentation-hideApiSection'],
					sAboutInfoSAPUI5: "Looking for the Demo Kit for a specific SAPUI5 version? " +
					"Check at <a href = 'https://sapui5.hana.ondemand.com/versionoverview.html'>https://sapui5.hana.ondemand.com/versionoverview.html</a> " +
					"which versions are available. " +
					"You can view the version-specific Demo Kit by adding the version number to the URL, e.g. " +
					"<a href='https://sapui5.hana.ondemand.com/1.52.4/'>https://sapui5.hana.ondemand.com/1.52.4/</a>",
					sAboutInfoOpenUI5: "Looking for the Demo Kit for a specific OpenUI5 version? " +
					"Check at <a href = 'https://openui5.hana.ondemand.com/versionoverview.html'>https://openui5.hana.ondemand.com/versionoverview.html</a> " +
					"which versions are available. " +
					"You can view the version-specific Demo Kit by adding the version number to the URL, e.g. " +
					"<a href='https://openui5.hana.ondemand.com/1.52.4/'>https://openui5.hana.ondemand.com/1.52.4/</a>"
				});

				this.MENU_LINKS_MAP = {
					"Legal": "https://www.sap.com/corporate/en/legal/impressum.html",
					"Privacy": "https://www.sap.com/corporate/en/legal/privacy.html",
					"Terms of Use": "https://www.sap.com/corporate/en/legal/terms-of-use.html",
					"Copyright": "https://www.sap.com/corporate/en/legal/copyright.html",
					"Trademark": "https://www.sap.com/corporate/en/legal/trademark.html",
					"Disclaimer": "https://help.sap.com/viewer/disclaimer",
					"License": "LICENSE.txt"
				};

				this.getOwnerComponent().loadVersionInfo().then(function () {
					if (this.getModel("versionData").getProperty("/isOpenUI5")) {
						this.MENU_LINKS_MAP["Terms of Use"] = "TermsOfUse.txt";
					}
				}.bind(this));

				this.FEEDBACK_SERVICE_URL = "https://feedback-sapuisofiaprod.hana.ondemand.com:443/api/v2/apps/5bb7d7ff-bab9-477a-a4c7-309fa84dc652/posts";

				// Cache view reference
				this._oView = this.getView();

				this.setModel(oViewModel, "appView");

				this.oHeader = this._oView.byId("headerToolbar");

				this.oRouter = this.getRouter();

				this._selectHeader = this._oView.byId("selectHeader");
				this._tabHeader = this._oView.byId("tabHeader");

				this._oWebPageTitleUtil = new WebPageTitleUtil();

				ResizeHandler.register(this.oHeader, this.onHeaderResize.bind(this));
				this.oRouter.attachRouteMatched(this.onRouteChange.bind(this));
				this.oRouter.attachBypassed(this.onRouteNotFound.bind(this));

				// register Feedback rating icons
				this._registerFeedbackRatingIcons();

				this._requestVersionInfo();

				// attach to the afterMasterClose event of the splitApp to be able to toggle the hamburger button state on clicking anywhere
				this.byId("splitApp").attachEvent("afterMasterClose", function (oEvent) {
					oViewModel.setProperty("/bIsShownMaster", false);
				}, this);
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			onAfterRendering: function() {
				// apply content density mode to the body tag
				// in order to get the controls in the static area styled correctly,
				// such as Dialog and Popover.
				jQuery(document.body).addClass(this.getOwnerComponent().getContentDensityClass());

				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			onExit: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			onRouteChange: function (oEvent) {

				if (!this.oRouter.getRoute(oEvent.getParameter("name"))._oConfig.target) {
					return;
				}

				var sRouteName = oEvent.getParameter("name"),
					sTabId = this.oRouter.getRoute(sRouteName)._oConfig.target[0] + "Tab",
					oTabToSelect = this._oView.byId(sTabId),
					sKey = oTabToSelect ? oTabToSelect.getKey() : "home",
					oViewModel = this.getModel("appView"),
					bPhoneSize = oViewModel.getProperty("/bPhoneSize"),
					bSearchMode = oViewModel.getProperty("/bSearchMode"),
					bPhone = Device.system.phone,
					bHasMaster = this.getOwnerComponent().getConfigUtil().hasMasterView(sRouteName),
					oMasterView,
					sMasterViewId;

				this._setHeaderSelectedKey(sKey);
				this._oWebPageTitleUtil.setTitle(WEB_PAGE_TITLE[sKey]);

				oViewModel.setProperty("/bHasMaster", bHasMaster);

				if (bPhoneSize && !bSearchMode) {
					this._selectHeader.setVisible(true);
				}

				if (bPhone && bHasMaster) { // on phone we need the id of the master view (for navigation)
					oMasterView = this.getOwnerComponent().getConfigUtil().getMasterView(sRouteName);
					sMasterViewId = oMasterView && oMasterView.getId();
					oViewModel.setProperty("/sMasterViewId", sMasterViewId);
				}

				// hide master on route change
				this.byId("splitApp").hideMaster();
				oViewModel.setProperty("/bIsShownMaster", false);
			},

			onRouteNotFound: function () {
				this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
				return;
			},

			toggleMaster: function(oEvent) {
				var bPressed = oEvent.getParameter("pressed"),
					bPhone = Device.system.phone,
					oSplitApp = this.byId("splitApp"),
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
				var sKey = oEvent.getParameter("key"),
					oItem;

				if (!sKey) {
					oItem = oEvent.getParameter("selectedItem");
					oItem && (sKey = oItem.getKey());
				}

				oEvent.preventDefault();
				if (sKey && sKey !== "home") {
					this.getRouter().navTo(sKey, {});
				} else {
					this.getRouter().navTo("welcome", {});

					this._setHeaderSelectedKey("home");
				}
			},

			handleMenuItemClick: function (oEvent) {
				var sTargetText = oEvent.getParameter("item").getText(),
					sTarget = this.MENU_LINKS_MAP[sTargetText];

				if (sTargetText === ABOUT_TEXT) {
					this.aboutDialogOpen();
				} else if (sTargetText === FEEDBACK_TEXT) {
					this.feedbackDialogOpen();
				} else if (sTargetText === CHANGE_VERSION_TEXT) {
					this.onChangeVersionButtonPress();
				} else if (sTarget) {
					URLHelper.redirect(sTarget, true);
				}
			},

			aboutDialogOpen: function () {
				if (!this._oAboutDialog) {
					this._oAboutDialog = new sap.ui.xmlfragment("aboutDialogFragment", "sap.ui.documentation.sdk.view.AboutDialog", this);
					this._oView.addDependent(this._oAboutDialog);
				} else {
					this._oAboutDialog.getContent()[0].backToTop(); // reset the nav container to the first page
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

			onChangeVersionButtonPress: function () {
				this.getVersionSwitchDialog().open();
			},

			onCloseVersionDialog: function () {
				this.getVersionSwitchDialog().close();
			},

			onChangeVersionDialogSearch: function (oEvent) {
				var sSearchedValue = oEvent.getParameter("newValue"),
					oFilter = new sap.ui.model.Filter("version", sap.ui.model.FilterOperator.Contains, sSearchedValue),
					oBinding = sap.ui.getCore().byId("versionList").getBinding("items");

				oBinding.filter([oFilter]);
			},

			onVersionItemPress: function (oEvent) {
				var oSelectedItem = oEvent.getParameter("listItem"),
					oCustomData = oSelectedItem.getCustomData()[0];

				if (oCustomData && oCustomData.getKey() === "path") {
					window.location.href = oCustomData.getValue(); // Domain relative redirect
				}
			},

			getVersionSwitchDialog: function () {
				if (!this._oChangeVersionDialog) {
					this._createVersionDialog();
				}

				return this._oChangeVersionDialog;
			},

			/**
			 * Custom comparison function, which is used when sorting group titles by minor version in the change version dialog
			 *
			 * @param sGroupTitleA
			 * @param sGroupTitleB
			 * @returns {number}
			 */
			versionSwitchCustomComparator: function (sGroupTitleA, sGroupTitleB) {
				return Version(sGroupTitleA).compareTo(Version(sGroupTitleB));
			},

			/**
			 * Determines whether or not to show the version change button.
			 *
			 * @private
			 */
			_updateVersionSwitchVisibility: function() {
				var oViewModel = this.getModel("appView"),
					bPhoneSize = oViewModel.getProperty("/bPhoneSize");

				// Version switch should not be shown on phone sizes or when no versions are found
				oViewModel.setProperty("/bShowVersionSwitchInHeader", !bPhoneSize && !!this._aNeoAppVersions);
				oViewModel.setProperty("/bShowVersionSwitchInMenu", bPhoneSize && !!this._aNeoAppVersions);
			},

			_createVersionDialog: function () {
				this._oChangeVersionDialog = new sap.ui.xmlfragment("sap.ui.documentation.sdk.view.ChangeVersionDialog", this);
				this._oChangeVersionDialog.setModel(this._buildVersionDialogModel());
				this._oView.addDependent(this._oChangeVersionDialog);
			},

			_buildVersionDialogModel: function() {
				var oChangeVersionDialogModel = new JSONModel();

				oChangeVersionDialogModel.setSizeLimit(1000);
				oChangeVersionDialogModel.setData(this._aNeoAppVersions);

				return oChangeVersionDialogModel;
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
						var sVersion = that._getUI5Version(),
							sUI5Distribution = that._getUI5Distribution();

						if (this.contextCheckBox.getSelected()) {
							this.contextData.setValue("Location: " + that._getCurrentPageRelativeURL() + "\n" + sUI5Distribution + " Version: " + sVersion);
						} else {
							this.contextData.setValue(sUI5Distribution + " Version: " + sVersion);
						}
					};

					this._oFeedbackDialog.updateContextData();
				}
				this._oFeedbackDialog.updateContextData();
				if (!this._oFeedbackDialog.isOpen()) {
					syncStyleClass("sapUiSizeCompact", this.getView(), this._oFeedbackDialog);
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

			onSearch : function (oEvent) {
				var sQuery = oEvent.getParameter("query");
				if (!sQuery) {
					return;
				}
				this.getRouter().navTo("search", {searchParam: sQuery}, false);
			},

			onHeaderResize: function (oEvent) {
				var iWidth = oEvent.size.width,
					bPhoneSize = Device.system.phone || iWidth < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0],
					oViewModel = this.getModel("appView"),
					bSearchMode = oViewModel.getProperty("/bSearchMode");

				// Check for a change in "bPhoneSize" property in order to
				// reduce number of method calls
				if (bPhoneSize !== oViewModel.getProperty("/bPhoneSize")) {
					oViewModel.setProperty("/bPhoneSize", bPhoneSize);
					this._updateVersionSwitchVisibility();
					this._tabHeader.setVisible(!bPhoneSize);
					this._selectHeader.setVisible(bPhoneSize);
				}

				// The select should be first set to visible on phone size, and after that
				// set to false if search is opened for correct calculation of the search width.
				if (bSearchMode) {
					this._selectHeader.setVisible(false);
				}
			},

			_onOrientationChange: function() {
				this.getModel("appView").setProperty("/bLandscape", Device.orientation.landscape);
			},

			onToggleSearchMode : function(oEvent) {
				var bSearchMode = oEvent.getParameter("isOpen"),
				oViewModel = this.getModel("appView"),
				bPhoneSize = oViewModel.getProperty("/bPhoneSize");
				oViewModel.setProperty("/bSearchMode", bSearchMode);

				if (bSearchMode) {
					// Init is called *before* the user entered a search term
					// in order to start the download of the search index
					// in the *earliest* point in time
					SearchUtil.init();

					setTimeout(function () {
						this._oView.byId("searchControl").getAggregation("_searchField").getFocusDomRef().focus();
					}.bind(this), 0);

					if (bPhoneSize) {
						this._selectHeader.setVisible(false);
					}
				} else if (bPhoneSize) {
					this._selectHeader.setVisible(true);
				}
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

			_requestVersionInfo: function () {
				Promise.resolve(jQuery.ajax(sNeoAppJsonPath)).then(
					// Success
					function(oNeoAppJson) {
						var oVersionModel = this.getModel("versionData"),
							bIsInternal = oVersionModel.getProperty("/isInternal"),
							bIsSnapshotVersion = oVersionModel.getProperty("/isSnapshotVersion");

						if (!(oNeoAppJson && oNeoAppJson.routes)) {
							Log.warning("No versions were found");
							return;
						}

						// Current version would be displayed for a second time as the last element,
						// therefore we should skip it to avoid duplicate items in the dialog.
						oNeoAppJson.routes.pop();

						this._aNeoAppVersions = oNeoAppJson.routes;

						// Store needed data
						if (!bIsInternal && !bIsSnapshotVersion) {
							this._aNeoAppVersions = this._aNeoAppVersions.filter(function(oRoute) {
								return oRoute.target.version.indexOf("-beta") === -1;
							});
						}

						this._aNeoAppVersions = this._aNeoAppVersions.map(function(oRoute) {
							var oVersion = Version(oRoute.target.version),
								oVersionSummary = {};

							// Add the following properties, in order use them for grouping later
							oVersionSummary.patchVersion = oVersion.getPatch(); // E.g: Extract 5 from "1.52.5"
							oVersionSummary.groupTitle = oVersion.getMajor() + "." + oVersion.getMinor(); // E.g: Extract "1.52" from "1.52.5"
							oVersionSummary.version = oVersion.toString();
							oVersionSummary.path = oRoute.path;

							return oVersionSummary;
						});

						// Make version select visible
						this._updateVersionSwitchVisibility();
					}.bind(this),
					// Error
					function() {
						Log.warning("No neo-app.json was detected");
					}
				);
			},

			_getUI5Version: function () {
				return this.getModel("versionData").getProperty("/version");
			},

			_getUI5VersionGav: function () {
				return this.getModel("versionData").getProperty("/versionGav");
			},

			_getUI5Distribution: function () {
				var sVersionGav = this._getUI5VersionGav();
				var sUI5Distribution = "SAPUI5";
				if (sVersionGav && /openui5/i.test(sVersionGav)) {
					sUI5Distribution = "OpenUI5";
				}
				return sUI5Distribution;
			},

			_getCurrentPageRelativeURL: function () {
				var parser = window.location;
				return parser.pathname + parser.hash + parser.search;
			},

			_setHeaderSelectedKey: function(sKey) {
				this._selectHeader.setSelectedKey(sKey);
				this._tabHeader.setSelectedKey(sKey);
			}

		});
	}
);