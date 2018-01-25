/*!
 * ${copyright}
 */

// Provides control sap.m.MessagePage.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/m/Text',
	'sap/m/Image',
	'sap/m/Button',
	'sap/m/Title',
	'sap/m/FormattedText',
	'./MessagePageRenderer'
], function(
	jQuery,
	library,
	coreLibrary,
	Control,
	IconPool,
	Text,
	Image,
	Button,
	Title,
	FormattedText,
	MessagePageRenderer
) {
		"use strict";

		var TextAlign = coreLibrary.TextAlign;
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		// shortcut for sap.m.BarDesign
		var BarDesign = library.BarDesign;

		/**
		 * Constructor for a new MessagePage.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Displays an empty page with an icon and a header when certain conditions are met.
		 * <h3>Overview</h3>
		 * MessagePage is displayed when there is no data or matching content. There are different use cases where a MessagePage might be visualized, for example:
		 *<ul>
		 *<li>The search query returned no results</li>
		 *<li>The app contains no items</li>
		 *<li>There are too many items</li>
		 *<li>The application is loading</li>
		 *</ul>
		 * The layout is unchanged but the text and icon vary depending on the use case.
		 * <h3>Usage</h3>
		 * <b>Note:</b> The <code>MessagePage</code> is not intended to be used as a top-level control,
		 * but rather used within controls such as <code>NavContainer</code>, <code>App</code>, <code>Shell</code> or other container controls.
		 *
		 * @extends sap.ui.core.Control
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.28
		 * @alias sap.m.MessagePage
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MessagePage = Control.extend("sap.m.MessagePage", /** @lends sap.m.MessagePage.prototype */ { metadata : {

			library : "sap.m",
			properties : {
				/**
				 * Determines the main text displayed on the MessagePage.
				 */
				text : {type : "string", group : "Misc", defaultValue : "No matching items found."},
				/**
				 * Determines the detailed description that shows additional information on the MessagePage.
				 */
				description : {type : "string", group : "Misc", defaultValue : "Check the filter settings."},
				/**
				 * Determines the title in the header of MessagePage.
				 */
				title : { type : "string", group : "Misc", defaultValue : null },
				/**
				 * Determines the visibility of the MessagePage header.
				 * Can be used to hide the header of the MessagePage when it's embedded in another page.
				 */
				showHeader : { type : "boolean", group : "Appearance", defaultValue : true },
				/**
				 * Determines the visibility of the navigation button in MessagePage header.
				 */
				showNavButton : {type : "boolean", group : "Appearance", defaultValue : false},
				/**
				 * Determines the icon displayed on the MessagePage.
				 */
				icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : "sap-icon://documents" },
				/**
				 * Defines the alt attribute of the icon displayed on the <code>MessagePage</code>.
				 *
				 * @since 1.52
				 */
				iconAlt : {type : "string", group : "Misc", defaultValue : null },
				/**
				 * Determines the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Defines whether the value set in the <code>description</code> property is displayed
				 * as formatted text in HTML format.
				 *
				 * For details regarding supported HTML tags, see {@link sap.m.FormattedText}
				 * @since 1.54
				 */
				enableFormattedText: { type: "boolean", group: "Appearance", defaultValue: false }
			},
			aggregations : {
				/**
				 * The (optional) custom Text control of this page.
				 * Use this aggregation when the "text" (sap.m.Text) control needs to be replaced with an sap.m.Link control.
				 * "text" and "textDirection" setters can be used for this aggregation.
				 */
				customText : {type : "sap.m.Link", multiple : false},
				/**
				 * The (optional) custom description control of this page.
				 * Use this aggregation when the "description" (sap.m.Text) control needs to be replaced with an sap.m.Link control.
				 * "description" and "textDirection" setters can be used for this aggregation.
				 */
				customDescription : {type : "sap.m.Link", multiple : false},

				/**
				 * The buttons displayed under the description text.
				 *
				 * <b>Note:</b> Buttons added to this aggregation are both vertically and horizontally
				 * centered. Depending on the available space, they may be rendered on several lines.
				 * @since 1.54
				 */
				buttons: {type: "sap.m.Button", multiple: true},

				/**
				 * A header bar which is managed internally by the MessagePage control.
				 */
				_internalHeader: {type: "sap.m.Bar", multiple: false, visibility: "hidden"},

				/**
				 * The formatted text which is used when enableFormattedText is true.
				 */
				_formattedText: {type: "sap.m.FormattedText", multiple: false, visibility: "hidden" },

				/**
				 * The text displayed under the icon.
				 */
				_text: {type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * The description displayed under the text when enableFormattedText is false.
				 */
				_description: {type: "sap.m.Text", multiple: false, visibility: "hidden"}
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
			},
			events : {
				/**
				 * This event is fired when Nav Button is pressed.
				 * @since 1.28.1
				 */
				navButtonPress : {}
			},
			designtime: "sap/m/designtime/MessagePage.designtime"
		}});

		MessagePage.prototype.init = function() {
			var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				oTitle = new Title(this.getId() + "-title");

			this._oNavButton = new Button(this.getId() + "-navButton", {
				type: ButtonType.Back,
				press: jQuery.proxy(function () {
					this.fireNavButtonPress();
				}, this)
			});

			this.setAggregation("_internalHeader", new sap.m.Bar(this.getId() + "-intHeader", {
				design: BarDesign.Header,
				contentMiddle: [ oTitle ]
			}));

			this.setProperty("text", oBundle.getText("MESSAGE_PAGE_TEXT"), true);
			this.setProperty("description", oBundle.getText("MESSAGE_PAGE_DESCRIPTION"), true);
		};

		MessagePage.prototype.exit = function() {
			if (this._oNavButton) {
				this._oNavButton.destroy();
				this._oNavButton = null;
			}

			if (this._oIconControl) {
				this._oIconControl.destroy();
				this._oIconControl = null;
			}
		};

		MessagePage.prototype.setTitle = function(sTitle) {
			this.setProperty("title", sTitle, true); // no re-rendering

			var oTitle = this._getInternalHeader().getContentMiddle()[0];
			oTitle.setText(sTitle);

			return this;
		};

		MessagePage.prototype.setText = function(sText) {
			this.setProperty("text", sText, true); // no re-rendering

			var oText = this.getAggregation("_text");
			oText && oText.setText(sText);

			return this;
		};

		MessagePage.prototype.setDescription = function(sDescription) {
			this.setProperty("description", sDescription, true); // no re-rendering

			var oFormattedText = this.getAggregation("_formattedText"),
				oDescription = this.getAggregation("_description");
			oFormattedText && oFormattedText.setHtmlText(sDescription);
			oDescription && oDescription.setText(sDescription);

			return this;
		};

		MessagePage.prototype.setShowNavButton = function(bShowNavButton) {
			this.setProperty("showNavButton", bShowNavButton, true); // no re-rendering

			var oHeader = this._getInternalHeader();

			if (bShowNavButton) {
				oHeader.addContentLeft(this._oNavButton);
			} else {
				oHeader.removeAllContentLeft();
			}

			return this;
		};

		MessagePage.prototype.setTextDirection = function(sTextDirection) {
			this.setProperty("textDirection", sTextDirection, true); // no re-rendering

			var oDomRef = this.getDomRef();

			if (oDomRef) {
				if (sTextDirection === TextDirection.Inherit) {
					oDomRef.removeAttribute("dir");
				} else {
					oDomRef.dir = sTextDirection.toLowerCase();
				}
			}

			return this;
		};

		MessagePage.prototype.setIcon = function(sIcon) {
			var sValue = this.getIcon() || "";
				sIcon = sIcon || "";

			if (sValue !== sIcon) {
				var bSupressRendering = !!sValue && !!sIcon && IconPool.isIconURI(sIcon) === IconPool.isIconURI(sValue);
				this.setProperty("icon", sIcon, bSupressRendering);
				if (bSupressRendering && this._oIconControl) {
					this._oIconControl.setSrc(sIcon);
				}
			}

			return this;
		};

		MessagePage.prototype.setEnableFormattedText = function (bEnable) {
			var oFormattedText;

			if (bEnable) {
				oFormattedText = this._getFormattedText();
				// Aways call setHtmlText - do not use a constructor property to avoid unwanted warnings for HTML elements
				oFormattedText.setHtmlText(this.getDescription());
			}

			return this.setProperty("enableFormattedText", bEnable);
		};

		MessagePage.prototype._getIconControl = function() {
			if (this._oIconControl) {
				this._oIconControl.destroy();
				this._oIconControl = null;
			}

			this._oIconControl = IconPool.createControlByURI({
				id: this.getId() + "-pageIcon",
				src: this.getIcon(),
				height: "8rem",
				width: "8rem",
				useIconTooltip: true,
				decorative: false,
				alt: this.getIconAlt()
			}, Image).addStyleClass("sapMMessagePageIcon");

			return this._oIconControl;
		};

		/**
		 * @returns {sap.m.Link|sap.m.Text} the control which will display the MessagePage's text
		 * @private
		 */
		MessagePage.prototype._getText = function() {
			if (this.getAggregation("customText")) {
				return this.getAggregation("customText");
			}

			if (!this.getAggregation("_text")) {
				var oText = new Text(this.getId() + "-text", {
					id: this.getId() + "-customText",
					text: this.getText(),
					textAlign: TextAlign.Center,
					textDirection: this.getTextDirection()
				});
				this.setAggregation("_text", oText);
			}

			return this.getAggregation("_text");
		};

		/**
		 * @returns {sap.m.Link|sap.m.FormattedText|sap.m.Text} the control which will display the MessagePage's description
		 * @private
		 */
		MessagePage.prototype._getDescription = function() {
			if (this.getAggregation("customDescription")) {
				return this.getAggregation("customDescription");
			}

			if (this.getEnableFormattedText()) {
				return this._getFormattedText();
			}

			if (!this.getAggregation("_description")) {
				var oDescription = new Text(this.getId() + "-description", {
					id: this.getId() + "-customDescription",
					text: this.getDescription(),
					textAlign: TextAlign.Center,
					textDirection: this.getTextDirection()
				});
				this.setAggregation("_description", oDescription);
			}

			return this.getAggregation("_description");
		};

		/**
		 * Returns the internal header
		 * Adding this functions because they are needed by the SplitContainer logic to show the "hamburger" button.
		 * @private
		 * @returns {sap.m.IBar} The internal header
		 */
		MessagePage.prototype._getAnyHeader = function() {
			return this._getInternalHeader();
		};

		/**
		 * Adding this functions because they are needed by the SplitContainer logic to show the "hamburger" button.
		 * @returns {sap.m.IBar} The header
		 * @private
		 */
		MessagePage.prototype._getInternalHeader = function() {
			return this.getAggregation("_internalHeader");
		};

		/**
		 * Instantiates and returns the FormattedText object that is displayed when enableFormattedText is true.
		 * @returns {sap.m.FormattedText}
		 * @private
		 */
		MessagePage.prototype._getFormattedText = function() {
			var oFormattedText = this.getAggregation("_formattedText");

			if (!oFormattedText) {
				oFormattedText = new FormattedText(this.getId() + "-formattedText");
				this.setAggregation("_formattedText", oFormattedText);
			}

			return oFormattedText;
		};

		return MessagePage;
	});
