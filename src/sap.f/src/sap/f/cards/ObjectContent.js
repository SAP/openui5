/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Control", "sap/ui/model/json/JSONModel", "sap/m/HBox", "sap/m/VBox", "sap/m/Text", "sap/m/Title", "sap/f/Avatar", "sap/m/Link", "sap/f/cards/Data", "sap/ui/base/ManagedObject"],
	function (Control, JSONModel, HBox, VBox, Text, Title, Avatar, Link, Data, ManagedObject) {
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
		 * @alias sap.f.cards.ObjectContent
		 */
		var ObjectContent = Control.extend("sap.f.cards.ObjectContent", {
			metadata: {
				properties: {

					/**
					 * The object configuration used to create a list content.
					 */
					configuration: { type: "object" }
				},
				aggregations: {

					/**
					 * Defines the internal content aggregation.
					 */
					_content: {
						multiple: false,
						visibility: "hidden"
					}
				}
			},
			constructor: function (vId, mSettings) {
				if (typeof vId !== "string"){
					mSettings = vId;
				}

				if (mSettings && mSettings.serviceManager) {
					this._oServiceManager = mSettings.serviceManager;
					delete mSettings.serviceManager;
				}

				Control.apply(this, arguments);
			},
			renderer: function (oRm, oCardContent) {
				oRm.write("<div");
				oRm.writeElementData(oCardContent);
				oRm.write(">");
				oRm.renderControl(oCardContent.getAggregation("_content"));
				oRm.write("</div>");
			}
		});

		ObjectContent.prototype._getRootContainer = function () {
			if (this._bIsBeingDestroyed) {
				return null;
			}

			var oHBox = this.getAggregation("_content");
			if (!oHBox) {
				oHBox = new HBox({
					wrap: "Wrap"
				});
				this.setAggregation("_content", oHBox);
			}

			return oHBox;
		};

		ObjectContent.prototype.init = function () {
			this._getRootContainer();
			var oModel = new JSONModel();
			this.setModel(oModel);
		};

		ObjectContent.prototype.destroy = function () {
			this.setAggregation("_content", null);
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

		/**
		 * @param {Object} oContent The content section of the manifest schema
		 */
		ObjectContent.prototype.setConfiguration = function (oContent) {
			this.setProperty("configuration", oContent);

			if (!oContent) {
				return;
			}

			if (oContent.data) {
				this._setData(oContent.data);
			}
		};

		ObjectContent.prototype._setData = function (oData) {
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

		ObjectContent.prototype._updateModel = function (oData, sPath) {
			this.getModel().setData(oData);
			// this._getRootContainer().bindItems({
			// 	path: sPath || "/",
			// 	template: this._oItemTemplate
			// });
			this._addGroups();
			this.bindElement({
				path: sPath || "/"
			});
		};

		ObjectContent.prototype._addGroups = function () {
			var oContainer = this._getRootContainer();
			var aGroups = this.getConfiguration().groups;

			aGroups.forEach(function (oGroup) {
				var oGroupContainer = new VBox();
				oGroupContainer.addStyleClass("sapFCardObjectGroup");
				oGroupContainer.addItem(new Title({ text: oGroup.title }));

				oGroup.items.forEach(function (oItem) {
					var oItemLabel = new Text({ text: oItem.label });
					oItemLabel.addStyleClass("sapFCardObjectItemLabel");
					var oItemText;

					if (oItem.value) {
						oItemText = new Text({ text: oItem.value });
					} else if (oItem.link) {
						oItemText = new Link({ href: oItem.link, text: oItem.link });
					}

					oItemText.addStyleClass("sapFCardObjectItemText");
					if (oItem.icon) {
						var oHBox = new HBox({
							items: [
								new Avatar({
									customDisplaySize: "2.5rem",
									displaySize: "Custom",
									src: oItem.icon.src
								}),
								new VBox({
									items: [
										oItemLabel,
										oItemText
									]
								})
							]
						});
						oGroupContainer.addItem(oHBox);
					} else {
						oGroupContainer.addItem(oItemLabel);
						oGroupContainer.addItem(oItemText);
					}
				});

				oContainer.addItem(oGroupContainer);
			});
		};

		return ObjectContent;
	});