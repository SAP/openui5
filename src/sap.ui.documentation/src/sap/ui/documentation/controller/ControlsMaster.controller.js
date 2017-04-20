/*!
 * ${copyright}
 */

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/Device",
		"sap/ui/documentation/controller/BaseController",
		"sap/ui/documentation/controller/util/APIInfo",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/controller/util/ControlsInfo",
		"sap/m/GroupHeaderListItem",
		"sap/ui/core/Component",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter"
	], function (jQuery, Device, BaseController, APIInfo, JSONModel, ControlsInfo, GroupHeaderListItem, Component,
				 Filter, Sorter) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.controller.ControlsMaster", {

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
				var oRouter = this.getRouter(),
					oEntityModel, oDeviceModel, oFilterModel,
					fnOnDataReady = function () {
						this._oView.getModel().setData({
							entityCount : ControlsInfo.data.entityCount,
							entities : ControlsInfo.data.entities
						});
						this.getModel("filter").setData(ControlsInfo.data.filter);
						this._updateListSelection();
					}.bind(this);

				// Cache view reference
				this._oView = this.getView();

				ControlsInfo.listeners.push(fnOnDataReady);
				ControlsInfo.init();

				oEntityModel = new JSONModel();
				oEntityModel.setSizeLimit(100000);
				this._oView.setModel(oEntityModel);

				oDeviceModel = new JSONModel({
					listMode : (Device.system.phone) ? "None" : "SingleSelectMaster",
					listItemType : (Device.system.phone) ? "Active" : "Inactive"
				});
				oDeviceModel.setDefaultBindingMode("OneWay");
				this._oView.setModel(oDeviceModel, "device");

				// Init Filter model
				oFilterModel = new JSONModel();
				oFilterModel.setSizeLimit(100000);
				this.setModel(oFilterModel, "filter");

				this._vsFilterBar = this._oView.byId("vsFilterBar");
				this._vsFilterLabel = this._oView.byId("vsFilterLabel");

				oRouter.getRoute("group").attachPatternMatched(this._onGroupMatched, this);
				oRouter.getRoute("entity").attachPatternMatched(this._onEntityMatched, this);
				oRouter.getRoute("sample").attachPatternMatched(this._onSampleMatched, this);
				oRouter.getRoute("code").attachPatternMatched(this._onSampleMatched, this);
				oRouter.getRoute("controls").attachPatternMatched(this._onControlsMatched, this);
				oRouter.getRoute("controlsMaster").attachPatternMatched(this._onControlsMasterMatched, this);

				this.LIST_SCROLL_DURATION = 0; // ms
				this._getList().addEventDelegate({
					onAfterRendering : function () {
						var oSelectedItem = this._getList().getSelectedItem();

						if (oSelectedItem) {
							this._scrollToListItem(oSelectedItem);
						}
					}.bind(this)
				});

				// Subscribe to view event to apply to it the current configuration
				this._oView.addEventDelegate({
					onBeforeFirstShow: jQuery.proxy(this.onBeforeFirstShow, this)
				});
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
					sEntityId = oEvent.getParameter("arguments").id;

				this.showMasterSide();
				this._topicId = sName + sEntityId;
				this._entityId = sEntityId;

				oEntityModel.refresh();
			},

			_onControlsMasterMatched: function(event) {
				this.showMasterSide();
				if (!Device.system.phone) {
					this.getRouter().navTo("controls");
				}
			},

			_onControlsMatched: function(event) {
				this.showMasterSide();
			},

			/* =========================================================== */
			/* Event handlers                                              */
			/* =========================================================== */

			/**
			 * After list data is available, this handler method updates the
			 * master list counter and hides the pull to refresh control, if
			 * necessary.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the master list object counter after new data is loaded
				// this._updateListItemCount(oEvent.getParameter("total"));
				// hide pull to refresh if necessary
				this.byId("pullToRefresh").hide();
			},

			onNavToEntity : function (oEvt) {
				var oItemParam = oEvt.getParameter("listItem"),
					oItem = (oItemParam) ? oItemParam : oEvt.getSource(),
					sPath = oItem.getBindingContext().getPath(),
					oEntity = this.getView().getModel().getProperty(sPath),
					bReplace = !Device.system.phone;

				this.getRouter().navTo("entity", {id: oEntity.id, part: "samples"}, bReplace);
			},

			getGroupHeader: function (oGroup) {
				return new GroupHeaderListItem({
					title: oGroup.key,
					upperCase: false
				});
			},

			/**
			 * Updates the <code>List</code> selection, based on the loaded sample,
			 * after the model is loaded and the data is available.
			 * NOTE: The method is executed in <code>fnOnDataReady</code> callback.
			 */
			_updateListSelection : function() {
				var oItemToSelect = this._getItemToSelect();

				if (oItemToSelect) {
					this._getList().setSelectedItem(oItemToSelect, undefined, false);
				}
			},

			/**
			 * Scrolls to the given <code>ListItemBase</code>.
			 * @param {sap.m.ListItemBase} oItemToSelect
			 */
			_scrollToListItem : function(oItemToSelect) {
				this._getPage().scrollToElement(oItemToSelect, this.LIST_SCROLL_DURATION);
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
			 * @returns {sap.m.Page || undefined}
			 */
			_getPage : function() {
				if (!this.oPage) {
					this.oPage = this.byId("exploredMasterPage");
				}

				return this.oPage;
			},

			/**
			 * Retrieves the <code>sap.m.List</code>, based on its ID.
			 * @returns {sap.m.List || undefined}
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

			onConfirmViewSettings: function (oEvent) {
				var oGroupItem = oEvent.getParameter("groupItem");

				// store filter settings
				this._oViewSettings.filter = oEvent.getParameter("filterCompoundKeys");

				// store group settings
				this._oViewSettings.groupProperty = oGroupItem ? oGroupItem.getKey() : null;
				this._oViewSettings.groupDescending = oEvent.getParameter("groupDescending");

				// update local storage
				this._oStorage.put(this._sStorageKey, JSON.stringify(this._oViewSettings));

				// update view
				this._updateView();
			},

			handleListSettings: function () {
				// create dialog on demand
				if (!this._oVSDialog) {
					this._oVSDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.documentation.view.viewSettingsDialog", this);
					this.getView().addDependent(this._oVSDialog);
				}

				this._oVSDialog.setSelectedFilterCompoundKeys(this._oViewSettings.filter);
				this._oVSDialog.setSelectedGroupItem(this._oViewSettings.groupProperty);
				this._oVSDialog.setGroupDescending(this._oViewSettings.groupDescending);

				jQuery('body').toggleClass("sapUiSizeCompact", this._oViewSettings.compactOn)
					.toggleClass("sapUiSizeCozy", !this._oViewSettings.compactOn);

				// open
				this._oVSDialog.open();

			},

			hadnleListFilter: function (oEvent) {
				this._sFilterValue = oEvent.getParameter("newValue").trim();
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
				jQuery.each(this._oViewSettings.filter, function (sProperty, oValues) {
					var aPropertyFilters = [];

					jQuery.each(oValues, function (sKey, bValue) {
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

				if (this._oViewSettings.groupProperty && this._oViewSettings.groupProperty !== this._sCurrentGroup) {
					bGroupChanged = true;
				} else if (this._oViewSettings.groupProperty && this._oViewSettings.groupDescending !== this._bCurrentlyGroupedDescending) {
					bGroupChanged = true;
				}

				// group
				if (bGroupChanged) {
					oSorter = new Sorter(
						this._oViewSettings.groupProperty,
						this._oViewSettings.groupDescending,
						this._mGroupFunctions[this._oViewSettings.groupProperty]);
					aSorters.push(oSorter);
					aSorters.push(new Sorter("name", false));
					oBinding.sort(aSorters);
				}

				this._sCurrentGroup = this._oViewSettings.groupProperty;
				this._bCurrentlyGroupedDescending = this._oViewSettings.groupDescending;

				// memorize that this function was executed at least once
				this._bIsViewUpdatedAtLeastOnce = true;
			},

			/**
			 * Makes sure the view settings are initialized and updates the filter bar dispay and list binding
			 */
			_updateView: function () {
				this._applyViewConfigurations();

				// update the filter bar
				this._updateFilterBarDisplay();

				// update the master list binding
				this._updateListBinding();
			},

			_updateFilterBarDisplay: function () {
				// calculate text
				var aFilterTexts = [];

				jQuery.each(this._oViewSettings.filter, function (sProperty, oValues) {
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
					this._oSettingsDialog = new sap.ui.xmlfragment("sap.ui.documentation.view.appSettingsDialog", this);
					this._oView.addDependent(this._oSettingsDialog);
				}

				// var oCaller = oEvent.getSource();
				jQuery.sap.delayedCall(0, this, function () {
					var oAppSettings = this._oCore.getConfiguration(),
						oThemeSelect = this._oCore.byId("ThemeSelect"),
						sUriParamTheme = jQuery.sap.getUriParameters().get("sap-theme"),
						bCompactMode = this._oViewSettings.compactOn,
						bRTL = this._oViewSettings.rtl,
						sUriParamRTL = jQuery.sap.getUriParameters().get("sap-ui-rtl");

					// Theme select
					oThemeSelect.setSelectedKey(sUriParamTheme ? sUriParamTheme : oAppSettings.getTheme());

					// RTL
					this._oCore.byId("RTLSwitch").setState(sUriParamRTL ? sUriParamRTL === "true" : bRTL);

					// Compact mode select
					this._oCore.byId("CompactModeSwitch").setState(bCompactMode);
					this._oSettingsDialog.open();
				});
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
					bCompact = this._oCore.byId('CompactModeSwitch').getState(),
					sTheme = this._oCore.byId('ThemeSelect').getSelectedKey(),
					bRTL = this._oCore.byId('RTLSwitch').getState(),
					bRTLChanged = (bRTL !== this._oViewSettings.rtl);

				this._oSettingsDialog.close();

				// Lazy loading of busy dialog
				if (!this._oBusyDialog) {
					jQuery.sap.require("sap.m.BusyDialog");
					BusyDialog = sap.ui.require("sap/m/BusyDialog");
					this._oBusyDialog = new BusyDialog();
					this.getView().addDependent(this._oBusyDialog);
				}

				// Handle busy dialog
				this._oBusyDialog.open();
				jQuery.sap.delayedCall(1000, this, function () {
					this._oBusyDialog.close();
				});

				// write new settings into local storage
				this._oViewSettings.compactOn = bCompact;
				this._oViewSettings.themeActive = sTheme;
				this._oViewSettings.rtl = bRTL;
				this._oViewSettings.version = this._oDefaultSettings.version;
				this._oStorage.put(this._sStorageKey, JSON.stringify(this._oViewSettings));

				// handle settings change
				this._component = Component.getOwnerComponentFor(this._oView);
				this._component.getEventBus().publish("app", "applyAppConfiguration", {
					themeActive: sTheme,
					compactOn: bCompact
				});

				if (bRTLChanged) {
					this._handleRTL(bRTL);
				}
			}
		});
	}
);