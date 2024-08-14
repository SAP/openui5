/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/SearchUtil",
	"sap/ui/documentation/sdk/controller/util/Highlighter",
	"sap/ui/model/json/JSONModel",
	"sap/m/GroupHeaderListItem",
	"sap/base/Log"
], function(BaseController, SearchUtil, Highlighter, JSONModel, GroupHeaderListItem, Log) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.SearchPage", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.setModel(new JSONModel(), "searchView");
				this.getRouter().getRoute("search").attachPatternMatched(this._onTopicMatched, this);
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
					sOldQuery = this.getModel("searchView").getProperty("/lastProcessedQuery"),
					sPageTitle = '';

				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					Log.error(e);
				}

				if (sQuery === sOldQuery) {
					this.getView().byId("searchPage").setSelectedSection(sSectionId);
					this._modifyLinks();
					return;
				}

				this.getModel("searchData").setProperty("/query", sQuery);

				oList.setBusy(true);
				SearchUtil.search(sQuery, {
					includeDeprecated: this.getModel("searchData").getProperty("/includeDeprecated")
				}).then(function(result) {
					this.getModel("searchView").setProperty("/lastProcessedQuery", sQuery);
					this.getModel("searchData").setProperty("/matches", result.matches);
					this.getView().byId("searchPage").setSelectedSection(sSectionId);
					oList.setBusy(false);
				}.bind(this));

				if (this.highlighter) {
					this.highlighter.highlight(sQuery);
				}

				sPageTitle = this.getModel("i18n").getResourceBundle().getText("SEARCH_PAGE_TITLE", [sQuery]);
				this.appendPageTitle(sPageTitle);
			},

			formatTableTitle: function (sPattern, iVisibleItemsCount, iItemsCount) {
				var sVisibleItemsString = iItemsCount > 0 ? "1 - " + iVisibleItemsCount : "0";

				return this.formatMessage(sPattern, sVisibleItemsString, iItemsCount);
			},

			onDeprecatedFlagChange: function(oEvent) {
				var bIncludeDeprecated = oEvent.getParameter("selected"),
					sQuery = this.getModel("searchData").getProperty("/query");

					SearchUtil.search(sQuery, {
						includeDeprecated: bIncludeDeprecated
					}).then(function(result) {
						this.getModel("searchData").setProperty("/matches", result.matches);
					}.bind(this));
			},

			_findSectionForCategory: function(sCategory) {
				var aSection = this.getView().byId("searchPage").getSections().filter(function(oSecion) {
					return (oSecion.data("category") == sCategory);
				});
				return aSection.length && aSection[0];
			},

			/**
			 * Modify all search result links
			 * The default modification is formatting of titles (hide/show trailing colons)
			 * @param bModifyHref enable modifications of href and target (to alow open in new window)
			 * @private
			 */
			_modifyLinks: function (bModifyHref) {
				var oView = this.getView(),
					// Collect all possible items from all lists
					aItems = [].concat(
						oView.byId("allList").getItems(),
						oView.byId("apiList").getItems(),
						oView.byId("documentationList").getItems(),
						oView.byId("samplesList").getItems()
					),
					iLen = aItems.length,
					oItem,
					oLink,
					sHref,
					sTarget = "_self",
					bExternal,
					bFormatTitle = true,
					oSearchDataModel = this.getOwnerComponent().getModel("searchData"),
					sQuery = oSearchDataModel.getProperty("/query");

				while (iLen--) {
					oItem = aItems[iLen];
					// Access control lazy loading method if available
					if (oItem._getLinkSender) {
						// Set link href to allow open in new window functionality
						oLink = this.loadSearchResultLink(oItem, bFormatTitle);
						if (bModifyHref) {
							sHref = oItem.getCustomData()[0].getValue();
							bExternal = oItem.getCustomData()[1].getValue();

							if (bExternal) {
								sHref = new URL(sHref, document.baseURI).href;
								sTarget = "_blank";
							}
							if (sQuery) {
								sHref = `${sHref}?q=${sQuery}`;
							}
							oLink.setHref(sHref);
							oLink.setTarget(sTarget);
						}
					}
				}
			},

			loadSearchResultLink: function(oItem, bFormatTitle) {
				var bShowColon;
				if (!oItem._getLinkSender) {
					return null;
				}
				if (bFormatTitle) {
					bShowColon = !!oItem.getText();
				}
				return oItem._getLinkSender(bShowColon);
			},

			getGroupHeader : function (oGroup) {
				return new GroupHeaderListItem( {
					title: oGroup.key
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
				this.getModel("searchView").setProperty("/visibleAllLength", oEvent.getParameter("actual"));
				this._modifyLinks(true);
			},

			onAPILoadMore : function (oEvent) {
				this.getModel("searchView").setProperty("/visibleAPILength", oEvent.getParameter("actual"));
				this._modifyLinks(true);
			},

			onDocLoadMore : function (oEvent) {
				this.getModel("searchView").setProperty("/visibleDocLength", oEvent.getParameter("actual"));
				this._modifyLinks(true);
			},

			onExploredLoadMore : function (oEvent) {
				this.getModel("searchView").setProperty("/visibleExploredLength", oEvent.getParameter("actual"));
				this._modifyLinks(true);
			},

			onSwitchTab: function(oEvent) {
				var sCategory = oEvent.getParameter("section").data("category"),
					oRouterParams = {searchParam: this.getModel("searchView").getProperty("/lastProcessedQuery")};

				if (sCategory) {
					oRouterParams["?options"] = {category: sCategory};
				}
				this.getRouter().navTo("search", oRouterParams);
			}

		});

	}
);