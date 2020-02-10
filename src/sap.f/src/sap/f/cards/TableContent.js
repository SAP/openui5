/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/f/library",
		"sap/ui/base/ManagedObject",
		"sap/m/Table",
		"sap/f/cards/BaseContent",
		"sap/m/Column",
		"sap/m/ColumnListItem",
		"sap/m/Text",
		"sap/m/Link",
		"sap/m/ProgressIndicator",
		"sap/m/ObjectIdentifier",
		"sap/m/ObjectStatus",
		"sap/f/Avatar",
		"sap/ui/core/library",
		"sap/m/library",
		"sap/f/cards/BindingResolver",
		"sap/f/cards/BindingHelper",
		"sap/f/cards/IconFormatter"
	], function (
		library,
		ManagedObject,
		ResponsiveTable,
		BaseContent,
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
		IconFormatter
	) {
		"use strict";

		// shortcut for sap.f.AvatarSize
		var AvatarSize = library.AvatarSize;

		// shortcut for sap.ui.core.VerticalAlign
		var VerticalAlign = coreLibrary.VerticalAlign;

		// shortcuts for sap.m.* types
		var ListSeparators = mobileLibrary.ListSeparators;
		var ListType = mobileLibrary.ListType;

		var AreaType = library.cards.AreaType;

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
		 * @extends sap.f.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.65
		 * @alias sap.f.cards.TableContent
		 */
		var TableContent = BaseContent.extend("sap.f.cards.TableContent", {
			renderer: {}
		});

		TableContent.prototype.exit = function () {
			BaseContent.prototype.exit.apply(this, arguments);

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
		 * Setter for configuring a <code>sap.f.cards.TableContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal table.
		 * @returns {sap.f.cards.TableContent} Pointer to the control instance to allow method chaining.
		 */
		TableContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);

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
					hAlign: oColumn.hAlign
				}));
				aCells.push(this._createCell(oColumn));
			}.bind(this));

			this._oItemTemplate = new ColumnListItem({
				cells: aCells,
				vAlign: VerticalAlign.Middle
			});

			this._oActions.setAreaType(AreaType.ContentItem);
			this._oActions.attach(oRow, this);

			var oBindingInfo = {
				template: this._oItemTemplate
			};
			this._bindAggregation("items", oTable, oBindingInfo);
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

				// TO DO: move this part to CardActions
				if (oRow.actions && Array.isArray(oRow.actions)) {
					// for now allow only 1 action of type navigation
					var oAction = oRow.actions[0];

					if (oAction.type === ListType.Navigation) {
						oItem.setType(ListType.Navigation);
					}

					if (oAction.url) {
						oItem.attachPress(function () {
							window.open(oAction.url, oAction.target || "_blank");
						});
					}
				}
				oTable.addItem(oItem);
			}.bind(this));

			//workaround until actions refactor
			this.fireEvent("_actionContentReady");
		};

		/**
		 * Factory method that returns a control from the correct type for each column.
		 *
		 * @param {Object} oColumn Object with settings from the schema.
		 * @returns {sap.ui.core.Control} The control of the proper type.
		 * @private
		 */
		TableContent.prototype._createCell = function (oColumn) {

			if (oColumn.url) {
				return new Link({
					text: oColumn.value,
					href: oColumn.url,
					target: oColumn.target || "_blank"
				});
			}

			if (oColumn.identifier) {

				var vTitleActive;

				if (oColumn.identifier.url) {
					vTitleActive = BindingHelper.formattedProperty(oColumn.identifier.url, function (sValue) {
						if (typeof sValue === "string") {
							return true;
						}
						return false;
					});
				}

				var oIdentifier = new ObjectIdentifier({
					title: oColumn.value,
					titleActive: vTitleActive
				});

				if (oColumn.identifier.url) {
					// TO DO: move this part to CardActions
					oIdentifier.attachTitlePress(function (oEvent) {

						var oSource = oEvent.getSource(),
							oBindingContext = oSource.getBindingContext(),
							oModel = oSource.getModel(),
							sPath,
							sUrl,
							sTarget;

						if (oBindingContext) {
							sPath = oBindingContext.getPath();
						}

						sUrl = BindingResolver.resolveValue(oColumn.identifier.url, oModel, sPath);
						sTarget = BindingResolver.resolveValue(oColumn.identifier.target, oModel, sPath);

						if (sUrl) {
							window.open(sUrl, sTarget || "_blank");
						}
					});
				}

				return oIdentifier;
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
				var vSrc = BindingHelper.formattedProperty(oColumn.icon.src, function (sValue) {
					return IconFormatter.formatSrc(sValue, this._sAppId);
				}.bind(this));
				return new Avatar({
					src: vSrc,
					displayShape: oColumn.icon.shape,
					displaySize: AvatarSize.XS
				});
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
		 * @overwrite
		 * @returns {sap.m.Table} The inner table.
		 */
		TableContent.prototype.getInnerList = function () {
			return this._getTable();
		};

		return TableContent;
});
