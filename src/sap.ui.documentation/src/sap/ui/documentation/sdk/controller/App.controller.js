/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/NewsInfo",
	"sap/ui/documentation/sdk/controller/util/SearchUtil",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/base/util/UriParameters",
	"sap/ui/documentation/library",
	"sap/ui/core/IconPool",
	"sap/m/MessageBox",
	"sap/m/library",
	"sap/base/Log",
	"sap/base/util/Version",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/Core",
	"sap/ui/documentation/sdk/model/formatter",
	"sap/m/ResponsivePopover",
	"sap/ui/documentation/sdk/controller/util/Highlighter",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/ui/documentation/sdk/util/Resources",
	'sap/base/util/LoaderExtensions'
], function(
	KeyCodes,
	jQuery,
	BaseController,
	NewsInfo,
	SearchUtil,
	Filter,
	FilterOperator,
	JSONModel,
	ResizeHandler,
	Device,
	Fragment,
	UriParameters,
	library,
	IconPool,
	MessageBox,
	mobileLibrary,
	Log,
	Version,
	syncStyleClass,
	Core,
	globalFormatter,
	ResponsivePopover,
	Highlighter,
	Button,
	Toolbar,
	ResourcesUtil,
	LoaderExtensions
) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		// Shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper;

		var MAIN_WEB_PAGE_TITLE = "Demo Kit - \uFFFD SDK",
			WEB_PAGE_TITLE = {
				topic: "Documentation - " + MAIN_WEB_PAGE_TITLE,
				api: "API Reference - " + MAIN_WEB_PAGE_TITLE,
				controls: "Samples - " + MAIN_WEB_PAGE_TITLE,
				demoapps: "Demo Apps - " + MAIN_WEB_PAGE_TITLE,
				tools: "Tools - " + MAIN_WEB_PAGE_TITLE,
				home: MAIN_WEB_PAGE_TITLE
			};

		function getResourcePath(sResource) {

			return ResourcesUtil.getResourcesVersion() && !self['sap-ui-documentation-config'] ?
				window.origin + sResource :
				ResourcesUtil.getResourceOriginPath(sResource);

		}
		// shortcut for sap.m.URLHelper
		var URLHelper = mobileLibrary.URLHelper,
			sNeoAppJsonPath = getResourcePath("/neo-app.json"), /* Load neo-app.json always from root URL */
			sVersionOverviewJsonPath = getResourcePath("/versionoverview.json"), /* Load versionoverview.json always from root URL */
			ABOUT_TEXT = "about",
			FEEDBACK_TEXT = "feedback",
			FEEDBACK_URL = "https://demokit-feedback-proxy.cfapps.eu12.hana.ondemand.com/issue",
			CHANGE_VERSION_TEXT = "change_version",
			CHANGE_SETTINGS_TEXT = "settings",
			CHANGE_COOKIE_PREFERENCES_TEXT = "cookie_preferences",
			DEMOKIT_DEFAULT_LANGUAGE = "en",
			DEMOKIT_APPEARANCE_KEY_LIGHT = "light",
			DEMOKIT_APPEARANCE_KEY_DARK = "dark",
			DEMOKIT_APPEARANCE_KEY_AUTO = "auto",
			DEMOKIT_APPEARANCE = Object.create(null),
			DEMOKIT_CONFIGURATION_LANGUAGE = "language",
			DEMOKIT_CONFIGURATION_APPEARANCE = "appearance",
			SITEMAP = "sitemap";

		DEMOKIT_APPEARANCE[DEMOKIT_APPEARANCE_KEY_LIGHT] = "sap_horizon";
		DEMOKIT_APPEARANCE[DEMOKIT_APPEARANCE_KEY_DARK] = "sap_horizon_dark";
		DEMOKIT_APPEARANCE[DEMOKIT_APPEARANCE_KEY_AUTO] = "sap_horizon"; // fallback if window.matchMedia is not supported

		return BaseController.extend("sap.ui.documentation.sdk.controller.App", {
			formatter: globalFormatter,

			_arrToTreeConverter: function() {
				var aNodes,
					aOriginalArr = this._aNeoAppVersions.slice(),
					aResultArr = [],
					iCounter = 0,
					sCurrGroupTitle = "";

				for (var i = 0; i < aOriginalArr.length; i++) {
					sCurrGroupTitle = aOriginalArr[i].groupTitle;
					iCounter = 0;
					aNodes = [];
					while (aOriginalArr[i] && aOriginalArr[i].groupTitle && aOriginalArr[i].groupTitle === sCurrGroupTitle) {
						aNodes.push(aOriginalArr[i]);
						iCounter++;
						i++;
					}
					i--;
					aResultArr.push({
						"groupTitle": sCurrGroupTitle,
						"version": sCurrGroupTitle + " (" + iCounter + " versions)",
						"nodes": aNodes,
						"path": aNodes[0].path
					});
				}

				return aResultArr;
			},

			onInit : function () {
				BaseController.prototype.onInit.call(this);

				var	oViewModel = new JSONModel({
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
					"<a href='https://openui5.hana.ondemand.com/1.52.4/'>https://openui5.hana.ondemand.com/1.52.4/</a>",
					bUseFeedbackDialog: false // enable to restore previous feedback dialog and hide the Qualtrics surveys
				});

				var oComponent = this.getOwnerComponent();

				this.MENU_LINKS_MAP = {
					"legal": "https://www.sap.com/corporate/en/legal/impressum.html",
					"privacy": "https://www.sap.com/corporate/en/legal/privacy.html",
					"terms_of_use": "https://www.sap.com/corporate/en/legal/terms-of-use.html",
					"copyright": "https://www.sap.com/corporate/en/legal/copyright.html",
					"trademark": "https://www.sap.com/corporate/en/legal/trademark.html",
					"disclaimer": "https://help.sap.com/viewer/disclaimer",
					"sitemap": "sitemap",
					"license": "LICENSE.txt"
				};

				this.getOwnerComponent().loadVersionInfo().then(function () {
					var sProduct;
					if (this.getModel("versionData").getProperty("/isOpenUI5")) {
						this.MENU_LINKS_MAP["Terms of Use"] = "TermsOfUse.txt";
						sProduct = "OPENUI5";
					} else {
						sProduct = "SAPUI5";
					}
					MAIN_WEB_PAGE_TITLE = MAIN_WEB_PAGE_TITLE.replace("\uFFFD", sProduct);
					Object.keys(WEB_PAGE_TITLE).forEach(function(sKey) {
						WEB_PAGE_TITLE[sKey] = WEB_PAGE_TITLE[sKey].replace("\uFFFD", sProduct);
					});

					if (this._sKey) {
						this.appendPageTitle(null).appendPageTitle(WEB_PAGE_TITLE[this._sKey]);
					}

				}.bind(this));

				this._oNewsModel = new JSONModel();
				this.setModel(this._oNewsModel, "news");

				// Cache view reference
				this._oSupportedLangModel = new JSONModel();

				this.setModel(this._oSupportedLangModel, "supportedLanguages");
				this.setModel(new JSONModel(), "messagesData");

				this._oView = this.getView();

				this.setModel(oViewModel, "appView");

				this.oHeader = this._oView.byId("headerToolbar");

				this.oRouter = this.getRouter();

				this._selectHeader = this._oView.byId("selectHeader");
				this._tabHeader = this._oView.byId("tabHeader");

				this._oConfigUtil = this.getOwnerComponent().getConfigUtil();
				this._oCookieNames = this._oConfigUtil.COOKIE_NAMES;
				this._sLocalStorageNewsName = this._oConfigUtil.LOCAL_STORAGE_NAMES['OLD_NEWS_IDS'];

				NewsInfo.prepareNewsData(this._oConfigUtil);

				this._bSupportsPrefersColorScheme = !!(window.matchMedia &&
					(window.matchMedia('(prefers-color-scheme: dark)').matches ||
					window.matchMedia('(prefers-color-scheme: light)').matches));

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

				this.bus = Core.getEventBus();
				this.bus.subscribe("newsChanged", "onDemoKitNewsChanged", this._syncNewsModelWithNewsInfo, this);

				this._createConfigurationBasedOnURIInput();

				this.getOwnerComponent().loadMessagesInfo().then(function (data) {
					if (data) {
						this._updateMessagesModel(data);
					}

				}.bind(this));

				if (this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_REQUIRED_COOKIES) === "1" && this._aConfiguration.length > 0) {
					this._applyCookiesConfiguration(this._aConfiguration);
				} else {
					this._applyDefaultConfiguration(this._aConfiguration);
				}

				this.initSearch();

				// open global search when ctrl + alt + F keys are pressed.
				document.addEventListener("keydown", function(event) {
					if (event.keyCode === KeyCodes.F && event.shiftKey && event.ctrlKey ) {
						this.byId("searchControl")._toggleOpen(true);
					}
				}.bind(this));

				oComponent.getCookiesManagement().then(function(oCookieMgmtComponent) {
					oCookieMgmtComponent.enable(oComponent.getRootControl());
				});

				this.setSurveyModelData();
			},

			_updateMessagesModel: function(oMessagesData) {
				var oMessageCookie = this._oConfigUtil.getCookieValue(this._oCookieNames["DEMOKIT_IMPORTANT_MESSAGES_READ"]),
					iVisibleMessagesCount = 0;

				oMessagesData.messages.length && oMessagesData.messages.forEach(function(message) {
					message.isMessageVisible = (new Date(message.expire).getTime() - new Date()) > 0 &&
						!oMessageCookie.includes(message.id);
					message.isMessageVisible && iVisibleMessagesCount++;
				});

				oMessagesData.iVisibleMessagesCount = iVisibleMessagesCount;

				this.getModel("messagesData").setData(oMessagesData);

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

				this._syncNewsModelWithNewsInfo();
			},

			onExit: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
				if (this.highlighter) {
					this.highlighter.destroy();
				}
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
				this.appendPageTitle(null).appendPageTitle(WEB_PAGE_TITLE[sKey]);
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

			navigateToNews: function() {
				this.getRouter().navTo("news");
			},

			handleNewsPress: function (oEvent) {
				var oButton = oEvent.getSource(),
					oView = this.getView();

				if (this._oNewsModel.getProperty("/newsCount") === 0) {
					this.navigateToNews();
				} else if (!this._oNewsPopover) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.NewsPopover",
						controller: this
					}).then(function(oPopover) {
						oView.addDependent(oPopover);
						this._oNewsPopover = oPopover;
						this._oNewsPopover.openBy(oButton);
					}.bind(this));
				} else {
					this._oNewsPopover.openBy(oButton);
				}
			},

			handleShowAllPress: function () {
				this._oNewsPopover.close();
				this.navigateToNews();
			},

			handleDismissAllPress: function () {
				NewsInfo.moveAllNewItemsToOld();
			},

			handleNewsItemClose: function (oEvent) {
				var oItem = oEvent.getSource(),
					iItemCustomId = oItem.getCustomData()[0].getValue(),
					oItemInfoInItemsProperty = this._oNewsModel.getProperty("/items").find(function(oItem){
						return oItem.id === iItemCustomId;
					});

					NewsInfo.moveNewItemToOld(oItemInfoInItemsProperty);
			},

			handleVisitNewsLink: function(oEvent) {
				var oItem = oEvent.getSource(),
					sItemLink = oItem.getCustomData()[0].getValue();

				URLHelper.redirect(sItemLink, true);
			},

			_syncNewsModelWithNewsInfo: function() {
				var aNewsInfoCopy,
					sPreparationFailureMessage = NewsInfo.getPreparationFailureMessage();

				if (!sPreparationFailureMessage) {
					aNewsInfoCopy = NewsInfo.getNewNewsArray().slice();
					this._oNewsModel.setProperty("/items", aNewsInfoCopy);
					this._oNewsModel.setProperty("/newsCount", aNewsInfoCopy.length);
				}

				this._oNewsModel.setProperty("/newsPreparationFailureMessage", sPreparationFailureMessage);
			},

			handleMenuItemClick: function (oEvent) {
				var sTargetText = oEvent.getParameter("item").getKey(),
					sTarget = this.MENU_LINKS_MAP[sTargetText],
					bUseFeedbackDialog = this.getModel("appView").getProperty("/bUseFeedbackDialog");

				if (sTargetText === ABOUT_TEXT) {
					this.aboutDialogOpen();
				} else if (sTargetText === FEEDBACK_TEXT) {
					if (!bUseFeedbackDialog) {
						this.launchSurvey(oEvent, true);
					} else {
						this.feedbackDialogOpen();
					}
				} else if (sTargetText === CHANGE_SETTINGS_TEXT) {
					this.settingsDialogOpen();
				} else if (sTargetText === CHANGE_COOKIE_PREFERENCES_TEXT) {
					this.getOwnerComponent().getCookiesManagement().then(function(oCookieMgmtComponent) {
						oCookieMgmtComponent.cookieSettingsDialogOpen({ showCookieDetails: true }, this.getView());
					}.bind(this));
				} else if (sTargetText === CHANGE_VERSION_TEXT) {
					this.onChangeVersionButtonPress();
				} else if (DEMOKIT_APPEARANCE[sTargetText]) {
					this._updateAppearance(sTargetText);
				} else if (sTarget === SITEMAP) {
					this.onSiteMapPress();
				} else if (sTarget) {
					URLHelper.redirect(sTarget, true);
				}
				this.sTarget = sTarget;
			},

			createSearchPopover: function() {
				var PlacementType = mobileLibrary.PlacementType,
					searchInput = this.getView().byId("searchControl"),
					oPopover = new ResponsivePopover({
					showArrow: false,
					showHeader: false,
					contentWidth: "600px",
					placement: PlacementType.Vertical,
					horizontalScrolling: false,
					initialFocus: this.getView().byId("searchControl-searchField")
				})
					.addStyleClass("sapMSltPicker-CTX");

				// implement the same <code>open</code> function as in the dialog
				// to allow the controller open the search picker regardless its type (popover or dialog)
				oPopover.open = function() {
					oPopover.openBy(searchInput);
				};

				this.getView().addDependent(oPopover);

				return oPopover;
			},

			createSearchPicker: function() {
				var oPicker = Device.system.phone ? this.createSearchDialog() : this.createSearchPopover();
				this.createSearchPickerContent().then(function(oContent) {
					oPicker.addContent(oContent);
				});
				return oPicker;
			},

			createSearchDialog: function () {
				var dialog,
					originalValue,
					dialogSearchField,
					customHeader,
					okButton,
					closeButton,
					bSearchRequested;

				var oInput = this.getView().byId("searchControl");

				// use sap.ui.require to avoid circular dependency between the SearchField and Suggest
				dialogSearchField = new (sap.ui.require('sap/m/SearchField'))({
					liveChange : function (oEvent) {
						var value = oEvent.getParameter("newValue");
						oInput._updateValue(value);
						oInput.fireLiveChange({newValue: value});
					},
					search : function (oEvent) {
						if (!oEvent.getParameter("clearButtonPressed")) {
							dialog.close();
							bSearchRequested = true;
						}
					}
				});

				closeButton = new Button({
					icon : "sap-icon://decline",
					press : function() {
						dialog._oCloseTrigger = true;
						dialog.close();
						oInput._updateValue(originalValue);
					}
				});

				customHeader = new Toolbar({
					content: [dialogSearchField, closeButton]
				});

				okButton = new Button({
					text : Core.getLibraryResourceBundle("sap.m").getText("MSGBOX_OK"),
					press : function() {
						dialog.close();
					}
				});

				function moveCursorToEnd(el) {
					if (typeof el.selectionStart == "number") {
						el.selectionStart = el.selectionEnd = el.value.length;
					} else if (typeof el.createTextRange != "undefined") {
						el.focus();
						var range = el.createTextRange();
						range.collapse(false);
						range.select();
					}
				}

				dialog = new (sap.ui.require('sap/m/Dialog'))({
					stretch: true,
					customHeader: customHeader,
					beginButton : okButton,
					beforeClose: function () {
						oInput._bSuggestionSuppressed = true;
					},
					beforeOpen: function() {
						originalValue = oInput.getValue();
						dialogSearchField._updateValue(originalValue);
						bSearchRequested = false; // reset flag
					},
					afterOpen: function() {
						var $input = dialogSearchField.$().find('input');
						$input.trigger("focus");
						moveCursorToEnd($input.get(0));
					},
					afterClose: function(oEvent) {
						if (bSearchRequested) { // fire the search event if not cancelled
							oInput.fireSearch({
								query: oInput.getValue(),
								clearButtonPressed: false
							});
						}
					}
				});

				this.getView().addDependent(dialog);

				return dialog;
			},

			createSearchPickerContent: function() {
				return Fragment.load({
					name: "sap.ui.documentation.sdk.view.GlobalSearchPicker",
					controller: this
				}).then(function(oContent) {

					var oShortList =  Core.byId("shortList"),
						oController = this,
						sSearchQuery;

					oShortList.addEventDelegate({
						onAfterRendering: function() {
							var oConfig = {
								useExternalStyles: false,
								shouldBeObserved: true,
								isCaseSensitive: false
							};

							oController.highlighter = new Highlighter(oShortList.getDomRef(), oConfig);
							sSearchQuery = oController.getModel("searchData").getProperty("/query");
							sSearchQuery && oController.highlighter.highlight(sSearchQuery);
							oShortList.removeEventDelegate(this);
						}
					});

					return oContent;
				}.bind(this));
			},

			initSearch: function() {
				// set the search data to custom search`s suggestions
				var oModel = this.getModel("searchData"),
				oSectionToRoutesMap = {
					"topics": ["topic", "topicId", "subTopicId"],
					"entity": ["sample", "controlsMaster", "controls", "code", "entity"],
					"apiref": ["api", "apiSpecialRoute", "apiId"]
				};

				// update current section on navigate
				this.oRouter.attachRouteMatched(function() {
					oModel.setProperty("/preferencedCategory", null);
				});
				Object.keys(oSectionToRoutesMap).forEach(function(sSectionKey) {
					var aRoutes = oSectionToRoutesMap[sSectionKey];
					aRoutes.forEach(function(sRoute) {
						this.oRouter.getRoute(sRoute).attachPatternMatched(function() {
							oModel.setProperty("/preferencedCategory", sSectionKey);
						});
					}.bind(this));
				}.bind(this));
			},

			getSearchPickerTitle: function(oContext) {
				var getMessageBundle = Core.getLibraryResourceBundle("sap.ui.documentation"),
				sTitle;

				switch (this.getModel("searchData").getProperty("/preferencedCategory")) {
					case "topics":
						sTitle =  getMessageBundle.getText("SEARCH_SUGGESTIONS_TITLE_DOCUMENTATION");
						break;
					case "apiref":
						sTitle =  getMessageBundle.getText("SEARCH_SUGGESTIONS_TITLE_API_REFERENCE");
						break;
					case "entity":
						sTitle =  getMessageBundle.getText("SEARCH_SUGGESTIONS_TITLE_SAMPLES");
						break;
					default:
						sTitle =  getMessageBundle.getText("SEARCH_SUGGESTIONS_TITLE_ALL");
				}

				return sTitle;
			},

			onSearchResultsSummaryPress: function(oEvent) {
				var sCategory = oEvent.oSource.data("category");
				this.navToSearchResults(sCategory);
			},

			onSearchPickerItemPress: function(oEvent) {
				var contextPath = oEvent.oSource.getBindingContextPath(),
					oDataItem = this.getModel("searchData").getProperty(contextPath);
				this.getRouter().parsePath(oDataItem.path);
				this.oPicker.close();
			},

			/**
			 * Updates the appearance of the Demo Kit depending of the incoming appearance keyword.
			 * If the keyword is "auto" the appearance will be updated to light or dark depending on the
			 * user's OS settings.
			 * @param {string} sKey the appearance keyword
			 * @private
			 */
			_updateAppearance: function(sKey) {
				if (sKey === DEMOKIT_APPEARANCE_KEY_AUTO && this._bSupportsPrefersColorScheme) {
					this._toggleLightOrDarkAppearance(window.matchMedia('(prefers-color-scheme: dark)').matches);
					this._attachPrefersColorSchemeChangeListener();
				} else {
					Core.applyTheme(DEMOKIT_APPEARANCE[sKey]);
				}

				this._sLastKnownAppearanceKey = sKey;

				this.bus.publish("themeChanged", "onDemoKitThemeChanged", {sThemeActive: DEMOKIT_APPEARANCE[sKey]});

				if (this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_REQUIRED_COOKIES) === "1") {
					this._oConfigUtil.setCookie(DEMOKIT_CONFIGURATION_APPEARANCE, sKey);
				}
			},

			/**
			 * Toggles the appearance of the Demo Kit to light or dark depending on the incoming argument.
			 * @param {boolean} bIsDark whether the new appearance should be dark
			 * @private
			 */
			_toggleLightOrDarkAppearance: function (bIsDark) {
				if (bIsDark) {
					// dark mode
					Core.applyTheme(DEMOKIT_APPEARANCE[DEMOKIT_APPEARANCE_KEY_DARK]);
				} else {
					// light mode or unsupported prefers-color-scheme
					Core.applyTheme(DEMOKIT_APPEARANCE[DEMOKIT_APPEARANCE_KEY_LIGHT]);
				}
			},

			/**
			 * Attaches an event listener to the 'change' event of the prefers-color-scheme media.
			 * Depending on the change and the last known appearance, the appearance of the Demo Kit is changed to light or dark.
			 * @private
			 */
			_attachPrefersColorSchemeChangeListener: function() {
				var that = this;

				if (!this._bAttachedPrefersColorSchemeChangeListener) {
					var oQuery = window.matchMedia('(prefers-color-scheme: dark)');
					var toggleAppearance = function(e) {
						if (that._sLastKnownAppearanceKey === DEMOKIT_APPEARANCE_KEY_AUTO) {
							that._toggleLightOrDarkAppearance(e.matches);
							that.bus.publish("themeChanged", "onDemoKitThemeChanged", {
								sThemeActive: DEMOKIT_APPEARANCE[e.matches ? DEMOKIT_APPEARANCE_KEY_DARK : DEMOKIT_APPEARANCE_KEY_LIGHT]
							});
						}
					};
					if (oQuery.addEventListener) {
						oQuery.addEventListener('change', toggleAppearance);
					} else { // Safari 13 and older only supports deprecated MediaQueryList.addListener
						oQuery.addListener(toggleAppearance);
					}
					this._bAttachedPrefersColorSchemeChangeListener = true;
				}
			},

			/**
			 * Creates configuration for the application regarding the URI input.
			 * @private
			 */
			_createConfigurationBasedOnURIInput: function () {
				var oUriParams = UriParameters.fromQuery(window.location.search);
				this._aConfiguration = [];

				if (!(oUriParams.has('sap-ui-language') || oUriParams.has('sap-language'))) {
					this._aConfiguration.push(DEMOKIT_CONFIGURATION_LANGUAGE);
				}

				if (!(oUriParams.has('sap-ui-theme') || oUriParams.has('sap-theme'))) {
					this._aConfiguration.push(DEMOKIT_CONFIGURATION_APPEARANCE);
				}
			},

			/**
			 * Applies configuration for the application regarding the default values.
			 * @private
			 */
			_applyDefaultConfiguration: function () {
				this._aConfiguration.forEach(function(sConf){
					if (sConf === DEMOKIT_CONFIGURATION_LANGUAGE) {
						Core.getConfiguration().setLanguage(DEMOKIT_DEFAULT_LANGUAGE);
					} else if (sConf === DEMOKIT_CONFIGURATION_APPEARANCE) {
						this._updateAppearance(DEMOKIT_APPEARANCE_KEY_AUTO);
					}
				}, this);

				this._oSupportedLangModel.setProperty("/selectedLang", Core.getConfiguration().getLanguage());
			},

			/**
			 * Applies configuration for the application regarding the cookies.
			 * @private
			 */
			_applyCookiesConfiguration: function () {
				var sCookieValue, sConf, i;

				for (i = 0; i < this._aConfiguration.length; i++) {
					sConf = this._aConfiguration[i];
					sCookieValue = this._oConfigUtil.getCookieValue(sConf);

					if (sCookieValue !== "") {
						if (sConf === DEMOKIT_CONFIGURATION_LANGUAGE) {
							this._setSelectedLanguage(sCookieValue);
						} else if (sConf === DEMOKIT_CONFIGURATION_APPEARANCE) {
							this._updateAppearance(sCookieValue);
						}

						// If we have available value for the given cookie we remove it from the configuration array.
						this._aConfiguration.splice(i, 1);
						i--;
					}
				}

				// If we still have configurations which are not set by their cookie values, we apply their default values.
				if (this._aConfiguration.length > 0) {
					this._applyDefaultConfiguration();
				}
			},

			/*
			 * Helper for function for preparing the data for the SupportedLangModel.
			 * @private
			 * @returns {Array[Object]} Array of objects containg the needed data for the SupportedLangModel
			 */
			_prepareSupportedLangModelData: function () {
				return Core.getConfiguration().getLanguagesDeliveredWithCore().reduce(function(result, sLangAbbreviation) {
					var langName,
							sLang = sLangAbbreviation,
							sLangRegion = sLangAbbreviation;

					if (typeof sLangAbbreviation === "string" && sLangAbbreviation.length > 0) {

						switch (sLangAbbreviation) {
							case "sh": //Serbian
								sLang = "sr_Latn";
								break;
							case "no": //Norwegian
								sLang = "nb";	// Bokmål
								break;
							case "iw": // Israel
								// Hebrew
								sLang  = "he";
								sLangRegion = "he";
								break;
							case "zh_TW": // Taiwan
								// Chinese Traditional
								sLangRegion = "zh_Hant";
								break;
							case "zh_CN": // People's Republic of China
								// Chinese Simplified
								sLangRegion = "zh_Hans";
								break;
						}

						result.push(new Promise(function (resolve, reject) {
							LoaderExtensions.loadResource("sap/ui/core/cldr/" + sLang + ".json",  {async: true})
								.then(function(locale) {
									langName = locale.languages[sLangRegion];

									resolve({
										"text": typeof langName === 'string' ? langName.charAt(0).toUpperCase() + langName.substring(1) : "Unknown",
										"key": sLangAbbreviation
									});
								});
						}));
					}

					return result;
				}, []);
			},

			/**
			 * Sets the selected language code abbreviation
			 * @param {string} sLanguage language code abbreviation
			 * @private
			 */
			_setSelectedLanguage: function(sLanguage) {
				this._oSupportedLangModel.setProperty("/selectedLang", sLanguage);
				Core.getConfiguration().setLanguage(sLanguage);
				if (this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_REQUIRED_COOKIES) === "1") {
					this._oConfigUtil.setCookie(DEMOKIT_CONFIGURATION_LANGUAGE, sLanguage);
				}
			},

			/**
			 * Gets the selected language code abbreviation
			 * @private
			 * @returns {string} sLanguage language code abbreviation
			 */
			_getSelectedLanguage: function() {
				return this._oSupportedLangModel.getProperty("/selectedLang");
			},

			/**
			 * Opens the settings dialog
			 * @public
			 */
			settingsDialogOpen: function () {
				var oModel;

				if (!this._oSettingsDialog) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.globalSettingsDialog",
						controller: this
					}).then(function (oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						this._oView.addDependent(oDialog);
						this._oSettingsDialog = oDialog;
						Core.byId("LanguageSelect").setSelectedKey(this._getSelectedLanguage());
						this._oSettingsDialog.open();
					}.bind(this));
				} else {
					this._oSettingsDialog.open();
				}

				if (!this._oSupportedLangModel.getProperty("/langs")) {
					oModel = this._oSupportedLangModel;
					oModel.setProperty("/selectBusy", true);
					Promise.all(this._prepareSupportedLangModelData()).then(function (result) {
						oModel.setProperty("/selectBusy", false);
						oModel.setProperty("/langs", result);
					});
				}
			},

			/**
			 * Closes the settings dialog
			 * @public
			 */
			handleCloseAppSettings: function () {
				this._oSettingsDialog.close();
			},

			/**
			 * Saves settings from the settings dialog
			 * @public
			 */
			handleSaveAppSettings: function () {
				var sLanguage = Core.byId('LanguageSelect').getSelectedKey();

				this._oSettingsDialog.close();

				// handle settings change
				this._applyAppConfiguration(sLanguage);
			},

			/**
			 * Apply content configuration
			 * @param {string} sLanguage language code abbreviation
			 * @private
			 */
			_applyAppConfiguration: function(sLanguage){
				this._setSelectedLanguage(sLanguage);
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
						oDialogData.noData = true;
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
					oFilter = new Filter("version", FilterOperator.Contains, sSearchedValue),
					oTree = Core.byId("versionList"),
					oBinding = oTree.getBinding("items");

				oBinding.filter([oFilter]);

				// If only one branch of the version info tree is currently left after filtering
				if (oBinding.getChildCount() === 1) {
					// expand the only branch of the version info tree
					oBinding.expand(0);
				} else {
					// collapse all of the branches of the version info tree
					oTree.collapseAll();
				}
			},

			onLogoIconPress: function () {
				this.oRouter.navTo("welcome", {});
			},

			onSiteMapPress: function () {
				this.oRouter.navTo("sitemap", {});
			},

			onLatestVersionItemPress: function() {
				if (ResourcesUtil.getResourcesVersion()) {
					window.sessionStorage.removeItem("versionPrefixPath");
					window.location.reload();
				} else {
					window.location.href = "/";
				}
			},

			onVersionItemPress: function (oEvent) {
				var oSelectedItem = sap.ui.getCore().byId("versionList").getSelectedItem(),
					oCustomData = oSelectedItem.getCustomData()[0];

				if (oCustomData && oCustomData.getKey() === "path") {

					if (ResourcesUtil.getHasProxy()) {
						window.sessionStorage.setItem("versionPrefixPath", oCustomData.getValue());
						window.location.reload();
					} else {
						window.location.href = oCustomData.getValue(); // Domain relative redirect
					}
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

				oChangeVersionDialogModel.setData(this._arrToTreeConverter(this._aNeoAppVersions));

				return oChangeVersionDialogModel;
			},

			/**
			 * Opens a dialog to give feedback on the demo kit
			 */
			feedbackDialogOpen: function () {
				var that = this;
				var oResourceBundle;

				if (!this._oFeedbackDialog) {
					oResourceBundle = this.getModel("i18n").getResourceBundle();

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
							status : "Excellent",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_EXCELLENT")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "good"),
							status : "Good",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_GOOD")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "average"),
							status : "Average",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_AVERAGE")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "poor"),
							status : "Poor",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_POOR")
						},
						{
							button : Fragment.byId("feedbackDialogFragment", "veryPoor"),
							status : "Very Poor",
							displayStatus: oResourceBundle.getText("FEEDBACK_DIALOG_STATUS_VERY_POOR")
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
			 * Opens the Qualtrics UX survey when the feedback button gets pressed.
			 * There are two available surveys - a short one (all year round), and quarterly survey.
			 *
			 * Depending on the number of available surveys:
			 * - Directly opens the short survey in a new tab.
			 * - If a long, quarterly survey is available, opens a popover with links for both.
			 *
			 * @param {sap.ui.base.Event} oEvent The feedback/menu button's press event
			 * @param {boolean} bMenu Whether the pressed button is hidden in the 'About' menu
			 */
			launchSurvey: function (oEvent, bMenu) {
				var oTarget = this.byId(!bMenu ? "surveyButton" : "aboutMenuButton"),
					oView = this.getView(),
					oViewModel = this.getModel("appView"),
					bShowLongSurvey = oViewModel.getProperty("/bShowLongSurvey");

				if (!bShowLongSurvey) {
					this.shortSurveyRedirect();
				} else if (!this._oSurveyPopover) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.SurveyPopover",
						controller: this
					}).then(function (oPopover) {
						oView.addDependent(oPopover);
						this._oSurveyPopover = oPopover;

						if (Device.system.phone) {
							this.addSurveyPopoverCloseBtn();
						}

						this._oSurveyPopover.openBy(oTarget);
					}.bind(this));
				} else {
					this._oSurveyPopover.openBy(oTarget);
				}
			},

			/**
			 * Closes the survey popover on mobile.
			 * @param {sap.ui.base.Event} oEvent The close button's press event
			 */
			closeSurveyPopover: function (oEvent) {
				this._oSurveyPopover.close();
			},

			shortSurveyRedirect: function () {
				var sQueryParams = "?product=SAPUI5&product_filter=UI5&cluster=BTP",
					sProdURL = "https://sapinsights.eu.qualtrics.com/jfe/form/SV_2gcfdw3EYYOIz5A" + sQueryParams,
					sDevURL = "https://sapinsights.eu.qualtrics.com/jfe/form/SV_d3UPNymSgUHAb9Y" + sQueryParams,
					bProd = !this.getModel("versionData").getProperty("/isDevEnv");

				// This survey could be displayed in a Qualtrics intercept
				// dialog in the future, instead of a new tab
				URLHelper.redirect(bProd ? sProdURL : sDevURL, true);
			},

			longSurveyRedirect: function () {
				var sBaseURL = "https://sapinsights.eu.qualtrics.com/jfe/form/SV_7X5P63Zg5zXC5zE",
					sBaseQueryParams = "?product=SAPUI5&product_filter=UI5&cluster=BTP",
					sProdURL = sBaseURL + sBaseQueryParams,
					sDevURL = sBaseURL + sBaseQueryParams + "&Q_CHL=preview&Q_SurveyVersionID=current",
					bProd = !this.getModel("versionData").getProperty("/isDevEnv");

				URLHelper.redirect(bProd ? sProdURL : sDevURL, true);
			},

			setSurveyModelData: function () {
				var oViewModel = this.getModel("appView"),
					dCurrentDate = new Date(),
					iCurrentYear = dCurrentDate.getFullYear(),
					aDateSpans = [
						[new Date(iCurrentYear, 1, 1), new Date(iCurrentYear, 1, 21)], // Feb 1-21
						[new Date(iCurrentYear, 4, 1), new Date(iCurrentYear, 4, 21)], // May 1-21
						[new Date(iCurrentYear, 7, 1), new Date(iCurrentYear, 7, 21)], // Aug 1-21
						[new Date(iCurrentYear, 10, 1), new Date(iCurrentYear, 10, 21)] // Nov 1-21
					],
					bDateInSpan = false,
					sLastAvailableDate;

					aDateSpans.forEach(function (aDateSpan) {
						var dMinDate = aDateSpan[0],
							dMaxDate = aDateSpan[1];

						if (dCurrentDate >= dMinDate && dCurrentDate <= dMaxDate) {
							bDateInSpan = true;
							sLastAvailableDate = dMaxDate.toLocaleDateString();
							return;
						}
					});

					oViewModel.setProperty("/bShowLongSurvey", bDateInSpan);

					if (bDateInSpan) {
						oViewModel.setProperty("/sLongSurveyLastDate", sLastAvailableDate);
					}
			},

			addSurveyPopoverCloseBtn: function () {
				var oResourceBundle = this.getModel("i18n").getResourceBundle(),
					fCloseBtnHandler = this.closeSurveyPopover.bind(this),
					oCloseButton = new Button({
						text: oResourceBundle.getText("SURVEY_POPOVER_CLOSE_BTN"),
						press: fCloseBtnHandler
					});

				this._oSurveyPopover.setEndButton(oCloseButton);
			},

			/**
			 * Event handler for the send feedback button
			 */
			onFeedbackDialogSend: function() {
				var oVersionInfo = Version(sap.ui.version),
				data = {
						"text": this._oFeedbackDialog.textInput.getValue(),
						"rating": this._oFeedbackDialog.ratingStatus.value,
						"major": oVersionInfo.getMajor(),
						"minor": oVersionInfo.getMinor(),
						"patch": oVersionInfo.getPatch(),
						"distribution": this._getUI5Distribution(),
						"snapshot": oVersionInfo.getSuffix().indexOf("SNAPSHOT") > -1,
						"url": this._getCurrentURL(),
						"page": this._getCurrentPageRelativeURL(),
						"pageContext": this._oFeedbackDialog.contextCheckBox.getSelected()
					},
					oResourceBundle = this.getModel("i18n").getResourceBundle();

				// send feedback
				this._oFeedbackDialog.setBusyIndicatorDelay(0);
				this._oFeedbackDialog.setBusy(true);

				jQuery.ajax({
					url: FEEDBACK_URL,
					type: "POST",
					contentType: "application/json",
					data: JSON.stringify(data)
				}).
				done(
					function () {
						MessageBox.success(oResourceBundle.getText("FEEDBACK_DIALOG_TEXT_SUCCESS"), {
							title: oResourceBundle.getText("FEEDBACK_DIALOG_TITLE_SUCCESS")
						});
						this._oFeedbackDialog.reset();
						this._oFeedbackDialog.close();
						this._oFeedbackDialog.setBusy(false);
					}.bind(this)
				).
				fail(
					function (oRequest, sStatus, sError) {
						var sErrorDetails = sError; // + "\n" + oRequest.responseText;
						MessageBox.error(oResourceBundle.getText("FEEDBACK_DIALOG_TEXT_ERROR") + sErrorDetails, {
							title: oResourceBundle.getText("FEEDBACK_DIALOG_TITLE_ERROR")
						});
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
			 * @param {sap.ui.base.Event} oEvent
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
									setRatingStatus("Success", oRatingBarElement.displayStatus, 5);
									break;
								case "Good":
									setRatingStatus("Success", oRatingBarElement.displayStatus, 4);
									break;
								case "Average":
									setRatingStatus("None", oRatingBarElement.displayStatus, 3);
									break;
								case "Poor":
									setRatingStatus("Warning", oRatingBarElement.displayStatus, 2);
									break;
								case "Very Poor":
									setRatingStatus("Error", oRatingBarElement.displayStatus, 1);
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
				var sQuery = encodeURIComponent( oEvent.getParameter("query") );
				if (!sQuery) {
					return;
				}
				this.getRouter().navTo("search", {searchParam: sQuery}, false);
				this.oPicker.close();
			},

			navToSearchResults : function (sCategory) {
				var sQuery = this.getModel("searchData").getProperty("/query"),
					oRouterParams = {searchParam: sQuery};

				if (!sQuery) {
					return;
				}

				if (sCategory) {
					oRouterParams["?options"] = {
						category: sCategory
					};
				}

				this.getRouter().navTo("search", oRouterParams, true);
				this.oPicker.close();
			},

			onSearchLiveChange: function(oEvent) {
				var oModel = this.getModel("searchData"),
				sQuery = oEvent.getParameter("newValue"),
				sPreferencedCategory = oModel.getProperty("/preferencedCategory"),
				bIncludeDeprecated = oModel.getProperty("/includeDeprecated");

				if (!this.oPicker) {
					this.oPicker = this.createSearchPicker();
				}

				if (!this.oPicker.isOpen()) {
					this.oPicker.open();
				}

				if (this.highlighter) {
					this.highlighter.highlight(sQuery);
				}

				oModel.setProperty("/query",sQuery);
				SearchUtil.search(sQuery, {
					preferencedCategory: sPreferencedCategory,
					includeDeprecated: bIncludeDeprecated
				}).then(function(result) {
					oModel.setProperty("/matches", result.matches);
				});
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

			_processVersionOverview: function(oVersionOverviewJson) {
				var aVersions = oVersionOverviewJson.versions,
					aResult = [];

				if (Array.isArray(aVersions)) {
					aVersions = aVersions.filter(function(oVersion) {
						return !!oVersion.hidden;
					}).forEach(function(oVersion) {
						var aHiddenVersions = oVersion.hidden.split(",").map(function(sVersion) {
							return sVersion.trim();
						});

						aResult = aResult.concat(aHiddenVersions);
					});
				}

				return aResult;
			},

			_processNeoAppJSON: function(oNeoAppJson) {
				var oVersionModel = this.getModel("versionData"),
					bIsInternal = oVersionModel.getProperty("/isInternal"),
					bIsSnapshotVersion = oVersionModel.getProperty("/isSnapshotVersion"),
					aRoutes = [];

				if (!(oNeoAppJson && oNeoAppJson.routes)) {
					Log.warning("No versions were found");
					return;
				}

				aRoutes = oNeoAppJson.routes;

				// Current version would be displayed for a second time as the last element,
				// therefore we should skip it to avoid duplicate items in the dialog.
				aRoutes.pop();

				// Store needed data
				if (!bIsInternal && !bIsSnapshotVersion) {
					aRoutes = aRoutes.filter(function(oRoute) {
						return oRoute.target.version.indexOf("-beta") === -1;
					});
				}

				aRoutes = aRoutes.map(function(oRoute) {
					var oVersion = Version(oRoute.target.version),
						oVersionSummary = {};

					// Add the following properties, in order use them for grouping later
					oVersionSummary.patchVersion = oVersion.getPatch(); // E.g: Extract 5 from "1.52.5"
					oVersionSummary.groupTitle = oVersion.getMajor() + "." + oVersion.getMinor(); // E.g: Extract "1.52" from "1.52.5"
					oVersionSummary.version = oVersion.toString();
					oVersionSummary.path = oRoute.path;

					return oVersionSummary;
				});

				return aRoutes;
			},

			_requestVersionInfo: function () {
				Promise.all([
						jQuery.ajax(sNeoAppJsonPath),
						jQuery.ajax(sVersionOverviewJsonPath)
					]).then(
					// Success
					function(oValues) {
						var aNeoAppVersions = this._processNeoAppJSON(oValues[0]),
							aHiddenValues = this._processVersionOverview(oValues[1]);

						if (Array.isArray(aNeoAppVersions)) {
							aNeoAppVersions = aNeoAppVersions.filter(function(oVersion) {
								return aHiddenValues.indexOf(oVersion.version) === -1;
							});

							this._aNeoAppVersions = aNeoAppVersions;
							// Make version select visible
							this._updateVersionSwitchVisibility();
							this.getModel("versionData").setProperty("/latestVersion", this._aNeoAppVersions[0].version);
						} else {
							Log.warning("No multi-version environment detected");
						}
					}.bind(this),
					// Error
					function() {
						Log.warning("No neo-app.json or versionoverview.json was detected");
					}
				);
			},

			_getUI5Version: function () {
				return ResourcesUtil.getResourcesVersion() ?
					window.sessionStorage.getItem("versionPrefixPath") : this.getModel("versionData").getProperty("/version");
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
				var currentLocation = window.location;
				return currentLocation.pathname + currentLocation.hash + currentLocation.search;
			},

			_getCurrentURL: function () {
				var currentLocation = window.location;
				return currentLocation.href;
			},

			_setHeaderSelectedKey: function(sKey) {
				this._selectHeader.setSelectedKey(sKey);
				this._tabHeader.setSelectedKey(sKey);
				this._sKey = sKey;
			},

			onCloseImportantMessage: function (oEvent) {
				var aMessageCookie = this._oConfigUtil.getCookieValue(this._oCookieNames["DEMOKIT_IMPORTANT_MESSAGES_READ"])
						.split(",").filter(function(id) { return id !== ''; }),
					oCustomData = oEvent.getSource().getCustomData().find(function(oCustomData) {
						return oCustomData.getKey() === "messageID";
					}),
					oId = oCustomData.getValue();

				aMessageCookie.push(oId);
				this._oConfigUtil.setCookie(this._oCookieNames["DEMOKIT_IMPORTANT_MESSAGES_READ"], aMessageCookie.join(","));

				this._updateMessagesModel(this.getModel("messagesData").getData());
			}
		});
	}
);
