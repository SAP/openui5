/*!
 * ${copyright}
 */
sap.ui.define([
    'sap/ui/core/Control',
	'sap/m/OverflowToolbar',
    "sap/ui/mdc/util/InfoBarRenderer",
    "sap/m/Text",
    "sap/ui/core/InvisibleText",
    "sap/m/Label"
], function(Control, Toolbar, InfoBarRenderer, Text, InvisibleText, Label) {
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
	 * @experimental As of version 1.111
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.111.0
	 * @alias sap.ui.mdc.util.InfoBar
	 */
	var InfoBar = Control.extend("sap.ui.mdc.util.InfoBar", {
		metadata: {
			properties: {
                infoText: {
                    type: "string"
                }
			},
            aggregations: {
                _toolbar : {
                    type: "sap.m.Toolbar",
                    multiple: false,
                    visibility: "hidden"
                }
            },
            events: {
				/**
				 * This event is fired when the user clicks on the infobar.
				 */
				press : {
					parameters : {

						/**
						 * The toolbar item that was pressed
						 */
						srcControl : {type : "sap.ui.core.Control"}
					}
				}
            }
		},
        renderer: InfoBarRenderer
	});

    InfoBar.prototype.init = function() {

        this.setVisible(!!this.getInfoText());
        this.oText = new Text({
            text: this.getInfoText(),
            wrapping: false
        });
        this.oInvisibleText = new InvisibleText({text: this.getInfoText()}).toStatic();

        var oToolbar = new Toolbar(this.getId() + "--bar", { design: "Info", active: true, content: [this.oText]});
        oToolbar.attachPress(function(oSrc){
            this.firePress({
				srcControl : oSrc
			});
        }.bind(this));
        this.setAggregation("_toolbar", oToolbar);

    };

    InfoBar.prototype.setInfoText = function(sText){
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
    };


	return InfoBar;

});