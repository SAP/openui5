/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/OverflowToolbar',
	"sap/ui/core/Lib",
	"sap/ui/mdc/util/InfoBarRenderer",
	"sap/m/Text",
	"sap/ui/core/InvisibleText",
	"sap/m/Label",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/ToolbarSpacer"
], (Control, Toolbar, Library, InfoBarRenderer, Text, InvisibleText, Label, Button, mLibrary, ToolbarSpacer) => {
	"use strict";

	/**
	 * Constructor for a new InfoBar.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>InfoBar</code> control provides an easy way of displaying filter information inside an <code>sap.ui.mdc.Chart</code> and an <code>sap.ui.mdc.Table</code>.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.111.0
	 * @alias sap.ui.mdc.util.InfoBar
	 */
	const InfoBar = Control.extend("sap.ui.mdc.util.InfoBar", {
		metadata: {
			properties: {
				infoText: {
					type: "string"
				}
			},
			aggregations: {
				_toolbar: {
					type: "sap.m.Toolbar",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {
				/**
				 * This event is fired when the user clicks on the infobar.
				 */
				press: {
					parameters: {

						/**
						 * The toolbar item that was pressed
						 */
						srcControl: { type: "sap.ui.core.Control" }
					}
				},
				/**
				 * This event is fired when the user presses the <code>RemoveAllfilters</code> button.
				 */
				removeAllFilters: {
					parameters: {}
				}
			}
		},
		renderer: InfoBarRenderer
	});

	InfoBar.prototype.applySettings = function() {
		Control.prototype.applySettings.apply(this, arguments);

		this.setInfoText(this.getInfoText());
	};

	InfoBar.prototype.init = function() {

		this.setVisible(false);
		this.oText = new Text({ wrapping: false });
		this.oInvisibleText = new InvisibleText().toStatic();

		this.oRemoveAllFiltersBtn = new Button(this.getId() + "-RemoveAllFilters", {
			type: mLibrary.ButtonType.Transparent,
			press: function(oEvent) {
				this.fireRemoveAllFilters();
				// TODO this.oInvisibleMessage.announce(oMessageBundle.getText("valuehelp.REMOVEALLTOKEN_ANNOUNCE"), InvisibleMessageMode.Assertive);
			}.bind(this),
			icon: "sap-icon://decline",
			tooltip: Library.getResourceBundleFor("sap.ui.mdc").getText("infobar.REMOVEALLFILTERS")
		});

		const oToolbar = new Toolbar(this.getId() + "--bar", { design: "Info", active: true, content: [this.oText, new ToolbarSpacer(), this.oRemoveAllFiltersBtn] });
		oToolbar.attachPress((oSrc) => {
			this.firePress({
				srcControl: oSrc
			});
		});
		this.setAggregation("_toolbar", oToolbar);

	};

	InfoBar.prototype.setInfoText = function(sText) {
		this.setProperty("infoText", sText);
		this.setVisible(!!sText);

		if (this.oText && this.oInvisibleText) {
			this.oText.setText(sText);
			this.oInvisibleText.setText(sText);
		}

		return this;
	};

	/**
	 * Provides the ID of the invisible text created by the <code>InfoBar</code>. Can be used to set ARIA labels correctly.
	 * @returns {string} ID of the invisible text control
	 */
	InfoBar.prototype.getACCTextId = function() {
		return this.oInvisibleText.getId();
	};

	InfoBar.prototype.exit = function() {
		if (this.oInvisibleText) {
			this.oInvisibleText.destroy();
			this.oInvisibleText = null;
		}

		if (this.oText) {
			this.oText.destroy();
			this.oText = null;
		}

		if (this.oRemoveAllFiltersBtn) {
			this.oRemoveAllFiltersBtn.destroy();
			this.oRemoveAllFiltersBtn = null;
		}
	};


	return InfoBar;

});