jQuery.sap.require("sap.ui.demo.mdskeleton.util.Controller");

sap.ui.demo.mdskeleton.util.Controller.extend("sap.ui.demo.mdskeleton.view.Master", {

		/* =========================================================== */
		/* begin: lifecycle methods                                    */
		/* =========================================================== */

		
		/**
		* Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		*/
		onInit : function () {
			// helper variables
			this.oList = this.byId("list");
			this.oListFilterState = {
				filter : [],
				search : []
			};
			this.oListSorterState = {
				group : [],
				sort : []
			};

			var oEventBus = this.getEventBus();
			// TODO : replace this with something else ???? promise?????
			this.oInitialLoadFinishedDeferred = jQuery.Deferred();	

			// use this call to trigger actions neccessary when the list is loaded for the first time
			this.oList.attachEventOnce("updateFinished", function() {
				
				this.oInitialLoadFinishedDeferred.resolve();
				
				oEventBus.publish("Master", "InitialLoadFinished", {
					bindingContext : this.oList.getItems()[0].getBindingContext()
				});

				//this._selectItemByPosition(0);

			}, this);

			// we always have to update the list item count on updates on the master list
			this.oList.attachEvent("updateFinished", function(){
				this._setListItemCount();
				this.oList.setBusy(false);
			}, this);
			
			//on phones, we will not have to select anything in the list so we don't need to attach to events
			if (sap.ui.Device.system.phone) {
				return;
			}
	
			this.getRouter().getRoute("main").attachPatternMatched(this.onRouteMatched, this);
	
			oEventBus.subscribe("Detail", "Changed", this.onDetailChanged, this);
			oEventBus.subscribe("Detail", "NotFound", this.onNotFound, this);
		},
	

	
	
		/* =========================================================== */
		/* begin: event handlers                                       */
		/* =========================================================== */
	
		/* 
		 * search handler for the master search field
		 * @param {sap.ui.base.Event} oEvent the search field event
		 */

		
		onSearch : function (oEvent) {
			var sQuery = oEvent.getParameter("query");
	
			if (sQuery && sQuery.length > 0) {
				this.oListFilterState.search = [new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery)];
			} else {
				this.oListFilterState.search = [];
			}
			this._applyFilterSearch();
		},

		/*
		 *  SortGroupFilter can either be impplemented as single selects
		 *  or one View Settings Dialog. Use the respective code blocks 
		 *  to implement custom functionality
		 *  
		 */
		
		
		/* View Settings Dialog Based SortGroupFilter                 */ 
		/* =========================================================== */
		
		
		onOpenViewSettings : function(oEvent){
			if(!this.oViewSettingsDialog){
				this.oViewSettingsDialog = sap.ui.xmlfragment("sap.ui.demo.mdskeleton.view.ViewSettingsDialog", this);
			}
				this.getView().addDependent(this.oViewSettingsDialog)
			this.oViewSettingsDialog.open();
		},
		
		onConfirmViewSettingsDialog : function(oEvent) {
			var mParams = oEvent.getParameters();

			if(mParams.groupItem){
				var sKey = mParams.groupItem.getKey(),
					bDescending = mParams.groupDescending,
					oGroups = {
							Group1 : "Rating",
							Group2 : "UnitNumber"
						};
				
				this.oListSorterState.group = [new sap.ui.model.Sorter(oGroups[sKey], bDescending, sap.ui.demo.mdskeleton.util.groupers[sKey])];
					
			} else {
					this.oListSorterState.group = [];
			}

			if (mParams.sortItem) {
				var sPath = mParams.sortItem.getKey(),
					bDescending = mParams.sortDescending;

				this.oListSorterState.sort = [new sap.ui.model.Sorter(sPath, bDescending)];
			}

			this._applyGroupSort();
	
			if (mParams.filterItems) {
				var aFilters = [],
					sFilters = "";
				
				jQuery.each(mParams.filterItems, function (i, oItem) {
					var sKey = oItem.getKey(),
						sValue = oItem.getText();

					switch (sKey) {
					case "Filter1":
						aFilters.push(new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.LE, 100));	
						break;
					case "Filter2":
						aFilters.push(new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.GT, 100));	
						break;
					}
					sFilters += sValue + ", ";
				});
				sFilters = sFilters.substr(0, sFilters.length - 2);
				this.oListFilterState.filter = aFilters;
			}
			this.byId("filterBar").setVisible(this.oListFilterState.filter.length > 0);
			this.byId("filterBarLabel").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterFilterBarText", [sFilters]));
			this._applyFilterSearch();
		},
		
		/* Single Select Based SortGroupFilter                         */
		/* =========================================================== */
		
		onSort : function(oEvent){
			var sPath = oEvent.getParameter("selectedItem").getKey();

			this.oListSorterState.sort  = new sap.ui.model.Sorter(sPath, false);
			this._applyGroupSort();
		},

		onFilter : function (oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey(),
				sValue = oEvent.getParameter("selectedItem").getText();
			switch (sKey) {
			case "Filter1":
				this.oListFilterState.filter = [new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.LE, 100)];	
				break;
			case "Filter2":
				this.oListFilterState.filter = [new sap.ui.model.Filter("UnitNumber", sap.ui.model.FilterOperator.GT, 100)];	
				break;
			default:
				this.oListFilterState.filter = [];
			}
			this.byId("filterBar").setVisible(this.oListFilterState.filter.length > 0);
			this.byId("filterBarLabel").setText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterFilterBarText", [sValue]));
			this._applyFilterSearch();
			
		},
		
		onFilterBarPressed: function () {
			// TODO : clarify!
		},
		
		onGroup : function(oEvent) {
			var sKey = oEvent.getParameter("selectedItem").getKey(),
				// TODO : make this better!
				oGroups = {
					Group1 : "Rating",
					Group2 : "UnitNumber"
				};

			if (sKey !== "none") {
				debugger;
				this.oListSorterState.group = [new sap.ui.model.Sorter(oGroups[sKey], false, jQuery.proxy(sap.ui.demo.mdskeleton.util.groupers[sKey], oEvent.getSource()))];
			} else {
				this.oListSorterState.group = [];
			}
			this._applyGroupSort();
		},
	
		onNotFound : function () {
			this.oList.removeSelections();
			//TODO: display not found view ?!!!
		},
	
		onRouteMatched : function(oEvent) {
			// load the detail view in desktop
			// TODO: replace with target (new routing feature)
			this.getRouter().myNavToWithoutHash({ 
				currentView : this.getView(),
				targetViewName : "sap.ui.demo.mdskeleton.view.Detail",
				targetViewType : "XML"
			});
	
			// wait for the list to be loaded once
			this._waitForInitialListLoading(function () {
				// on the empty hash select the first item
				this._selectItemByPosition(0);
			});
	
		},
	
		onDetailChanged : function (sChanel, sEvent, oData) {
			var that = this,
				sObjectPath = oData.objectPath;
	
			// wait for the list to be loaded once
			this._waitForInitialListLoading(function () {
	
				var oSelectedItem = that.oList.getSelectedItem();
				// the correct item is already selected
				if(oSelectedItem && oSelectedItem.getBindingContext().getPath() === sObjectPath) {
					return;
				}
	
				var aItems = that.oList.getItems();
				

				//this.oList.selectItemById(sObjectPath);
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].getBindingContext().getPath() === sObjectPath) {
						that.oList.setSelectedItem(aItems[i], true);
						break;
					}
				}
			});
		},
	
		onSelect : function(oEvent) {
			// get the list item, either from the listItem parameter or from the event's
			// source itself (will depend on the device-dependent mode).
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/*
		 * 
		 * 
		 */
		_waitForInitialListLoading : function (fnToExecute) {
			jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));
		},

		/*
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created 
		 * 
		 * @param: {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function(oItem) {
			var bReplace = jQuery.device.is.phone ? false : true;
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ObjectID")
			}, bReplace);
		},
		
		/*
		 * Sets the item count on the master list header
		 * @private
		 */
		_setListItemCount : function(){
			
			// TODO: what to do if the length is not final????
			if(this.oList.getBinding('items').isLengthFinal()) {
				var iItems = this.byId("list").getBinding("items").getLength(),
					sTitle = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("masterTitleCount", [iItems]);
	
				this.byId("page").setTitle(sTitle);			
			} else {
			}
		},
		 /*
		  * Internal helper method to apply both filter and search state together on the list binding
		  * @private
		  */
		_applyFilterSearch : function () {
			var aFilters = this.oListFilterState.search.concat(this.oListFilterState.filter);
			this.oList.getBinding("items").filter(aFilters, "Application");
		},
		
		/*
		 * Internal helper method to apply both group and sort state together on the list binding
		 * @private
		 */ 
		_applyGroupSort : function () {
			var aSorters = this.oListSorterState.group.concat(this.oListSorterState.sort);
			this.oList.getBinding("items").sort(aSorters);
		},
		
		/*
		 * Selects a list item by it's position in the list
		 * 
		 * @param {integer} iPosition the position in the list
		 *
		 * @private
		 */
		_selectItemByPosition : function(iPosition) {
			var aItems = this.oList.getItems();
	
			if (aItems.length) {
				this.oList.setSelectedItem(aItems[iPosition], true);
			}
		},
	
	});