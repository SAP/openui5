/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseListContent",
	"./TableContentRenderer",
	"sap/ui/integration/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/ProgressIndicator",
	"sap/m/ObjectIdentifier",
	"sap/m/ObjectStatus",
	"sap/m/Avatar",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/BindingHelper",
	"sap/base/Log"
], function (
	BaseListContent,
	TableContentRenderer,
	library,
	ResponsiveTable,
	Column,
	ColumnListItem,
	Text,
	Link,
	ProgressIndicator,
	ObjectIdentifier,
	ObjectStatus,
	Avatar,
	coreLibrary,
	mobileLibrary,
	BindingResolver,
	BindingHelper,
	Log
) {
	"use strict";

	// shortcut for sap.f.AvatarSize
	var AvatarSize = mobileLibrary.AvatarSize;

	// shortcut for sap.m.AvatarColor
	var AvatarColor = mobileLibrary.AvatarColor;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	// shortcuts for sap.m.* types
	var ListSeparators = mobileLibrary.ListSeparators;
	var ListType = mobileLibrary.ListType;

	// shortcuts for sap.ui.integration.CardActionArea
	var ActionArea = library.CardActionArea;

	/**
	 * Constructor for a new <code>TableContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 *
	 * <h3>Usage</h3>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * @extends sap.ui.integration.cards.BaseListContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.65
	 * @alias sap.ui.integration.cards.TableContent
	 */
	var TableContent = BaseListContent.extend("sap.ui.integration.cards.TableContent", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: TableContentRenderer
	});

	TableContent.prototype.exit = function () {
		BaseListContent.prototype.exit.apply(this, arguments);

		if (this._oItemTemplate) {
			this._oItemTemplate.destroy();
			this._oItemTemplate = null;
		}
	};

	TableContent.prototype._getTable = function () {

		if (this._bIsBeingDestroyed) {
			return null;
		}

		var oTable = this.getAggregation("_content");

		if (!oTable) {
			oTable = new ResponsiveTable({
				id: this.getId() + "-Table",
				showSeparators: ListSeparators.None
			});
			this.setAggregation("_content", oTable);
		}

		return oTable;
	};

	/**
	 * @override
	 */
	TableContent.prototype.setConfiguration = function (oConfiguration) {
		BaseListContent.prototype.setConfiguration.apply(this, arguments);
		oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration) {
			return this;
		}

		if (oConfiguration.rows && oConfiguration.columns) {
			this._setStaticColumns(oConfiguration.rows, oConfiguration.columns);
			return this;
		}

		if (oConfiguration.row && oConfiguration.row.columns) {
			this._setColumns(oConfiguration.row);
		}

		return this;
	};

	/**
	 * @override
	 */
	TableContent.prototype.getStaticConfiguration = function () {
		var aRows = this.getInnerList().getItems(),
			oConfiguration = this.getParsedConfiguration(),
			bHasGroups = aRows[0] && aRows[0].isA("sap.m.GroupHeaderListItem"),
			aHeaders = [],
			aResolvedRows = [],
			aResolvedGroups = [],
			oResolvedRow,
			oResolvedGroup;

		(oConfiguration.row.columns || []).forEach(function (oColumn) {
			oColumn = BindingResolver.resolveValue(oColumn, this, this.getBindingContext().getPath());

			aHeaders.push({
				title: oColumn.title,
				width: oColumn.width,
				hAlign: oColumn.hAlign,
				visible: oColumn.visible,
				identifier: oColumn.identifier
			});
		}.bind(this));

		aRows.forEach(function (oRow) {
			if (oRow.isA("sap.m.GroupHeaderListItem")) {
				if (oResolvedGroup) {
					aResolvedGroups.push(oResolvedGroup);
				}

				aResolvedRows = [];
				oResolvedGroup = {
					title: oRow.getTitle(),
					rows: aResolvedRows
				};
			} else {
				oResolvedRow = BindingResolver.resolveValue(oConfiguration.row, this, oRow.getBindingContext().getPath());

				(oResolvedRow.columns || []).forEach(function (oColumn) {
					delete oColumn.title;
					delete oColumn.width;
					delete oColumn.hAlign;
					delete oColumn.visible;
					delete oColumn.identifier;
				});

				aResolvedRows.push(oResolvedRow);
			}
		}.bind(this));

		if (oResolvedGroup) {
			aResolvedGroups.push(oResolvedGroup);
		}

		var oStaticConfiguration = {
			headers: aHeaders
		};

		if (bHasGroups) {
			oStaticConfiguration.groups = aResolvedGroups;
		} else {
			oStaticConfiguration.rows = aResolvedRows;
		}

		return oStaticConfiguration;
	};

	/**
	 * Handler for when data is changed.
	 */
	TableContent.prototype.onDataChanged = function () {
		this._handleNoItemsError(this.getParsedConfiguration().row);
		this._checkHiddenNavigationItems(this.getParsedConfiguration().row);
	};

	/**
	 * Binds/Sets properties to the inner item template based on the configuration object row template which is already parsed.
	 * Attaches all required actions.
	 *
	 * @private
	 * @param {Object} oRow The item template of the configuration object.
	 */
	TableContent.prototype._setColumns = function (oRow) {
		var aCells = [],
			oTable = this._getTable(),
			aColumns = oRow.columns;

		aColumns.forEach(function (oColumn) {
			oTable.addColumn(new Column({
				header: new Text({ text: oColumn.title }),
				width: oColumn.width,
				hAlign: oColumn.hAlign,
				visible: oColumn.visible
			}));
			aCells.push(this._createCell(oColumn));
		}.bind(this));

		this._oItemTemplate = new ColumnListItem({
			cells: aCells,
			vAlign: VerticalAlign.Middle
		});

		this._oActions.attach({
			area: ActionArea.ContentItem,
			actions: oRow.actions,
			control: this,
			actionControl: this._oItemTemplate,
			enabledPropertyName: "type",
			enabledPropertyValue: ListType.Active,
			disabledPropertyValue: ListType.Inactive
		});

		var oGroup = this.getParsedConfiguration().group;

		if (oGroup) {
			this._oSorter = this._getGroupSorter(oGroup);
		}

		var oBindingInfo = {
			template: this._oItemTemplate,
			sorter: this._oSorter
		};
		this._bindAggregationToControl("items", oTable, oBindingInfo);
	};

	TableContent.prototype._setStaticColumns = function (aRows, aColumns) {
		var oTable = this._getTable();

		aColumns.forEach(function (oColumn) {
			oTable.addColumn(new Column({
				header: new Text({ text: oColumn.title }),
				width: oColumn.width,
				hAlign: oColumn.hAlign
			}));
		});

		aRows.forEach(function (oRow) {
			var oItem = new ColumnListItem({
				vAlign: VerticalAlign.Middle
			});

			if (oRow.cells && Array.isArray(oRow.cells)) {
				for (var j = 0; j < oRow.cells.length; j++) {
					oItem.addCell(this._createCell(oRow.cells[j]));
				}
			}

			if (oRow.actions && Array.isArray(oRow.actions)) {
				this._oActions.attach({
					area: ActionArea.ContentItem,
					actions: oRow.actions,
					control: this,
					actionControl: oItem,
					enabledPropertyName: "type",
					enabledPropertyValue: ListType.Active,
					disabledPropertyValue: ListType.Inactive
				});
			}
			oTable.addItem(oItem);
		}.bind(this));

		//workaround until actions refactor
		this.fireEvent("_actionContentReady");
	};

	/**
	 * Factory method that returns a control from the correct type for each column.
	 *
	 * @param {object} oColumn Object with settings from the schema.
	 * @returns {sap.ui.core.Control} The control of the proper type.
	 * @private
	 */
	TableContent.prototype._createCell = function (oColumn) {
		var oControl;

		if (oColumn.identifier) {
			if (typeof oColumn.identifier == "object") {
				if (!BindingResolver.isBindingInfo(oColumn.identifier)) {
					Log.warning("Usage of object type for column property 'identifier' is deprecated.", null, "sap.ui.integration.widgets.Card");
				}

				if (oColumn.identifier.url) {
					oColumn.actions = [{
						type: "Navigation",
						parameters: {
							url: oColumn.identifier.url,
							target: oColumn.identifier.target
						}
					}];
				}
			}

			oControl = new ObjectIdentifier({
				title: oColumn.value
			});

			if (oColumn.actions) {
				oControl.setTitleActive(true);

				this._oActions.attach({
					area: ActionArea.ContentItemDetail,
					actions: oColumn.actions,
					control: this,
					actionControl: oControl,
					enabledPropertyName: "titleActive",
					eventName: "titlePress"
				});
			}

			return oControl;
		}

		if (oColumn.url) {
			Log.warning("Usage of column property 'url' is deprecated. Use card actions for navigation.", null, "sap.ui.integration.widgets.Card");

			oColumn.actions = [{
				type: "Navigation",
				parameters: {
					url: oColumn.url,
					target: oColumn.target
				}
			}];
		}

		if (oColumn.actions) {
			oControl = new Link({
				text: oColumn.value
			});

			this._oActions.attach({
				area: ActionArea.ContentItemDetail,
				actions: oColumn.actions,
				control: this,
				actionControl: oControl,
				enabledPropertyName: "enabled"
			});

			return oControl;
		}

		if (oColumn.state) {
			return new ObjectStatus({
				text: oColumn.value,
				state: oColumn.state
			});
		}

		if (oColumn.value) {
			return new Text({
				text: oColumn.value
			});
		}

		if (oColumn.icon) {
			var oSrc = BindingHelper.formattedProperty(oColumn.icon.src, function (sValue) {
				return this._oIconFormatter.formatSrc(sValue);
			}.bind(this));

			return new Avatar({
				src: oSrc,
				displayShape: oColumn.icon.shape,
				displaySize: oColumn.icon.size || AvatarSize.XS,
				tooltip: oColumn.icon.alt,
				initials: oColumn.icon.text,
				backgroundColor: oColumn.icon.backgroundColor || (oColumn.icon.text ? undefined : AvatarColor.Transparent)
			}).addStyleClass("sapFCardIcon");
		}

		if (oColumn.progressIndicator) {
			return new ProgressIndicator({
				percentValue: oColumn.progressIndicator.percent,
				displayValue: oColumn.progressIndicator.text,
				state: oColumn.progressIndicator.state
			});
		}
	};

	/**
	 * @override
	 * @returns {sap.m.Table} The inner table.
	 */
	TableContent.prototype.getInnerList = function () {
		return this._getTable();
	};

	return TableContent;
});
