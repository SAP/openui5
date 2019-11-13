/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/SearchUtil",
	"sap/ui/documentation/sdk/controller/util/Highlighter",
    "sap/ui/model/json/JSONModel",
    "sap/m/GroupHeaderListItem",
    "sap/base/Log"
], function(jQuery, BaseController, SearchUtil, Highlighter, JSONModel, GroupHeaderListItem, Log) {
		"use strict";

		var APIREF_URL_PATHS = {
			"properties": "controlProperties",
			"fields": "properties",
			"aggregations": "aggregations",
			"associations": "associations",
			"events": "events",
			"specialSettings": "specialsettings",
			"annotations": "annotations",
			"methods": "methods"
		},

		APIREF_SECTION_TITLE = {
			"properties": "property",
			"fields": "field",
			"aggregations": "aggregation",
			"associations": "association",
			"events": "event",
			"specialSettings": "specialsetting",
			"annotations": "annotation",
			"methods": "method"
		};

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

			onAfterRendering: function () {
				var oConfig = {
					useExternalStyles: false,
					shouldBeObserved: true,
					isCaseSensitive: false
				};

				if (!this.highlighter) {
					this.highlighter = new Highlighter(this.getView().getDomRef(), oConfig);
				}
			},

			onExit: function () {
				this.highlighter.destroy();
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
				var sQuery = decodeURIComponent(event.getParameter("arguments").searchParam),
					oList = this.byId("allList");

				this.dataObject.searchTerm = sQuery;
				this._modelRefresh();

				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					Log.error(e);
				}

				oList.setBusy(true);
				SearchUtil.search(sQuery).then(function(result) {
					this.processResult(result, sQuery);
					oList.setBusy(false);
				}.bind(this));
			},

			processResult : function (oData, sQuery) {
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
							var oMatch = oData.matches[i],
								oDoc = oMatch.doc;
							//TODO: Find a nicer Date formatting procedure
							oDoc.modifiedStr = oDoc.modified + "";
							var sModified = oDoc.modifiedStr.substring(0,4) + "/" + oDoc.modifiedStr.substring(4,6) + "/" + oDoc.modifiedStr.substring(6,8) + ", " + oDoc.modifiedStr.substring(8,10) + ":" + oDoc.modifiedStr.substring(10),
								sTitle = oDoc.title,
								sSummary = oDoc.summary,
								sNavURL = oDoc.path,
								bShouldAddToSearchResults = false,
								sCategory;
							if (oDoc.category === "topics") {
								sNavURL = sNavURL.substring(0, sNavURL.lastIndexOf(".html"));
								bShouldAddToSearchResults = true;
								sCategory = "Documentation";
								this.dataObject.dataDoc.push({
									index: this.dataObject.DocLength,
									title: sTitle ? sTitle : "Untitled",
									path: sNavURL,
									summary: sSummary || "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.DocLength++;
							} else if (oDoc.category === "entity") {
								bShouldAddToSearchResults = true;
								sCategory = "Samples";
								this.dataObject.dataExplored.push({
									index: this.dataObject.ExploredLength,
									title: sTitle ? sTitle + " (samples)" : "Untitled",
									path: sNavURL,
									summary: sSummary || "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.ExploredLength++;
							} else if (oDoc.category === 'apiref') {
								sNavURL = this._formatApiRefURL(oMatch);
								sTitle = this._formatApiRefTitle(oMatch);
								sSummary = this._formatApiRefSummary(oMatch);
								bShouldAddToSearchResults = true;
								sCategory = "API Reference";
								this.dataObject.dataAPI.push({
									index: this.dataObject.APILength,
									title: sTitle,
									path: sNavURL,
									summary: sSummary || "",
									score: oDoc.score,
									modified: sModified,
									category: sCategory
								});
								this.dataObject.APILength++;
							}

							if (bShouldAddToSearchResults) {
								this.dataObject.data.push({
									index: i,
									title: sTitle ? sTitle : "Untitled",
									path: sNavURL,
									summary: sSummary || "",
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
				this.highlighter.highlight(sQuery);
			},

			_formatApiRefURL: function(oMatch) {
				var sEntityType = oMatch.matchedDocField,
					sEntityName = oMatch.doc.title,
					sEntityPath = APIREF_URL_PATHS[sEntityType],
					sURL;

				sURL = "api/" + sEntityName;

				if (sEntityPath) {
					sURL += "#" + sEntityPath; // add target section
				}

				if (sEntityType === "methods") {
					sURL += "/" + oMatch.matchedDocWord; // add target subSection
				}

				return sURL;
			},

			_formatApiRefTitle: function(oMatch) {
				var oDoc = oMatch.doc,
					sMetadataFieldType = APIREF_SECTION_TITLE[oMatch.matchedDocField],
					sMetadataFieldName = oMatch.matchedDocWord;

				if (sMetadataFieldType && sMetadataFieldName) {
					// a match was found within a *known* section of the apiref doc
					return sMetadataFieldName + " (" + sMetadataFieldType + ")";
				}

				if (oDoc.kind) {
					return oDoc.title + " (" + oDoc.kind + ")";
				}
				//default case
				return oDoc.title;
			},

			_formatApiRefSummary: function(oMatch) {
				var oDoc = oMatch.doc,
				sMatchedFieldType = APIREF_SECTION_TITLE[oMatch.matchedDocField],
				sMatchedFieldName = oMatch.matchedDocWord,
				bMatchedSubSection = sMatchedFieldType && sMatchedFieldName;

				if (bMatchedSubSection) {
					// we matched a known property/aggregation/method (etc.) *name*
					// so the default doc summary (which is the summary of the entire class/namespace)
					// may not be the closest context anymore
					// => return the doc title only (to indicate in which class/namespace the match was found)
					return oDoc.title;
				}
				//default case
				return oDoc.summary;
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
						oItem._getLinkSender().setHref(oItem.getCustomData()[0].getValue());
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