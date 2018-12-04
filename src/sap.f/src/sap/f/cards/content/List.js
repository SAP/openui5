/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/model/json/JSONModel', 'sap/m/List', 'sap/m/StandardListItem', 'sap/ui/base/ManagedObject', "sap/f/cards/Data"],
	function (jQuery, Control, JSONModel, sapMList, StandardListItem, ManagedObject, Data) {
		"use strict";

		/**
		 * Constructor for a new <code>List</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * <h3>Overview</h3>
		 *
		 *
		 * <h3>Usage</h3>
		 *
		 * <h3>Responsive Behavior</h3>
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @experimental
		 * @since 1.60
		 * @see {@link TODO Card}
		 * @alias sap.f.cards.content.List
		 */
		var List = Control.extend("sap.f.cards.content.List", {
			metadata: {
				properties: {
					/**
					 * A JSON Object that passes information about the request, response for the data request.
					 * Optionally the only the response.json can be provided without any request object
					 * Example with provided data:
					 * <pre>
					 * {
					 *    "type": "json",
					 *    "json": [{
					 *        "Name": "Notebook Basic 15",
					 *        "Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
					 *    }]
					 * }
					 * </pre>
					 * Example with simple URL request (string)
					 * <pre>
					 * {
					 *    "type": "json",
					 *    "request": "./cardcontent/listcard/data.json"
					 * }
					 * </pre>
					 * Example with a configured request (object)
					 * <pre>
					 * {
					 *    "type": "json",
					 *    "request": {
					 *       "mode": "same-origin",
					 *       "url": "./cardcontent/listcard/data.json",
					 *       "headers": {
					 *          "Content-Type" : "application/json; charset=utf-8"
					 *       },
					 *       "credentials" : "include"
					 *    }
					 * }
					 * </pre>
					 */
					data: {
						type: "object"
					},
					/**
					 * JSON structure to define the fields to be displayed in the List.
					 * Example
					 * "fields": {
					 *     "title": {
					 *     "label": "Product Name",
					 *     "value": "{Name}",
					 *     "type": "string"
					 * },
					 * "description": {
					 *     "label": "Product Description",
					 *     "value": "{Description}",
					 *     "type": "string",
					 * }
					 */
					item: {
						type: "object"
					}
				},
				aggregations: {
					_content: {
						multiple: false,
						visibility: "hidden"
					}
				}
			},
			renderer: function (oRm, oCardContent) {
				oRm.write("<div");
				oRm.writeElementData(oCardContent);
				oRm.write(">");
				oRm.renderControl(oCardContent.getAggregation("_content"));
				oRm.write("</div>");
			}
		});

		List.prototype.init = function () {
			//create a list control
			this.oList = new sapMList({
				id: this.getId() + "-list",
				growing: false,
				showNoData: false,
				showSeparators: "None"
			});
			var that = this;
			this.oList.attachUpdateFinished(function () {
				if (that._iVisibleItems) {
					var aItems = this.oList.getItems();
					for (var i = that._iVisibleItems + 1; i < aItems.length; i++) {
						aItems[i].setVisible(false);
					}
				}
			}.bind(this));
			this.setAggregation("_content", this.oList);
			var oModel = new JSONModel();
			this.setModel(oModel);
			this._oItemTemplate = new StandardListItem({
				iconDensityAware: false,
				iconInset: false
			});
		};

		List.prototype.exit = function () {
			if (this._oItemTemplate) {
				this._oItemTemplate.destroy();
				this._oItemTemplate = null;
			}

			if (this.oList) {
				this.oList.destroy();
				this.oList = null;
			}
		};

		List.prototype.destroy = function () {
			this.setAggregation("_content", null);
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

		List.prototype.setItem = function (mItems) {
			this.setProperty("item", mItems, true);
			if (!mItems) {
				return this;
			}
			this._oItemTemplate.bindProperty("title", ManagedObject.bindingParser(mItems["title"].value));
			this._oItemTemplate.bindProperty("description", ManagedObject.bindingParser(mItems["description"].value));
			this._oItemTemplate.bindProperty("icon", ManagedObject.bindingParser(mItems["icon"].value));
			var oList = this.getAggregation("_content");
			if (oList.isBound("items")) {
				oList.bindItems({
					path: oList.getBindingInfo("items").path,
					template: this._oItemTemplate
				});
			}
			return this;
		};

		List.prototype.setData = function (oData) {

			this.setProperty("data", oData, true);

			if (!oData) {
				return this;
			}

			var oRequest = oData.request;

			if (oData.json && !oRequest) {
				this._updateModel(oData.json, oData.path);
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this._updateModel(data, oData.path);
				}.bind(this)).catch(function (oError) {
					// TODO: Handle errors. Maybe add error message
				});
			}

			return this;
		};

		List.prototype._updateModel = function (oData, sPath) {
			this.getModel().setData(oData);
			this.getAggregation("_content").bindItems({
				path: sPath || "/",
				template: this._oItemTemplate
			});
		};

	return List;
});
