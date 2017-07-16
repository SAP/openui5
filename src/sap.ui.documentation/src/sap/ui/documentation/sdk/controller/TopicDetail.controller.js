/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/XML2JSONUtils",
		"sap/ui/Device"
	], function (BaseController, JSONModel, XML2JSONUtils, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.TopicDetail", {


			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.oPage = this.byId("topicDetailPage");
				this.oPage.addStyleClass('docuPage');

				if ( !window.prettyPrint ) {
					jQuery.sap.require("sap.ui.documentation.sdk.thirdparty.google-code-prettify.prettify");
				}

				this.getRouter().getRoute("topicId").attachPatternMatched(this._onTopicMatched, this);
				this._oConfig = this.getConfig();

				this.jsonDefModel = new JSONModel();
				this.getView().setModel(this.jsonDefModel);
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			onAfterRendering: function() {
				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			onExit: function() {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} event pattern match event in route 'topicId'
			 * @private
			 */
			_onTopicMatched: function (event) {
				var topicId = event.getParameter("arguments").id,
					topicURL = this._oConfig.docuPath + topicId + ".html",
					htmlContent = jQuery.sap.syncGetText(topicURL).data,
					jsonObj;

				if (!htmlContent) {
					return;
				}

				jsonObj = XML2JSONUtils.XML2JSON(htmlContent, this._oConfig);
				jsonObj.topicURL = topicURL;


				this.jsonDefModel.setData(jsonObj);

				this._scrollContentToTop();

				setTimeout(window.prettyPrint, 0);

				this.searchResultsButtonVisibilitySwitch(this.getView().byId("topicDetailBackToSearch"));

				if (this.extHookonTopicMatched) {
					this.extHookonTopicMatched(topicId);
				}
			},

			_scrollContentToTop: function () {
				if (this.oPage && this.oPage.$().length > 0) {
					this.oPage.getScrollDelegate().scrollTo(0, 1);
				}
			},

			_formatHTML: function(html) {
				return '<div>' + html + '</div>';
			},

			_onOrientationChange: function(e) {
				var page = this.getView().byId("topicDetailPage");

				if (e.landscape) {
					page.setShowHeader(false);
				} else {
					page.setShowHeader(true);
				}
			},

			backToSearch: function (text) {
				this.onNavBack();
			}

		});

	}
);