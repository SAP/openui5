/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardExtension.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/core/delegate/ItemNavigation', './TableUtils'],
	function(jQuery, BaseObject, ItemNavigation, TableUtils) {
	"use strict";

	/*
	 * Wrapper for event handling of the item navigation.
	 * Allows to selectively forward the events to the item navigation.
	 * "this" in the function context is the corresponding keyboard extension
	 */
	var ItemNavigationDelegate = {

		_forward : function(oExtension, oEvent) {
			var oIN = oExtension.getTable()._getItemNavigation();
			if (oIN && !oExtension._itemNavigationSuspended && !oEvent.isMarked("sapUiTableSkipItemNavigation")) {
				oIN["on" + oEvent.type](oEvent);
			}
		},

		onfocusin : 			function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapfocusleave : 		function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onmousedown : 			function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapnext : 			function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapnextmodifiers : 	function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapprevious : 		function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsappreviousmodifiers : function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsappageup : 			function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsappagedown : 		function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsaphome : 			function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsaphomemodifiers : 	function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapend : 				function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapendmodifiers : 	function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); },
		onsapkeyup : 			function(oEvent) { ItemNavigationDelegate._forward(this, oEvent); }

	};


	/*
	 * Handles the keyboard events of the table which is associated with the extension.
	 * "this" in the function context is the corresponding keyboard extension
	 */
	var KeyboardDelegate = {
		tbd : function(oEvent) {

		}
	};


	/*
	 * Handles the keyboard events of the table inf future (new keyboard behavior) which is associated with the extension.
	 * "this" in the function context is the corresponding keyboard extension
	 */
	var NewKeyboardDelegate = {
		tbd : function(oEvent) {

		}
	};


	/*
	 * Switch between old an new keyboard behavior.
	 * (Only for development purposes to allow smaller commit chunks)
	 * Use NewKeyboardDelegate to switch to new behavior.
	 */
	var USED_KEYBOARD_DELEGATE = NewKeyboardDelegate; //satisfy eslint by using the var
	USED_KEYBOARD_DELEGATE = KeyboardDelegate;


	/*
	 * Provides utility functions used this extension
	 */
	var ExtensionHelper = {

		/*
		 * Initialize ItemNavigations (content and header) and transfer relevant dom elements.
		 * TabIndexes are set by the ItemNavigation.
		 */
		_initItemNavigation : function(oExtension) {
			var oTable = oExtension.getTable();
			var $Table = oTable.$();
			var iColumnCount = TableUtils.getVisibleColumnCount(oTable);
			var iTotalColumnCount = iColumnCount;
			var bHasRowHeader = TableUtils.hasRowHeader(oTable);

			// create the list of item dom refs
			var aItemDomRefs = [];
			if (oTable.getFixedColumnCount() == 0) {
				aItemDomRefs = $Table.find(".sapUiTableCtrl td[tabindex]").get();
			} else {
				var $topLeft = $Table.find('.sapUiTableCtrlFixed.sapUiTableCtrlRowFixed');
				var $topRight = $Table.find('.sapUiTableCtrlScroll.sapUiTableCtrlRowFixed');
				var $middleLeft = $Table.find('.sapUiTableCtrlFixed.sapUiTableCtrlRowScroll');
				var $middleRight = $Table.find('.sapUiTableCtrlScroll.sapUiTableCtrlRowScroll');
				var $bottomLeft = $Table.find('.sapUiTableCtrlFixed.sapUiTableCtrlRowFixedBottom');
				var $bottomRight = $Table.find('.sapUiTableCtrlScroll.sapUiTableCtrlRowFixedBottom');
				for (var i = 0; i < oTable.getVisibleRowCount(); i++) {
					aItemDomRefs = aItemDomRefs.concat($topLeft.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
					aItemDomRefs = aItemDomRefs.concat($topRight.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
					aItemDomRefs = aItemDomRefs.concat($middleLeft.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
					aItemDomRefs = aItemDomRefs.concat($middleRight.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
					aItemDomRefs = aItemDomRefs.concat($bottomLeft.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
					aItemDomRefs = aItemDomRefs.concat($bottomRight.find('tr[data-sap-ui-rowindex="' + i + '"]').find('td[tabindex]').get());
				}
			}

			// to later determine the position of the first TD in the aItemDomRefs we keep the
			// count of TDs => aCount - TDs = first TD (add the row headers to the TD count / except the first one!)
			var iTDCount = aItemDomRefs.length;
			var iInitialIndex = 0;

			// add the row header items (if visible)
			if (bHasRowHeader) {
				var aRowHdrDomRefs = $Table.find(".sapUiTableRowHdr").get();
				for (var i = aRowHdrDomRefs.length - 1; i >= 0; i--) {
					aItemDomRefs.splice(i * iColumnCount, 0, aRowHdrDomRefs[i]);
					// we ignore the row headers
					iTDCount++;
				}
				// except the first row header
				iTDCount--;
				// add the row header to the column count
				iTotalColumnCount++;
				iInitialIndex = 1;
			}

			// add the column items
			if (oTable.getColumnHeaderVisible()) {
				aItemDomRefs = $Table.find(".sapUiTableCol").get().concat(aItemDomRefs);
			}

			// add the select all item
			if (bHasRowHeader && oTable.getColumnHeaderVisible()) {
				var aRowHdr = $Table.find(".sapUiTableColRowHdr").get();
				for (var i = oTable._getHeaderRowCount() - 1; i >= 0; i--) {
					aItemDomRefs.splice(i * iColumnCount, 0, aRowHdr[0]);
				}
			}

			// initialization of item navigation for the Table control
			if (!oExtension._itemNavigation) {
				oTable._iLastSelectedDataRow = oTable._getHeaderRowCount(); //TBD: Needed?
				oExtension._itemNavigation = new ItemNavigation();
				oExtension._itemNavigation.setTableMode(true);
				oExtension._itemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, function(oEvent) {
					var iRow = Math.floor(oEvent.getParameter("index") / oExtension._itemNavigation.iColumns);
					if (iRow > 0) {
						oTable._iLastSelectedDataRow = iRow;
					}
				}, oTable);
			}


			// configure the item navigation
			oExtension._itemNavigation.setColumns(iTotalColumnCount);
			oExtension._itemNavigation.setRootDomRef($Table.find(".sapUiTableCnt").get(0));
			oExtension._itemNavigation.setItemDomRefs(aItemDomRefs);
			oExtension._itemNavigation.setFocusedIndex(iInitialIndex);

			// revert invalidation flag
			oExtension._itemNavigationInvalidated = false;
		}
	};

	/**
	 * Extension for sap.ui.table.Table which handles keyboard related things.
	 *
	 * @class Extension for sap.ui.table.Table which handles keyboard related things.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableKeyboardExtension
	 */
	var TableKeyboardExtension = BaseObject.extend("sap.ui.table.TableKeyboardExtension", /* @lends sap.ui.table.TableKeyboardExtension */ {

		/*
		 * @see TableKeyboardExtension.enrich
		 */
		constructor : function(oTable) {
			BaseObject.call(this);
			this._table = oTable;
			this._itemNavigation = null;
			this._itemNavigationInvalidated = false; // determines whether item navigation should be reapplied from scratch
			this._itemNavigationSuspended = false; // switch off event forwarding to item navigation

			// Register the delegates in correct order
			// TBD: Maybe do this somewhere else centrally ("DelegateManager")
			this._table.addEventDelegate(USED_KEYBOARD_DELEGATE, this);
			this._table.addEventDelegate(ItemNavigationDelegate, this);
			var oAccExt = this._table._getAccExtension();
			this._table.addEventDelegate(oAccExt, oAccExt);
		},

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() {
			// Deregister the delegates
			// TBD: Maybe do this somewhere else centrally ("DelegateManager")
			this._table.removeEventDelegate(USED_KEYBOARD_DELEGATE);
			this._table.removeEventDelegate(ItemNavigationDelegate);
			this._table.removeDelegate(this._table._getAccExtension());

			if (this._itemNavigation) {
				this._itemNavigation.destroy();
				this._itemNavigation = null;
			}

			this._table = null;
			BaseObject.prototype.destroy.apply(this, arguments);
		},

		/*
		 * @see sap.ui.base.Object#getInterface
		 */
		getInterface : function() { return this; }

	});

	/*
	 * Initializes the Keyboard Extension based on the type of the given Table control.
	 * @public (Part of the API for Table control only!)
	 */
	TableKeyboardExtension.enrich = function(oTable) {
		var oExtension;

		//Preparation for later:
		/*function _isInstanceOf(oControl, sType) {
			var oType = sap.ui.require(sType);
			return oType && (oControl instanceof oType);
		}

		if (_isInstanceOf(oTable, "sap/ui/table/TreeTable")) {
			oExtension = new TableKeyboardExtension(oTable);
		} else if (_isInstanceOf(oTable, "sap/ui/table/AnalyticalTable")) {
			oExtension = new TableKeyboardExtension(oTable);
		} else {
			oExtension = new TableKeyboardExtension(oTable);
		}*/
		oExtension = new TableKeyboardExtension(oTable);

		oTable._getKeyboardExtension = function(){ return oExtension; };
		oTable._getItemNavigation = function() { return oExtension._itemNavigation; };
	};


	/*
	 * Returns the related table control.
	 * @public (Part of the API for Table control only!)
	 */
	TableKeyboardExtension.prototype.getTable = function() {
		return this._table;
	};


	/*
	 * Check whether item navigation should be reapplied from scratch and initializes it if needed.
	 * @public (Part of the API for Table control only!)
	 */
	TableKeyboardExtension.prototype.initItemNavigation = function() {
		if (!this._itemNavigation || this._itemNavigationInvalidated) {
			ExtensionHelper._initItemNavigation(this);
		}
		return this._table;
	};


	/*
	 * Invalidates the item navigation (forces a re-initialization with the next initItemNavigation call)
	 * @public (Part of the API for Table control only!)
	 */
	TableKeyboardExtension.prototype.invalidateItemNavigation = function() {
		this._itemNavigationInvalidated = true;
	};


	/*
	 * Suspends the event handling of the item navigation.
	 * @public (Part of the API for Table control only!)
	 */
	TableKeyboardExtension.prototype.suspendItemNavigation = function() {
		this._itemNavigationSuspended = true;
	};


	/*
	 * Resumes the event handling of the item navigation.
	 * @public (Part of the API for Table control only!)
	 */
	TableKeyboardExtension.prototype.resumeItemNavigation = function() {
		this._itemNavigationSuspended = false;
	};


	return TableKeyboardExtension;

}, /* bExport= */ true);