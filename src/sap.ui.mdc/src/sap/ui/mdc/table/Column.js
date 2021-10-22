/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element", "sap/m/Label", "sap/ui/core/Core"
], function(Element, Label, Core) {
	"use strict";

	/**
	 * Constructor for a new Column.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The column for the metadata driven table, that hold the template to be shown when the rows has data.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.58
	 * @alias sap.ui.mdc.table.Column
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var Column = Element.extend("sap.ui.mdc.table.Column", {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "template",
			properties: {
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},
				minWidth: {
					type: "float",
					group: "Behavior",
					defaultValue: 8
				},
				header: {
					type: "string"
				},
				/**
				 * Defines whether the column header is visible
				 * @since 1.78
				 */
				headerVisible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				hAlign: {
					type: "sap.ui.core.HorizontalAlign",
					defaultValue: "Begin"
				},
				importance: {
					type: "sap.ui.core.Priority",
					group: "Behavior",
					defaultValue: "None"
				},
				/*
				 * Only used during creation of table for initial/1st rendering, 0 based index
				 */
				// TODO: Delete!
				initialIndex: {
					type: "int",
					defaultValue: -1
				},
				dataProperty: {
					type: "string"
				}
			},
			events: {},
			aggregations: {
				template: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				creationTemplate: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		}
	});

	Column.prototype.init = function() {
		// Skip propagation of properties (models and bindingContexts).
		this.mSkipPropagation = {
			template: true,
			creationTemplate: true
		};
	};

	// Return the clone of the template set by the app on the column
	Column.prototype.getTemplate = function(bClone) {
		var oTemplate = this.getAggregation("template");

		if (bClone && this._oTemplateClone && this._oTemplateClone.bIsDestroyed) {
			this._oTemplateClone = null;
		}

		// clone the template control
		if (!this._oTemplateClone && oTemplate) {
			this._oTemplateClone = oTemplate.clone();
		}

		return bClone ? this._oTemplateClone : oTemplate;
	};

	Column.prototype.getCreationTemplate = function(bClone) {
		var oCreationTemplate = this.getAggregation("creationTemplate");

		if (bClone && this._oCreationTemplateClone && this._oCreationTemplateClone.bIsDestroyed) {
			this._oCreationTemplateClone = null;
		}

		// clone the creationTemplate control
		if (!this._oCreationTemplateClone && oCreationTemplate) {
			this._oCreationTemplateClone = oCreationTemplate.clone();
		}

		return bClone ? this._oCreationTemplateClone : oCreationTemplate;
	};

	Column.prototype.setHeaderVisible = function(bHeaderVisible) {
		if (this.getHeaderVisible() === bHeaderVisible) {
			return this;
		}

		this.setProperty("headerVisible", bHeaderVisible, true);
		this._updateColumnHeaderControl();
		return this;
	};

	Column.prototype.setHeader = function(sHeader) {
		this.setProperty("header", sHeader, true);
		this._updateColumnHeaderControl();
		var oLabelElement = this.getDomRef();
		if (oLabelElement) {
			oLabelElement.textContent = this.getHeader();
		}

		return this;
	};

	Column.prototype.setHAlign = function(sHAlign) {
		this.setProperty("hAlign", sHAlign, true);
		this._updateColumnHeaderControl();
		return this;
	};

	/**
	 * Updates the width of the column based on the auto column width calculation.
	 * @private
	 */
	Column.prototype._updateColumnWidth = function(sWidth) {
		var oInnerColumn = Core.byId(this.getId() + "-innerColumn");
		if (!oInnerColumn || !this.getWidth()) {
			this.setProperty("width", sWidth);
		}

		// set the inner column width only if there is no user(flex) changes has been applied
		if (oInnerColumn && !oInnerColumn.getWidth()) {
			oInnerColumn.setWidth(sWidth);
		}
	};

	/**
	 * Updates the column header control based on the current column property settings.
	 * @private
	 */
	Column.prototype._updateColumnHeaderControl = function() {
		if (this._oColumnHeaderLabel) {
			this._oColumnHeaderLabel.setWidth(this.getHeaderVisible() ? null : "0px");
			this._oColumnHeaderLabel.setWrapping(this._bMobileTable && !this._bResizable && this.getHeaderVisible());
			this._oColumnHeaderLabel.setText(this.getHeader());
			this._oColumnHeaderLabel.setTextAlign(this.getHAlign());
		}
	};

	/**
	 * Updates the resizable state of the column.
	 * @private
	 */
	Column.prototype.updateColumnResizing = function(bEnabled) {
		this._bResizable = !!bEnabled;
		this._updateColumnHeaderControl();
	};

	Column.prototype.setParent = function(oParent) {
		var oPrevParent = this.getParent();
		Element.prototype.setParent.apply(this, arguments);
		if (oParent && oParent.isA("sap.ui.mdc.Table")) {
			if (oParent.getDomRef()) {
				this._addAriaStaticDom();
			} else {
					this.oAfterRenderingDelegate = {
					onAfterRendering: function () {
						this._addAriaStaticDom();
						this.getParent().removeDelegate(this.oAfterRenderingDelegate);
					}
				};
				oParent.addDelegate(this.oAfterRenderingDelegate, this);
			}
		} else if (!oParent) {
			oPrevParent.removeDelegate(this.oAfterRenderingDelegate);
			this._removeAriaStaticDom();
		}
	};

	/**
	 * Creates and returns the column header control.
	 * If <code>headerVisible=false</code> then, <code>width=0px</code> is applied to the sap.m.Label control for accessibility purpose.
	 * @param {boolean} bMobileTable - indicates the type of the table
	 * @param {boolean} bResizing - indicates whether the column is resizable
	 * @returns {object} column header control
	 * @private
	 */
	Column.prototype.getColumnHeaderControl = function(bMobileTable, bResizing) {
		if (this._oColumnHeaderLabel) {
			this._oColumnHeaderLabel.destroy();
		}

		this._oColumnHeaderLabel = new Label(this.getId() + "-innerColumnHeader", {
			wrappingType: bMobileTable ? "Hyphenated" : null
		});
		this._bMobileTable = bMobileTable;

		this.updateColumnResizing(bResizing);

		return this._oColumnHeaderLabel;
	};

	Column.prototype._removeAriaStaticDom = function() {
		var oDomElement = this.getDomRef();

		if (oDomElement) {
			oDomElement.parentNode.removeChild(oDomElement);
		}
	};

	Column.prototype._addAriaStaticDom = function() {
		var oInvisibleDiv = document.createElement("div");
		oInvisibleDiv.setAttribute("id", this.getId());
		oInvisibleDiv.setAttribute("class", "sapUiInvisibleText");
		oInvisibleDiv.setAttribute("aria-hidden", "true");
		var oHeaderTextNode = document.createTextNode(this.getHeader());
		oInvisibleDiv.appendChild(oHeaderTextNode);
		var oStaticDiv = Core.getStaticAreaRef();

		if (oInvisibleDiv && oStaticDiv) {
			oStaticDiv.appendChild(oInvisibleDiv);
		}
	};

	Column.prototype.exit = function() {
		if (this._oTemplateClone) {
			this._oTemplateClone.destroy();
			this._oTemplateClone = null;
		}

		if (this._oCreationTemplateClone) {
			this._oCreationTemplateClone.destroy();
			this._oCreationTemplateClone = null;
		}

		if (this._oColumnHeaderLabel) {
			this._oColumnHeaderLabel.destroy();
			this._oColumnHeaderLabel = null;
		}
		this._removeAriaStaticDom();
	};

	return Column;

});
