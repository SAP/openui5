/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/table/columnmenu/QuickActionBase",
	"sap/m/StepInput",
	"sap/m/library",
	"sap/ui/core/Lib"
], function (
	QuickActionBase,
	StepInput,
	library,
	Library
) {
	"use strict";

	/**
	 * Constructor for a new <code>QuickResize</code>.
	 *
	 * @param {string} [sId] ID for the new <code>QuickResize</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>QuickResize</code>
	 *
	 * @class
	 * The <code>QuickResize</code> class is used for quick resizing of columns via the <code>sap.m.table.columnmenu.Menu</code>.
	 * It can be used to specify quick actions for accessible column resizing.
	 *
	 * @extends sap.m.table.columnmenu.QuickActionBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.137
	 *
	 * @alias sap.m.table.columnmenu.QuickResize
	 */
	var QuickResize = QuickActionBase.extend("sap.m.table.columnmenu.QuickResize", {

		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The width of the column.
				 *
				 * <b>Note</b>: This property is used to set the initial value of the input control. The <code>QuickResize</code> doesn't have a
				 * built-in mechanism to automatically determine the value from the actual column width.
				 */
				width: { type: "int", defaultValue: 200 }
			},
			aggregations: {
				/**
				 * The content of the <code>QuickResize</code>.
				 *
				 * @private
				 */
				_content: { type: "sap.ui.core.Control", visibility: "hidden" }
			},
			events: {
				/**
				 * Fires the change event.
				 */
				change: {
					parameters: {
						/**
						 * The new width.
						 */
						width: { type: "int" }
					}
				}
			}
		}
	});

	QuickResize.prototype.getEffectiveQuickActions = function() {
		return this.getVisible() ? [this] : [];
	};

	QuickResize.prototype.getLabel = function() {
		const oBundle = Library.getResourceBundleFor("sap.m");
		return oBundle.getText("table.COLUMNMENU_QUICK_RESIZE_LABEL");
	};

	QuickResize.prototype.getContent = function() {
		if (!this.getAggregation("_content")) {
			this._createContent();
		}
		return this.getAggregation("_content");
	};

	QuickResize.prototype.getCategory = function() {
		return library.table.columnmenu.Category.Generic;
	};

	QuickResize.prototype.getContentSize = function() {
		return library.InputListItemContentSize.L;
	};

	QuickResize.prototype._createContent = function() {
		const oBundle = Library.getResourceBundleFor("sap.m");
		const RESIZE_STEP = 16;
		const RESIZE_MIN = 3 * RESIZE_STEP;
		const RESIZE_MAX = 160 * RESIZE_STEP;

		const oStepInput = new StepInput({
			min: RESIZE_MIN,
			max: RESIZE_MAX,
			step: RESIZE_STEP,
			width: "120px",
			validationMode: library.StepInputValidationMode.LiveChange,
			validationError: function(oEvent) {
				const oStepInput = oEvent.getSource();
				const aViolatedConstraints = oEvent.getParameter("exception").violatedConstraints;

				if (aViolatedConstraints.includes('minimum')) {
					const sMinErrorText = oBundle.getText("table.COLUMNMENU_QUICK_RESIZE_MIN_ERROR", [RESIZE_MIN]);
					oStepInput.setValueStateText(sMinErrorText);
				} else {
					const sMaxErrorText = oBundle.getText("table.COLUMNMENU_QUICK_RESIZE_MAX_ERROR", [RESIZE_MAX]);
					oStepInput.setValueStateText(sMaxErrorText);
				}
			},
			change: [
				function(oEvent) {
					const iValue = oEvent.getSource().getValue();
					this.fireChange({width: iValue});
				}, this
			]
		});
		this.addAggregation("_content", oStepInput, true);
	};

	QuickResize.prototype.setWidth = function(iValue) {
		this.setProperty("width", iValue);
		this.getContent()[0].setValue(iValue);
		return this;
	};

	return QuickResize;
});