/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/m/GroupHeaderListItem",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/base/util/Version",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/UriParameters",
	"sap/ui/util/Storage",
	"sap/ui/core/Core",
	"sap/ui/documentation/sdk/controller/util/Highlighter"
], function(
	jQuery,
	Device,
	BaseController,
	JSONModel,
	ControlsInfo,
	GroupHeaderListItem,
	Filter,
	Sorter,
	Version,
	jQueryDOM,
	UriParameters,
	Storage,
	Core,
	Highlighter
) {
		"use strict";

		var COZY = "cozy",
			COMPACT = "compact",
			CONDENSED = "condensed";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ControlsMaster", {

			_oStorage: new Storage(Storage.Type.local),
			_sStorageKey: "UI5_EXPLORED_LIST_SETTINGS_FROM_1_48",
			_oViewSettings: {
				densityMode: COMPACT,
				themeActive: "sap_fiori_3",
				rtl: false
			},
			_oDefaultSettings: {
				densityMode: COMPACT,
				themeActive: "sap_fiori_3",
				rtl: false
			},
			_oListSettings: {
				filter: {},
				groupProperty: "category",
				groupDescending: false,
				version: Version(sap.ui.version).getMajor() + "." + Version(sap.ui.version).getMinor()
			},
			_mGroupFunctions: {
				"name": function (oContext) {
					var sKey = oContext.getProperty("name").charAt(0);
					return {
						key: sKey,
						text: sKey
					};
				},
				"namespace": true,
				"category": true,
				"since": true,
				"formFactors": true
			},
			_sFilterValue: "",

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the master list controller is instantiated.
			 * It sets up the event handling for the master/detail communication and other lifecycle tasks.
			 * @public
			 */
			onInit : function () {
				this._oList = this.byId("exploredMasterList");

				var oEntityModel, oDeviceModel, oFilterModel,
					fnOnDataReady = function (oControlsData) {
						this._oView.getModel().setData({
							entityCount : oControlsData.entityCount,
							entities : oControlsData.entities
						});
						this.getModel("filter").setData(oControlsData.filter);
						this._toggleListItem(this._getItemToSelect(), true);
					}.bind(this);

				this._oRouter = this.getRouter();

				// Keep track if navigation happens via selecting items manually within the List
				this._bNavToEntityViaList = false;

				// Cache view reference
				this._oView = this.getView();

				ControlsInfo.loadData().then(fnOnDataReady);

				oEntityModel = new JSONModel();
				oEntityModel.setSizeLimit(100000);
				this._oView.setModel(oEntityModel);

				oDeviceModel = new JSONModel({
					listMode : (Device.system.phone) ? "None" : "SingleSelectMaster",
					listItemType : (Device.system.phone) ? "Active" : "Inactive"
				});
				oDeviceModel.setDefaultBindingMode("OneWay");
				this._oView.setModel(oDeviceModel, "viewModel");

				// Init Filter model
				oFilterModel = new JSONModel();
				oFilterModel.setSizeLimit(100000);
				this.setModel(oFilterModel, "filter");

				this._vsFilterBar = this._oView.byId("vsFilterBar");
				this._vsFilterLabel = this._oView.byId("vsFilterLabel");

				this._oRouter.getRoute("listFilter").attachPatternMatched(this._onFilterMatched, this);
				this._oRouter.getRoute("group").attachPatternMatched(this._onGroupMatched, this);
				this._oRouter.getRoute("entity").attachPatternMatched(this._onEntityMatched, this);
				this._oRouter.getRoute("sample").attachPatternMatched(this._onSampleMatched, this);
				this._oRouter.getRoute("code").attachPatternMatched(this._onSampleMatched, this);
				this._oRouter.getRoute("codeFile").attachPatternMatched(this._onSampleMatched, this);
				this._oRouter.getRoute("controls").attachPatternMatched(this._onControlsMatched, this);
				this._oRouter.getRoute("controlsMaster").attachPatternMatched(this._onControlsMasterMatched, this);

				this.LIST_SCROLL_DURATION = 0; // ms

				//DOM rendering delay is used before calling scroll, to ensure scroll is applied to the final DOM
				//DOM rendering delay value is minimal by default, but some function may increase it if that function calls intensive DOM operation
				// (e.g. RTL change, that leads to new CSS to be requested and applied on entire DOM)
				this._iDomRenderingDelay = 0; // (ms)
				this._getList().addEventDelegate({
					onAfterRendering : function() {
						setTimeout(this._scrollToSelectedListItem.bind(this), this._iDomRenderingDelay);
					}}, this);
				this._oCore.attachThemeChanged(this._scrollToSelectedListItem, this); // theme change requires us to restore scroll position
				this._oCore.attachLocalizationChanged(this._onLocalizationChange, this);

				// Subscribe to view event to apply to it the current configuration
				this._oView.addEventDelegate({
					onBeforeFirstShow: this.onBeforeFirstShow.bind(this)
				});

				// subscribe to app events
				this._oComponent = this.getOwnerComponent();
				this._oRootView = this.getRootView();

				switch (this._oComponent.getContentDensityClass()) {
					case "sapUiSizeCompact":
						this._oViewSettings.densityMode = COMPACT;
						break;
					case "sapUiSizeCondensed":
						this._oViewSettings.densityMode = CONDENSED;
						break;
					default:
						this._oViewSettings.densityMode = COZY;
				}

				this._oViewSettings.rtl = this._oCore.getConfiguration().getRTL();

				// Keep default settings for density mode up to date
				this._oDefaultSettings.densityMode = this._oViewSettings.densityMode;
				this._oDefaultSettings.rtl = this._oViewSettings.rtl;

				this._initListSettings();

				this.bus = Core.getEventBus();

			},

			onAfterRendering: function () {
				if (!this.highlighter) {
					this.highlighter = new Highlighter(this._oList.getDomRef(), {
						shouldBeObserved: true
					});
				}
			},

			_viewSettingsResetOnNavigation: function (oEvent) {
				var sRouteName = oEvent.getParameter("name");
				if (["group", "entity", "sample", "code", "code_file", "controls", "controlsMaster", "listFilter"].indexOf(sRouteName) === -1) {
					// Reset view settings
					this._applyAppConfiguration(this._oDefaultSettings.themeActive,
						this._oDefaultSettings.densityMode,
						this._oDefaultSettings.rtl);

					// When we restore the default settings we don't need the event any more
					this.getRouter().detachBeforeRouteMatched(this._viewSettingsResetOnNavigation, this);
				}
			},

			/**
			 * Initialize the list settings. At first local storage is checked. If this is empty defaults are used.
			 * @private
			 */
			_initListSettings: function () {
				var sJson = this._oStorage.get(this._sStorageKey);
				if (sJson) {
					this._oListSettings = JSON.parse(sJson);
				}
			},

			/**
			 * Toggles content density classes in the provided html body
			 * @param {object} oBody the html body to set the correct class on
			 * @param {string} sDensityMode content density mode
			 * @private
			 */
			_toggleContentDensityClasses: function(oBody, sDensityMode){
				switch (sDensityMode) {
					case COMPACT:
						oBody.toggleClass("sapUiSizeCompact", true).toggleClass("sapUiSizeCozy", false).toggleClass("sapUiSizeCondensed", false);
						break;
					case CONDENSED:
						oBody.toggleClass("sapUiSizeCondensed", true).toggleClass("sapUiSizeCozy", false).toggleClass("sapUiSizeCompact", true);
						break;
					default:
						oBody.toggleClass("sapUiSizeCozy", true).toggleClass("sapUiSizeCondensed", false).toggleClass("sapUiSizeCompact", false);
				}
			},

			/**
			 * Apply content configuration
			 * @param {string} sThemeActive name of the theme
			 * @param {string} sDensityMode content density mode
			 * @param {boolean} bRTL right to left mode
			 * @private
			 */
			_applyAppConfiguration: function(sThemeActive, sDensityMode, bRTL){
				var oSampleFrameContent,
					oSampleFrameCore,
					$SampleFrame,
					bRTLChanged,
					bThemeChanged,
					bContentDensityChanged;

				// Handle content density change
				if (this._oViewSettings.densityMode !== sDensityMode) {
					this._toggleContentDensityClasses(jQueryDOM(document.body), sDensityMode);
					this._oViewSettings.densityMode = sDensityMode;
					bContentDensityChanged = true;
				}

				// Handle RTL mode change
				if (this._oViewSettings.rtl !== bRTL) {
					this._oCore.getConfiguration().setRTL(bRTL);

					this._oViewSettings.rtl = bRTL;
					bRTLChanged = true;
				}

				// Handle theme change
				if (this._oViewSettings.themeActive !== sThemeActive) {
					this._oCore.applyTheme(sThemeActive);

					this._oViewSettings.themeActive = sThemeActive;
					bThemeChanged = true;
					this.bus.publish("themeChanged", "onDemoKitThemeChanged", {sThemeActive: sThemeActive});
				} else if (bContentDensityChanged) {
					// NOTE: We notify for content density change only if no theme change is applied because both
					// methods fire the same event which may lead to unpredictable result.
					this._oCore.notifyContentDensityChanged();
				}

				// Apply theme and compact mode also to iframe samples if there is actually a change
				if (bRTLChanged || bContentDensityChanged || bThemeChanged) {

					$SampleFrame = jQueryDOM("#sampleFrame");
					if ($SampleFrame.length > 0) {
						oSampleFrameContent = $SampleFrame[0].contentWindow;
						if (oSampleFrameContent) {
							oSampleFrameCore = oSampleFrameContent.sap.ui.getCore();

							if (bContentDensityChanged) {
								this._toggleContentDensityClasses(oSampleFrameContent.jQuery('body'), sDensityMode);
							}

							if (bRTLChanged) {
								oSampleFrameCore.getConfiguration().setRTL(bRTL);
							}

							if (bThemeChanged) {
								oSampleFrameCore.applyTheme(sThemeActive);
							} else if (bContentDensityChanged) {
								// Notify Core for content density change only if no theme change happened
								oSampleFrameCore.notifyContentDensityChanged();
							}

						}
					}

				}

			},

			_onGroupMatched: function (event) {
				this._onMatched('#/group/', event);
			},

			_onEntityMatched: function (event) {
				this._onMatched('#/entity/', event);
			},

			_onSampleMatched: function (event) {
				this._onMatched('#/sample/', event);
			},

			_onMatched: function(sName, oEvent) {
				var oEntityModel = this._getList().getModel(),
					sEntityId = oEvent.getParameter("arguments").entityId;

				this.showMasterSide();
				this._topicId = sName + sEntityId;
				this._entityId = sEntityId;

				oEntityModel.refresh();

				this._updateListSelection();
			},

			_onControlsMasterMatched: function(event) {
				this.showMasterSide();
				if (!Device.system.phone) {
					this.getRouter().navTo("controls");
				}
			},

			_onFilterMatched: function (oEvent) {
				var sFilterValue = oEvent.getParameter("arguments").value,
					oSearchField;

				if (sFilterValue) {
					// Get the search control, apply the value and fire a live change event so the list will be filtered
					sFilterValue = decodeURI(sFilterValue);
					oSearchField = this.byId("searchField");
					oSearchField.setValue(sFilterValue).fireLiveChange({
						newValue: sFilterValue
					});

					// Show master page: this call will show the master page only on small screen sizes but not on phone
					setTimeout(function () {
						this.getSplitApp().showMaster();
					}.bind(this), 0);

					// On phone: navigation is needed so the user will see the master list
					if (Device.system.phone) {
						this.getRouter().navTo("controlsMaster", {});
					}
				}

				// Call _onControlsMatched view to handle the rest of the needed initialization as this is a sub-route
				this._onControlsMatched(oEvent);
			},

			_onControlsMatched: function() {
				this.showMasterSide();
				this._resetListSelection();

				if (Device.system.desktop) {
					setTimeout(function () {
						this.getView().byId("searchField").getFocusDomRef().focus();
					}.bind(this), 0);
				}
			},

			/* =========================================================== */
			/* Event handlers                                              */
			/* =========================================================== */

			_onLocalizationChange: function(oEvent) {
				this._iDomRenderingDelay = 3000; //RTL change requires longer DOM computations as new CSS is requested and applied on the entire DOM
				setTimeout(function() {
					this._iDomRenderingDelay = 0;
				}.bind(this), this._iDomRenderingDelay);
			},

			onNavToEntity : function (oEvt) {
				var oItemParam = oEvt.getParameter("listItem"),
					oItem = (oItemParam) ? oItemParam : oEvt.getSource(),
					sPath = oItem.getBindingContext().getPath(),
					oEntity = this.getView().getModel().getProperty(sPath);

				this._bNavToEntityViaList = true;
				this.getRouter().navTo("entity", {id: oEntity.id, part: "samples"});
			},

			getGroupHeader: function (oGroup) {
				return new GroupHeaderListItem({
					title: oGroup.key,
					upperCase: false
				});
			},

			/**
			* Updates the <code>List</code> selection, based on the loaded sample,
			* after the model is loaded.
			* <code>Note</code>:
			* The method scrolls the page to the given item,
			* if the navigation happens not by selecting items from the <code>List</code>,
			* but using links from other pages.
			*/
			_updateListSelection : function() {
				var oItemToSelect = this._getItemToSelect();

				if (!oItemToSelect) {
					return;
				}

				this._toggleListItem(oItemToSelect, true);

				if (!this._bNavToEntityViaList) {
					setTimeout(this._scrollToSelectedListItem.bind(this), 0);
				}
				this._bNavToEntityViaList = false;
			},

			/**
			* Resets the given <code>List</code> selection
			* and scrolls to the top.
			*/
			_resetListSelection : function() {
				var oSelectedItem = this._getList().getSelectedItem();

				if (oSelectedItem) {
					this._toggleListItem(oSelectedItem, false);
					setTimeout(this._scrollPageTo.bind(this, 0, 0), 0);
				}
			},

			/**
			* Selects or deselects the given <code>ListItemBase</code>.
			*
			* @param {sap.m.ListItemBase} oItemToSelect
			* @param {boolean} bSelect Sets selected status of the list item.
			*/
			_toggleListItem : function(oItemToSelect, bSelect) {
				this._getList().setSelectedItem(oItemToSelect, bSelect, false);
			},

			/**
			* Scrolls to the currently selected <code>ListItemBase</code>
			*
			*/
			_scrollToSelectedListItem : function() {
				var oItemToScroll = this._getList().getSelectedItem();
				if (oItemToScroll) {
					this._getPage().scrollToElement(oItemToScroll, this.LIST_SCROLL_DURATION);
				}
			},

			/**
			* Scrolls the <code>sap.m.Page</code> to the given position.
			*
			* @param {int} iPos The vertical pixel position to scroll to.
			* @param {int} iDuration The duration of animated scrolling.
			*/
			_scrollPageTo : function (iPos, iDuration) {
				this._getPage().scrollTo(iPos, iDuration);
			},

			/**
			* Retrieves the <code>sap.m.ListItem</code>, that should be selected within the List,
			* based on the loaded sample or null, if it does not exist.
			* @returns {sap.m.ListItemBase | null}
			*/
			_getItemToSelect : function () {
				var oList = this._getList(),
					oEntityModel = oList.getModel(),
					oEntity,
					oItemBindingContext,
					sItemBindingContextPath,
					sLoadedEntityId = this._entityId,
					oItemToSelect = null;

				oList.getItems().forEach(function (oItem) {
					oItemBindingContext = oItem.getBindingContext();
					if (oItemBindingContext) {
						sItemBindingContextPath = oItemBindingContext.getPath();
						oEntity = oEntityModel.getProperty(sItemBindingContextPath);
						if (oEntity.id === sLoadedEntityId) {
							oItemToSelect = oItem;
							return false;
						}
					}
				});

				return oItemToSelect;
			},

			/**
			 * Retrieves the <code>sap.m.Page</code>, based on its ID.
			 * @returns {sap.m.Page | undefined}
			 */
			_getPage : function() {
				if (!this.oPage) {
					this.oPage = this.byId("exploredMasterPage");
				}

				return this.oPage;
			},

			/**
			 * Retrieves the <code>sap.m.List</code>, based on its ID.
			 * @returns {sap.m.List | undefined}
			 */
			_getList : function() {
				if (!this.oList) {
					this.oList = this.byId("exploredMasterList");
				}

				return this.oList;
			},

			/**
			 * Called on before first show of the view
			 * @override
			 */
			onBeforeFirstShow: function () {
				this._updateView();
			},

			/**
			 * Called upon destruction of the view
			 * @override
			 */
			onExit: function() {
				this._oCore.detachThemeChanged(this._scrollToSelectedListItem, this);
				this._oCore.detachLocalizationChanged(this._onLocalizationChange, this);
				this.highlighter.destroy();
			},

			onConfirmViewSettings: function (oEvent) {
				var oGroupItem = oEvent.getParameter("groupItem");

				// store filter settings
				this._oListSettings.filter = oEvent.getParameter("filterCompoundKeys");

				// store group settings
				this._oListSettings.groupProperty = oGroupItem ? oGroupItem.getKey() : null;
				this._oListSettings.groupDescending = oEvent.getParameter("groupDescending");

				// update local storage
				this._oStorage.put(this._sStorageKey, JSON.stringify(this._oListSettings));

				// update view
				this._updateView();
			},

			handleListSettings: function () {
				// create dialog on demand
				if (!this._oVSDialog) {
					this._oVSDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.documentation.sdk.view.viewSettingsDialog", this);
					this.getView().addDependent(this._oVSDialog);
				}

				this._oVSDialog.setSelectedFilterCompoundKeys(this._oListSettings.filter);
				this._oVSDialog.setSelectedGroupItem(this._oListSettings.groupProperty);
				this._oVSDialog.setGroupDescending(this._oListSettings.groupDescending);

				// open
				this._oVSDialog.open();

			},

			handleListFilter: function (oEvent) {
				this._sFilterValue = oEvent.getParameter("newValue").trim();
				if (this.highlighter) {
					this.highlighter.highlight(this._sFilterValue);
				}
				this._updateView();
			},

			_updateListBinding: function () {

				var oFilter,
					oSorter,
					aFilters = [],
					aSorters = [],
					bFilterChanged = false,
					bGroupChanged = false,
					oList = this._oView.byId("exploredMasterList"),
					oBinding = oList.getBinding("items");

				bFilterChanged = true;
				aFilters.push(new Filter("searchTags", "Contains", this._sFilterValue));

				// add filters for view settings
				jQueryDOM.each(this._oListSettings.filter, function (sProperty, oValues) {
					var aPropertyFilters = [];

					jQueryDOM.each(oValues, function (sKey, bValue) {
						var sOperator = (sProperty === "formFactors") ? "Contains" : "EQ";
						aPropertyFilters.push(new Filter(sProperty, sOperator, sKey));
					});

					bFilterChanged = true;
					aFilters.push(new Filter(aPropertyFilters, false)); // second parameter stands for "or"
				});

				// filter
				if (bFilterChanged && aFilters.length === 0) {
					oBinding.filter(aFilters, "Application");
				} else if (bFilterChanged && aFilters.length > 0) {
					oFilter = new Filter(aFilters, true); // second parameter stands for "and"
					oBinding.filter(oFilter, "Application");
				}

				if (this._oListSettings.groupProperty && this._oListSettings.groupProperty !== this._sCurrentGroup) {
					bGroupChanged = true;
				} else if (this._oListSettings.groupProperty && this._oListSettings.groupDescending !== this._bCurrentlyGroupedDescending) {
					bGroupChanged = true;
				}

				// group
				if (bGroupChanged) {
					oSorter = new Sorter(
						this._oListSettings.groupProperty,
						this._oListSettings.groupDescending,
						this._mGroupFunctions[this._oListSettings.groupProperty]);
					aSorters.push(oSorter);
					aSorters.push(new Sorter("name", false));
					oBinding.sort(aSorters);
				}

				this._sCurrentGroup = this._oListSettings.groupProperty;
				this._bCurrentlyGroupedDescending = this._oListSettings.groupDescending;

				// memorize that this function was executed at least once
				this._bIsViewUpdatedAtLeastOnce = true;
			},

			/**
			 * Makes sure the view settings are initialized and updates the filter bar dispay and list binding
			 */
			_updateView: function () {
				// update the filter bar
				this._updateFilterBarDisplay();

				// update the master list binding
				this._updateListBinding();
			},

			_updateFilterBarDisplay: function () {
				// calculate text
				var aFilterTexts = [];

				jQueryDOM.each(this._oListSettings.filter, function (sProperty, oValues) {
					aFilterTexts = aFilterTexts.concat(Object.keys(oValues));
				});

				if (aFilterTexts.length > 0) {
					this._vsFilterBar.setVisible(true);
					this._vsFilterLabel.setText(aFilterTexts.join(", "));
				} else {
					this._vsFilterBar.setVisible(false);
				}
			},

			/**
			 * Opens the View settings dialog
			 * @public
			 */
			handleSettings: function () {
				if (!this._oSettingsDialog) {
					this._oSettingsDialog = new sap.ui.xmlfragment("sap.ui.documentation.sdk.view.appSettingsDialog", this);
					this._oView.addDependent(this._oSettingsDialog);
				}

				setTimeout(function () {
					var oAppSettings = this._oCore.getConfiguration(),
						oThemeSelect = this._oCore.byId("ThemeSelect"),
						sUriParamTheme = UriParameters.fromQuery(window.location.search).get("sap-theme"),
						bDensityMode = this._oViewSettings.densityMode;

					// Theme select
					oThemeSelect.setSelectedKey(sUriParamTheme ? sUriParamTheme : oAppSettings.getTheme());

					// RTL
					this._oCore.byId("RTLSwitch").setState(oAppSettings.getRTL());

					// Density mode select
					this._oCore.byId("DensityModeSwitch").setSelectedKey(bDensityMode);
					this._oSettingsDialog.open();
				}.bind(this), 0);
			},

			/**
			 * Closes the View settings dialog
			 * @public
			 */
			handleCloseAppSettings: function () {
				this._oSettingsDialog.close();
			},

			/**
			 * Saves settings from the view settings dialog
			 * @public
			 */
			handleSaveAppSettings: function () {
				var BusyDialog,
					sDensityMode = this._oCore.byId('DensityModeSwitch').getSelectedKey(),
					sTheme = this._oCore.byId('ThemeSelect').getSelectedKey(),
					bRTL = this._oCore.byId('RTLSwitch').getState();

				this._oSettingsDialog.close();

				// Lazy loading of busy dialog
				if (!this._oBusyDialog) {
					//TODO: global jquery call found
					jQuery.sap.require("sap.m.BusyDialog");
					BusyDialog = sap.ui.require("sap/m/BusyDialog");
					this._oBusyDialog = new BusyDialog();
					this.getView().addDependent(this._oBusyDialog);
				}

				// Handle busy dialog
				this._oBusyDialog.open();
				setTimeout(function () {
					this._oBusyDialog.close();
				}.bind(this), 1000);

				// handle settings change
				this._applyAppConfiguration(sTheme, sDensityMode, bRTL);

				// If we are navigating outside the Explored App section: view settings should be reset
				this.getRouter().attachBeforeRouteMatched(this._viewSettingsResetOnNavigation, this);
			}
		});
	}
);
