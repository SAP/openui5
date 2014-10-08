/*!
 * ${copyright}
 */

// Provides control sap.m.P13nFilterPanel.
sap.ui.define(['jquery.sap.global', './P13nConditionPanel', './P13nPanel', './library', 'sap/ui/core/Control'],
	function(jQuery, P13nConditionPanel, P13nPanel, library, Control) {
	"use strict";



	/**
	 * Constructor for a new P13nFilterPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The FilterPanel Control can be used to...
	 * @extends sap.m.P13nPanel
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.P13nFilterPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nFilterPanel = P13nPanel.extend("sap.m.P13nFilterPanel", /** @lends sap.m.P13nFilterPanel.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * defines the max number of include filter.
			 */
			maxIncludes : {type : "string", group : "Misc", defaultValue : '-1'},
	
			/**
			 * defines the max number of exclude filter
			 */
			maxExcludes : {type : "string", group : "Misc", defaultValue : '-1'},
	
			/**
			 * defines if the mediaQuery or a ContainerResize will be used for layout update.
			 * When the ConditionPanel is used on a dialog the property should be set to true!
			 */
			containerQuery : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * can be used to control the layout behavior. Default is "" which will automatically change the layout. With "Desktop", "Table" or"Phone" you can set a fixed layout.
			 */
			layoutMode : {type : "string", group : "Misc", defaultValue : null}
		},
		aggregations : {
	
			/**
			 * content for include and exclude panels
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content", visibility : "hidden"}, 
	
			/**
			 * tbd
			 */
			filterItems : {type : "sap.m.P13nFilterItem", multiple : true, singularName : "filterItem", bindable : "bindable"}
		},
		events : {
	
			/**
			 * event raised when a filterItem was added
			 */
			addFilterItem : {
				parameters : {
	
					/**
					 * item added
					 */
					newItem : {type : "sap.m.P13nFilterItem"}
				}
			}, 
	
			/**
			 * remove a filter item
			 */
			removeFilterItem : {}
		}
	}});
	
	
	/**
	 * This method allows you to specify the KeyFields for the filter. You can set an array of object with Key and Label properties to define the keyfields.
	 *
	 * @name sap.m.P13nFilterPanel#setKeyFields
	 * @function
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * This method must be used to assign a list of conditions to the FilterPanel.
	 *
	 * @name sap.m.P13nFilterPanel#setConditions
	 * @function
	 * @param {sap.m.Token[]} aAConditions
	 *         array of conditions.
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	// EXC_ALL_CLOSURE_003

	/**
	 * sets the array of conditions.
	 * 
	 * @param {array}
	 *          aConditions the complete list of conditions
	 */
	P13nFilterPanel.prototype.setConditions = function(aConditions) {
		var aIConditions = [];
		var aEConditions = [];
	
		if (aConditions.length) {
			for ( var i = 0; i < aConditions.length; i++) {
				var oConditionData = aConditions[i];
				if (!oConditionData.exclude) {
					aIConditions.push(oConditionData);
				} else {
					aEConditions.push(oConditionData);
				}
			}
		}
	
		this._oIncludeFilterPanel.setConditions(aIConditions);
		this._oExcludeFilterPanel.setConditions(aEConditions);
		if (aEConditions.length > 0) {
			this._oExcludePanel.setExpanded(true);
		}
	};
	
	/**
	 * returns the array of conditions.
	 * 
	 * @private
	 */
	P13nFilterPanel.prototype.getConditions = function() {
		var aIConditions = this._oIncludeFilterPanel.getConditions();
		var aEConditions = this._oExcludeFilterPanel.getConditions();
	
		return aIConditions.concat(aEConditions);
	};
	
	P13nFilterPanel.prototype.setContainerQuery = function(b) {
		this.setProperty("containerQuery", b);
	
		this._oIncludeFilterPanel.setContainerQuery(b);
		this._oExcludeFilterPanel.setContainerQuery(b);
	};
	
	P13nFilterPanel.prototype.setLayoutMode = function(sMode) {
		this.setProperty("layoutMode", sMode);
	
		this._oIncludeFilterPanel.setLayoutMode(sMode);
		this._oExcludeFilterPanel.setLayoutMode(sMode);
	};
	
	/**
	 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state) and opens a popup
	 * message dialog to give the user the feedback that some values are wrong or missing.
	 * 
	 * @private
	 * @param {function}
	 *          fnCallback which we call when all conditions are valid or the user ignores the wrong/missing fields by
	 *          pressing Yes on a message dialog.
	 */
	P13nFilterPanel.prototype.validateConditions = function() {
		return this._oIncludeFilterPanel.validateConditions() && this._oExcludeFilterPanel.validateConditions();
	};
	
	/**
	 * setter for the supported Include operations array
	 * 
	 * @public
	 * @param {array}
	 *          array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nFilterPanel.prototype.setIncludeOperations = function(aOperation) {
		this._aIncludeOperations = aOperation;
	
		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.setOperations(this._aIncludeOperations);
		}
	};
	
	/**
	 * setter for the supported Exclude operations array
	 * 
	 * @public
	 * @param {array}
	 *          array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
	 */
	P13nFilterPanel.prototype.setExcludeOperations = function(aOperation) {
		this._aExcludeOperations = aOperation;
	
		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setOperations(this._aExcludeOperations);
		}
	};
	
	/**
	 * setter for a KeyFields array
	 * 
	 * @public
	 * @param {array}
	 *          array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]
	 */
	P13nFilterPanel.prototype.setKeyFields = function(aKeyFields) {
		this._aKeyFields = aKeyFields;
	
		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.setKeyFields(this._aKeyFields);
		}
		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.setKeyFields(this._aKeyFields);
		}
	
	};
	
	P13nFilterPanel.prototype.getKeyFields = function() {
		return this._aKeyFields;
	};
	
	/**
	 * Initialize the control
	 * 
	 * @public
	 */
	P13nFilterPanel.prototype.init = function() {
		sap.ui.getCore().loadLibrary("sap.ui.layout");
		jQuery.sap.require("sap.ui.layout.Grid");
	
		sap.ui.layout.Grid.prototype.init.apply(this);
	
		this._aKeyFields = [];
		this.addStyleClass("sapMFilterPanel");
	
		// init some resources
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	
		if (!this._aIncludeOperations) {
			this.setIncludeOperations([sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ,
					sap.m.P13nConditionOperation.Contains, sap.m.P13nConditionOperation.StartsWith,
					sap.m.P13nConditionOperation.EndsWith, sap.m.P13nConditionOperation.LT, sap.m.P13nConditionOperation.LE,
					sap.m.P13nConditionOperation.GT, sap.m.P13nConditionOperation.GE]);
		}
	
		if (!this._aExcludeOperations) {
			this.setExcludeOperations([sap.m.P13nConditionOperation.EQ]);
		}
	
		this._oIncludePanel = new sap.m.Panel({
			expanded : true,
			expandable : true,
			headerText : this._oRb.getText("FILTERPANEL_INCLUDES"),
			width : "auto"
		}).addStyleClass("sapMFilterPadding");
	
		this._oIncludeFilterPanel = new P13nConditionPanel({
			//width : "100%",
			maxConditions : -1,
			exclude : false,
			autoAddNewRow : true,
			alwaysShowAddIcon : false,
			layoutMode: this.getLayoutMode(),
			dataChange : this._handleDataChange()
		});
		this._oIncludeFilterPanel.setOperations(this._aIncludeOperations);
	
		this._oIncludePanel.addContent(this._oIncludeFilterPanel);
	
		this.addAggregation("content", this._oIncludePanel);
	
		this._oExcludePanel = new sap.m.Panel({
			expanded : false,
			expandable : true,
			headerText : this._oRb.getText("FILTERPANEL_EXCLUDES"),
			width : "auto"
		}).addStyleClass("sapMFilterPadding");
	
		this._oExcludeFilterPanel = new P13nConditionPanel({
			//width : "100%",
			maxConditions : -1,
			exclude : true,
			autoAddNewRow : true,
			alwaysShowAddIcon : false,
			layoutMode: this.getLayoutMode(),
			dataChange : this._handleDataChange()
		});
		this._oExcludeFilterPanel.setOperations(this._aExcludeOperations);
	
		this._oExcludePanel.addContent(this._oExcludeFilterPanel);
	
		this.addAggregation("content", this._oExcludePanel);
	};
	
	P13nFilterPanel.prototype.exit = function() {
	
		var destroyHelper = function(o) {
			if (o && o.destroy) {
				o.destroy();
			}
			return null;
		};
	
		this._aKeyFields = destroyHelper(this._aKeyFields);
		this._aIncludeOperations = destroyHelper(this._aIncludeOperations);
		this._aExcludeOperations = destroyHelper(this._aExcludeOperations);
	
		this._oRb = destroyHelper(this._oRb);
	};
	
	P13nFilterPanel.prototype.addItem = function(oItem) {
		P13nPanel.prototype.addItem.apply(this, arguments);
	
		var oKeyField = {
			key : oItem.getKey(),
			text : oItem.getText()
		};
	
		this._aKeyFields.push(oKeyField);
	
		if (this._oIncludeFilterPanel) {
			this._oIncludeFilterPanel.addKeyField(oKeyField);
		}
		if (this._oExcludeFilterPanel) {
			this._oExcludeFilterPanel.addKeyField(oKeyField);
		}
	};
	
	P13nFilterPanel.prototype.addFilterItem = function(oFilterItem) {
		this.addAggregation("filterItems", oFilterItem);
	
		var aConditions = []; 
		this.getFilterItems().forEach(function(oFilterItem_) {
			aConditions.push({
				exclude : oFilterItem_.getExclude(),
				key : oFilterItem_.getKey(),
				keyField : oFilterItem_.getColumnKey(),
				operation : oFilterItem_.getOperation(),
				value1 : oFilterItem_.getValue1(),
				value2 : oFilterItem_.getValue2()
			});
		});
	
		if (!this._bIgnoreAdd) {
			this.setConditions(aConditions);
		}
	};
	
	P13nFilterPanel.prototype._handleDataChange = function() {
		var that = this;
	
		return function(oEvent) {
			var oNewData = oEvent.getParameter("newData");
			var sOperation = oEvent.getParameter("operation");
			var sKey = oEvent.getParameter("key");
	
			if (sOperation === "update") {
				var oFilterItem = that._getFilterItem(sKey);
				if (oFilterItem) {
					oFilterItem.setExclude(oNewData.exclude);
					oFilterItem.setColumnKey(oNewData.keyField);
					oFilterItem.setOperation(oNewData.operation);
					oFilterItem.setValue1(oNewData.value1);
					oFilterItem.setValue2(oNewData.value2);
					
					sap.m.MessageToast.show("update FilterItem ---> " + sKey);
				} 
			}
			if (sOperation === "add") {
				that._bIgnoreAdd = true;
				var oFilterItem = new sap.m.P13nFilterItem({
					key : sKey,
					exclude : oNewData.exclude,
					columnKey : oNewData.keyField,
					operation : oNewData.operation,
					value1 : oNewData.value1,
					value2 : oNewData.value2
				});
	
				that.fireAddFilterItem({ key: sKey, index: oEvent.getParameter("index"), newItem : oFilterItem });
				that._bIgnoreAdd = false;
			}
			if (sOperation === "remove") {
				that.fireRemoveFilterItem({ key : sKey });
			}
		};
	};
	
	P13nFilterPanel.prototype._getFilterItem = function(sKey) {
		var oFilterItem = null;
		this.getFilterItems().forEach(function(oFilterItem_) {
			if (oFilterItem_.getKey() === sKey) {
				oFilterItem = oFilterItem_;
				return;
			}
		});
		return oFilterItem;
	};
	

	return P13nFilterPanel;

}, /* bExport= */ true);
