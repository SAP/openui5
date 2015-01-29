/*!
 * ${copyright}
 */

// Provides control sap.m.MessagePage.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, IconPool) {
		"use strict";

		/**
		 * Constructor for a new MessagePage.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * MessagePage is displayed when there is no data or matching content. There are different use cases where a MessagePage might be visualized, for example:
		 *		- The search query returned no results
		 *		- The app contains no items
		 *		- There are too many items
		 *		- The application is loading
		 *	The layout is unchanged but the text varies depending on the use case.
		 * @extends sap.ui.core.Control
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.28
		 * @alias sap.m.MessagePage
		 */
		var MessagePage = Control.extend("sap.m.MessagePage", /** @lends sap.m.MessagePage.prototype */ { metadata : {

			library : "sap.m",
			properties : {
				/**
				 * MessagePage text
				 */
				text : {type : "string", group : "Misc", defaultValue : null},
				/**
				 * MessagePage filter text
				 */
				filterText : {type : "string", group : "Misc", defaultValue : null},
				/**
				 * MessagePage title
				 */
				title : { type : "string", group : "Misc", defaultValue : null },
				/**
				 * Determines whether the header of the MessagePage is rendered when it's embedded in another page.
				 */
				showHeader : { type : "boolean", group : "Appearance", defaultValue : true },
				/**
				 * MessagePage main icon
				 */
				icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : "sap-icon://documents" },
				/**
				 * This property specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit}
			},
			aggregations : {
				/**
				 * The (optional) custom Text control of this page.
				 * Use this aggregation when the "text" (sap.m.Text) control needs to be replaced with a sap.m.Link control.
				 * "text" and "textDirection" setters can be used for this aggregation.
				 */
				customText : {type : "sap.m.Link", multiple : false},
				/**
				 * The (optional) custom filterText control of this page.
				 * Use this aggregation when the "filterText" (sap.m.filterText) control needs to be replaced with a sap.m.Link control.
				 * "filterText" and "textDirection" setters can be used for this aggregation.
				 */
				customFilterText : {type : "sap.m.Link", multiple : false},
				/**
				 * A Page control which is managed internally by the MessagePage control
				 */
				_page : {type : "sap.m.Page", multiple : false/*, visibility : "hidden"*/}
			},
			associations : {

				/**
				 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			}
		}});

		MessagePage.prototype.init = function() {
			this.setAggregation("_page", new sap.m.Page({
				showHeader: this.getShowHeader()
			}));
		};

		MessagePage.prototype.onBeforeRendering = function() {
			// Don't want controls to be added again on re-rendering
			if (!(this._oText && this._oFilterText)) {
				this._addPageContent();
			}
		};

		MessagePage.prototype.exit = function() {
			var oPage = this.getAggregation("_page");

			if (oPage) {
				oPage.destroy();
				oPage = null;
			}

			if (this._oText) {
				this._oText = null;
			}

			if (this._oFilterText) {
				this._oFilterText = null;
			}

			if (this._oIconControl) {
				this._oIconControl = null;
			}
		};

		MessagePage.prototype.setTitle = function(sTitle) {
			this.setProperty("title", sTitle, true); // no re-rendering
			this.getAggregation("_page").setTitle(sTitle);
		};

		MessagePage.prototype.setText = function(sText) {
			this.setProperty("text", sText, true); // no re-rendering
			this._oText && this._oText.setText(sText);
		};

		MessagePage.prototype.setFilterText = function(sText) {
			this.setProperty("filterText", sText, true); // no re-rendering
			this._oFilterText && this._oFilterText.setText(sText);
		};

		MessagePage.prototype.setShowHeader = function(bShowHeader) {
			this.setProperty("showHeader", bShowHeader, true); // no re-rendering
			this.getAggregation("_page").setShowHeader(bShowHeader);
		};

		MessagePage.prototype.setTextDirection = function(sTextDirection) {
			this.setProperty("textDirection", sTextDirection, true); // no re-rendering
			this._oText && this._oText.setTextDirection(sTextDirection);
			this._oFilterText && this._oFilterText.setTextDirection(sTextDirection);
		};

		MessagePage.prototype.setIcon = function(sIconUri) {
			var sOldIconUri = this.getIcon();
			this.setProperty("icon", sIconUri, true); // no re-rendering

			if (this._oIconControl) {
				// check if the value is changed and if URIs are from different type(icon or image) in order to avoid destroying and creating of icon control
				if (sOldIconUri !== sIconUri && IconPool.isIconURI(sOldIconUri) != IconPool.isIconURI(sIconUri)) {
					var oPage = this.getAggregation("_page");

					oPage.removeContent(this._oIconControl);
					this._oIconControl.destroy();
					oPage.insertContent(this._getIconControl(), 0);
				} else {
					this._oIconControl.setSrc(sIconUri);
				}
			}
		};

		MessagePage.prototype._addPageContent = function() {
			var oPage = this.getAggregation("_page");

			if (this.getAggregation("customText")) {
				this._oText = this.getAggregation("customText");
			} else {
				this._oText = new sap.m.Text({
					text: this.getText(),
					textAlign: sap.ui.core.TextAlign.Center,
					textDirection: this.getTextDirection()
				});
			}

			if (this.getAggregation("customFilterText")) {
				this._oFilterText = this.getAggregation("customFilterText");
			} else {
				this._oFilterText = new sap.m.Text({
					text: this.getFilterText(),
					textAlign: sap.ui.core.TextAlign.Center,
					textDirection: this.getTextDirection()
				});
			}

			oPage.addContent(this._getIconControl());
			oPage.addContent(this._oText.addStyleClass("sapMMessagePageMainText"));
			oPage.addContent(this._oFilterText.addStyleClass("sapMMessagePageFilterText"));
		};

		MessagePage.prototype._getIconControl = function() {
			this._oIconControl = IconPool.createControlByURI({
				id: this.getId() + "-pageIcon",
				src: this.getIcon()
			}, sap.m.Image);

			return this._oIconControl;
		};

		return MessagePage;
	}, /* bExport= */ true);
