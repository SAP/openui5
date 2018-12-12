/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/Control', 'sap/ui/model/json/JSONModel', 'sap/m/List', 'sap/m/StandardListItem', 'sap/ui/base/ManagedObject', "sap/f/cards/Data"],
	function (Control, JSONModel, sapMList, StandardListItem, ManagedObject, Data) {
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
		 * @alias sap.f.cards.ListContent
		 */
		var ListContent = Control.extend("sap.f.cards.ListContent", {
			metadata: {
				properties: {

					manifestContent: { type: "object" }
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

		ListContent.prototype._getList = function () {

			if (this._bIsBeingDestroyed) {
				return null;
			}

			var oList = this.getAggregation("_content");

			if (!oList) {
				oList = new sapMList({
					id: this.getId() + "-list",
					growing: false,
					showNoData: false,
					showSeparators: "None"
				});
				this.setAggregation("_content", oList);
			}

			return oList;
		};

		ListContent.prototype.init = function () {
			var oList = this._getList();
			var that = this;

			oList.attachUpdateFinished(function () {
				if (that._iVisibleItems) {
					var aItems = oList.getItems();
					for (var i = that._iVisibleItems + 1; i < aItems.length; i++) {
						aItems[i].setVisible(false);
					}
				}
			});

			var oModel = new JSONModel();
			this.setModel(oModel);
			this._oItemTemplate = new StandardListItem({
				iconDensityAware: false,
				iconInset: false
			});
		};

		ListContent.prototype.exit = function () {
			if (this._oItemTemplate) {
				this._oItemTemplate.destroy();
				this._oItemTemplate = null;
			}
		};

		ListContent.prototype.destroy = function () {
			this.setAggregation("_content", null);
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

		/**
		 * @param {Object} oContent The content section of the manifest schema
		 */
		ListContent.prototype.setManifestContent = function (oContent) {

			this.setProperty("manifestContent", oContent);

			if (!oContent) {
				return;
			}

			if (oContent.data) {
				this._setData(oContent.data);
			}

			if (oContent.item) {
				this._setItem(oContent.item);
			}
		};

		ListContent.prototype._setItem = function (mItems) {
			this._oItemTemplate.bindProperty("title", ManagedObject.bindingParser(mItems["title"].value));
			this._oItemTemplate.bindProperty("description", ManagedObject.bindingParser(mItems["description"].value));
			this._oItemTemplate.bindProperty("icon", ManagedObject.bindingParser(mItems["icon"].value));
			var oList = this._getList();
			if (oList.isBound("items")) {
				oList.bindItems({
					path: oList.getBindingInfo("items").path,
					template: this._oItemTemplate
				});
			}
			return this;
		};

		ListContent.prototype._setData = function (oData) {

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

		ListContent.prototype._updateModel = function (oData, sPath) {
			this.getModel().setData(oData);
			this._getList().bindItems({
				path: sPath || "/",
				template: this._oItemTemplate
			});
		};

	return ListContent;
});
