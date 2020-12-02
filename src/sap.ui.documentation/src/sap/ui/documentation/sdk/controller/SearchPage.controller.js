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
					oOptions = event.getParameter("arguments")["?options"],
					sCategory = oOptions && oOptions.category,
					oList = this.byId("allList"),
					oSection = this._findSectionForCategory(sCategory),
					sSectionId = oSection ? oSection.getId() : null,
					sOldQuery = this.getModel().getProperty("/searchTerm");

				if (sQuery === sOldQuery) {
					this.getView().byId("searchPage").setSelectedSection(sSectionId);
					return;
				}

				this.getModel().setProperty("/searchTerm", sQuery);
				this._modelRefresh();

				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					Log.error(e);
				}

				oList.setBusy(true);
				SearchUtil.search(sQuery).then(function(result) {
					this.dataObject = result.matches;
					this.dataObject.searchTerm = sQuery;
					this.getModel().setData(this.dataObject);
					this.getView().byId("searchPage").setSelectedSection(sSectionId);
					oList.setBusy(false);
				}.bind(this));

				if (this.highlighter) {
					this.highlighter.highlight(sQuery);
				}
			},

			formatTableTitle: function (sPattern, iVisibleItemsCount, iItemsCount) {
				var sVisibleItemsString = iItemsCount > 0 ? "1 - " + iVisibleItemsCount : "0";

				return this.formatMessage(sPattern, sVisibleItemsString, iItemsCount);
			},

			_findSectionForCategory: function(sCategory) {
				var aSection = this.getView().byId("searchPage").getSections().filter(function(oSecion) {
					return (oSecion.data("category") == sCategory);
				});
				return aSection.length && aSection[0];
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
			},

			onSwitchTab: function(oEvent) {
				var sCategory = oEvent.getParameter("section").data("category"),
					oRouterParams = {searchParam: this.getModel().getProperty("/searchTerm")};

				if (sCategory) {
					oRouterParams["?options"] = {category: sCategory};
				}
				this.getRouter().navTo("search", oRouterParams);
			}

		});

	}
);