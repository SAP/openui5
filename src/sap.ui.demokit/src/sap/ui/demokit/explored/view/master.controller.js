/*!
 * @copyright@
 */

jQuery.sap.require("jquery.sap.storage");

sap.ui.controller("sap.ui.demokit.explored.view.master", {

	//========= members =======================================================================

	_bIsViewUpdatedAtLeastOnce: false,

	_oVSDialog: null, // set on demand

	_oViewSettings: null, // set on init

	_oStorage: jQuery.sap.storage(jQuery.sap.storage.Type.local),

	_sStorageKey: "UI5_EXPLORED_VIEW_SETTINGS",

	_oDefaultSettings: {
		filter: {},
		groupProperty: "category",
		groupDescending: false,
		compactOn: false,
		themeActive: "sap_bluecrystal",
		rtl: false
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

	// ====== init ====================================================================

	onInit : function () {
		// subscribe to routing
		this.router = sap.ui.core.UIComponent.getRouterFor(this);
		this.router.attachRoutePatternMatched(this.onRouteMatched, this);

		// subscribe to app events
		this._component = sap.ui.core.Component.getOwnerComponentFor(this.getView());
		this._component.getEventBus().subscribe("app", "selectEntity", this.onSelectEntity, this);

		// set the group to the default used in the view
		this._sCurrentGroup = this._oDefaultSettings.groupProperty;

		// subscribe to nav container events
		this.getView().addEventDelegate({
			onBeforeFirstShow: jQuery.proxy(this.onBeforeFirstShow, this)
		});
	},

	// ====== event handling ====================================================================

	onBeforeFirstShow: function () {
		if (!this._bIsViewUpdatedAtLeastOnce) {
			this._updateView();
		}
	},

	onRouteMatched: function (oEvt) {

		var sRouteName = oEvt.getParameter("name");
		if (sRouteName !== "home" && sRouteName != "notFound") {
			var oView = oEvt.getParameter('view');
			if (oView) {
				var oToggleFullScreenBtn = oView.byId("toggleFullScreenBtn");
				if (oToggleFullScreenBtn) {
					sap.ui.demokit.explored.util.ToggleFullScreenHandler.updateControl(oToggleFullScreenBtn, oView);
				}
			}
			return;
		}

		// update view
		this._updateView();
	},

	onOpenAppSettings: function (oEvent) {

		if (!this._oSettingsDialog) {
			this._oSettingsDialog = new sap.ui.xmlfragment("sap.ui.demokit.explored.view.appSettingsDialog", this);
			this.getView().addDependent(this._oSettingsDialog);
		}

//		var oCaller = oEvent.getSource();
		jQuery.sap.delayedCall(0, this, function () {

			// variable for convenience
			var oAppSettings = sap.ui.getCore().getConfiguration();
			var bCompactMode = this._oViewSettings.compactOn;
			var bRTL = this._oViewSettings.rtl;

			// handling of URI parameters
			var sUriParamTheme = jQuery.sap.getUriParameters().get("sap-theme");
			var sUriParamRTL = jQuery.sap.getUriParameters().get("sap-ui-rtl");

			// setting the button for Theme
			if (sUriParamTheme) {
				sap.ui.getCore().byId("ThemeButtons").setSelectedKey(sUriParamTheme);
			} else {
				sap.ui.getCore().byId("ThemeButtons").setSelectedKey(oAppSettings.getTheme());
			}

			// setting the button for Compact Mode
			sap.ui.getCore().byId("CompactModeButtons").setState(bCompactMode);

			// setting the RTL Button
			if (sUriParamRTL) {
				sap.ui.getCore().byId("RTLButtons").setState(sUriParamRTL === "true" ? true : false);
			} else {
				sap.ui.getCore().byId("RTLButtons").setState(bRTL);
			}


			this._oSettingsDialog.open();
		});

	},

	onSaveAppSettings: function (oEvent) {

		this._oSettingsDialog.close();

		if (!this._oBusyDialog) {
			jQuery.sap.require("sap.m.BusyDialog");
			this._oBusyDialog = new sap.m.BusyDialog();
			this.getView().addDependent(this._oBusyDialog);
		}
		var bCompact = sap.ui.getCore().byId('CompactModeButtons').getState();
		var sTheme = sap.ui.getCore().byId('ThemeButtons').getSelectedKey();
		var bRTL = sap.ui.getCore().byId('RTLButtons').getState();

		var bRTLChanged = (bRTL !== this._oViewSettings.rtl);

		// busy dialog
		this._oBusyDialog.open();
		jQuery.sap.delayedCall(1000, this, function () {
			this._oBusyDialog.close();
		});

		// write new settings into local storage
		this._oViewSettings.compactOn = bCompact;
		this._oViewSettings.themeActive = sTheme;
		this._oViewSettings.rtl = bRTL;
		var s = JSON.stringify(this._oViewSettings);
		this._oStorage.put(this._sStorageKey, s);

		// handle settings change
		this._component.getEventBus().publish("app", "applyAppConfiguration", {
			themeActive: sTheme,
			compactOn: bCompact
		});

		if (bRTLChanged) {
			this._handleRTL(bRTL);
		}
	},

	onDialogCloseButton: function () {

		this._oSettingsDialog.close();
	},

	onSelectEntity: function (sChannel, sEvent, oData) {

		var oView = this.getView(),
			oList = oView.byId("list"),
			oModel = oView.getModel("entity");

		// find item to select
		var oSelectItem = null;
		var aItems = oList.getItems();
		jQuery.each(aItems, function (i, oItem) {
			var oContext = oItem.getBindingContext("entity");
			if (oContext) {
				var sPath = oContext.getPath();
				var oEntity = oModel.getProperty(sPath);
				if (oEntity.id === oData.id) {
					oSelectItem = oItem;
					return false;
				}
			}
		});

		// select
		if (oSelectItem) {
			oList.setSelectedItem(oSelectItem);
		} else {
			oList.removeSelections();
		}

		// TODO scroll to list item
	},

	onOpenViewSettings: function () {

		// create dialog on demand
		if (!this._oVSDialog) {
			this._oVSDialog = sap.ui.xmlfragment(this.getView().getId() ,"sap.ui.demokit.explored.view.viewSettingsDialog", this);
			this.getView().addDependent(this._oVSDialog);
		}

		// delay because addDependent is async
		jQuery.sap.delayedCall(0, this, function () {

			// apply user selection
			var aFilterKeys = {};
			jQuery.each(this._oViewSettings.filter, function (sPropery, aValues) {
				jQuery.each(aValues, function (i, aValue) {
					aFilterKeys[aValue] = true;
				});
			});
			this._oVSDialog.setSelectedFilterKeys(aFilterKeys);
			this._oVSDialog.setSelectedGroupItem(this._oViewSettings.groupProperty);
			this._oVSDialog.setGroupDescending(this._oViewSettings.groupDescending);
			jQuery('body').toggleClass("sapUiSizeCompact", this._oViewSettings.compactOn).toggleClass("sapUiSizeCozy", !this._oViewSettings.compactOn);

			// open
			this._oVSDialog.open();
		});
	},

	onConfirmViewSettings: function (oEvt) {

		// store filter settings
		var that = this;
		this._oViewSettings.filter = {};
		var aFilterItems = oEvt.getParameter("filterItems");
		jQuery.each(aFilterItems, function (i, oItem) {
			var sKey = oItem.getKey();
			var sParentKey = oItem.getParent().getKey();
			if (!that._oViewSettings.filter.hasOwnProperty(sParentKey)) {
				that._oViewSettings.filter[sParentKey] = [];
			}
			that._oViewSettings.filter[sParentKey].push(sKey);
		});

		// store group settings
		var oGroupItem = oEvt.getParameter("groupItem");
		var sNewGroup = (oGroupItem) ? oGroupItem.getKey() : null;
		this._oViewSettings.groupProperty = sNewGroup;
		this._oViewSettings.groupDescending = oEvt.getParameter("groupDescending");

		// update local storage
		var s = JSON.stringify(this._oViewSettings);
		this._oStorage.put(this._sStorageKey, s);

		// update view
		this._updateView();
	},

	onSearch: function () {
		this._updateView(); // yes this function does a bit too much for search but it makes my life easier and I see no delay
	},

	onNavToEntity: function (oEvt) {
		var oItemParam = oEvt.getParameter("listItem");
		var oItem = (oItemParam) ? oItemParam : oEvt.getSource();
		var sPath = oItem.getBindingContext("entity").getPath();
		var oEnt = this.getView().getModel("entity").getProperty(sPath);
		var bReplace = !sap.ui.Device.system.phone;
		this.router.navTo("entity", {
			id: oEnt.id,
			part: "samples"
		}, bReplace);
	},

	// ========= internal ===========================================================================

	/**
	 * Makes sure the view settings are initialized and updates the filter bar dispay and list binding
	 */
	_updateView: function () {

		if (!this._oViewSettings) {

			// init the view settings
			this._initViewSettings();

			// apply app settings
			this._component.getEventBus().publish("app", "applyAppConfiguration", {
				themeActive: this._oViewSettings.themeActive,
				compactOn: this._oViewSettings.compactOn
			});

		}


		// update the filter bar
		this._updateFilterBarDisplay();

		// update the master list binding
		this._updateListBinding();
	},

	/**
	 * Updates the filter bar in the view
	 */
	_updateFilterBarDisplay: function () {

		// calculate text
		var sFilterText = "";
		jQuery.each(this._oViewSettings.filter, function (sProperty, aValues) {
			jQuery.each(aValues, function (i, aValue) {
				sFilterText += aValue + ", ";
			});
		});
		if (sFilterText.length > 0) {
			var iIndex = sFilterText.lastIndexOf(", ");
			sFilterText = sFilterText.substring(0, iIndex);
		}

		// update view
		var oView = this.getView();
		oView.byId("vsFilterBar").setVisible(sFilterText.length > 0);
		oView.byId("vsFilterLabel").setText(sFilterText);
	},

	/**
	 * Updates the binding of the master list and applies filters and groups
	 *
	 * Dear maintainer having more time than i currently have -
	 * this function does way too much an gets called everywhere the list gets rerendered a lot of times.
	 * So i build in some very small detection to at least reduce the rerenderings when starting the app.
	 * For future refactorings this has to be split up into functions responsible for filtering sorting and only
	 * trigger those filters if a user really changed them. currently everytime the list items will be destroyed.
	 */
	_updateListBinding: function () {

		var aFilters = [],
			aSorters = [],
			bFilterChanged = false,
			bGroupChanged = false,
			oSearchField = this.getView().byId("searchField"),
			oList = this.getView().byId("list"),
			oBinding = oList.getBinding("items");

		// add filter for search
		var sQuery = oSearchField.getValue().trim();

		bFilterChanged = true;
		aFilters.push(new sap.ui.model.Filter("searchTags", "Contains", sQuery));

		// add filters for view settings
		jQuery.each(this._oViewSettings.filter, function (sProperty, aValues) {
			var aPropertyFilters = [];
			jQuery.each(aValues, function (i, aValue) {
				var sOperator = (sProperty === "formFactors") ? "Contains" : "EQ";
				aPropertyFilters.push(new sap.ui.model.Filter(sProperty, sOperator, aValue));
			});
			var oFilter = new sap.ui.model.Filter(aPropertyFilters, false); // second parameter stands for "or"
			bFilterChanged = true;
			aFilters.push(oFilter);
		});

		// filter
		if (bFilterChanged && aFilters.length === 0) {
			oBinding.filter(aFilters, "Application");
		} else if (bFilterChanged && aFilters.length > 0) {
			var oFilter = new sap.ui.model.Filter(aFilters, true); // second parameter stands for "and"
			oBinding.filter(oFilter, "Application");
		}

		if (this._oViewSettings.groupProperty && this._oViewSettings.groupProperty !== this._sCurrentGroup) {
			bGroupChanged = true;
		} else if (this._oViewSettings.groupProperty && this._oViewSettings.groupDescending !== this._bCurrentlyGroupedDescending) {
			bGroupChanged = true;
		}

		// group
		if (bGroupChanged) {
			var oSorter = new sap.ui.model.Sorter(
				this._oViewSettings.groupProperty,
				this._oViewSettings.groupDescending,
				this._mGroupFunctions[this._oViewSettings.groupProperty]);
			aSorters.push(oSorter);
			aSorters.push(new sap.ui.model.Sorter("name", false));
			oBinding.sort(aSorters);
		}

		this._sCurrentGroup = this._oViewSettings.groupProperty;
		this._bCurrentlyGroupedDescending = this._oViewSettings.groupDescending;

		// memorize that this function was executed at least once
		this._bIsViewUpdatedAtLeastOnce = true;
	},

	/**
	 * Inits the view settings. At first local storage is checked. If this is empty defaults are applied.
	 */
	_initViewSettings: function () {

		var sJson = this._oStorage.get(this._sStorageKey);
		if (!sJson) {

			// local storage is empty, apply defaults
			this._oViewSettings = this._oDefaultSettings;

		} else {
			// parse
			this._oViewSettings = JSON.parse(sJson);

			// clean filter and remove values that do not exist any longer in the data model
			// (the cleaned filter are not written back to local storage, this only happens on changing the view settings)
			var oFilterData = this.getView().getModel("filter").getData();
			var oCleanFilter = {};
			jQuery.each(this._oViewSettings.filter, function (sProperty, aValues) {
				var aNewValues = [];
				jQuery.each(aValues, function (i, aValue) {
					var bValueIsClean = false;
					jQuery.each(oFilterData[sProperty], function (i, oValue) {
						if (oValue.id === aValue) {
							bValueIsClean = true;
							return false;
						}
					});
					if (bValueIsClean) {
						aNewValues.push(aValue);
					}
				});
				if (aNewValues.length > 0) {
					oCleanFilter[sProperty] = aNewValues;
				}
			});
			this._oViewSettings.filter = oCleanFilter;

			// handling data stored with an older explored versions
			if (!this._oViewSettings.hasOwnProperty("compactOn")) { // compactOn was introduced later
				this._oViewSettings.compactOn = false;
			}

			if (!this._oViewSettings.hasOwnProperty("themeActive")) { // themeActive was introduced later
				this._oViewSettings.themeActive = "sap_bluecrystal";
			}

			if (!this._oViewSettings.hasOwnProperty("rtl")) { // rtl was introduced later
				this._oViewSettings.rtl = false;
			}

			// handle RTL-on in settings as this need a reload
			if (this._oViewSettings.rtl && !jQuery.sap.getUriParameters().get('sap-ui-rtl')) {
				this._handleRTL(true);
			}
		}
	},

	// trigger reload w/o URL-Parameter;
	_handleRTL: function (bSwitch) {

		jQuery.sap.require("sap.ui.core.routing.HashChanger");
		var oHashChanger = new sap.ui.core.routing.HashChanger();
		var sHash = oHashChanger.getHash();
		var oUri = window.location;

		// TODO: remove this fix when microsoft fix this under IE11 on Win 10
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" +
				window.location.hostname +
				(window.location.port ? ':' + window.location.port : '');
		}

		if (bSwitch) {
			// add the parameter
			window.location = oUri.origin + oUri.pathname + "?sap-ui-rtl=true#" + sHash;
		} else {
			// or remove it
			window.location = oUri.origin + oUri.pathname + "#/" + sHash;
		}

	},

	getGroupHeader: function (oGroup) {
		return new sap.m.GroupHeaderListItem({
			title: oGroup.key,
			upperCase: false
		});
	}
});
