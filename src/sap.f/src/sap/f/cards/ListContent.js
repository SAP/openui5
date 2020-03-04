/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/f/library",
		"sap/f/cards/BaseListContent",
		"sap/m/List",
		"sap/m/StandardListItem",
		"sap/ui/base/ManagedObject",
		"sap/f/cards/IconFormatter",
		"sap/f/cards/BindingHelper"
	],
	function (library, BaseListContent, sapMList, StandardListItem, ManagedObject, IconFormatter, BindingHelper) {
		"use strict";

		var AreaType = library.cards.AreaType;

		/**
		 * Constructor for a new <code>ListContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is a wrapper of a <code>sap.m.List</code> and allows its creation based on a configuration.
		 *
		 * @extends sap.f.cards.BaseListContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.62
		 * @alias sap.f.cards.ListContent
		 */
		var ListContent = BaseListContent.extend("sap.f.cards.ListContent", {
			renderer: {}
		});

		/**
		 * Lazily get a configured <code>sap.m.List</code>.
		 *
		 * @private
		 * @returns {sap.m.List} The inner list
		 */
		ListContent.prototype._getList = function () {

			if (this._bIsBeingDestroyed) {
				return null;
			}

			var oList = this.getAggregation("_content");

			if (!oList) {
				oList = new sapMList({
					id: this.getId() + "-list",
					growing: false,
					showNoData: false,
					showSeparators: "None"
				});
				this.setAggregation("_content", oList);
			}

			return oList;
		};

		/**
		 * Called when control is initialized.
		 */
		ListContent.prototype.init = function () {
			BaseListContent.prototype.init.apply(this, arguments);

			var oList = this._getList();
			var that = this;

			oList.attachUpdateFinished(function () {
				if (that._iVisibleItems) {
					var aItems = oList.getItems();
					for (var i = that._iVisibleItems + 1; i < aItems.length; i++) {
						aItems[i].setVisible(false);
					}
				}
			});

			this._oItemTemplate = new StandardListItem({
				iconDensityAware: false
			});
		};

		/**
		 * Called when control is destroyed.
		 */
		ListContent.prototype.exit = function () {
			BaseListContent.prototype.exit.apply(this, arguments);

			if (this._oItemTemplate) {
				this._oItemTemplate.destroy();
				this._oItemTemplate = null;
			}
		};

		/**
		 * Setter for configuring a <code>sap.f.cards.ListContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal list.
		 * @returns {sap.f.cards.ListContent} Pointer to the control instance to allow method chaining.
		 */
		ListContent.prototype.setConfiguration = function (oConfiguration) {
			BaseListContent.prototype.setConfiguration.apply(this, arguments);

			if (!oConfiguration) {
				return this;
			}

			if (oConfiguration.items) {
				this._setStaticItems(oConfiguration.items);
				return this;
			}

			if (oConfiguration.item) {
				this._setItem(oConfiguration.item);
			}

			return this;
		};

		/**
		 * Handler for when data is changed.
		 */
		ListContent.prototype.onDataChanged = function () {
			this._checkHiddenNavigationItems(this.getConfiguration().item);
		};

		/**
		 * Binds/Sets properties to the inner item template based on the configuration object item template which is already parsed.
		 * Attaches all required actions.
		 *
		 * @private
		 * @param {Object} mItem The item template of the configuration object.
		 */
		ListContent.prototype._setItem = function (mItem) {
			var mSettings = {
				iconDensityAware: false,
				title: mItem.title && (mItem.title.value || mItem.title),
				description: mItem.description && (mItem.description.value || mItem.description),
				highlight: mItem.highlight,
				info: mItem.info && mItem.info.value,
				infoState: mItem.info && mItem.info.state
			};

			if (mItem.icon && mItem.icon.src) {
				mSettings.icon = BindingHelper.formattedProperty(mItem.icon.src, function (sValue) {
					return IconFormatter.formatSrc(sValue, this._sAppId);
				}.bind(this));
			}

			this._oItemTemplate = new StandardListItem(mSettings);
			this._oActions.setAreaType(AreaType.ContentItem);
			this._oActions.attach(mItem, this);

			var oBindingInfo = {
				template: this._oItemTemplate
			};
			this._filterHiddenNavigationItems(mItem, oBindingInfo);
			this._bindAggregation("items", this._getList(), oBindingInfo);
		};

		/**
		 * Create static StandardListItems which will be mapped with the configuration that is passed.
		 *
		 * @private
		 * @param {Array} mItems The list of static items that will be used
		 */
		ListContent.prototype._setStaticItems = function (mItems) {
			var oList = this._getList();
			mItems.forEach(function (oItem) {
				var oListItem = new StandardListItem({
					iconDensityAware: false,
					title: oItem.title ? oItem.title : "",
					description: oItem.description ? oItem.description : "",
					icon: oItem.icon ? oItem.icon : "",
					infoState: oItem.infoState ? oItem.infoState : "None",
					info: oItem.info ? oItem.info : "",
					highlight: oItem.highlight ? oItem.highlight : "None"
				});

				// Here can be called _attachAction so that navigation service can be used
				if (oItem.action) {
					oListItem.setType("Navigation");

					if (oItem.action.url) {
						oListItem.attachPress(function () {
							window.open(oItem.action.url, oItem.target || "_blank");
						});
					}
				}
				oList.addItem(oListItem);
			});

			//workaround until actions refactor
			this.fireEvent("_actionContentReady");
		};

		/**
		 * @overwrite
		 * @returns {sap.m.List} The inner list.
		 */
		ListContent.prototype.getInnerList = function () {
			return this._getList();
		};

		return ListContent;
	}
);
