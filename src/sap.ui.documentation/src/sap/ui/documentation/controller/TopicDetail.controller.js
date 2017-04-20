/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/controller/util/JSDocUtil",
		"sap/ui/documentation/controller/util/XML2JSONUtils",
		"sap/ui/Device"
	], function (BaseController, JSONModel, JSDocUtil, XML2JSONUtils, Device) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.controller.TopicDetail", {


			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.oPage = this.byId("topicDetailPage");
				this.oPage.addStyleClass('docuPage');

				if ( !window.prettyPrint ) {
					jQuery.sap.require("sap.ui.documentation.controller.util.google-code-prettify.prettify");
				}

				this.getRouter().getRoute("topicId").attachPatternMatched(this._onTopicMatched, this);
				this._oConfig = this.getConfig();

				this.jsonDefModel = new JSONModel();
				this.getView().setModel(this.jsonDefModel);
			},

			onBeforeRendering: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onAfterRendering: function() {
				Device.orientation.attachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onExit: function() {
				Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
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

			/**
			 * This function wraps a text in a span tag so that it can be represented in an HTML control.
			 * @param {string} text
			 * @returns {string}
			 * @private
			 */
			_wrapInSpanTag: function (text) {
				return JSDocUtil.formatTextBlock(text, {
					linkFormatter: function (target, text) {

						var p;

						target = target.trim().replace(/\.prototype\./g, "#");
						p = target.indexOf("#");
						if (p === 0) {
							// a relative reference - we can't support that
							return "<code>" + target.slice(1) + "</code>";
						}

						if (p > 0) {
							text = text || target; // keep the full target in the fallback text
							target = target.slice(0, p);
						}

						return "<a class=\"jsdoclink\" href=\"javascript:void(0);\" data-sap-ui-target=\"" + target + "\">" + (text || target) + "</a>";

					}
				});
			},

			_formatHTML: function(html) {
				return '<div>' + html + '</div>';
			},

			_fnOrientationChange: function(e) {
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