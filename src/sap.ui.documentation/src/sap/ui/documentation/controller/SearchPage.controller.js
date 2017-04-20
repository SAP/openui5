/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/m/GroupHeaderListItem"
	], function (BaseController, JSONModel, GroupHeaderListItem) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.controller.SearchPage", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.bindListResults();
				this.getRouter().getRoute("search").attachPatternMatched(this._onTopicMatched, this);
			},

			bindListResults: function () {
				this.dataObject = {data:[]};
				this.oSearchModel = new JSONModel();
				this.oSearchModel.setData(this.dataObject);
				this.getView().setModel(this.oSearchModel);
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
					this.oSearchModel.refresh();

				jQuery.ajax({
					url: "search?q=" + sQuery, // TODO escaping
					dataType : "json",
					success : function(oData, sStatus, xhr) {
						jQuery(function() {
							that.processResult(oData, sStatus, xhr);
						});
					},
					error : function() {
						jQuery(function() {
							that.processResult(null);
						});
					}
				});
			},

			processResult : function (oData, sStatus, xhr) {
				this.dataObject.data = [];
				this.dataObject.dataAPI = [];
				this.dataObject.dataDoc = [];
				this.dataObject.AllLength = 0;
				this.dataObject.APILength = 0;
				this.dataObject.DocLength = 0;
				if ( oData && oData[0] && oData[0].success ) {
					if ( oData[0].totalHits == 0 ) {
						jQuery(".sapUiRrNoData").html("No matches found.");
					} else {
						for (var i = 0; i < oData[0].matches.length; i++) {
							var oDoc = oData[0].matches[i];
							//TODO: Find a nicer Date formatting procedure
							oDoc.modifiedStr = oDoc.modified + "";
							var sModified = oDoc.modifiedStr.substring(0,4) + "/" + oDoc.modifiedStr.substring(4,6) + "/" + oDoc.modifiedStr.substring(6,8) + ", " + oDoc.modifiedStr.substring(8,10) + ":" + oDoc.modifiedStr.substring(10),
								sNavURL = oDoc.path,
								bShouldAddToSearchResults = false,
								sCategory;
							if (sNavURL.indexOf("docs/guide/") === 0) {
								sNavURL = sNavURL.substring("docs/guide/".length, sNavURL.lastIndexOf(".html"));
								sNavURL = "topicId/" + sNavURL;
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
							} else if (sNavURL.indexOf("docs/api/symbols/") === 0) {
								sNavURL = sNavURL.substring("docs/api/symbols/".length, sNavURL.lastIndexOf(".html"));
								sNavURL = "apiId/" + sNavURL;
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
				this.oSearchModel.refresh();
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

			onAllLoadMore : function (oEvent) {
				this.dataObject.visibleAllLength = oEvent.getParameter("actual");
				this.oSearchModel.refresh();
			},

			onAPILoadMore : function (oEvent) {
				this.dataObject.visibleAPILength = oEvent.getParameter("actual");
				this.oSearchModel.refresh();
			},

			onDocLoadMore : function (oEvent) {
				this.dataObject.visibleDocLength = oEvent.getParameter("actual");
				this.oSearchModel.refresh();
			},

			openSearchResult : function (oControlEvent) {
				var aNavParams,
					oCustomData = oControlEvent.getSource().getCustomData()[0];
				if (oCustomData.getKey() === "path") {
					aNavParams = oCustomData.getValue().split("/");
				}
				this.getRouter().navTo(aNavParams[0], {id: aNavParams[1]}, false);
			}

		});

	}
);