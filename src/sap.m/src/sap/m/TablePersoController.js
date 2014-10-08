/*
 * ${copyright}
 */

// Provides TablePersoController
sap.ui.define(['jquery.sap.global', './TablePersoDialog', 'sap/ui/base/ManagedObject'],
	function(jQuery, TablePersoDialog, ManagedObject) {
	"use strict";


	
	/**
	 * The TablePersoController can be used to connect a table that you want to provide
	 * a personalization dialog for, with a persistence service such as one provided by
	 * the unified shell.
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
	 * @class Table Personalization Controller
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP
	 * @version ${version}
	 * @name sap.m.TablePersoController
	 */
	var TablePersoController = ManagedObject.extend("sap.m.TablePersoController", /** @lends sap.m.TablePersoController */
	
	{
		constructor: function(sId, mSettings) {
	
			ManagedObject.apply(this, arguments);
	
		},
	
		metadata: {
			properties: {
				"contentWidth": {type: "sap.ui.core.CSSSize"},
				"contentHeight": {type: "sap.ui.core.CSSSize", defaultValue: "20rem", since: "1.22"},
				"componentName": {type: "string", since: "1.20.2"},
				"hasGrouping": {type: "boolean", defaultValue: false, since: "1.22"},
				"showSelectAll": {type: "boolean", defaultValue: true, since: "1.22"},
				"showResetAll": {type: "boolean", defaultValue: true, since: "1.22"}
			},
			aggregations: {
				"_tablePersoDialog": {
					type: "sap.m.TablePersoDialog",
					multiple: false,
					visibility: "hidden"
				},
				"persoService": {
					type: "Object",
					multiple: false
				}
			},
			associations: {
				"table": {
					type: "sap.m.Table",
					multiple: false
				},
				"tables": {
					type: "sap.m.Table",
					multiple: true
				}
			},
			events: {
				personalizationsDone: {}
			},
			library: "sap.m"
		}
	
	});
	
	
	/**
	 * Initializes the TablePersoController instance after creation.
	 *
	 * @function
	 * @name sap.m.TablePersoController.prototype.init
	 * @protected
	 */
	TablePersoController.prototype.init = function() {
	
		// Table Personalization schema
		this._schemaProperty = "_persoSchemaVersion";
		this._schemaVersion = "1.0";
	
		// To store the intermediate personalization data
		this._oPersonalizations = null;
		//Initialize delegate map
		this._mDelegateMap = {};
		//Initialize table personalization map
		this._mTablePersMap = {};
		//Initialize map to contain initial states of all tables
		this._mInitialTableStateMap = {};
		//Internal flag which may be checked by clients which
		//have workaround for missing event in place
		this._triggersPersDoneEvent = true;
	
	};
	
	/**
	 * Do some clean up: remove event delegates, etc
	 *
	 * @function
	 * @name sap.m.TablePersoController.prototype.exit
	 * @protected
	 */
	TablePersoController.prototype.exit = function() {
	
		// Clean up onBeforRendering delegates
		this._callFunctionForAllTables(jQuery.proxy(function(oTable){
			oTable.removeDelegate(this._mDelegateMap[oTable]);
		}, this));
		
		delete this._mDelegateMap;
		delete this._mTablePersMap;
		delete this._mInitialTableStateMap;
	};
	
	/**
	 * Activates the controller, i.e. tries to retrieve existing persisted
	 * personalizations, creates a TablePersoDialog for the associated
	 * table and attaches a close handler to apply the personalizations to
	 * the table and persist them.
	 * @public
	 */
	TablePersoController.prototype.activate = function() {
	
		//Remember initial table columns states before personalization
		this._callFunctionForAllTables(this._rememberInitialTableStates);
		// Add 'onBeforeRendering' delegates to all tables
		this._callFunctionForAllTables(this._createAndAddDelegateForTable);
		
		return this;
	};
	
	/**
	 * Returns a  _tablePersoDialog instance if available. It can be NULL if
	 * the controller has not been activated yet.
	 *
	 * @public
	 */
	TablePersoController.prototype.getTablePersoDialog = function() {
		return this.getAggregation("_tablePersoDialog");
	};
	
	
	/**
	 * Applies the personalizations by getting the existing personalizations
	 * and adjusting to the table.
	 *
	 * @param {object} oTable
	 * @public
	 */
	TablePersoController.prototype.applyPersonalizations = function(oTable) {
		var oReadPromise = this.getPersoService().getPersData();
		var that = this;
		oReadPromise.done(function(oPersData) {
			if (!!oPersData) {
				that._adjustTable(oPersData, oTable);
			}
		});
		oReadPromise.fail(function() {
			jQuery.sap.log.error("Problem reading persisted personalization data.");
		});
	};
	
	/**
	 * Creates 'onBeforeRendering' delegate for given table and adds it to the controller'
	 * '_mDelegateMap'
	 *
	 * @private
	 */
	TablePersoController.prototype._createAndAddDelegateForTable = function(oTable) {
		if (!this._mDelegateMap[oTable]) {
			//Use 'jQuery.proxy' to conveniently use 'this' within the
			//delegate function
			var oTableOnBeforeRenderingDel = {onBeforeRendering : jQuery.proxy(function () {
				// Try to retrieve existing persisted personalizations
				// and adjust the table
				this.applyPersonalizations(oTable);
				// This function will be called whenever its table is rendered or
				// re-rendered. The TablePersoDialog only needs to be created once, though!
				if (!this.getAggregation("_tablePersoDialog")) {
					this._createTablePersoDialog(oTable);
				}
			}, this)};
			//By adding our function as a delegate to the table's 'beforeRendering' event,
			//this._fnTableOnBeforeRenderingDel will be executed whenever the table is
			//rendered or re-rendered
			
			oTable.addDelegate(oTableOnBeforeRenderingDel);
			//Finally add delegate to map to enable proper housekeeping, i.e. cleaning
			//up delegate when TablePersoController instance is destroyed
			this._mDelegateMap[oTable] = oTableOnBeforeRenderingDel;
		}
	};
	
	/**
	 * Creation of the TablePersoDialog based on the content of oTable and
	 * save the personalizations
	 *
	 */
	TablePersoController.prototype._createTablePersoDialog = function(oTable) {
		// Create a new TablePersoDialog control for the associated table
			var oTablePersoDialog = new TablePersoDialog({
					persoDialogFor: oTable,
					persoMap : this._getPersoColumnMap(oTable),
					columnInfoCallback: this._tableColumnInfo,
					initialColumnState : this._mInitialTableStateMap[oTable],
					persoService: this.getPersoService(),
					contentWidth: this.getContentWidth(),
					contentHeight: this.getContentHeight(),
					hasGrouping: this.getHasGrouping(),
					showSelectAll: this.getShowSelectAll(),
					showResetAll: this.getShowResetAll()
			});
	
	// Link to this new TablePersoDialog via the aggregation
		this.setAggregation("_tablePersoDialog", oTablePersoDialog);
	
	// When the TablePersoDialog closes, we want to retrieve the personalizations
	// made, amend the table, and also persist them
		oTablePersoDialog.attachConfirm(jQuery.proxy(function() {
			this._oPersonalizations = oTablePersoDialog.retrievePersonalizations();
			this._callFunctionForAllTables(this._personalizeTable);
			this.savePersonalizations();
			this.firePersonalizationsDone();
		}, this));
	
	};
	
	/**
	 * Adjusts the table by getting the existing personalizations
	 * and applying them to the table.
	 *
	 * @private
	 */
	TablePersoController.prototype._adjustTable = function(oData, oTable) {
		if (oData && oData.hasOwnProperty(this._schemaProperty) && oData[this._schemaProperty] === this._schemaVersion) {
			this._oPersonalizations = oData;
			if (!!oTable) {
				this._personalizeTable(oTable);
			} else {
				this._callFunctionForAllTables(this._personalizeTable);
			}
			
		}
	};
	
	
	/**
	 * Personalizes the table, i.e. sets column order and visibility
	 * according to the stored personalization settings
	 *
	 * @private
	 */
	TablePersoController.prototype._personalizeTable = function(oTable) {
		var mPersoMap = this._getPersoColumnMap(oTable);
		
		//mPersoMap may be null if oTable's id is not static 
		//or if any of the column ids is not static
		if (!!mPersoMap && !!this._oPersonalizations) {
			var bDoSaveMigration = false;
			// Set order and visibility
			for ( var c = 0, cl = this._oPersonalizations.aColumns.length; c < cl; c++) {
				var oNewSetting = this._oPersonalizations.aColumns[c];
				var oTableColumn = mPersoMap[oNewSetting.id];
				if (!oTableColumn) {
					//Fallback for deprecated personalization procedure
					oTableColumn = sap.ui.getCore().byId(oNewSetting.id);
					if (!!oTableColumn) {
						//migrate old persistence id
						jQuery.sap.log.info("Migrating personalization persistence id of column " + oNewSetting.id );
						oNewSetting.id = mPersoMap[oTableColumn];
						bDoSaveMigration = true;
					}
				}
				
				if (oTableColumn) {
					oTableColumn.setVisible(oNewSetting.visible);
					oTableColumn.setOrder(oNewSetting.order);
				} else {
					jQuery.sap.log.warning("Personalization could not be applied to column " + oNewSetting.id + " - not found!");
				}
			}
			
			if (bDoSaveMigration) {
				this.savePersonalizations();
			}
	
			// Force re-rendering of Table for column reorder
			oTable.invalidate();
		}
	};
	
	
	/**
	 * Persist the personalizations
	 *
	 * @public
	 */
	TablePersoController.prototype.savePersonalizations = function() {
	
		var oBundle = this._oPersonalizations;
	
		// Add schema version to bundle
		oBundle[this._schemaProperty] = this._schemaVersion;
	
		// Commit to backend service
		var oWritePromise = this.getPersoService().setPersData(oBundle);
		oWritePromise.done(function() {
			// all OK
		});
		oWritePromise.fail(function() {
			jQuery.sap.log.error("Problem persisting personalization data.");
		});
	
	};
	
	
	/**
	 * Refresh the personalizations: reloads the personalization information from the table perso 
	 * provider, applies it to the controller's table and updates the controller's table perso dialog.
	 *
	 * @public
	 */
	TablePersoController.prototype.refresh = function() {
		var fnRefreshTable = function(oTable) {
			this._mTablePersMap = {};
			oTable.invalidate();
		};
	
		this._callFunctionForAllTables(fnRefreshTable);
		var oTablePersoDialog = this.getAggregation("_tablePersoDialog");
		if (!!oTablePersoDialog) {
			//need to refresh the map which contains columns and personalizations
			//columns may have been removed or added. (CSN 0120031469 0000415411 2014)
			oTablePersoDialog.setPersoMap(this._getPersoColumnMap(sap.ui.getCore().byId(oTablePersoDialog.getPersoDialogFor())));
		}
	};
	
	
	/**
	 * Opens the TablePersoDialog, stores the personalized settings on close,
	 * modifies the table columns, and sends them to the persistence service
	 *
	 * @public
	 */
	TablePersoController.prototype.openDialog = function() {
		var oTablePersoDialog = this.getAggregation("_tablePersoDialog");
		if (!!oTablePersoDialog) {
			jQuery.sap.syncStyleClass("sapUiSizeCompact", oTablePersoDialog.getPersoDialogFor(), oTablePersoDialog._oDialog);
			oTablePersoDialog.open();
		} else {
			jQuery.sap.log.warning("sap.m.TablePersoController: trying to open TablePersoDialog before TablePersoService has been activated.");
		}
	};
	
	/**
	 * Reflector for the controller's 'contentWidth' property.
	 * @param {sap.ui.core.CSSSize} sWidth
	 * @public
	 */
	TablePersoController.prototype.setContentWidth = function(sWidth) {
		this.setProperty("contentWidth", sWidth, true);
		var oTablePersoDialog = this.getAggregation("_tablePersoDialog");
		if (!!oTablePersoDialog) {
			oTablePersoDialog.setContentWidth(sWidth);
		}
		return this;
	};
	
	/**
	 * Reflector for the controller's 'contentHeight' property.
	 * @param {sap.ui.core.CSSSize} sHeight
	 * @public
	 */
	TablePersoController.prototype.setContentHeight = function(sHeight) {
		this.setProperty("contentHeight", sHeight, true);
		var oTablePersoDialog = this.getAggregation("_tablePersoDialog");
		if (!!oTablePersoDialog) {
			oTablePersoDialog.setContentHeight(sHeight);
		}
		return this;
	};
	
	/**
	 * Reflector for the controller's 'hasGrouping' property.
	 * @param {boolean} bHasGrouping
	 * @public
	 */
	TablePersoController.prototype.setHasGrouping = function(bHasGrouping) {
		this.setProperty("hasGrouping", bHasGrouping, true);
		var oTablePersoDialog = this.getAggregation("_tablePersoDialog");
		if (!!oTablePersoDialog) {
			oTablePersoDialog.setHasGrouping(bHasGrouping);
		}
		return this;
	};
	
	/**
	 * Reflector for the controller's 'showSelectAll' property.
	 * @param {boolean} bShowSelectAll
	 * @public
	 */
	TablePersoController.prototype.setShowSelectAll = function(bShowSelectAll) {
		this.setProperty("showSelectAll", bShowSelectAll, true);
		var oTablePersoDialog = this.getAggregation("_tablePersoDialog");
		if (!!oTablePersoDialog) {
			oTablePersoDialog.setShowSelectAll(bShowSelectAll);
		}
		return this;
	};
	
	/**
	 * Reflector for the controller's 'showResetAll' property.
	 * @param {boolean} bShowResetAll
	 * @public
	 */
	TablePersoController.prototype.setShowResetAll = function(bShowResetAll) {
		this.setProperty("showResetAll", bShowResetAll, true);
		var oTablePersoDialog = this.getAggregation("_tablePersoDialog");
		if (!!oTablePersoDialog) {
			oTablePersoDialog.setShowResetAll(bShowResetAll);
		}
		return this;
	};
	
	/**
	 * Using this method, the first part of tablePerso persistence ids can be
	 * provided, in case the table's app does not provide that part itself.
	 * 
	 * If a component name is set using this method, it will be used, regardless of
	 * whether the table's app has a different component name or not.
	 * 
	 * @param {string} sCompName
	 * @public
	 */
	TablePersoController.prototype.setComponentName = function(sCompName) {
		this.setProperty("componentName", sCompName, true);
		return this;
	};
	
	/**
	 * Returns the controller's component name set via 'setComponentName' if present, otherwise it
	 * delivers the given oControl's component name by recursive asking its
	 * parents for their component name. If none of oControl's ancestors has a component
	 * name, the function returns 'empty_component'.
	 * 
	 * @private
	 */
	TablePersoController.prototype._getMyComponentName = function(oControl) {
		if (this.getComponentName()) {
			return this.getComponentName();
		}
		
		if (oControl === null) {
			return "empty_component";
		}
		var oMetadata = oControl.getMetadata();
		if (oControl.getMetadata().getStereotype() === "component") {
			return oMetadata._sComponentName;
		}
		return this._getMyComponentName(oControl.getParent());
	};
	
	/**
	 * Checks if a table is specified for the singular association 'table'.
	 * Otherwise, the first table of the multiple association 'tables' will be returned.
	 * This function returns controls, not ids!
	 * 
	 * @private
	 */
	TablePersoController.prototype._getFirstTable = function() {
		var oTable = sap.ui.getCore().byId(this.getAssociation("table"));
		var aTables = this.getAssociation("tables");
		if (!oTable && aTables && aTables.length > 0) {
			oTable = sap.ui.getCore().byId(aTables[0]);
		}
		return oTable;
	};
	
	/**
	 * Takes a function and calls it for all table, specified in the controller's
	 * 'table' or 'tables' association. The passed in function must take
	 * a table as first parameter!
	 * 
	 * @private
	 */
	TablePersoController.prototype._callFunctionForAllTables = function(fnToCall) {
		var oTable = sap.ui.getCore().byId(this.getAssociation("table"));
		if (!!oTable) {
			fnToCall.call(this, oTable);
		}
		var aTables = this.getAssociation("tables");
		if (aTables) {
			for ( var i = 0, iLength = this.getAssociation("tables").length; i < iLength; i++) {
				oTable = sap.ui.getCore().byId(this.getAssociation("tables")[i]);
				fnToCall.call(this, oTable);
			}
		}
	};
	
	/**
	* Simple heuristic to determine if an ID is generated or static
	* @private
	*/
	TablePersoController.prototype._isStatic = function (sId) {
		var sUidPrefix = sap.ui.getCore().getConfiguration().getUIDPrefix();
		var rGeneratedPrefix = new RegExp("^" + sUidPrefix);
		return ! rGeneratedPrefix.test(sId);
	};
	
	
	/**
	 * Lazy instantiation of private member _mPersMap 
	 * This is a map containg key value pairs of the following kind:
	 * 		- key: a table column object
	 * 		- value: column personalization identifier of the form 
	 * 		  <componentName>-<tableIdSuffix>-<columnIDSuffix> 
	 * and vice versa! This map is created once, before the corresponding 
	 * table is rendered for the first time.
	 * @param oTable the table for whose columns shall be the resulting map's keys.
	 * @private
	 */
	TablePersoController.prototype._getPersoColumnMap = function(oTable) {
		var mResult = this._mTablePersMap[oTable];
		if (!mResult) {
			mResult = {};
			//convenience function to extract last part of an id
			//need this for columns and table
			var fnExtractIdSuffix = function(sId) {
				var iLastDashIndex = sId.lastIndexOf("-");
				//if no dash was found 'substring' will still work:
				//it returns the entire string, which should not happen
				//but would be ok in that case
				return sId.substring(iLastDashIndex + 1);
			};
			
			var sTableIdSuffix = fnExtractIdSuffix.call(this, oTable.getId());
			
			//Check table id. Must be static
			if (!this._isStatic(sTableIdSuffix)) {
				jQuery.sap.log.error("Table " + oTable.getId() + " must have a static id suffix. Otherwise personalization can not be persisted.");
				//Invalidate persoMap
				mResult = null;
				return null;
			}
			var sNextPersoColumnIdentifier;
			var sComponentName = this._getMyComponentName(oTable);
			
			
			var that = this;
			
			oTable.getColumns().forEach(function(oNextColumn) {
				//Check if result has been invalidated by a previous iteration
				if (!!mResult) {
					//'this' refers to the current table column
					var sNextColumnId = oNextColumn.getId();
					var sNextColumnIdSuffix = fnExtractIdSuffix.call(that, sNextColumnId);
					// columns must have static IDs for personalization to be stable
					if (!that._isStatic(sNextColumnIdSuffix)) {
						jQuery.sap.log.error("Suffix " + sNextColumnIdSuffix + " of table column " + sNextColumnId + " must be static. Otherwise personalization can not be persisted for its table.");
						//Invalidate persoMap
						mResult = null;
						return null;
					}
					//concatenate the parts
					sNextPersoColumnIdentifier = sComponentName + "-" + sTableIdSuffix + "-" + sNextColumnIdSuffix;
					//add column as key and identifier as value
					mResult[oNextColumn] = sNextPersoColumnIdentifier;
					//add vice versa as well
					mResult[sNextPersoColumnIdentifier] = oNextColumn;
				}
			});
			this._mTablePersMap[oTable] = mResult;
		}
		return mResult;
	};
	
	/**
	 * Store's the given table's initial state in the controler's initial state map.
	 * @private
	 * @param {object} oTable the table for which initial state shall be remembered
	 */
	TablePersoController.prototype._rememberInitialTableStates = function (oTable) {
		this._mInitialTableStateMap[oTable] = this._tableColumnInfo(oTable, this._getPersoColumnMap(oTable), this.getPersoService());
	};
	
	/**
	 * Returns table column settings (header text, order, visibility) for a table
	 * @private
	 * @param {object} oTable the table for which column settings should be returned
	 * @param {object} oPersoMap the table's personalization map
	 * @param {object} oPersoService the table's personalization provider instance
	 */
	TablePersoController.prototype._tableColumnInfo = function (oTable, oPersoMap, oPersoService) {
		
		//Check if persoMap has been passed into the dialog.
		//Otherwise, personalization is not possible.
		if (!!oPersoMap) {
			var aColumns = oTable.getColumns(),
				aColumnInfo = [];
			aColumns.forEach(function(oColumn){
				var sCaption = null;
				if (oPersoService.getCaption) {
					sCaption = oPersoService.getCaption(oColumn);
				}
				
				var sGroup = null;
				if (oPersoService.getGroup) {
					sGroup = oPersoService.getGroup(oColumn);
				}
				
				if (!sCaption) {
					var oColHeader = oColumn.getHeader();
					//Check if header control has either text or 'title' property
					if (oColHeader.getText && oColHeader.getText()) {
						sCaption = oColHeader.getText();
					} else if (oColHeader.getTitle && oColHeader.getTitle()) {
						sCaption = oColHeader.getTitle();
					}
					
					if (!sCaption) {
						//Fallback: use column id and issue warning to let app developer know to add captions to columns
						sCaption = oColumn.getId();
						jQuery.sap.log.warning("Please 'getCaption' callback implentation in your TablePersoProvider for column " + oColumn + ". Table personalization uses column id as fallback value.");
					}
				}
				
				//In this case, oColumn is one of our controls. Therefore, sap.ui.core.Element.toString() 
				//is called which delivers something like 'Element sap.m.Column#<sId>' where sId is the column's sId property
				aColumnInfo.push({
					text : sCaption,
					order : oColumn.getOrder(),
					visible : oColumn.getVisible(),
					id: oPersoMap[oColumn],
					group : sGroup
				});
			});
	
			// Sort to make sure they're presented in the right order
			aColumnInfo.sort(function(a, b) { return a.order - b.order; });
	
			return aColumnInfo;
		}
		return null;
	};
	
	

	return TablePersoController;

}, /* bExport= */ true);
