/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Control", "sap/ui/model/json/JSONModel", "sap/m/List", "sap/m/StandardListItem", "sap/ui/base/ManagedObject", "sap/f/cards/Data", "sap/base/Log"],
	function (Control, JSONModel, sapMList, StandardListItem, ManagedObject, Data, Log) {
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

					configuration: { type: "object" }
				},
				aggregations: {

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

				if (mSettings.serviceManager) {
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

		/**
		 * Returns configured <code>sap.m.List</code> for ListContent.
		 * @returns {object} <code>this</code> for chaining
		 * @since 1.61
		 * @private
		 */
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

		/**
		 * Called when control is initialized.
		 */
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
				iconDensityAware: false
			});
		};

		/**
		 * Called when control is destroyed.
		 */
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
		ListContent.prototype.setConfiguration = function (oContent) {

			this.setProperty("configuration", oContent);

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

		/**
		 * Returns configured <code>sap.m.List</code> for ListContent.
		 * @returns {object} <code>this</code> for chaining
		 * @since 1.61
		 * @override
		 * @private
		 */
		ListContent.prototype._setItem = function (mItem) {
			/* eslint-disable no-unused-expressions */
			mItem.title && this._bindItemProperty("title", mItem.title.value);
			mItem.description && this._bindItemProperty("description", mItem.description.value);
			mItem.icon && this._bindItemProperty("icon", mItem.icon.value);
			mItem.highlight && this._bindItemProperty("highlight", mItem.highlight);
			mItem.info && this._bindItemProperty("info", mItem.info.value);
			mItem.info && this._bindItemProperty("infoState", mItem.info.state);
			mItem.interactionType && this._bindItemProperty("type", mItem.interactionType);
			/* eslint-enable no-unused-expressions */

			this._attachActions(mItem);

			var oList = this._getList();
			if (oList.isBound("items")) {
				oList.bindItems({
					path: oList.getBindingInfo("items").path,
					template: this._oItemTemplate
				});
			}
			return this;
		};

		ListContent.prototype._bindItemProperty = function (sPropertyName, sPropertyValue) {
			if (!sPropertyValue) {
				return;
			}

			var oBindingInfo = ManagedObject.bindingParser(sPropertyValue);
			if (oBindingInfo) {
				this._oItemTemplate.bindProperty(sPropertyName, oBindingInfo);
			} else {
				this._oItemTemplate.setProperty(sPropertyName, sPropertyValue);
			}
		};

		ListContent.prototype._attachActions = function (mItem) {
			if (!mItem.actions) {
				return;
			}

			// For now we allow for only one action of type navigation.
			var oAction = mItem.actions[0];
			if (oAction.type === "Navigation" && oAction.enabled) {
				this._attachNavigationAction(oAction);
			}
		};

		ListContent.prototype._attachNavigationAction = function (oAction) {

			if (oAction.service) {
				this._oItemTemplate.attachPress(function (oEvent) {
					// How should we do this? Pass handler from card? Or maybe fire event requstService and wait for parent to return it?
					this.getParent()._oServiceManager.getService("sap.ui.integration.services.Navigation").then(function (oNavigationService) {
						if (oNavigationService) {
							oNavigationService.navigate({
								parameters: oEvent.getParameters(),
								manifestParameters: oAction.parameters
							});
						}
					}).catch(function () {
						Log.error("Navigation service unavailable");
					});
				}.bind(this));
			} else if (oAction.url) {
				this._oItemTemplate.attachPress(function () {
					window.open(oAction.url, oAction.target || "_blank");
				});
			}
		};

		/**
		 * Sets data from manifest
		 * @returns {object} <code>this</code> for chaining
		 * @since 1.61
		 * @override
		 * @private
		 */
		ListContent.prototype._setData = function (oData) {

			var oRequest = oData.request;
			var oService = oData.service;

			if (oData.json && !oRequest) {
				this._updateModel(oData.json, oData.path);
			}

			if (oService) {
				this._oServiceManager.getService("sap.ui.integration.services.Data").then(function (oDataService) {
					if (oDataService) {
						oDataService.getData().then(function (data) {
							this._updateModel(data, oData.path);
						}.bind(this)).catch(function () {
							Log.error("Card content data service failed to get data");
						});
						oDataService.attachDataChanged(function (oEvent) {
							this._updateModel(oEvent.data, oData.path);
						}.bind(this), oData.service.parameters);
					}
				}.bind(this)).catch(function () {
					Log.error("Data service unavailable");
				});
			} else if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this._updateModel(data, oData.path);
				}.bind(this)).catch(function (oError) {
					Log.error("Card content data request failed");
				});
			}

			return this;
		};

		/**
		 * Updates model when data is received.
		 * @since 1.61
		 * @private
		 */
		ListContent.prototype._updateModel = function (oData, sPath) {
			this.getModel().setData(oData);
			this._getList().bindItems({
				path: sPath || "/",
				template: this._oItemTemplate
			});
		};

	return ListContent;
});
