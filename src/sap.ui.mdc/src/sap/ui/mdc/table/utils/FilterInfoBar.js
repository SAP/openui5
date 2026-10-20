/*!
 * ${copyright}
 */
sap.ui.define([
	"./Personalization",
	"sap/m/Toolbar",
	"sap/m/ToolbarRenderer",
	"sap/m/ToolbarSpacer",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/Lib",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Element"
], (
	PersonalizationUtils,
	Toolbar,
	ToolbarRenderer,
	ToolbarSpacer,
	Text,
	Button,
	mLibrary,
	Library,
	InvisibleText,
	Element
) => {
	"use strict";

	/**
	 * Constructor for a new FilterInfoBar.
	 *
	 * @class
	 * The <code>FilterInfoBar</code> control provides an easy way of displaying filter information in the table.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @extends sap.m.Toolbar
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.mdc.table.utils.FilterInfoBar
	 */
	const FilterInfoBar = Toolbar.extend("sap.ui.mdc.table.utils.FilterInfoBar", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				infoText: {type: "string"}
			},
			associations: {
				table: {type: "sap.ui.mdc.ListTableBase"}
			}
		},
		renderer: ToolbarRenderer
	});

	FilterInfoBar.prototype.init = function() {
		Toolbar.prototype.init.apply(this, arguments);
		this.oText = new Text({wrapping: false});
		this.oInvisibleText = new InvisibleText().toStatic();
		this.oRemoveAllFiltersBtn = new Button({
			type: mLibrary.ButtonType.Transparent,
			press: () => {
				const oTable = Element.getElementById(this.getTable());
				PersonalizationUtils.createClearFiltersChange(oTable);
			},
			icon: "sap-icon://decline",
			tooltip: Library.getResourceBundleFor("sap.ui.mdc").getText("infobar.REMOVEALLFILTERS")
		});
		this.setDesign("Info");
		this.setActive(true);
		this.addContent(this.oText);
		this.addContent(new ToolbarSpacer());
		this.addContent(this.oRemoveAllFiltersBtn);
		this.addDependent(this.oInvisibleText);
		this.attachPress(() => {
			const oTable = Element.getElementById(this.getTable());
			PersonalizationUtils.openFilterDialog(oTable, () => {
				// Because the filter info bar was pressed, it must have had the focus when opening the dialog. When removing all filters in
				// the dialog and confirming, the filter info bar will be hidden, and the dialog tries to restore the focus on the hidden filter
				// info bar. To avoid a focus loss, the table gets the focus.
				if (!this.getVisible()) {
					oTable.focus();
				}
			});
		});
	};

	FilterInfoBar.prototype.onBeforeRendering = function() {
		// If the filter info bar gets hidden when it, or an element inside it, has the focus,
		// the focus must move to the table to avoid focus loss.
		if (!this.getVisible() && this.getDomRef()?.contains(document.activeElement)) {
			Element.getElementById(this.getTable())?.focus();
		}
	};

	FilterInfoBar.prototype.getVisible = function() {
		return !!this.getInfoText();
	};

	FilterInfoBar.prototype.setInfoText = function(sText) {
		this.setProperty("infoText", sText);
		this.oText.setText(sText);
		this.oInvisibleText.setText(sText);
		return this;
	};

	/**
	 * Provides the ID of the invisible text created by the <code>FilterInfoBar</code>. Can be used to set ARIA labels correctly.
	 *
	 * @returns {string} ID of the invisible text control
	 */
	FilterInfoBar.prototype.getACCTextId = function() {
		return this.oInvisibleText.getId();
	};

	return FilterInfoBar;
});