sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/LoaderExtensions",
	"sap/tnt/NavigationListItem",
	"sap/tnt/NavigationListGroup",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/ObjectStatus",
	"sap/m/library"
], function (Controller, JSONModel, LoaderExtensions, NavigationListItem, NavigationListGroup, Dialog, Button, Text, ObjectStatus, mLibrary) {
	"use strict";

	const ButtonType = mLibrary.ButtonType;

	const oOriginalData = LoaderExtensions.loadResource("sap/tnt/sample/SideNavigationSearch/model/data.json", {
		async: false,
		dataType: "json"
	});

	return Controller.extend("sap.tnt.sample.SideNavigationSearch.C", {

		onInit: function () {
			const oModel = new JSONModel(oOriginalData);
			this.getView().setModel(oModel);
		},

		onMenuTogglePress: function () {
			const oToolPage = this.byId("toolPage"),
				bSideExpanded = !oToolPage.getSideExpanded();

			if (!bSideExpanded) {
				// reset the filtering when collapse the side navigation
				this.byId("sideNavigationSearchField").setValue("");
				this.byId("navigationList").setHighlightedText("");
				this._executeSearch("");
			}

			oToolPage.setSideExpanded(bSideExpanded);
		},

		onItemSelect: function (oEvent) {
			const oNavContainer = this.byId("navContainer"),
				sKey = oEvent.getParameter("item").getKey();

			if (sKey && oNavContainer.getPage(this.getView().createId(sKey))) {
				oNavContainer.to(this.getView().createId(sKey));
			}
		},

		onItemPress: function (oEvent) {
			const oItem = oEvent.getSource();
			if (oItem && oItem.getKey && oItem.getKey() === "quickCreate") {
				this._getQuickCreateDialog().open();
			}
		},

		onSearch: function (oEvent) {
			const sValue = oEvent.getSource().getValue(),
				oNavigationList = this.byId("navigationList");

			if (!sValue) {
				return;
			}

			const aCombinedItems = oOriginalData.navigation.concat(oOriginalData.fixedNavigation);
			const iMatchCount = this._countItems(aCombinedItems, sValue);

			oNavigationList.announceSearchMatchCount(iMatchCount);
		},

		onLiveChange: function (oEvent) {
			const sValue = oEvent.getSource().getValue(),
				oNavigationList = this.byId("navigationList");

			// The application drives the search: it merges the matching items into the flexible
			// list and empties the fixed list (see _executeSearch). Because the fixed list is then
			// empty, the SideNavigation renders a single, correctly announced navigation landmark.
			this._executeSearch(sValue);
			oNavigationList.setHighlightedText(sValue);
		},

		navigationItemFactory: function (sId, oContext) {
			const oData = oContext.getObject();

			if (oData.type === "group") {
				return new NavigationListGroup(sId, {
					text: "{title}",
					expanded: "{expanded}",
					items: {
						path: "items",
						templateShareable: true,
						template: this._createNavigationItem()
					}
				});
			}

			return this._createNavigationItem();
		},

		_createNavigationItem: function () {
			return new NavigationListItem({
				text: "{title}",
				icon: "{icon}",
				enabled: "{enabled}",
				expanded: "{expanded}",
				hasExpander: "{hasExpander}",
				selectable: "{selectable}",
				key: "{key}",
				href: "{href}",
				target: "{target}",
				ariaHasPopup: "{ariaHasPopup}",
				design: "{design}",
				press: this.onItemPress.bind(this),
				tag: this._createTag(),
				items: {
					path: "items",
					templateShareable: true,
					template: new NavigationListItem({
						selectable: "{selectable}",
						text: "{title}",
						key: "{key}",
						enabled: "{enabled}",
						href: "{href}",
						target: "{target}",
						ariaHasPopup: "{ariaHasPopup}",
						design: "{design}",
						press: this.onItemPress.bind(this),
						tag: this._createTag()
					})
				}
			});
		},

		_createTag: function () {
			return new ObjectStatus({
				text: "{tagText}",
				state: "{tagState}",
				inverted: true,
				visible: "{= !!${tagText} }"
			});
		},

		_countItems: function (aItems, sValue) {
			if (!aItems) {
				return 0;
			}

			const sLowerValue = sValue.toLowerCase();

			return aItems.reduce((iCount, oItem) => {
				const bTitleMatches = oItem.title?.toLowerCase().includes(sLowerValue);
				return iCount + (bTitleMatches ? 1 : 0) + this._countItems(oItem.items, sValue);
			}, 0);
		},

		_executeSearch: function (sValue) {
			const oModel = this.getView().getModel();

			if (!sValue) {
				oModel.setData(oOriginalData);
				return 0;
			}

			const aCombinedItems = oOriginalData.navigation.concat(oOriginalData.fixedNavigation);

			const oFilteredData = {
				navigation: this._filterItems(aCombinedItems, sValue),
				fixedNavigation: []
			};

			oModel.setData(oFilteredData);
		},

		_filterItems: function (aItems, sValue) {
			if (!aItems) {
				return [];
			}

			const sLowerValue = sValue.toLowerCase();

			return aItems.reduce(function (aResult, oItem) {
				const bTitleMatches = oItem.title?.toLowerCase().includes(sLowerValue);
				const bTagTextMatches = oItem.tagText?.toLowerCase().includes(sLowerValue);

				if (bTitleMatches || bTagTextMatches) {
					aResult.push(oItem);
				} else if (oItem.items) {
					const aFilteredChildren = this._filterItems(oItem.items, sValue);
					if (aFilteredChildren.length > 0) {
						aResult.push(Object.assign({}, oItem, { items: aFilteredChildren }));
					}
				}

				return aResult;
			}.bind(this), []);
		},

		_getQuickCreateDialog: function () {
			if (!this._oQuickCreateDialog) {
				this._oQuickCreateDialog = new Dialog({
					title: "Create Item",
					type: "Message",
					content: [
						new Text({ text: "Create New Navigation List Item." })
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Create",
						press: function () {
							this._oQuickCreateDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this._oQuickCreateDialog.close();
						}.bind(this)
					})
				});

				this.getView().addDependent(this._oQuickCreateDialog);
			}

			return this._oQuickCreateDialog;
		}

	});
});