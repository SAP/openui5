/*!
 * ${copyright}
 */

// Provides control sap.uxap.HierarchicalSelect.
sap.ui.define(["jquery.sap.global", "sap/m/Select", "sap/ui/Device", "./library"], function (jQuery, Select, Device, library) {
	"use strict";

	/**
	 * Constructor for a new HierarchicalSelect.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A select that display items on 2 level of hierarchy.
	 * If a provided item has a custom data named "secondLevel", then it will be displayed as a second level, otherwise it would be displayed as a first level.
	 * @extends sap.m.Select
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @since 1.26
	 * @alias sap.uxap.HierarchicalSelect
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HierarchicalSelect = Select.extend("sap.uxap.HierarchicalSelect", /** @lends sap.uxap.HierarchicalSelect.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * Determines whether the HierarchicalSelect items are displayed in upper case.
				 */
				upperCase: {type: "boolean", group: "Appearance", defaultValue: false}
			}
		}
	});

	HierarchicalSelect.POPOVER_MIN_WIDTH_REM = 11;

	HierarchicalSelect.prototype.onAfterRenderingPicker = function () {

		Select.prototype.onAfterRenderingPicker.call(this);

		var aItems = this.getItems() || [];

		aItems.forEach(function (oItem) {
			var sClass = (oItem.data("secondLevel") === true) ? "sapUxAPHierarchicalSelectSecondLevel" : "sapUxAPHierarchicalSelectFirstLevel";

			oItem.$().addClass(sClass);
		}, this);
	};


	HierarchicalSelect.prototype.setUpperCase = function (bValue, bSuppressInvalidate) {

		this.setProperty("upperCase", bValue, bSuppressInvalidate);
		this.toggleStyleClass("sapUxAPHierarchicalSelectUpperCase", bValue);
		var oPicker = this.getAggregation("picker");
		if (oPicker) {
			oPicker.toggleStyleClass("sapMSltPickerFirstLevelUpperCase", bValue);
			if (!bSuppressInvalidate) {
				oPicker.invalidate();
			}
		}
		return this;
	};

	/**
	 * Keyboard handling requirement to have the same behavior on [ENTER] key
	 * as on [SPACE] key (namely, to toggle the open state the select dropdown)
	 */
	HierarchicalSelect.prototype.onsapenter = Select.prototype.onsapspace;

	/**
	 * Keyboard handling of [UP], [PAGE-UP], [PAGE-DOWN], [HOME], [END] keys
	 * Stops propagation to avoid triggering the listeners for the same keys of the parent control (the AnchorBar)
	 */
	["onsapup", "onsappageup", "onsappagedown", "onsaphome", "onsapend"].forEach(function (sName) {
		HierarchicalSelect.prototype[sName] = function (oEvent) {
			Select.prototype[sName].call(this, oEvent);
			oEvent.stopPropagation();
		};
	});

	HierarchicalSelect.prototype._createDialog = function () {

		var oDialog = Select.prototype._createDialog.call(this);

		oDialog.getCustomHeader().addStyleClass("sapUxAPHierarchicalSelect");

		return oDialog;

	};

	/**
	 * Decorate a Popover instance by adding some private methods.
	 *
	 * We are overriding function from sap.m.Select
	 * in order to redefine position of popover
	 *
	 * @param {sap.m.Popover}
	 * @private
	 */
	HierarchicalSelect.prototype._decoratePopover = function (oPopover) {

		Select.prototype._decoratePopover.call(this, oPopover);

		oPopover._adaptPositionParams = function () {
			this._marginTop = 0;
			this._marginLeft = 0;
			this._marginRight = 0;
			this._marginBottom = 0;

			this._arrowOffset = 0;
			this._offsets = ["0 0", "0 0", "0 0", "0 0"];

			this._myPositions = ["end bottom", "end center", "end top", "begin center"];
			this._atPositions = ["end top", "end center", "end bottom", "begin center"];
		};

		// offset the popup to make it cover the scrollbar (to avoid having page-scrollbar and popup-scrollbar appearing next to each other)
		if (Device.system.tablet || Device.system.desktop) {
			var fRight = jQuery.position.scrollbarWidth();
			if (fRight > 0) {
				oPopover.setOffsetX(fRight);
			}
		}
	};

	/**
	 * Overriding function from sap.m.Select to access min-width of the popover
	 * in order to ensure that min-width is not smaller than sap.uxap.HierarchicalSelect.POPOVER_MIN_WIDTH_REM
	 */
	HierarchicalSelect.prototype._onAfterRenderingPopover = function () {

		Select.prototype._onAfterRenderingPopover.call(this);

		// ensure popover min-width is not smaller than sap.uxap.HierarchicalSelect.POPOVER_MIN_WIDTH_REM
		if (Device.system.tablet || Device.system.desktop) {

			var oPopover = this.getPicker(),
				sMinWidth = oPopover.getDomRef().style.minWidth;

			if (jQuery.sap.endsWith(sMinWidth, "rem")) {
				sMinWidth = sMinWidth.substring(0, sMinWidth.length - 3);
				var iMinWidth = parseFloat(sMinWidth);
				if (iMinWidth < HierarchicalSelect.POPOVER_MIN_WIDTH_REM) {
					oPopover._setMinWidth(HierarchicalSelect.POPOVER_MIN_WIDTH_REM + "rem");
				}
			}
		}
	};

	return HierarchicalSelect;
});
