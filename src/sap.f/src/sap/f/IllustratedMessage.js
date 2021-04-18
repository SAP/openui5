/*!
 * ${copyright}
 */

// Provides control sap.f.IllustratedMessage.
sap.ui.define([
	"./library",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/FormattedText",
	"sap/f/Illustration",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	'sap/ui/core/library',
	"sap/ui/core/ResizeHandler",
	"sap/ui/thirdparty/jquery",
	"./IllustratedMessageRenderer"
], function(
	library,
	Text,
	Title,
	FormattedText,
	Illustration,
	Control,
	Core,
	coreLibrary,
	ResizeHandler,
	jQuery,
	IllustratedMessageRenderer
) {
	"use strict";

	// shortcut for sap.f.IllustratedMessageSize
	var IllustratedMessageSize = library.IllustratedMessageSize;

	// shortcut for sap.f.IllustratedMessageType
	var IllustratedMessageType = library.IllustratedMessageType;

	// shortcut for sap.ui.core.IllustratedMessageType
	var TextAlign = coreLibrary.TextAlign;


	/**
	 * Constructor for a new <code>IllustratedMessage</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A combination of message and illustration to represent an empty or a success state.
	 *
	 * <h3>Overview</h3>
	 *
	 * An <code>IllustratedMessage</code> is a recommended combination of a solution-oriented message,
	 * an engaging illustration, and conversational tone to better communicate an empty or a success state
	 * than just show a message alone.
	 * Empty states are moments in the user experience where there’s no data to display.
	 * Success states are occasions to celebrate and reward a user’s special accomplishment or the completion of an important task.
	 *
	 * The <code>IllustratedMessage</code> control is meant to be used inside container controls,
	 * for example a <code>Card</code>, a <code>Dialog</code>, or a <code>Page</code>.
	 *
	 * <h3>Structure</h3>
	 *
	 * The <code>IllustratedMessage</code> consists of the following elements, which are displayed below
	 * each other in the following order:
	 * <ul>
	 * <li>Illustration</li>
	 * <li>Title</li>
	 * <li>Description</li>
	 * <li>Additional Content</li>
	 * </ul>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The <code>IllustratedMessage</code> control can adapt depending on the API settings provided by the app developer
	 * and the available space of its parent container. Some of the structural elements are displayed differently or
	 * are omitted in the different breakpoint sizes (XS, S, M, L).
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since 1.88 This class is experimental. The API may change.
	 * @since 1.88
	 * @alias sap.f.IllustratedMessage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var IllustratedMessage = Control.extend("sap.f.IllustratedMessage", /** @lends sap.f.IllustratedMessage.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * Defines the description displayed below the title.
				 *
				 * If there is no initial input from the app developer and the default illustration set is being used,
				 * a default description for the current illustration type is going to be displayed. The default
				 * description is stored in the <code>sap.f</code> resource bundle.
				 *
				 * @since 1.88
				 */
				description : {type : "string", group : "Misc", defaultValue : ""},

				/**
				 * Defines whether the value set in the <code>description</code> property is displayed
				 * as formatted text in HTML format.
				 *
				 * For details regarding supported HTML tags, see {@link sap.m.FormattedText}.
				 * @since 1.88
				 */
				enableFormattedText: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Determines which illustration breakpoint variant is used.
				 *
				 * As <code>IllustratedMessage</code> adapts itself around the <code>Illustration</code>, the other
				 * elements of the control are displayed differently on the different breakpoints/illustration sizes.
				 *
				 * @since 1.88
				 */
				illustrationSize : {type: "sap.f.IllustratedMessageSize", group: "Appearance", defaultValue: IllustratedMessageSize.Auto},

				/**
				 * Determines which illustration type is displayed.
				 *
				 * <b>Note:</b> The {@link sap.f.IllustratedMessageType} enumeration contains a default illustration set.
				 * If you want to use another illustration set, you have to register it in the {@link sap.f.IllustrationPool}.
				 *
				 * Example input for the <code>illustrationType</code> property is <code>sapIllus-UnableToLoad</code>.
				 * The logic behind this format is as follows:
				 * <ul>
				 * <li>First is the the illustration set - sapIllus</li>
				 * <li>Second is the illustration type - UnableToLoad</li>
				 * </ul>
				 *
				 * @since 1.88
				 */
				illustrationType : {type: "string", group: "Appearance", defaultValue: IllustratedMessageType.NoSearchResults},

				/**
				 * Defines the title that is displayed below the illustration.
				 *
				 * If there is no initial input from the app developer and the default illustration set is being used,
				 * a default title is displayed corresponding to the current <code>illustrationType</code>.
				 *
				 * @since 1.88
				 */
				title: {type: "string", group: "Misc", defaultValue: ""}
			},
			aggregations: {

				/**
				 * Defines the controls placed below the description as additional content.
				 *
				 * <b>Note:</b> Not displayed when <code>illustrationSize</code> is set to <code>Base</code>.
				 *
				 * @since 1.88
				 */
				additionalContent: {type: "sap.m.Button", multiple: true},

				/**
				 * The description displayed under the title when <code>enableFormattedText</code> is <code>true</code>.
				 *
				 * @since 1.88
				 */
				_formattedText: {type: "sap.m.FormattedText", multiple: false, visibility: "hidden" },

				/**
				 * Defines the illustration used, according to the <code>illustrationType</code> property
				 * and the current state of <code>IllustratedMessage</code>.
				 *
				 * It is placed above all other aggregations. Not displayed <code>illustrationSize</code> is set to <code>Base</code>.
				 *
				 * @since 1.88
				 */
				_illustration: {type: "sap.f.Illustration", visibility: "hidden", multiple: false },

				/**
				 * The description displayed under the title when <code>enableFormattedText</code> is <code>false</code>.
				 *
				 * @since 1.88
				 */
				_text: {type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * The text displayed under the illustration.
				 *
				 * @since 1.88
				 */
				_title: {type: "sap.m.Title", multiple: false, visibility: "hidden"}
			},
			dnd: { draggable: false, droppable: true }
		}
	});

	/**
	 * STATIC MEMBERS
	 */

	IllustratedMessage.PREPENDS = {
		DESCRIPTION: "IllustratedMessage_DESCRIPTION_",
		TITLE: "IllustratedMessage_TITLE_"
	};

	IllustratedMessage.BREAK_POINTS = {
		DIALOG: 679,
		SPOT: 319,
		BASE: 259
	};

	IllustratedMessage.MEDIA = {
		BASE: "sapFIllustratedMessage-Base",
		SPOT: "sapFIllustratedMessage-Spot",
		DIALOG: "sapFIllustratedMessage-Dialog",
		SCENE: "sapFIllustratedMessage-Scene"
	};

	IllustratedMessage.RESIZE_HANDLER_ID = {
		CONTENT: "_sContentResizeHandlerId"
	};

	/**
	 * LIFECYCLE METHODS
	 */

	IllustratedMessage.prototype.init = function () {
		this._updateInternalIllustrationSetAndType(this.getIllustrationType());
	};

	IllustratedMessage.prototype.onBeforeRendering = function () {
		this._detachResizeHandlers();
	};

	IllustratedMessage.prototype.onAfterRendering = function () {
		this._updateDomSize();
		this._attachResizeHandlers();
		this._preventWidowWords(this._getTitle().getDomRef());
		this._preventWidowWords(this._getDescription().getDomRef());
	};

	IllustratedMessage.prototype.exit = function () {
		this._detachResizeHandlers();
	};

	/**
	 * GETTERS / SETTERS
	 */

	IllustratedMessage.prototype.setIllustrationType = function (sValue) {
		if (this.getIllustrationType() === sValue) {
			return this;
		}

		this._updateInternalIllustrationSetAndType(sValue);

		return this.setProperty("illustrationType", sValue);
	};

	/**
	 * Gets the default text for the description aggregation.
	 * @private
	 * @returns {string} The default text.
	 */
	IllustratedMessage.prototype._getDefaultDescription = function () {
		return this._getResourceBundle().getText(IllustratedMessage.PREPENDS.DESCRIPTION + this._sIllustrationType, null, true);
	};

	/**
	 * Gets the correct aggregation for the description.
	 * If the enableFormattedText property is true, the function returns
	 * sap.m.FormattedText. If it's false, it returns sap.m.Text.
	 * @private
	 * @returns {sap.m.Text|sap.m.FormattedText} The aggregation which will be used as description
	 */
	IllustratedMessage.prototype._getDescription = function () {
		return this.getEnableFormattedText() ? this._getFormattedText() : this._getText();
	};

	/**
	 * Gets content of the _formattedText aggregation.
	 * @private
	 * @returns {sap.m.FormattedText}
	 */
	IllustratedMessage.prototype._getFormattedText = function () {
		var sDescription = this.getDescription(),
			oFormattedText = this.getAggregation("_formattedText");

		if (!oFormattedText) {
			oFormattedText = new FormattedText({textAlign: TextAlign.Center});
			this.setAggregation("_formattedText", oFormattedText);
		}

		if (sDescription) {
			oFormattedText.setHtmlText(sDescription);
		} else {
			// Use default text for the description if applicable
			oFormattedText.setHtmlText(this._getDefaultDescription());
		}

		return oFormattedText;
	};

	/**
	 * Gets content of the _illustration aggregation.
	 * @private
	 * @returns {sap.f.Illustration}
	 */
	IllustratedMessage.prototype._getIllustration = function () {
		var oIllustration = this.getAggregation("_illustration");

		if (!oIllustration) {
			oIllustration = new Illustration();

			this.setAggregation("_illustration", oIllustration);
		}

		return oIllustration;
	};

	IllustratedMessage.prototype._getResourceBundle = function () {
		return Core.getLibraryResourceBundle("sap.f");
	};

	/**
	 * Gets content of the _text aggregation.
	 * @private
	 * @returns {sap.m.Text}
	 */
	IllustratedMessage.prototype._getText = function () {
		var sDescription = this.getDescription(),
			oText = this.getAggregation("_text");

		if (!oText) {
			oText = new Text({textAlign: TextAlign.Center});
			this.setAggregation("_text", oText);
		}

		if (sDescription) {
			oText.setText(sDescription);
		} else {
			// Use default text for the description if applicable
			oText.setText(this._getDefaultDescription());
		}

		return oText;
	};

	/**
	 * Gets content of the _title aggregation.
	 * @private
	 * @returns {sap.m.Title}
	 */
	IllustratedMessage.prototype._getTitle = function () {
		var sTitle = this.getTitle(),
			oTitle = this.getAggregation("_title");

		if (!oTitle) {
			oTitle = new Title({wrapping: true});
			this.setAggregation("_title", oTitle);
		}

		if (sTitle) {
			oTitle.setText(sTitle);
		} else {
			// Use default text for the title if applicable
			oTitle.setText(this._getResourceBundle().getText(IllustratedMessage.PREPENDS.TITLE + this._sIllustrationType, null, true));
		}

		return oTitle;
	};

	/**
	 * PRIVATE METHODS
	 */

	/**
	 * Helper function which ensures that there is non-breaking space between the last two words
	 * of a given DOM content. By adding it, we prevent one word (widow) on the last row of a text node.
	 * @param {DOMRef} oDomRef - the DOM object which will be checked against
	 * @private
	 */
	IllustratedMessage.prototype._preventWidowWords = function(oDomRef) {
		var $DomRef,
			sDomRefContent,
			oHTMLElement = window.HTMLElement;

		if (!(oHTMLElement && oDomRef instanceof oHTMLElement)) {
			return;
		}

		$DomRef = jQuery(oDomRef);
		sDomRefContent = $DomRef.html();

		sDomRefContent = sDomRefContent.replace(/ ([^ ]*)$/,'&nbsp;$1');
		$DomRef.html(sDomRefContent);
	};

	/**
	 * Updates the <code>IllustratedMessage</code> DOM elements according to its <code>illustrationSize</code> property.
	 * @private
	 */
	IllustratedMessage.prototype._updateDomSize = function () {
		var oDomRef = this.getDomRef(),
			sSize;

		if (oDomRef) {
			sSize = this.getIllustrationSize();
			if (sSize === IllustratedMessageSize.Auto) {
				this._updateMedia(oDomRef.getBoundingClientRect().width);
			} else {
				this._updateMediaStyle(IllustratedMessage.MEDIA[sSize.toUpperCase()]);
			}
		}

	};

	/**
	 * Caches the <code>IllustratedMessage</code> illustration set and illustration type in private instance variables.
	 * @private
	 */
	IllustratedMessage.prototype._updateInternalIllustrationSetAndType = function (sValue) {
		var aValues = sValue.split("-");

		this._sIllustrationSet = aValues[0];
		this._sIllustrationType = aValues[1];
	};

	/**
	 * Handles the resize event of the <code>IllustratedMessage</code>.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	IllustratedMessage.prototype._onResize = function (oEvent) {
		var iCurrentWidth = oEvent.size.width;

		this._updateMedia(iCurrentWidth);
	};

	/**
	 * Updates the media size of the control based on its own width, not on the entire screen size (which media query does).
	 * @param {Number} iWidth - the actual width of the control
	 * @private
	 */
	IllustratedMessage.prototype._updateMedia = function (iWidth) {
		if (!iWidth) {
			return;
		}

		if (iWidth <= IllustratedMessage.BREAK_POINTS.BASE) {
			this._updateMediaStyle(IllustratedMessage.MEDIA.BASE);
		} else if (iWidth <= IllustratedMessage.BREAK_POINTS.SPOT) {
			this._updateMediaStyle(IllustratedMessage.MEDIA.SPOT);
		} else if (iWidth <= IllustratedMessage.BREAK_POINTS.DIALOG) {
			this._updateMediaStyle(IllustratedMessage.MEDIA.DIALOG);
		} else {
			this._updateMediaStyle(IllustratedMessage.MEDIA.SCENE);
		}
	};

	/**
	 * It puts the appropriate classes on the control and updates illustration's symbol based on the current media size.
	 * @param {string} sCurrentMedia
	 * @private
	 */
	IllustratedMessage.prototype._updateMediaStyle = function (sCurrentMedia) {
		Object.keys(IllustratedMessage.MEDIA).forEach(function (sMedia) {
			var bEnable = sCurrentMedia === IllustratedMessage.MEDIA[sMedia],
				sIdMedia = sMedia.charAt(0) + sMedia.slice(1).toLowerCase();
			this.toggleStyleClass(IllustratedMessage.MEDIA[sMedia], bEnable);
			if (bEnable && sCurrentMedia !== IllustratedMessage.MEDIA.BASE) { // No need to require a resource for BASE illustrationSize, since there is none
				this._getIllustration().setSet(this._sIllustrationSet, true)
					.setMedia(sIdMedia, true)
					.setType(this._sIllustrationType);
			}
		}, this);
	};

	/**
	 * ATTACH/DETACH HANDLERS
	 */

	/**
	 * Attaches resize handlers on <code>IllustratedMessage</code>.
	 * @private
	 */
	IllustratedMessage.prototype._attachResizeHandlers = function () {
		var sIllustrationSize = this.getIllustrationSize();

	if (this.getDomRef() && sIllustrationSize === IllustratedMessageSize.Auto) {
			this._registerResizeHandler(IllustratedMessage.RESIZE_HANDLER_ID.CONTENT, this, this._onResize.bind(this));
		}
	};

	/**
	 * Detaches resize handlers on <code>IllustratedMessage</code>.
	 * @private
	 */
	IllustratedMessage.prototype._detachResizeHandlers = function () {
		this._deRegisterResizeHandler(IllustratedMessage.RESIZE_HANDLER_ID.CONTENT);
	};

	/**
	 * Registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @param {Object} oObject
	 * @param {Function} fnHandler
	 * @private
	 */
	IllustratedMessage.prototype._registerResizeHandler = function (sHandler, oObject, fnHandler) {
		if (!this[sHandler]) {
			this[sHandler] = ResizeHandler.register(oObject, fnHandler);
		}
	};

	/**
	 * De-registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @private
	 */
	IllustratedMessage.prototype._deRegisterResizeHandler = function (sHandler) {
		if (this[sHandler]) {
			ResizeHandler.deregister(this[sHandler]);
			this[sHandler] = null;
		}
	};

	return IllustratedMessage;

});
