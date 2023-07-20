/*!
 * ${copyright}
 */

sap.ui.define(
	[
		"sap/m/p13n/BasePanel",
		"sap/ui/model/FilterOperator",
		"sap/m/List",
		"sap/base/util/merge",
		"sap/m/CustomListItem",
		"sap/m/library",
		"sap/m/HBox",
		"sap/m/VBox",
		"sap/m/Button",
		"sap/m/Input",
		"sap/m/Select",
		"sap/ui/core/ListItem",
		"sap/m/ComboBox",
		"sap/ui/layout/cssgrid/CSSGrid",
		"sap/ui/layout/cssgrid/GridItemLayoutData",
		"sap/base/util/uid"
	],
	function (
		BasePanel,
		FilterOperator,
		List,
		merge,
		CustomListItem,
		mLibrary,
		HBox,
		VBox,
		Button,
		Input,
		Select,
		ListItem,
		ComboBox,
		CSSGrid,
		GridItemLayoutData,
		uid
	) {
		"use strict";
		//Constants config for Filter Panel
		const DEFAULT_FILTER_OPERATIONS = FilterOperator.Contains;
		const FILTER_OPERATIONS = [
			{ operator: FilterOperator.Contains, label: "p13n.FILTER_OPERATOR_CONTAINS" },
			{ operator: FilterOperator.NotContains, label: "p13n.FILTER_OPERATOR_NOT_CONTAINS" },
			{ operator: FilterOperator.EQ, label: "p13n.FILTER_OPERATOR_EQ" },
			{ operator: FilterOperator.GE, label: "p13n.FILTER_OPERATOR_GE" },
			{ operator: FilterOperator.GT, label: "p13n.FILTER_OPERATOR_GT" },
			{ operator: FilterOperator.LE, label: "p13n.FILTER_OPERATOR_LE" },
			{ operator: FilterOperator.LT, label: "p13n.FILTER_OPERATOR_LT" },
			{ operator: FilterOperator.NE, label: "p13n.FILTER_OPERATOR_NE" },
			{ operator: FilterOperator.StartsWith, label: "p13n.FILTER_OPERATOR_STARTSWITH" },
			{ operator: FilterOperator.EndsWith, label: "p13n.FILTER_OPERATOR_ENDSWITH" },
			{ operator: FilterOperator.NotStartsWith, label: "p13n.FILTER_OPERATOR_NOTSTARTSWITH" },
			{ operator: FilterOperator.NotEndsWith, label: "p13n.FILTER_OPERATOR_NOTENDSWITH" }
		];
		const GRID_COLUMN_COUNT = 12;
		/**
		 * Constructor for a new FilterPanel.
		 *
		 * @param {string} [sId] ID for the new control. It is generated automatically if an ID is not provided.
		 * @param {object} [mSettings] Initial settings for the new control.
		 *
		 * @class Create filter panel in p13n dialog that allows a user to create filter criteria for the UploadSetWithTable columns.
		 * @extends sap.m.p13n.BasePanel
		 *
		 * @author SAP SE
		 *
		 * @constructor
		 * @private
		 * @experimental
		 * @internal
		 * @alias sap.m.upload.FilterPanel
		 */
		const FilterPanel = BasePanel.extend("sap.m.upload.FilterPanel", {
			metadata: {
				properties: {
					/**
					 * A short text describing the panel.
					 * <b>Note:</b> This text is displayed only if the panel is being used in a <code>sap.m.p13n.Popup</code>.
					 */
					title: {
						type: "string",
						defaultValue: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("p13n.DEFAULT_TITLE_FILTER")
					},
					fields: { type: "sap.m.FilterPanelField[]", defaultValue: [] }
				}
			},
			renderer: {
				apiVersion: 2
			}
		});

		FilterPanel.prototype.applySettings = function () {
			BasePanel.prototype.applySettings.apply(this, arguments);
			this._setTemplate(this._getListTemplate());
		};

		FilterPanel.prototype.init = function () {
			BasePanel.prototype.init.apply(this, arguments);
			this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			this._bFocusOnRearrange = false;
			this.setEnableReorder(true);
			this.addStyleClass("sapMP13nQueryPanel");

			// Add button
			const addButton = this._createAddButton();
			addButton.setLayoutData(new GridItemLayoutData({ gridColumn: `1 / ${GRID_COLUMN_COUNT}` }));

			const gridContainer = new VBox({
				items: [this._getCSSGrid([addButton])]
			});
			gridContainer.addStyleClass("sapUiTinyMargin");

			const vBox = this.getAggregation("_content");
			vBox.addItem(gridContainer);
		};

		FilterPanel.prototype._createInnerListControl = function () {
			return new List(this.getId() + "-innerP13nList", {
				itemPress: [this._onItemPressed, this],
				dragDropConfig: this._getDragDropConfig()
			});
		};

		/**
		 * Sets the personalization state of the panel instance.
		 *
		 * @private
		 * @param {sap.m.p13n.Item[]} aP13nData An array containing the personalization state that is represented by the <code>FilterPanel</code>.
		 * @returns {this} The FilterPanel instance
		 */
		FilterPanel.prototype.setP13nData = function (aP13nData) {
			aP13nData = merge([], aP13nData);
			BasePanel.prototype.setP13nData.call(this, aP13nData);
			return this;
		};

		FilterPanel.prototype.getP13nData = function (bOnlyActive) {
			const aItems = this._getP13nModel().getProperty("/items");

			return merge(
				[],
				aItems.filter(function (entry) {
					return !!entry.path && !!entry.operator;
				})
			);
		};

		FilterPanel.prototype._getListTemplate = function () {
			const keySelect = this._createKeySelect(),
				filterOperator = this._createFilterOperationSelect(),
				filterValue = this._createSearchCriteriaInput();
			const filterControlContainer = new HBox({
				items: [
					new VBox({ width: "100%", items: [keySelect] }).addStyleClass("sapUiTinyMarginEnd"),
					new VBox({ width: "100%", items: [filterOperator] })
				]
			});
			filterControlContainer.setLayoutData(
				new GridItemLayoutData({ gridColumn: `1 / ${GRID_COLUMN_COUNT}`, gridRow: "1" })
			);
			filterValue.setLayoutData(new GridItemLayoutData({ gridColumn: `1 / ${GRID_COLUMN_COUNT}`, gridRow: "2" }));

			const removeButton = this._createRemoveButton();
			removeButton.setLayoutData(
				new GridItemLayoutData({
					gridColumn: `${GRID_COLUMN_COUNT} / ${GRID_COLUMN_COUNT + 1}`,
					gridRow: "1 / 3"
				})
			);

			return new CustomListItem({
				type: mLibrary.ListType.Active,
				content: [
					new VBox({ items: [this._getCSSGrid([filterControlContainer, filterValue, removeButton])] }).addStyleClass(
						"sapUiTinyMargin"
					)
				]
			});
		};

		FilterPanel.prototype._getCSSGrid = function (items) {
			return new CSSGrid({
				gridTemplateColumns: `repeat(${GRID_COLUMN_COUNT - 1}, 1fr) minmax(32px, 1fr)`,
				gridTemplateRows: "repeat(2, 1fr)",
				gridColumnGap: "0.3rem",
				items: items
			});
		};

		FilterPanel.prototype._getAvailableItems = function () {
			if (!this.getFields()) {
				return [];
			}
			return this.getFields().map(function (entry) {
				return new ListItem({ key: entry.path, text: entry.label });
			});
		};

		FilterPanel.prototype._createKeySelect = function (oItem) {
			return new ComboBox({
				width: "100%",
				items: this._getAvailableItems(),
				selectedKey: `{${this.P13N_MODEL}>path}`
			});
		};

		FilterPanel.prototype._createFilterOperationSelect = function (oItem) {
			return new Select({
				width: "100%",
				selectedKey: `{${this.P13N_MODEL}>operator}`,
				items: FILTER_OPERATIONS.map(
					function (entry) {
						return new ListItem({
							key: entry.operator,
							text: this._oRb.getText(entry.label)
						});
					}.bind(this)
				)
			});
		};

		FilterPanel.prototype._createSearchCriteriaInput = function (oItem) {
			return new Input({ value: `{${this.P13N_MODEL}>value}` });
		};

		FilterPanel.prototype._createAddButton = function () {
			return new HBox({
				justifyContent: mLibrary.FlexJustifyContent.End,
				items: [
					new Button({
						text: this._oRb.getText("p13n.ADD_FILTER_CRITERIA"),
						press: function () {
							const aItems = this._getP13nModel().getProperty("/items");
							aItems.push({ name: uid(), operator: DEFAULT_FILTER_OPERATIONS});
							this.setP13nData(aItems);
						}.bind(this)
					})
				]
			});
		};

		FilterPanel.prototype._createRemoveButton = function () {
			return new VBox({
				alignItems: mLibrary.FlexAlignItems.End,
				justifyContent: mLibrary.FlexJustifyContent.End,
				items: [
					new Button({
						type: mLibrary.ButtonType.Transparent,
						icon: "sap-icon://decline",
						press: function (oEvt) {
							// Find list item
							let item = oEvt.getSource();

							// Traverse up the control hierarchy to find the ColumnListItem
							while (item && !(item instanceof CustomListItem)) {
								item = item.getParent();
							}
							if (!(item instanceof CustomListItem)) {
								return;
							}
							// Remove item from model
							const aItems = this._getP13nModel().getProperty("/items"),
								iIndex = aItems.indexOf(this._getModelEntry(item));
							aItems.splice(iIndex, 1);
							this.setP13nData(aItems);
						}.bind(this)
					})
				]
			});
		};

		return FilterPanel;
	}
);
