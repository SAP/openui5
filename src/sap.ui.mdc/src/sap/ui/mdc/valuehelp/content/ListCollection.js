/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/valuehelp/base/Content",
	'sap/ui/mdc/util/loadModules',
	'sap/ui/model/BindingMode'
], function(
	Content,
	loadModules
) {
	"use strict";

	var ListCollection = Content.extend("sap.ui.mdc.valuehelp.content.ListCollection", /** @lends sap.ui.mdc.valuehelp.content.ListCollection.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.IDialogContent"
			],
			aggregations: {
				lists: {
					type: "sap.ui.mdc.valuehelp.base.FilterableListContent",
					multiple: true
				}
			},
			defaultAggregation: "lists"
		}
	});

	ListCollection.prototype.init = function() {

		Content.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			aggregations: ["lists", "displayContent"]
		});

	};

	ListCollection.prototype._getVisibleList = function () {
		return this.getLists().find(function (oList) {
			return this._sVisibleListId ? oList.getId() === this._sVisibleListId : true;
		}.bind(this));
	};

	ListCollection.prototype.getFormattedTitle = function(iCount) {
		return "ListCollection: " + this._getVisibleList().getFormattedTitle();
	};

	ListCollection.prototype.getFormattedShortTitle = function() {
		return "ListCollection: " + this._getVisibleList().getFormattedShortTitle();
	};

	ListCollection.prototype._observeChanges = function(oChanges) {
		Content.prototype._observeChanges.apply(this, arguments);

		if (oChanges.name === "lists") {
			this._handleListsUpdate(oChanges);
		}

		if (oChanges.name === "displayContent") {
			this._assignCollectiveSearchToVisibleList();
		}

		// Dirty?
		this.getLists().forEach(function (oList) {
			oList._observeChanges(oChanges);
		});
	};

	ListCollection.prototype.onShow = function () {
		var oActiveList = this._getVisibleList();
		oActiveList.onShow.apply(oActiveList, arguments);
	};

	ListCollection.prototype.onHide = function () {
		var oActiveList = this._getVisibleList();
		oActiveList.onHide.apply(oActiveList, arguments);
	};


	ListCollection.prototype._handleListsUpdate = function (oChanges) {
		if (oChanges.mutation === "insert") {
			if (oChanges.child.setCollectiveSearchSelect) {
				this._updateSelectModel();
			}
		}
	};

	ListCollection.prototype._handleConfirmed = function (oEvent) {
		this.fireConfirmed(oEvent.getParameters());
	};

	ListCollection.prototype._handleCanceled = function (oEvent) {
		this.fireCanceled(oEvent.getParameters());
	};

	ListCollection.prototype._handleSelect = function (oEvent) {
		this.fireSelect(oEvent.getParameters());
	};


	ListCollection.prototype._assignCollectiveSearchToVisibleList = function (oChanges) {
		this._retrieveCollectiveSearchSelect().then(function (oSelect) {
			var oList = this._getVisibleList();
			oList.setCollectiveSearchSelect(oSelect);
		}.bind(this));
	};

	ListCollection.prototype.getContent = function () {
		var oVisibleList = this._getVisibleList();
		return oVisibleList.getContent().then(function (oContent) {
			this.setAggregation("displayContent", oContent);
			return oContent;
		}.bind(this));

	};

	ListCollection.prototype.onShow = function () {
		Content.prototype.onShow.apply(this, arguments);
		var oVisibleList = this._getVisibleList();
		this._getContainer()._bindContent(oVisibleList);
		oVisibleList.onShow();

	};

	ListCollection.prototype.onHide = function () {
		var oVisibleList = this._getVisibleList();
		this._getContainer()._unbindContent(oVisibleList);
		oVisibleList.onHide();

		Content.prototype.onHide.apply(this, arguments);
	};


	ListCollection.prototype._handleCollectiveSearchSelect = function (oEvent) {
		var oCurrentList = this._getVisibleList();
		this._getContainer()._unbindContent(oCurrentList);
		oCurrentList.onHide();

		this._sVisibleListId = oEvent.getParameter("key");
		var oNextList = this._getVisibleList();
		this.getContent().then(function () {
			this._getContainer()._bindContent(oNextList);
			oNextList.onShow();
		}.bind(this));
	};

	ListCollection.prototype._updateSelectModel = function () {
		if (this._oSelectModel) {
			var aLists = this.getLists();
			var oModelData = aLists.reduce(function (oResult, oCurrent) {
				oResult.lists.push({key: oCurrent.getId(), text: oCurrent.getFormattedTitle()});
				return oResult;
			} , {lists: []});
			this._oSelectModel.setData(oModelData);
		}
	};

	ListCollection.prototype._retrieveCollectiveSearchSelect = function () {
		return this._retrievePromise("collectiveSearchSelect", function () {
			return loadModules([
				"sap/ui/mdc/filterbar/vh/CollectiveSearchSelect",
				"sap/ui/core/Item",
				"sap/ui/model/json/JSONModel"
			]).then(function(aModules) {
				var CollectiveSearchSelect = aModules[0];
				var Item = aModules[1];
				var JSONModel = aModules[2];

				this._oSelectModel = new JSONModel(this);
				this._updateSelectModel();
				this.setModel(this._oSelectModel, "$contenthelp");

				var oItemTemplate = new Item(this.getId() + "-collSearchItem", {
					key: "{$contenthelp>key}",
					text: "{$contenthelp>text}",
					enabled: true
					/*textDirection: "{$contenthelp>textDirection}" */
				});

				var oCollectiveSearchSelect = new CollectiveSearchSelect(this.getId() + "-collSearch", {
					items: {path: "$contenthelp>/lists", template: oItemTemplate},
					select: this._handleCollectiveSearchSelect.bind(this),
					selectedItemKey: this._oSelectModel.getProperty("/lists/0/key")
				});
				oCollectiveSearchSelect.setModel(this._oSelectModel, "$contenthelp");
				return oCollectiveSearchSelect;
			}.bind(this));
		}.bind(this));

	};

	ListCollection.prototype.exit = function () {
		this._oSelectModel = null;
		this._iVisibleListIndex = null;
		Content.prototype.exit.apply(this, arguments);
	};

	return ListCollection;
});
