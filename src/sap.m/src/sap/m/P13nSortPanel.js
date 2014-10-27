/*!
 * ${copyright}
 */

// Provides control sap.m.P13nSortPanel.
sap.ui.define(['jquery.sap.global', './P13nConditionPanel', './P13nPanel', './library', 'sap/ui/core/Control'],
		function(jQuery, P13nConditionPanel, P13nPanel, library, Control) {
			"use strict";

			/**
			 * Constructor for a new P13nSortPanel.
			 * 
			 * @param {string}
			 *            [sId] id for the new control, generated automatically if no id is given
			 * @param {object}
			 *            [mSettings] initial settings for the new control
			 * 
			 * @class The SortPanel Control can be used to...
			 * @extends sap.m.P13nPanel
			 * @version ${version}
			 * 
			 * @constructor
			 * @public
			 * @name sap.m.P13nSortPanel
			 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
			 */
			var P13nSortPanel = P13nPanel.extend("sap.m.P13nSortPanel", /** @lends sap.m.P13nSortPanel.prototype */
			{
				metadata : {

					library : "sap.m",
					properties : {

						/**
						 * defines if the mediaQuery or a ContainerResize will be used for layout update. When the
						 * ConditionPanel is used on a dialog the property should be set to true!
						 */
						containerQuery : {
							type : "boolean",
							group : "Misc",
							defaultValue : false
						},

						/**
						 * can be used to control the layout behavior. Default is "" which will automatically change the
						 * layout. With "Desktop", "Table" or"Phone" you can set a fixed layout.
						 */
						layoutMode : {
							type : "string",
							group : "Misc",
							defaultValue : null
						}
					},
					aggregations : {

						/**
						 * content for include and exclude panels
						 */
						content : {
							type : "sap.ui.core.Control",
							multiple : true,
							singularName : "content",
							visibility : "hidden"
						},

						/**
						 * tbd
						 */
						sortItems : {
							type : "sap.m.P13nSortItem",
							multiple : true,
							singularName : "sortItem",
							bindable : "bindable"
						}
					},
					events : {

						/**
						 * event raised when a Item was added
						 */
						addSortItem : {
							parameters : {

								/**
								 * item added
								 */
								newItem : {
									type : "sap.m.P13nSortItem"
								}
							}
						},

						/**
						 * remove a sort item
						 */
						removeSortItem : {}
					}
				}
			});

			/**
			 * sets the array of conditions.
			 * 
			 * @param {object[]}
			 *            aConditions the complete list of conditions
			 */
			P13nSortPanel.prototype.setConditions = function(aConditions) {
				this._oSortPanel.setConditions(aConditions);
			};

			/**
			 * returns the array of conditions.
			 * 
			 * @private
			 */
			P13nSortPanel.prototype.getConditions = function() {
				return this._oSortPanel.getConditions();
			};

			P13nSortPanel.prototype.setContainerQuery = function(b) {
				this.setProperty("containerQuery", b);

				this._oSortPanel.setContainerQuery(b);
			};

			P13nSortPanel.prototype.setLayoutMode = function(sMode) {
				this.setProperty("layoutMode", sMode);

				this._oSortPanel.setLayoutMode(sMode);
			};

			/**
			 * check if the entered/modified conditions are correct, marks invalid fields yellow (Warning state) and
			 * opens a popup message dialog to give the user the feedback that some values are wrong or missing.
			 * 
			 * @private
			 * @param {function}
			 *            fnCallback which we call when all conditions are valid or the user ignores the wrong/missing
			 *            fields by pressing Yes on a message dialog.
			 */
			P13nSortPanel.prototype.validateConditions = function() {
				return this._oSortPanel.validateConditions();
			};

			/**
			 * setter for the supported operations array
			 * 
			 * @public
			 * @param {array}
			 *            array of operations [sap.m.P13nConditionOperation.BT, sap.m.P13nConditionOperation.EQ]
			 */
			P13nSortPanel.prototype.setOperations = function(aOperation) {
				this._aOperations = aOperation;

				if (this._oSortPanel) {
					this._oSortPanel.setOperations(this._aOperations);
				}
			};

			/**
			 * setter for a KeyFields array
			 * 
			 * @public
			 * @param {array}
			 *            array of KeyFields [{key: "CompanyCode", text: "ID"}, {key:"CompanyName", text : "Name"}]
			 */
			P13nSortPanel.prototype.setKeyFields = function(aKeyFields) {
				this._aKeyFields = aKeyFields;

				if (this._oSortPanel) {
					this._oSortPanel.setKeyFields(this._aKeyFields);
				}
			};

			P13nSortPanel.prototype.getKeyFields = function() {
				return this._aKeyFields;
			};

			/**
			 * Initialize the control
			 * 
			 * @public
			 */
			P13nSortPanel.prototype.init = function() {
				sap.ui.getCore().loadLibrary("sap.ui.layout");
				jQuery.sap.require("sap.ui.layout.Grid");

				sap.ui.layout.Grid.prototype.init.apply(this);

				this._aKeyFields = [];
				this.addStyleClass("sapMSortPanel");

				if (!this._aOperations) {
					this
							.setOperations([sap.m.P13nConditionOperation.Ascending,
									sap.m.P13nConditionOperation.Descending]);
				}

				this._oSortPanel = new P13nConditionPanel({
					autoReduceKeyFieldItems : true,
					layoutMode : this.getLayoutMode(),
					dataChange : this._handleDataChange()
				});
				this._oSortPanel.setOperations(this._aOperations);

				this.addAggregation("content", this._oSortPanel);
			};

			P13nSortPanel.prototype.exit = function() {

				var destroyHelper = function(o) {
					if (o && o.destroy) {
						o.destroy();
					}
					return null;
				};

				this._aKeyFields = destroyHelper(this._aKeyFields);
				this._aOperations = destroyHelper(this._aOperations);
			};

			P13nSortPanel.prototype.addItem = function(oItem) {
				P13nPanel.prototype.addItem.apply(this, arguments);

				var oKeyField = {
					key : oItem.getColumnKey(),
					text : oItem.getText(),
					tooltip : oItem.getTooltip()
				};

				this._aKeyFields.push(oKeyField);

				if (this._oSortPanel) {
					this._oSortPanel.addKeyField(oKeyField);
				}
			};

			P13nSortPanel.prototype.addSortItem = function(oSortItem) {
				this.addAggregation("sortItems", oSortItem);

				var aConditions = [];

				this.getSortItems().forEach(function(oSortItem_) {
					aConditions.push({
						key : oSortItem_.getKey(),
						keyField : oSortItem_.getColumnKey(),
						operation : oSortItem_.getOperation()
					});
				});

				if (!this._bIgnoreAdd) {
					this.setConditions(aConditions);
				}
			};

			P13nSortPanel.prototype._handleDataChange = function() {
				var that = this;

				return function(oEvent) {
					var oNewData = oEvent.getParameter("newData");
					var sOperation = oEvent.getParameter("operation");
					var sKey = oEvent.getParameter("key");
					var iIndex = oEvent.getParameter("index");
					
					if (sOperation === "update") {
						var oSortItem = that.getSortItems()[iIndex];
						if (oSortItem) {
							oSortItem.setColumnKey(oNewData.keyField);
							oSortItem.setOperation(oNewData.operation);

							// sap.m.MessageToast.show("update SortItem ---> " + sKey);
						}
					}
					if (sOperation === "add") {
						that._bIgnoreAdd = true;
						var oSortItem = new sap.m.P13nSortItem({
							key : sKey,
							columnKey : oNewData.keyField,
							operation : oNewData.operation
						});

						that.fireAddSortItem({
							index : oEvent.getParameter("index"),
							newItem : oSortItem
						});
						that._bIgnoreAdd = false;
					}
					if (sOperation === "remove") {
						that.fireRemoveSortItem({
							index : oEvent.getParameter("index")
						});
					}
				};
			};

			return P13nSortPanel;

		}, /* bExport= */true);
