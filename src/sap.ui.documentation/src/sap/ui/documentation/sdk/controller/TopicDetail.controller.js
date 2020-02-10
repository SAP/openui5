/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/XML2JSONUtils",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler"
	], function (jQuery, BaseController, JSONModel, XML2JSONUtils, Device, ToggleFullScreenHandler) {
		"use strict";

		var GIT_HUB_DOCS_URL = "https://sap.github.io/openui5-docs/#/",
			REGEX = {
				SPECIAL_CHARS: /[\\\/:*\?"<>|]/g,
				SPACES: /\s+/g
			};

		return BaseController.extend("sap.ui.documentation.sdk.controller.TopicDetail", {


			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.oPage = this.byId("topicDetailPage");
				this.oPage.addStyleClass('docuPage');

				if ( !window.prettyPrint ) {
					//TODO: global jquery call found
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
				//TODO: global jquery call found
				var topicId = event.getParameter("arguments").id, topicURL = this._oConfig.docuPath + topicId + (topicId.match(/\.html/) ? "" : ".html"), htmlContent = jQuery.sap.syncGetText(topicURL).data, jsonObj;

				if (!htmlContent) {
					setTimeout(function () {
						this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
					}.bind(this), 0);
					return;
				}

				jsonObj = XML2JSONUtils.XML2JSON(htmlContent, this._oConfig);
				jsonObj.topicURL = topicURL;
				jsonObj.iframeAttribute = Device.os.name === Device.os.OS.IOS ? ' scrolling="no" ' : "";
				jsonObj.bIsPhone = Device.system.phone;
				if (jsonObj.shortdesc) {
					jsonObj.shortdesc = jsonObj.shortdesc.trim().replace(/(\r\n|\n|\r)/gm, ' ');
				}

				this.jsonDefModel.setData(jsonObj);

				this._scrollContentToTop();

				setTimeout(window.prettyPrint, 0);

				this.searchResultsButtonVisibilitySwitch(this.byId("topicDetailBackToSearch"));

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

			backToSearch: function (text) {
				this.onNavBack();
			},

			onToggleFullScreen: function(oEvent) {
				ToggleFullScreenHandler.updateMode(oEvent, this.getView(), this);
			},

			onEditGitHubPress: function(oEvent) {
				var sUrl = this.jsonDefModel.getProperty("/topicURL"),
					sTitle = this.jsonDefModel.getProperty("/topictitle1"),
					sGitHubUrl = this._formatToGitHubUrl(sUrl, sTitle);
				window.open(sGitHubUrl, "_blank");
			},

			/**
			 * Transforms a URL from the SAPUI5 documentation into the corresponding URL in the GitHub repo,
			 * following the rules:
			 * The GitHub URL starts with <code>GIT_HUB_DOCS_URL</code>
			 * and the filename is calculated from the topic title in the following way:
			 * 1) Special symbols are removed \ / : * ? “ < > |
			 * 2) All empty spaces are replaced with “_” and one additional “_” is added at the end
			 * 3) The first seven symbols from the ID used in the Demo Kit URLs are added at the end
			 * 4) The file type is added at the end “.md”
			 *
			 * @param sUrl, the url of the file in the internal repo
			 * @param sTitle, the title of the file
			 * @returns {string}, the url of the file in the GitHub repo
			 * @private
			 */
			_formatToGitHubUrl: function(sUrl, sTitle) {
				var sGitHubFileName = sTitle.trim()
					.replace(REGEX.SPECIAL_CHARS, "") // remove special chars
					.replace(REGEX.SPACES, "_"); // replace remaining spaces with delimiter char
				sGitHubFileName += "_"; // end the text with a single delimiter char
				sGitHubFileName += sUrl.split("/").pop().substring(0, 7); // concat the first 7 symbols of the original filename
				sGitHubFileName += ".md";
				return GIT_HUB_DOCS_URL + sGitHubFileName;
			}

		});

	}
);
