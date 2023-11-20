/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		'sap/ui/model/json/JSONModel',
		"sap/ui/documentation/sdk/util/Resources",
		"sap/ui/thirdparty/jquery",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/core/HTML"
		],
		function (BaseController, JSONModel, ResourcesUtil, jQuery, ResourceModel, HTML) {
		'use strict';

		return BaseController.extend('sap.ui.documentation.sdk.controller.BPSupport', {
			onInit: function() {
				this.getRouter().getRoute("BPSupport").attachPatternMatched(this._onMatched, this);

				this._oModel = new JSONModel();
				this.setModel(this._oModel);

				if (!this._oMessageBundle) {
					this._oMessageBundle = new ResourceModel({
						bundleName: "sap.ui.documentation.messagebundle"
					});
				}
				this.setModel(this._oMessageBundle, "i18n");
				this.oConfigUtil = this.getOwnerComponent().getConfigUtil();

			},

			_requestContentPage: function(oConfigPath) {
				return new Promise(function(resolve, reject) {
					jQuery.ajax(ResourcesUtil.getResourceOriginPath(oConfigPath["browserSupportPath"]), {
						dataType: "text"
					}).done(function (oData) {
						resolve(oData);
					}).fail(function (jqXHR, sTextStatus, sError) {
						reject();
					});
				});
			},
			/**
			 * Handles "BPSupport" routing
			 * @function
			 * @private
			 */
			_onMatched: function () {
				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
				}

				this.oConfigUtil._requireConfigJSON()
					.then(this._requestContentPage)
					.then(function(oData){
						this._oHTML = new HTML({
							id : "BPSupportContent",
							content : '<div id="d4h5-main-container" class="bpsupport">' + oData + '</div>'
						});

						this.byId("BPSupportPage").removeAllContent();
						this.byId("BPSupportPage").addContent(this._oHTML);

					}.bind(this))
					.catch(function(oErr) {
						this.onRouteNotFound();
					}.bind(this));
			}
		});
	});
