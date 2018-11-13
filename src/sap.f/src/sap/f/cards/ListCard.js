/*!
 * ${copyright}
 */
/**
 * List Card
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/model/json/JSONModel', 'sap/m/List', 'sap/m/StandardListItem', 'sap/ui/base/ManagedObject'],
	function (jQuery, Control, JSONModel, List, StandardListItem, ManagedObject) {
		"use strict";
		var ListCard = Control.extend("sap.f.cards.ListCard", {
			metadata: {
				properties: {
					/**
					 * A JSON Object that passes information about the request, response for the data request.
					 * Optionally the only the response.json can be provided without any request object
					 * Example with provided data:
					 * <pre>
					 * {
					 *    "type": "json",
					 *    "response": {
					 *        "json": [{
					 *            "Name": "Notebook Basic 15",
					 *             "Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
					 *        }],
					 *        "path": "/"
					 *    }
					 * }
					 * </pre>
					 * Example with simple URL request (string)
					 * <pre>
					 * {
					 *    "type": "json",
					 *    "request": "./cardcontent/listcard/data.json",
					 *    "path": "/"
					 *
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
					 *    },
					 *    "response": {
					 *       "path": "/"
					 *    }
					 * }
					 * </pre>
					 */
					listdata: {
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
					fields: {
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
		ListCard.prototype.init = function () {
			//create a list control
			this.oList = new List({
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
			this._oItemTemplate = new StandardListItem();
		};
		ListCard.prototype.exit = function () {
			if (this._oItemTemplate) {
				this._oItemTemplate.destroy();
				this._oItemTemplate = null;
			}

			if (this.oList) {
				this.oList.destroy();
				this.oList = null;
			}
		};
		ListCard.prototype.destroy = function () {
			this.setAggregation("_content", null);
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

		ListCard.prototype.setFields = function (mFields) {
			this.setProperty("fields", mFields, true);
			if (!mFields) {
				return this;
			}
			this._oItemTemplate.bindProperty("title", ManagedObject.bindingParser(mFields["title"].value));
			this._oItemTemplate.bindProperty("description", ManagedObject.bindingParser(mFields["description"].value));
			var oList = this.getAggregation("_content");
			if (oList.isBound("items")) {
				oList.bindItems({
					path: oList.getBindingInfo("items").path,
					template: this._oItemTemplate
				});
			}
			return this;
		};

		ListCard.prototype.setListdata = function (oListData) {
			this.setProperty("listdata", oListData, true);
			if (!oListData) {
				return this;
			}
			//handling the request
			var oRequest = oListData.request,
				oResponse = oListData.response;
			if (oResponse.json && !oRequest) {
				this.getModel().setData(oResponse.json);
			}
			if (oRequest) {
				//create url
				var oUrl = oRequest.url,
					sUrl = "";
				if (typeof oUrl === "object") {
					if (!oUrl.port) {
						oUrl.port = oUrl.protocol === "https" ? "443" : "80";
					}
					sUrl = oUrl.protocol + "://" + oUrl.host + ":" + (oUrl.port) + oUrl.path;
				} else if (typeof oUrl === "string") {
					sUrl = oUrl;
				}
				var mHeaders = oRequest.headers || {};
				if (oListData.type === "json" && !mHeaders["Accept"]) {
					mHeaders["Accept"] = "application/json;charset=utf-8";
				}
				this.getModel().loadData(sUrl, oRequest.parameters, true, oRequest.method || "GET", false, true, mHeaders);
			}
			if (oResponse.path) {
				this.getAggregation("_content").bindItems({
					path: oResponse.path,
					template: this._oItemTemplate
				});
			}
			return this;
		};

	return ListCard;
});