/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		'sap/ui/model/json/JSONModel',
		"sap/ui/documentation/sdk/controller/util/NewsInfo",
		"sap/ui/core/Core",
		"sap/m/library"
		],
		function (BaseController, JSONModel, NewsInfo, Core, mobileLibrary) {
		'use strict';

		return BaseController.extend('sap.ui.documentation.sdk.controller.News', {
			onInit: function() {
				this.getRouter().getRoute("news").attachPatternMatched(this._onMatched, this);

				this._oModel = new JSONModel();
				this.setModel(this._oModel);

				NewsInfo.prepareNewsData(this.getOwnerComponent().getConfigUtil());

				Core.getEventBus().subscribe("newsChanged", "onDemoKitNewsChanged", this._syncModelWithNewsInfo, this);
			},

			onAfterRendering: function() {
				this._syncModelWithNewsInfo();
			},

			handleNewsItemClose: function (oEvent) {
				var oItem = oEvent.getSource(),
					iItemCustomId = oItem.getCustomData()[0].getValue(),
					oItemInfoInItemsProperty = this._oModel.getProperty("/new").find(function(oItem){
						return oItem.id === iItemCustomId;
					});

					NewsInfo.moveNewItemToOld(oItemInfoInItemsProperty);
			},

			handleMarkAsRead: function () {
				NewsInfo.moveAllNewItemsToOld();
			},

			handleVisitLink: function(oEvent) {
				var oItem = oEvent.getSource(),
					sItemLink = oItem.getCustomData()[0].getValue();

				mobileLibrary.URLHelper.redirect(sItemLink, true);
			},

			_syncModelWithNewsInfo: function() {
				var sPreparationFailureMessage = NewsInfo.getPreparationFailureMessage();

				if (!sPreparationFailureMessage) {
					this._oModel.setProperty("/new", NewsInfo.getNewNewsArray().slice());
					this._oModel.setProperty("/old", NewsInfo.getOldNewsArray().slice());
				}
				this._oModel.setProperty("/preparationFailureMessage", sPreparationFailureMessage);
			},

			/**
			 * Handles "demoapps" routing
			 * @function
			 * @private
			 */
			_onMatched: function () {
				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
				}
			}
		});
	});
