/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Control", "sap/ui/model/json/JSONModel", "sap/m/List", "sap/m/StandardListItem", "sap/ui/base/ManagedObject", "sap/f/cards/Data", "sap/base/Log"],
	function (Control, JSONModel, sapMList, StandardListItem, ManagedObject, Data, Log) {
		"use strict";

		/**
		 * Constructor for a new <code>ListContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is a wrapper of a <code>sap.m.List</code> and allows its creation based on a configuration.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.62
		 * @alias sap.f.cards.ListContent
		 */
		var ListContent = Control.extend("sap.f.cards.ListContent", {
			metadata: {
				properties: {

					/**
					 * The object configuration used to create a list content.
					 */
					configuration: { type: "object" }
				},
				aggregations: {

					/**
					 * Defines the content of the control.
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

		/**
		 * Lazily get a configured <code>sap.m.List</code>.
		 *
		 * @private
		 * @returns {sap.m.List} The inner list
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

		/**
		 * Called when control is destroyed.
		 *
		 * @returns {sap.f.cards.ListContent} <code>this</code> for chaining
		 */
		ListContent.prototype.destroy = function () {
			this.setAggregation("_content", null);
			this.setModel(null);
			return Control.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Setter for configuring a <code>sap.f.cards.ListContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal list.
		 * @returns {sap.f.cards.ListContent} Pointer to the control instance to allow method chaining.
		 */
		ListContent.prototype.setConfiguration = function (oConfiguration) {

			this.setProperty("configuration", oConfiguration);

			if (!oConfiguration) {
				return this;
			}

			if (oConfiguration.data) {
				this._setData(oConfiguration.data);
			}

			if (oConfiguration.item) {
				this._setItem(oConfiguration.item);
			}

			return this;
		};

		/**
		 * Binds/Sets properties to the inner item template based on the configuration object item template.
		 * Attaches all required actions.
		 *
		 * @private
		 * @param {Object} mItem The item template of the configuration object
		 */
		ListContent.prototype._setItem = function (mItem) {
			/* eslint-disable no-unused-expressions */
			mItem.title && this._bindItemProperty("title", mItem.title.value);
			mItem.description && this._bindItemProperty("description", mItem.description.value);
			mItem.icon && mItem.icon.src && this._bindItemProperty("icon", mItem.icon.src);
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
		};

		/**
		 * Tries to create a binding info object based on sPropertyValue.
		 * If succeeds the binding info will be used for property binding.
		 * Else sPropertyValue will be set directly on the item template.
		 *
		 * @private
		 * @param {string} sPropertyName The name of the property
		 * @param {string} sPropertyValue The value of the property
		 */
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

		/**
		 * Attaches all actions to the inner item template.
		 *
		 * @private
		 * @param {Object} mItem The item template inside the configuration object
		 */
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

		/**
		 * Attaches a navigation action to the inner item template.
		 *
		 * @private
		 * @param {Object} oAction A navigation action
		 */
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
		 * Requests data and bind it to the item template.
		 *
		 * @private
		 * @param {Object} oData The data part of the configuration object
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
		};

		/**
		 * Updates the model and binds the data to the list.
		 *
		 * @private
		 * @param {Object} oData the data to set
		 * @param {string} sPath the binding path
		 */
		ListContent.prototype._updateModel = function (oData, sPath) {
			this.getModel().setData(oData);
			this._getList().bindItems({
				path: sPath || "/",
				template: this._oItemTemplate
			});

			this.fireEvent("_updated");
		};

	return ListContent;
});
