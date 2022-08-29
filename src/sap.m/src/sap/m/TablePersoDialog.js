/*
 * ${copyright}
 */

// Provides TablePersoDialog
sap.ui.define([
	'./Text',
	'./Title',
	'./Label',
	'./Column',
	'./Button',
	'./Dialog',
	'./ColumnListItem',
	'./Table',
	'./Toolbar',
	'./Bar',
	'sap/ui/base/ManagedObject',
	'sap/ui/base/ManagedObjectRegistry',
	'sap/base/Log',
	'sap/base/util/deepExtend',
	'sap/m/library',
	'sap/ui/Device',
	'sap/ui/model/Sorter',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/json/JSONModel',
	'sap/m/SearchField',
	'sap/ui/core/Configuration'
],
	function(
		Text,
		Title,
		Label,
		Column,
		Button,
		Dialog,
		ColumnListItem,
		Table,
		Toolbar,
		Bar,
		ManagedObject,
		ManagedObjectRegistry,
		Log,
		deepExtend,
		library,
		Device,
		Sorter,
		Filter,
		FilterOperator,
		JSONModel,
		SearchField,
		Configuration
	) {
	"use strict";



	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.WrappingType
	var WrappingType = library.WrappingType;

	/**
	 * The TablePersoDialog can be used to display and allow modification of personalization settings relating to a Table. It displays the columns of the table that it refers to by using
	 * <ul><li>The result of calling sap.m.TablePersoProvider's 'getCaption' callback if it is implemented and delivers a non-null value for a column</li>
	 * <li>the column header control's 'text' property if no caption property is available</li>
	 * <li>the column header control's 'title' property if neither 'text' nor 'caption' property are available</li>
	 * <li>the column id is displayed as last fallback, if none of the above is at hand. In that case, a warning is logged. </li></ul>
	 *
	 * @param {string}
	 *			[sId] optional id for the new control; generated automatically if
	 *			no non-empty id is given Note: this can be omitted, no matter
	 *			whether <code>mSettings</code> will be given or not!
	 * @param {object}
	 *			[mSettings] optional map/JSON-object with initial settings for the
	 *			new component instance
	 * @public
	 *
	 * @class Table Personalization Dialog
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP
	 * @version ${version}
	 * @alias sap.m.TablePersoDialog
	 */
	var TablePersoDialog = ManagedObject.extend("sap.m.TablePersoDialog", /** @lends sap.m.TablePersoDialog.prototype */

	{
		constructor : function(sId, mSettings) {

			ManagedObject.apply(this, arguments);

		},

		metadata : {
			properties: {
				"contentWidth": {type: "sap.ui.core.CSSSize"},
				"contentHeight": {type: "sap.ui.core.CSSSize", since: "1.22"},
				"persoMap": {type: "object"},
				"columnInfoCallback": {type: "object", since: "1.22"},
				"initialColumnState": {type: "object", since: "1.22"},
				"hasGrouping": {type: "boolean", since: "1.22"},
				"showSelectAll": {type: "boolean", since: "1.22"},
				"showResetAll": {type: "boolean", since: "1.22"}
			},
			aggregations: {
				/**
				 * Refers to the service for reading and writing the personalization.
				 * @deprecated Since version 1.30.1
				 * This aggregate is no longer used. It collided with the TablePersoController's
				 * persoService reference
				 */
				"persoService": {
					type: "Object",
					multiple: false,
					deprecated: true
				}
			},
			associations: {
				/**
				 * The table which shall be personalized.
				 */
				"persoDialogFor": "sap.m.Table"
			},
			events: {
				confirm: {},
				cancel: {}
			},
			library: "sap.m"
		}

	});


	// apply the registry mixin
	ManagedObjectRegistry.apply(TablePersoDialog, {
		onDuplicate: function(sId, oldDialog, newDialog) {
			if ( oldDialog._sapui_candidateForDestroy ) {
				Log.debug("destroying dangling template " + oldDialog + " when creating new object with same ID");
				oldDialog.destroy();
			} else {
				var sMsg = "adding TablePersoDialog with duplicate id '" + sId + "'";
				// duplicate ID detected => fail or at least log a warning
				if (Configuration.getNoDuplicateIds()) {
					Log.error(sMsg);
					throw new Error("Error: " + sMsg);
				} else {
					Log.warning(sMsg);
				}
			}
		}
	});

	/**
	 * Initializes the TablePersoDialog instance after creation.
	 *
	 * @protected
	 */
	TablePersoDialog.prototype.init = function() {
		var that = this,
			iLiveChangeTimer = 0;

		// Resource bundle, for texts
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		// To store the column settings
		this._oP13nModel = new JSONModel();
		// Make sure that model can contain more than the 100 entries
		// it may contain by default.
		// SUGGESTED IMPROVEMENT: use number of table columns instead
		this._oP13nModel.setSizeLimit(Number.MAX_VALUE);

		// Template for list inside the dialog - 1 item per column
		this._oColumnItemTemplate = new ColumnListItem(this.getId() + "-cli", {
			selected: "{Personalization>visible}",
			type: "Active",
			cells: [
				new Label({
					wrapping: true,
					wrappingType: WrappingType.Hyphenated,
					text: "{Personalization>text}"
				})
			],
			press: function(oEvt){
				this._oSelectedItem = oEvt.oSource;
				this._fnUpdateArrowButtons.call(this);
			}.bind(this)
		}).addStyleClass("sapMPersoDialogLI");

		// Button definition for sorting of the table content(up/down)
		this._oButtonUp = new Button(this.getId() + "-buttonUp", {
						icon: "sap-icon://navigation-up-arrow",
						enabled: false,
						tooltip: that._oRb.getText('PERSODIALOG_UP'),
						press: function() {
							that._moveItem(-1);
						}
		});

		this._oButtonDown = new Button(this.getId() + "-buttonDown",{
						icon: "sap-icon://navigation-down-arrow",
						enabled: false,
						tooltip: that._oRb.getText('PERSODIALOG_DOWN'),
						press: function() {
							  that._moveItem(1);
						}
		});

		this._fnUpdateArrowButtons = function() {
			if (this.getHasGrouping()) {
				return;
			}
			// Initialisation of the enabled property
			var aFields = this._oInnerTable.getModel("Personalization").getProperty("/aColumns");
			var bButtonUpEnabled,bButtonDownEnabled;

			if (!this._oSelectedItem){
				//no item yet selected
				bButtonUpEnabled = false;
				bButtonDownEnabled = false;
			} else {
				var iItemIndex = aFields.indexOf(this._oSelectedItem.getBindingContext("Personalization").getObject());
				bButtonUpEnabled = iItemIndex > 0 ? true : false;
				bButtonDownEnabled = iItemIndex < aFields.length - 1 ? true : false;
			}
			this._updateMarkedItem();
			that._oButtonUp.setEnabled(bButtonUpEnabled);
			that._oButtonDown.setEnabled(bButtonDownEnabled);
		}.bind(this);

		this._fnAfterDialogOpen = function () {
			// Make sure that arrow buttons are updated when dialog is opened
			that._fnUpdateArrowButtons.call(that);
		};

		this._oInnerTable =  new Table(this.getId() + "-colTable",{
			noDataText: this._oRb.getText('PERSODIALOG_NO_DATA'),
			mode: ListMode.MultiSelect,
			width: "100%",
			sticky: ["ColumnHeaders"],
			columns: [
				new Column({
					header: new Text({
						text: this._oRb.getText("PERSODIALOG_SELECT_ALL")
					})
				})
			]
		});

		this._oSearchField = new SearchField(this.getId() + "-searchField", {
			width: "100%",
			liveChange: function (oEvent) {
				var sValue = oEvent.getSource().getValue(),
					iDelay = (sValue ? 300 : 0); // No delay if value is empty

				// Execute search after user stops typing for 300ms
				clearTimeout(iLiveChangeTimer);
				if (iDelay) {
					iLiveChangeTimer = setTimeout(function () {
						that._executeSearch();
					}, iDelay);
				} else {
					that._executeSearch();
				}
			},
			// Execute the standard search
			search: function () {
				that._executeSearch();
			}
		});

		this._resetAllButton = new Button(this.getId() + "-buttonUndo", {
			text: this._oRb.getText("VIEWSETTINGS_RESET"),
			press : function () {
				this._resetAll();
			}.bind(this)
		}).addStyleClass("sapMPersoDialogResetBtn");

		var oHeader = new Bar({
			contentLeft:
				new Title(this.getId() + "-Dialog-title",{
					text: this._oRb.getText("PERSODIALOG_COLUMNS_TITLE")
				}),
			contentRight: this._resetAllButton
		});

		var oSubHeader = new Toolbar(this.getId() + "-toolbar", {
			//makes sure that toolbar itself is not clickable and removed from tab chain
			active : false,
			content: [ this._oSearchField, this._oButtonUp, this._oButtonDown ]
		});

		this._oDialog = new Dialog(this.getId() + "-Dialog", {
			title: this._oRb.getText("PERSODIALOG_COLUMNS_TITLE"),
			customHeader: oHeader,
			draggable: true,
			resizable: true,
			stretch: Device.system.phone,
			horizontalScrolling: false,
			verticalScrolling: true,
			initialFocus: (Device.system.desktop ? this._oInnerTable : null),
			content : [this._oInnerTable ],
			subHeader : oSubHeader,
			leftButton : new Button(this.getId() + "-buttonOk", {
				text : this._oRb.getText("PERSODIALOG_OK"),
				press : function () {
					that._oDialog.close();
					that._oSelectedItem = null;
					that._oSearchField.setValue("");
					that.fireConfirm();
				},
				type : ButtonType.Emphasized
			}),
			rightButton : new Button(this.getId() + "-buttonCancel", {
				text: this._oRb.getText("PERSODIALOG_CANCEL"),
				press: function () {
					that._oDialog.close();
					that._oSelectedItem = null;
					that._oSearchField.setValue("");
					that.fireCancel();
				}
			}),
			afterOpen: this._fnAfterDialogOpen
		}).addStyleClass("sapMPersoDialog");

		this._oDialog.setTitle = function(sTitle) {
			this.setProperty("title", sTitle);
			this.getCustomHeader().getContentLeft()[0].setText(sTitle);
		};
	};

	TablePersoDialog.prototype._updateMarkedItem = function(){
		if (!this._oSelectedItem) {
			this._oSelectedItem = this._oInnerTable && this._oInnerTable.getItems().length > 0 ? this._oInnerTable.getItems()[0] : null;
		}
		if (this._oSelectedItem){
			this._oInnerTable.getItems().forEach(function(oItem){
				if (oItem.hasStyleClass("sapMPersoDialogItemSelected")){
					oItem.removeStyleClass("sapMPersoDialogItemSelected");
				}
			});
			this._oSelectedItem.addStyleClass("sapMPersoDialogItemSelected");
		}
	};

	/**
	 * Returns the personalizations made. Currently supports
	 * a 'columns' property which holds an array of settings,
	 * one element per column in the associated table. The element
	 * contains column-specific information as follows: id: column id;
	 * order: new order; text: the column's header text that was displayed
	 * in the dialog; visible: visibility (true or false).
	 *
	 * @return {object} the personalization data
	 * @public
	 */
	TablePersoDialog.prototype.retrievePersonalizations = function () {
		return this._oP13nModel.getData();
	};

	/**
	 * Sets the content of the dialog, being list items representing
	 * the associated table's column settings, and opens the dialog
	 * @public
	 */
	TablePersoDialog.prototype.open = function () {
		var aSorter = null;
		if (this.getHasGrouping()) {
			aSorter = [new Sorter('group', false, true)];
		}
		// Get the associated Table's column info and set it into the Personalization model
		this._readCurrentSettingsFromTable();

		// SUGGESTED IMPROVEMENT: Move the following code block into
		// 'init' method. Seems like it is not necessary to call setModel
		// and 'bindAggregation' over and over angain, when the dialog is
		// opened.
		this._oDialog.setModel(this._oP13nModel, "Personalization");
		this._oInnerTable.bindAggregation("items", {
			path: "Personalization>/aColumns",
			key: "text",
			sorter: aSorter,
			template: this._oColumnItemTemplate
		});
		// SUGGESTED IMPROVEMENT: until here

		if (!this._oInnerTable.getSelectedItem()) {
			// Make sure initial selection is set
			var aItems = this._oInnerTable.getItems();
			if (this.getHasGrouping()) {
				aItems = aItems.filter(function (oItem){
					return oItem.getMetadata().getName() != "sap.m.GroupHeaderListItem";
				});
			}
			if (aItems.length > 0) {
				this._sLastSelectedItemId = aItems[0].getBindingContext('Personalization').getProperty('id');
			}
		}

		// Update 'Move' button's state
		this._fnUpdateArrowButtons.call(this);

		// Now show the dialog
		this._oDialog.open();
	};


	TablePersoDialog.prototype.setContentHeight = function(sHeight) {
		sHeight = sHeight ? sHeight : "28rem";
		this.setProperty("contentHeight", sHeight, true);
		this._oDialog.setContentHeight(sHeight);
		return this;
	};

	TablePersoDialog.prototype.setContentWidth = function(sWidth) {
		sWidth = sWidth ? sWidth : "25rem";
		this.setProperty("contentWidth", sWidth, true);
		this._oDialog.setContentWidth(sWidth);
		return this;
	};

	/**
	 * Destroys the control
	 * @private
	 */
	TablePersoDialog.prototype.exit = function () {
		this._oRb = null;
		this._oP13nModel = null;
		this._oSelectedItem = null;

		if (this._oColumnItemTemplate) {
			this._oColumnItemTemplate.destroy();
			this._oColumnItemTemplate = null;
		}

		if (this._oInnerTable) {
			this._oInnerTable.destroy();
			this._oInnerTable = null;
		}

		if (this._oSearchField) {
			this._oSearchField.destroy();
			this._oSearchField = null;
		}

		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}

		if (this._oButtonDown) {
			this._oButtonDown.destroy();
			this._oButtonDown = null;
		}
		if (this._oButtonUp) {
			this._oButtonUp.destroy();
			this._oButtonUp = null;
		}
	};

	/* =========================================================== */
	/*           begin: internal methods                           */
	/* =========================================================== */

	/**
	* Turn column visibility and order back to initial state (state before table
	* was personalized)
	* @private
	*/
	TablePersoDialog.prototype._resetAll = function () {
		if (this.getInitialColumnState()) {
			// Deep copy of Initial Data, otherwise initial data will be changed
			// and can only be used once to restore the initial state

			var aInitialStateCopy = deepExtend([], this.getInitialColumnState()),
				that = this;
			// CSN 0120031469 0000184938 2014
			// Remember last selected row, so it can be selected again after
			// reset all is done
			var oLastSelectedItem = this._oInnerTable.getSelectedItem();
			this._sLastSelectedItemId = oLastSelectedItem &&
				oLastSelectedItem.getBindingContext('Personalization') &&
				oLastSelectedItem.getBindingContext('Personalization').getProperty('id');

			// CSN 0120061532 0001380609 2014
			// Make sure that captions are not replaced by column id's. This my be the case if
			// initalStateCopy has been created too early
			if (this._mColumnCaptions) {
				aInitialStateCopy.forEach(
					function(oColumn) {
						oColumn.text = that._mColumnCaptions[oColumn.id];
				});
			}

			this._oP13nModel.getData().aColumns = aInitialStateCopy;

			this._oP13nModel.updateBindings();
			//Make sure that list is rerendered so that _fnListUpdateFinished is called
			//and list items are rendered correctly
			sap.ui.getCore().applyChanges();
		}
	};



	/**
	 * Moves an item up or down, swapping it with the neighbour.
	 * Does this in the bound model.
	 * @private
	 * @param {int} iDirection the move direction (-1 up, 1 down)
	 */
	TablePersoDialog.prototype._moveItem = function (iDirection) {

		var oSelectedItem = this._oSelectedItem;
		if (!oSelectedItem) {
			return;
		}

		var aItems = this._oInnerTable.getItems();
		var aFields = this._oInnerTable.getModel("Personalization").getProperty("/aColumns");

		// index of the item in the model not the index in the aggregation
		var iOldIndex = aFields.indexOf(oSelectedItem.getBindingContext("Personalization").getObject());

		// limit the minumum and maximum index
		var iNewIndex = iOldIndex + iDirection;

		// new index of the item in the model
		iNewIndex = aFields.indexOf(aItems[iNewIndex].getBindingContext("Personalization").getObject());
		if (iNewIndex == iOldIndex) {
			return;
		}

		// remove data from old position and insert it into new position
		aFields.splice(iNewIndex, 0, aFields.splice(iOldIndex, 1)[0]);
		aFields.forEach(function(oItem, iIndex){
			oItem.order = iIndex;
		});
		this._oInnerTable.getModel("Personalization").setProperty("/aColumns", aFields);

		// store the moved item again due to binding
		this._oSelectedItem = aItems[iNewIndex];
		this._scrollToItem(this._oSelectedItem);

		this._fnUpdateArrowButtons.call(this);

	};

	/**
	 * Scrolls the inner Table based to the passed item and the relative viewport.
	 *
	 * @private
	 * @param {object} oItem the item which should be scrolled to
	 */
	TablePersoDialog.prototype._scrollToItem = function(oItem){
		//update DOM refs for height calculations
		sap.ui.getCore().applyChanges();

		//check if there is an item
		if (oItem.getDomRef()) {
			var iNewIndex = this._oInnerTable.getItems().indexOf(oItem);

			var oItemDOMRect = oItem.getDomRef().getBoundingClientRect();
			var oDialogContainerRect = this._oDialog.getDomRef("cont").getBoundingClientRect();

			var iVPStart = oDialogContainerRect.top;
			var iVPEnd = oDialogContainerRect.bottom;

			var iElementOffset = oItemDOMRect.top;

			if (iElementOffset < iVPStart + 18) {
				this._oInnerTable.scrollToIndex(iNewIndex);
			} else if (iElementOffset > iVPEnd - 18) {
				this._oInnerTable.scrollToIndex(iNewIndex);
			}
		}
	};

	/**
	 * Reads current column settings from the table and stores in the model
	 * @private
	 */
	TablePersoDialog.prototype._readCurrentSettingsFromTable = function() {
		var oTable = sap.ui.getCore().byId(this.getPersoDialogFor()),
			that = this,
			aCurrentColumns = this.getColumnInfoCallback().call(this, oTable, this.getPersoMap());
		this._oP13nModel.setData({
			aColumns : aCurrentColumns
		});

		// Remember column captions, needed for 'Reset All'
		// This is a workaround to fix an issue with unavailable column texts
		// after executing 'resetAll' (see 'resetAll' and CSN 0120061532 0001380609 2014)
		this._mColumnCaptions = {};
		aCurrentColumns.forEach(
			function(oColumn) {
				that._mColumnCaptions[oColumn.id] = oColumn.text;
		});
	};

	/**
	 * Filters the columns list with the given value
	 * @return {sap.m.TablePersoDialog} the tablePersoDialog instance.
	 * @private
	 */
	TablePersoDialog.prototype._executeSearch = function () {
		var sValue = this._oSearchField.getValue(),
			oFilter = new Filter("text", FilterOperator.Contains, sValue),
			oBinding = this._oInnerTable.getBinding("items");

		oBinding.filter([oFilter]);
		this._fnUpdateArrowButtons.call(this);
		return this;
	};

	/**
	 * Setter to turn on/ switch off TablePersoDialog's grouping mode.
	 * @param {boolean} bHasGrouping groping mode on or off.
	 * @returns {this} the TablePersoDialog instance.
	 * @public
	 */
	TablePersoDialog.prototype.setHasGrouping = function (bHasGrouping) {
		this.setProperty("hasGrouping", bHasGrouping, true);
		var oBar = this._oDialog.getSubHeader();
		if (!bHasGrouping) {
			if (oBar.getContent().length === 1) {
				// Only search field is displayed, add up- and down
				// buttons
				oBar.addContent(this._oButtonDown);
				oBar.addContent(this._oButtonUp);
			}
		} else {
			oBar.removeContent(this._oButtonUp);
			oBar.removeContent(this._oButtonDown);
		}
		return this;
	};

	/**
	 * Setter to show/hide TablePersoDialog's 'selectAll' checkbox.
	 * @param {boolean} bShowSelectAll selectAll checkbox visible or not.
	 * @returns {this} the TablePersoDialog instance.
	 * @public
	 */
	TablePersoDialog.prototype.setShowSelectAll = function (bShowSelectAll) {
		this.setProperty("showSelectAll", bShowSelectAll, true);
		var sText = bShowSelectAll ? this._oRb.getText("PERSODIALOG_SELECT_ALL") : this._oRb.getText("PERSODIALOG_COLUMNS_TITLE");
		this._oInnerTable.getColumns()[0].setHeader(new Text({
			text: sText
		}));
		this._oInnerTable.bPreventMassSelection = !bShowSelectAll;
		return this;
	};

	/**
	 * Setter to show/hide TablePersoDialog's 'Undo Personalization' button.
	 * @param {boolean} bShowResetAll 'undo Personalization' button visible or not.
	 * @returns {this} the TablePersoDialog instance.
	 * @public
	 */
	TablePersoDialog.prototype.setShowResetAll = function (bShowResetAll) {
		this.setProperty("showResetAll", bShowResetAll, true);
		this._resetAllButton.setVisible(bShowResetAll);
		return this;
	};

	return TablePersoDialog;

});