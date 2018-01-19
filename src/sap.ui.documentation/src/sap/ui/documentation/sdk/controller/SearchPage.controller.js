/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/m/GroupHeaderListItem"
	], function (jQuery, BaseController, JSONModel, GroupHeaderListItem) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.SearchPage", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.setModel(new JSONModel());
				this.bindListResults();
				this.getRouter().getRoute("search").attachPatternMatched(this._onTopicMatched, this);
			},

			bindListResults: function () {
				this.dataObject = {data:[]};
				this.getModel().setData(this.dataObject);
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
				var that = this,
					sQuery = event.getParameter("arguments").searchParam;
				this.dataObject.searchTerm = sQuery;
				this._modelRefresh();

				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					jQuery.sap.log.error(e);
				}

				// Build the full query strings, escape special characters
				var sQueryDoc = "(category:topics) AND (" + encodeURIComponent(sQuery) + ")";
				var sQueryApi = "(category:apiref) AND (" + encodeURIComponent(sQuery) + ")";
				var sQueryExplored = "(category:entity) AND (" + encodeURIComponent(sQuery) + ")";

				var PromiseDoc = new Promise(function (resolve) {
					jQuery.ajax({
						url: "search?q=" + sQueryDoc,
						dataType : "json",
						success : function(oData, sStatus, xhr) {
							resolve(oData, sStatus, xhr);
						},
						error : function() {
							resolve([]);
						}
					});
				});

				var PromiseApi = new Promise(function (resolve) {
					jQuery.ajax({
						url: "search?q=" + sQueryApi,
						dataType : "json",
						success : function(oData, sStatus, xhr) {
							resolve(oData, sStatus, xhr);
						},
						error : function() {
							resolve([]);
						}
					});
				});

				var PromiseExplored = new Promise(function (resolve) {
					jQuery.ajax({
						url: "search?q=" + sQueryExplored,
						dataType : "json",
						success : function(oData, sStatus, xhr) {
							resolve(oData, sStatus, xhr);
						},
						error : function() {
							resolve([]);
						}
					});
				});

				Promise.all([PromiseDoc, PromiseApi, PromiseExplored]).then(function(result) {
					var oData = {},
						oResultDoc = result[0][0] || {},
						oResultApi = result[1][0] || {},
						oResultExplored = result[2][0] || {};

					oResultDoc.matches = oResultDoc.matches || [];
					oResultApi.matches = oResultApi.matches || [];
					oResultExplored.matches = oResultExplored.matches || [];

					oData.success = oResultDoc.success || oResultApi.success || oResultExplored.success || false;
					oData.totalHits = (oResultDoc.totalHits + oResultApi.totalHits + oResultExplored.totalHits) || 0;
					oData.matches = oResultDoc.matches.concat(oResultApi.matches).concat(oResultExplored.matches);
					that.processResult(oData);
				 }).catch(function(reason) {
					 // implement catch function to prevent uncaught errors message
				 });
			},

			processResult : function (oData) {
				this.dataObject.data = [];
				this.dataObject.dataAPI = [];
				this.dataObject.dataDoc = [];
				this.dataObject.dataExplored = [];
				this.dataObject.AllLength = 0;
				this.dataObject.APILength = 0;
				this.dataObject.DocLength = 0;
				this.dataObject.ExploredLength = 0;
				if ( oData && oData.success ) {
					if ( oData.totalHits == 0 ) {
						jQuery(".sapUiRrNoData").html("No matches found.");
					} else {
						for (var i = 0; i < oData.matches.length; i++) {
							var oDoc = oData.matches[i];
							//TODO: Find a nicer Date formatting procedure
							oDoc.modifiedStr = oDoc.modified + "";
							var sModified = oDoc.modifiedStr.substring(0,4) + "/" + oDoc.modifiedStr.substring(4,6) + "/" + oDoc.modifiedStr.substring(6,8) + ", " + oDoc.modifiedStr.substring(8,10) + ":" + oDoc.modifiedStr.substring(10),
								sNavURL = oDoc.path,
								bShouldAddToSearchResults = false,
								sCategory;
							if (sNavURL.indexOf("topic/") === 0) {
								sNavURL = sNavURL.substring(0, sNavURL.lastIndexOf(".html"));
								bShouldAddToSearchResults = true;
								sCategory = "Documentation";
								this.dataObject.dataDoc.push({
									index: this.dataObject.DocLength,
									title: oDoc.title ? oDoc.title : "Untitled",
									path: sNavURL,
									summary: oDoc.summary ? (oDoc.summary + "...") : "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.DocLength++;
							} else if (sNavURL.indexOf("entity/") === 0 ) {
								bShouldAddToSearchResults = true;
								sCategory = "Samples";
								this.dataObject.dataExplored.push({
									index: this.dataObject.ExploredLength,
									title: oDoc.title ? oDoc.title : "Untitled",
									path: sNavURL,
									summary: oDoc.summary ? (oDoc.summary + "...") : "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.ExploredLength++;
							} else if (sNavURL.indexOf("docs/api/symbols/") === 0) {
								sNavURL = sNavURL.substring("docs/api/symbols/".length, sNavURL.lastIndexOf(".html"));
								sNavURL = "api/" + sNavURL;
								bShouldAddToSearchResults = true;
								sCategory = "API Reference";
								this.dataObject.dataAPI.push({
									index: this.dataObject.APILength,
									title: oDoc.title ? oDoc.title : "Untitled",
									path: sNavURL,
									summary: oDoc.summary ? (oDoc.summary + "...") : "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.APILength++;
							} else if (sNavURL.indexOf("docs/api/modules/") === 0) {
								sNavURL = sNavURL.substring("docs/api/modules/".length, sNavURL.lastIndexOf(".html")).replace(/_/g, ".");
								sNavURL = "api/" + sNavURL;
								bShouldAddToSearchResults = true;
								sCategory = "API Reference";
								this.dataObject.dataAPI.push({
									index: this.dataObject.APILength,
									title: oDoc.title ? oDoc.title : "Untitled",
									path: sNavURL,
									summary: oDoc.summary ? (oDoc.summary + "...") : "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.APILength++;
							}

							if (bShouldAddToSearchResults) {
								this.dataObject.data.push({
									index: i,
									title: oDoc.title ? oDoc.title : "Untitled",
									path: sNavURL,
									summary: oDoc.summary ? (oDoc.summary + "...") : "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.AllLength++;
							}
						}
					}
				} else {
					jQuery(".sapUiRrNoData").html("Search failed, please retry ...");
				}
				this._modelRefresh();
			},

			/**
			 * Modify all search result links
			 * @private
			 */
			_modifyLinks: function () {
				var oView = this.getView(),
					// Collect all possible items from all lists
					aItems = [].concat(
						oView.byId("allList").getItems(),
						oView.byId("apiList").getItems(),
						oView.byId("documentationList").getItems(),
						oView.byId("samplesList").getItems()
					),
					iLen = aItems.length,
					oItem;

				while (iLen--) {
					oItem = aItems[iLen];
					// Access control lazy loading method if available
					if (oItem._getLinkSender) {
						// Set link href to allow open in new window functionality
						oItem._getLinkSender().setHref("#/" + oItem.getCustomData()[0].getValue());
					}
				}
			},

			/**
			 * Refresh model and modify links
			 * @private
			 */
			_modelRefresh: function () {
				this.getModel().refresh();
				this._modifyLinks();
			},

			getGroupHeader : function (oGroup) {
				return new GroupHeaderListItem( {
					title: oGroup.key,
					upperCase: false
				} );
			},

			categoryAPIFormatter : function (sCategory) {
				return sCategory === "API Reference";
			},

			categoryDocFormatter : function (sCategory) {
				return sCategory === "Documentation";
			},

			categoryExploredFormatter : function (sCategory) {
				return sCategory === "Samples";
			},

			onAllLoadMore : function (oEvent) {
				this.dataObject.visibleAllLength = oEvent.getParameter("actual");
				this._modelRefresh();
			},

			onAPILoadMore : function (oEvent) {
				this.dataObject.visibleAPILength = oEvent.getParameter("actual");
				this._modelRefresh();
			},

			onDocLoadMore : function (oEvent) {
				this.dataObject.visibleDocLength = oEvent.getParameter("actual");
				this._modelRefresh();
			},

			onExploredLoadMore : function (oEvent) {
				this.dataObject.visibleExploredLength = oEvent.getParameter("actual");
				this._modelRefresh();
			}

		});

	}
);