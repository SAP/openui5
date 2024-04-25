/*!
 * ${copyright}
 */

// Provides control sap.m.IllustratedMessage.
sap.ui.define([
	"./library",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/FormattedText",
	"sap/m/Illustration",
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/EventBus",
	"sap/ui/core/Lib",
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
	Log,
	Control,
	EventBus,
	Library,
	coreLibrary,
	ResizeHandler,
	jQuery,
	IllustratedMessageRenderer
) {
	"use strict";

	// shortcut for sap.m.IllustratedMessageSize
	var IllustratedMessageSize = library.IllustratedMessageSize;

	// shortcut for sap.m.IllustratedMessageType
	var IllustratedMessageType = library.IllustratedMessageType;

	// shortcut for sap.ui.core.IllustratedMessageType
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

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
	 * Empty states are moments in the user experience where there's no data to display.
	 * Success states are occasions to celebrate and reward a user's special accomplishment or the completion of an important task.
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
	 * @since 1.98
	 * @alias sap.m.IllustratedMessage
	 */
	var IllustratedMessage = Control.extend("sap.m.IllustratedMessage", /** @lends sap.m.IllustratedMessage.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Defines the description displayed below the title.
				 *
				 * If there is no initial input from the app developer, <code>enableDefaultTitleAndDescription</code> is <code>true</code> and the default illustration set is being used,
				 * a default description for the current illustration type is going to be displayed. The default
				 * description is stored in the <code>sap.m</code> resource bundle.
				 *
				 * @since 1.98
				 */
				description : {type : "string", group : "Misc", defaultValue : ""},

				/**
				 * Defines whether the default title and description should be used when the input for their respective part is empty
				 * and the default illustration set is being used. Title and description are stored in the <code>sap.m</code> resource bundle.
				 *
				 * @since 1.111
				 */
				enableDefaultTitleAndDescription: { type: "boolean", group: "Appearance", defaultValue: true },

				/**
				 * Defines whether the value set in the <code>description</code> property is displayed
				 * as formatted text in HTML format.
				 *
				 * For details regarding supported HTML tags, see {@link sap.m.FormattedText}.
				 * @since 1.98
				 */
				enableFormattedText: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Defines whether the <code>IllustratedMessage</code> would resize itself according to it's height
				 * if <code>illustrationSize</code> property is set to <code>IllustratedMessageSize.Auto</code>.
				 *
				 * @since 1.104
				 */
				enableVerticalResponsiveness: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Determines which illustration breakpoint variant is used.
				 *
				 * As <code>IllustratedMessage</code> adapts itself around the <code>Illustration</code>, the other
				 * elements of the control are displayed differently on the different breakpoints/illustration sizes.
				 *
				 * @since 1.98
				 */
				illustrationSize : {type: "sap.m.IllustratedMessageSize", group: "Appearance", defaultValue: IllustratedMessageSize.Auto},

				/**
				 * Determines which illustration type is displayed.
				 *
				 * <b>Note:</b> The {@link sap.m.IllustratedMessageType} enumeration contains a default illustration set.
				 * If you want to use another illustration set, you have to register it in the {@link sap.m.IllustrationPool}.
				 *
				 * Example input for the <code>illustrationType</code> property is <code>sapIllus-UnableToLoad</code>.
				 * The logic behind this format is as follows:
				 * <ul>
				 * <li>First is the the illustration set - sapIllus</li>
				 * <li>Second is the illustration type - UnableToLoad</li>
				 * </ul>
				 *
				 * @since 1.98
				 */
				illustrationType : {type: "string", group: "Appearance", defaultValue: IllustratedMessageType.NoSearchResults},

				/**
				 * Defines the title that is displayed below the illustration.
				 *
				 * If there is no initial input from the app developer, <code>enableDefaultTitleAndDescription</code> is <code>true</code> and the default illustration set is being used,
				 * a default title is displayed corresponding to the current <code>illustrationType</code>. The default
				 * title is stored in the <code>sap.m</code> resource bundle.
				 *
				 * @since 1.98
				 */
				title: {type: "string", group: "Misc", defaultValue: ""},

				/**
				 * Defines the semantic level of the title. When using <code>Auto</code>, no explicit level information is written.
				 *
				 * <b>Note:</b> Used for accessibility purposes only.
				 *
				 * @public
				 * @since 1.111
				 */
				ariaTitleLevel: {type: "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto}
			},
			aggregations: {

				/**
				 * Defines the controls placed below the description as additional content.
				 *
				 * <b>Note:</b> Not displayed when <code>illustrationSize</code> is set to <code>Base</code>.
				 *
				 * @since 1.98
				 */
				additionalContent: {type: "sap.m.Button", multiple: true},

				/**
				 * The description displayed under the title when <code>enableFormattedText</code> is <code>true</code>.
				 *
				 * @since 1.98
				 */
				_formattedText: {type: "sap.m.FormattedText", multiple: false, visibility: "hidden" },

				/**
				 * Defines the illustration used, according to the <code>illustrationType</code> property
				 * and the current state of <code>IllustratedMessage</code>.
				 *
				 * It is placed above all other aggregations. Not displayed <code>illustrationSize</code> is set to <code>Base</code>.
				 *
				 * @since 1.98
				 */
				_illustration: {type: "sap.m.Illustration", visibility: "hidden", multiple: false },

				/**
				 * The description displayed under the title when <code>enableFormattedText</code> is <code>false</code>.
				 *
				 * @since 1.98
				 */
				_text: {type: "sap.m.Text", multiple: false, visibility: "hidden"},

				/**
				 * The text displayed under the illustration.
				 *
				 * @since 1.98
				 */
				_title: {type: "sap.m.Title", multiple: false, visibility: "hidden"}
			},
			associations : {
				/**
				 * Association to controls / IDs which label those controls (see WAI-ARIA attribute aria-labelledBy).
	 			 * @since 1.106.0
				 */
				 illustrationAriaLabelledBy: {type : "sap.ui.core.Control", multiple : true, singularName : "illustrationAriaLabelledBy"}
			},
			dnd: { draggable: false, droppable: true }
		},

		renderer: IllustratedMessageRenderer
	});

	/**
	 * STATIC MEMBERS
	 */

	IllustratedMessage.ORIGINAL_TEXTS = {
		UnableToLoad: "UnableToLoad",
		UnableToUpload: "UnableToUpload",
		NoActivities: "NoActivities",
		BeforeSearch: "BeforeSearch",
		NoSearchResults: "NoSearchResults",
		NoEntries: "NoEntries",
		NoData: "NoData",
		NoNotifications: "NoNotifications",
		BalloonSky: "BalloonSky",
		SuccessScreen: "SuccessScreen",
		NoMail: "NoMail",
		NoSavedItems: "NoSavedItems",
		NoTasks: "NoTasks",
		UploadToCloud: "UploadToCloud",
		NoDimensionsSet: "NoDimensionsSet",
		AddDimensions: "AddDimensions"
	};

	IllustratedMessage.FALLBACK_TEXTS = {
		ReloadScreen: IllustratedMessage.ORIGINAL_TEXTS.UnableToLoad,
		Connection: IllustratedMessage.ORIGINAL_TEXTS.UnableToLoad,
		ErrorScreen: IllustratedMessage.ORIGINAL_TEXTS.UnableToUpload,
		EmptyCalendar: IllustratedMessage.ORIGINAL_TEXTS.NoActivities,
		SearchEarth: IllustratedMessage.ORIGINAL_TEXTS.BeforeSearch,
		SearchFolder: IllustratedMessage.ORIGINAL_TEXTS.NoSearchResults,
		EmptyList: IllustratedMessage.ORIGINAL_TEXTS.NoEntries,
		Tent: IllustratedMessage.ORIGINAL_TEXTS.NoData,
		SleepingBell: IllustratedMessage.ORIGINAL_TEXTS.NoNotifications,
		SimpleBalloon: IllustratedMessage.ORIGINAL_TEXTS.BalloonSky,
		SimpleBell: IllustratedMessage.ORIGINAL_TEXTS.NoNotifications,
		SimpleCalendar: IllustratedMessage.ORIGINAL_TEXTS.NoActivities,
		SimpleCheckMark: IllustratedMessage.ORIGINAL_TEXTS.SuccessScreen,
		SimpleConnection: IllustratedMessage.ORIGINAL_TEXTS.UnableToLoad,
		SimpleEmptyDoc: IllustratedMessage.ORIGINAL_TEXTS.NoData,
		SimpleEmptyList: IllustratedMessage.ORIGINAL_TEXTS.NoEntries,
		SimpleError: IllustratedMessage.ORIGINAL_TEXTS.UnableToUpload,
		SimpleMagnifier: IllustratedMessage.ORIGINAL_TEXTS.BeforeSearch,
		SimpleMail: IllustratedMessage.ORIGINAL_TEXTS.NoMail,
		SimpleNoSavedItems: IllustratedMessage.ORIGINAL_TEXTS.NoSavedItems,
		SimpleNotFoundMagnifier: IllustratedMessage.ORIGINAL_TEXTS.NoSearchResults,
		SimpleReload: IllustratedMessage.ORIGINAL_TEXTS.UnableToLoad,
		SimpleTask: IllustratedMessage.ORIGINAL_TEXTS.NoTasks,
		SuccessBalloon: IllustratedMessage.ORIGINAL_TEXTS.BalloonSky,
		SuccessCheckMark: IllustratedMessage.ORIGINAL_TEXTS.SuccessScreen,
		SuccessHighFive: IllustratedMessage.ORIGINAL_TEXTS.BalloonSky
	};

	IllustratedMessage.PREPENDS = {
		DESCRIPTION: "IllustratedMessage_DESCRIPTION_",
		TITLE: "IllustratedMessage_TITLE_"
	};

	IllustratedMessage.BREAK_POINTS = {
		DIALOG: 679,
		SPOT: 319,
		DOT: 259,
		BASE: 159
	};

	IllustratedMessage.BREAK_POINTS_HEIGHT = {
		DIALOG: 451,
		SPOT: 296,
		DOT: 154,
		BASE: 87
	};

	// The medias should always be in ascending order (smaller to bigger)
	IllustratedMessage.MEDIA = {
		BASE: "sapMIllustratedMessage-Base",
		DOT: "sapMIllustratedMessage-Dot",
		SPOT: "sapMIllustratedMessage-Spot",
		DIALOG: "sapMIllustratedMessage-Dialog",
		SCENE: "sapMIllustratedMessage-Scene"
	};

	IllustratedMessage.RESIZE_HANDLER_ID = {
		CONTENT: "_sContentResizeHandlerId"
	};

	/**
	 * LIFECYCLE METHODS
	 */

	IllustratedMessage.prototype.init = function () {
		this._sLastKnownMedia = null;
		this._oLastKnownWidthForMedia = {};
		this._oLastKnownHeightForMedia = {};
		this._updateInternalIllustrationSetAndType(this.getIllustrationType());
		EventBus.getInstance().subscribe("sapMIllusPool-assetLdgFailed", this._handleMissingAsset.bind(this));
	};

	IllustratedMessage.prototype.onBeforeRendering = function () {
		this._detachResizeHandlers();
	};

	IllustratedMessage.prototype.onAfterRendering = function () {
		this._updateDomSize();
		this._attachResizeHandlers();
		this._preventWidowWords(this._getTitle().getDomRef());
		this._preventWidowWords(this._getDescription().getDomRef());
		this._setDefaultIllustrationLabel();
	};

	IllustratedMessage.prototype.exit = function () {
		this._detachResizeHandlers();
	};

	/*
	 * GETTERS / SETTERS
	 */

	IllustratedMessage.prototype.setIllustrationType = function (sValue) {
		if (this.getIllustrationType() === sValue) {
			return this;
		}

		if (typeof sValue === 'string') {
			this._updateInternalIllustrationSetAndType(sValue);
		}

		return this.setProperty("illustrationType", sValue);
	};

	/**
	 * Sets the title of the IllustratedMessage as default aria-labelledby to the Illustration.
	 * @private
	 */
	IllustratedMessage.prototype._setDefaultIllustrationLabel = function (sValue) {
		var aAriaLabelledBy = this.getAssociation("ariaLabelledBy"),
			sTitleId = this._getTitle().sId;

		// check if falsy or empty array
		if (!aAriaLabelledBy || !aAriaLabelledBy.length) {
			this.addIllustrationAriaLabelledBy(sTitleId);
		}
	};


	/**
	 * Gets the default text for the description aggregation.
	 * @private
	 * @returns {string} The default text.
	 */
	IllustratedMessage.prototype._getDefaultDescription = function () {
		return this._findDefaultText(IllustratedMessage.PREPENDS.DESCRIPTION);
	};

	/**
	 * Gets the default text for the title aggregation.
	 * @private
	 * @returns {string} The default text.
	 */
	IllustratedMessage.prototype._getDefaultTitle = function () {
		return this._findDefaultText(IllustratedMessage.PREPENDS.TITLE);
	};

	/**
	 * Gets the default text for the title or the description aggregation.
	 * @private
	 * @param {string} sPrepend - prepend being either the title or the description for the bundle key
	 * @returns {string} The default text.
	 */
	IllustratedMessage.prototype._findDefaultText = function(sPrepend) {
		var oBundle = this._getResourceBundle();

		// first we try to access the "original" text
		// then try to fallback to "original" text without appended version (_v*** after the original type key)
		// then try to fallback to "original" text from the IllustratedMessage.FALLBACK_TEXTS map
		return oBundle.getText(sPrepend + this._sIllustrationType, undefined, true) ||
			oBundle.getText(sPrepend + this._sIllustrationType.substr(0, this._sIllustrationType.indexOf('_v')) , undefined, true) ||
			oBundle.getText(sPrepend + IllustratedMessage.FALLBACK_TEXTS[this._sIllustrationType], undefined, true);
	};

	/**
	 * Helper method which decides if the title should be rendered.
	 * When it's empty it shouldn't take space in the DOM.
	 * @private
	 * @returns {boolean} whether or not the title should be rendered
	 */
	IllustratedMessage.prototype._shouldRenderTitle = function () {
		return this._getTitle().getText().length !== 0;
	};

	/**
	 * Helper method which decides if the description should be rendered.
	 * When it's empty it shouldn't take space in the DOM.
	 * @private
	 * @returns {boolean} whether or not the description should be rendered
	 */
	IllustratedMessage.prototype._shouldRenderDescription = function () {
		var oDescription = this._getDescription();

		if (this.getEnableFormattedText()) {
			return oDescription.getHtmlText().length !== 0;
		} else {
			return oDescription.getText().length !== 0;
		}
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
	 * Gets content of the formattedText aggregation.
	 * @private
	 * @returns {sap.m.FormattedText} The sap.m.FormattedText control instance
	 */
	IllustratedMessage.prototype._getFormattedText = function () {
		var sDescription = this.getDescription(),
			oFormattedText = this.getAggregation("_formattedText");

		if (!oFormattedText) {
			oFormattedText = new FormattedText({textAlign: TextAlign.Center});
			this.setAggregation("_formattedText", oFormattedText);
		}

		if (!sDescription && this.getEnableDefaultTitleAndDescription()) {
			// Use default text for the description if applicable
			oFormattedText.setHtmlText(this._getDefaultDescription());
		} else {
			oFormattedText.setHtmlText(sDescription);
		}

		return oFormattedText;
	};

	/**
	 * Gets content of the illustration aggregation.
	 * @private
	 * @returns {sap.m.Illustration} The sap.m.Illustration control instance
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
		return Library.getResourceBundleFor("sap.m");
	};

	/**
	 * Gets content of the _text aggregation.
	 * @private
	 * @returns {sap.m.Text} The sap.m.Text control instance
	 */
	IllustratedMessage.prototype._getText = function () {
		var sDescription = this.getDescription(),
			oText = this.getAggregation("_text");

		if (!oText) {
			oText = new Text({textAlign: TextAlign.Center});
			this.setAggregation("_text", oText);
		}

		if (!sDescription && this.getEnableDefaultTitleAndDescription()) {
			// Use default text for the description if applicable
			oText.setText(this._getDefaultDescription());
		} else {
			oText.setText(sDescription);
		}

		return oText;
	};

	/**
	 * Gets content of the _title aggregation.
	 * @private
	 * @returns {sap.m.Title} The sap.m.Title control instance
	 */
	IllustratedMessage.prototype._getTitle = function () {
		var sTitle = this.getTitle(),
			oTitle = this.getAggregation("_title");

		if (!oTitle) {
			oTitle = new Title({wrapping: true});
			this.setAggregation("_title", oTitle);
		}

		if (!sTitle && this.getEnableDefaultTitleAndDescription()) {
			// Use default text for the title if applicable
			oTitle.setText(this._getDefaultTitle());
		} else {
			oTitle.setText(sTitle);
		}

		return oTitle;
	};

	/**
	 * PRIVATE METHODS
	 */

	/**
	 * Helper function which ensures that there is non-breaking space between the last two words
	 * of a given DOM content. By adding it, we prevent one word (widow) on the last row of a text node.
	 * @param {HTMLElement} oDomRef - the DOM object which will be checked against
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
			sSize, sCustomSize;

		if (oDomRef) {
			sSize = this.getIllustrationSize();
			if (sSize === IllustratedMessageSize.Auto) {
				this._updateMedia(oDomRef.getBoundingClientRect().width, oDomRef.getBoundingClientRect().height);
			} else {
				sCustomSize = IllustratedMessage.MEDIA[sSize.toUpperCase()];
				this._updateSymbol(sCustomSize);
				this._updateMediaStyle(sCustomSize);
			}
		}

	};

	/**
	 * Caches the <code>IllustratedMessage</code> illustration set and illustration type in private instance variables.
	 * @param {string} sValue The Set-Type pair which should be stored
	 * @private
	 */
	IllustratedMessage.prototype._updateInternalIllustrationSetAndType = function (sValue) {
		var aValues = sValue.split("-");

		this._sIllustrationSet = aValues[0];
		this._sIllustrationType = aValues[1];
	};

	/**
	 * Handles the resize event of the <code>IllustratedMessage</code>.
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	IllustratedMessage.prototype._onResize = function (oEvent) {
		var iCurrentWidth = oEvent.size.width,
			iCurrentHeight = oEvent.size.height;

		this._updateMedia(iCurrentWidth, iCurrentHeight);
	};

	/**
	 * Updates the media size of the control based on its own width and height, not on the entire screen size (which media query does).
	 * @param {number} iWidth - the actual width of the control
	 * @param {number} iHeight - the actual height of the control
	 * @private
	 */
	IllustratedMessage.prototype._updateMedia = function (iWidth, iHeight) {
		var bVertical = this.getEnableVerticalResponsiveness(),
			sNewMedia, iLastKnownWidth, iLastKnownHeight;

		if (!iWidth && !iHeight) {
			return;
		}

		if (iWidth <= IllustratedMessage.BREAK_POINTS.BASE || (iHeight <= IllustratedMessage.BREAK_POINTS_HEIGHT.BASE && bVertical)) {
			sNewMedia = IllustratedMessage.MEDIA.BASE;
		} else if (iWidth <= IllustratedMessage.BREAK_POINTS.DOT || (iHeight <= IllustratedMessage.BREAK_POINTS_HEIGHT.DOT && bVertical)) {
			sNewMedia = IllustratedMessage.MEDIA.DOT;
		} else if (iWidth <= IllustratedMessage.BREAK_POINTS.SPOT || (iHeight <= IllustratedMessage.BREAK_POINTS_HEIGHT.SPOT && bVertical)) {
			sNewMedia = IllustratedMessage.MEDIA.SPOT;
		} else if (iWidth <= IllustratedMessage.BREAK_POINTS.DIALOG || (iHeight <= IllustratedMessage.BREAK_POINTS_HEIGHT.DIALOG && bVertical)) {
			sNewMedia = IllustratedMessage.MEDIA.DIALOG;
		} else {
			sNewMedia = IllustratedMessage.MEDIA.SCENE;
		}

		this._updateSymbol(sNewMedia);

		iLastKnownWidth = this._oLastKnownWidthForMedia[sNewMedia];
		iLastKnownHeight = this._oLastKnownHeightForMedia[sNewMedia];
		// prevents infinite resizing, when same width is detected for the same media,
		// excluding the case in which, the control is placed inside expand/collapse container
		if (this._sLastKnownMedia !== sNewMedia &&
			!(iLastKnownWidth && iWidth === iLastKnownWidth
			&& iLastKnownHeight && iHeight === iLastKnownHeight)
			|| this._oLastKnownWidthForMedia[this._sLastKnownMedia] === 0
			|| this._oLastKnownHeightForMedia[this._sLastKnownMedia] === 0) {
			this._updateMediaStyle(sNewMedia);
			this._oLastKnownWidthForMedia[sNewMedia] = iWidth;
			this._oLastKnownHeightForMedia[sNewMedia] = iHeight;
			this._sLastKnownMedia = sNewMedia;
		}
	};

	/**
	 * It puts the appropriate classes on the control based on the current media size.
	 * @param {string} sCurrentMedia The media currently being used
	 * @private
	 */
	IllustratedMessage.prototype._updateMediaStyle = function (sCurrentMedia) {
		if (this._sLastKnownMedia !== sCurrentMedia) {
			this._sLastKnownMedia = sCurrentMedia;
		} else {
			return; // No need to iterate over the media classes if the media is the same as the one previously used
		}
		Object.keys(IllustratedMessage.MEDIA).forEach(function (sMedia) {
			var bEnable = sCurrentMedia === IllustratedMessage.MEDIA[sMedia];
			this.toggleStyleClass(IllustratedMessage.MEDIA[sMedia], bEnable);
		}, this);
	};

	/**
	 * Updates illustration's symbol based on the current media size.
	 * @param {string} sCurrentMedia
	 * @private
	 */

	 IllustratedMessage.prototype._updateSymbol = function (sCurrentMedia) {
		// No need to require a resource for BASE illustrationSize, since there is none
		if (sCurrentMedia === IllustratedMessage.MEDIA.BASE) {
			return;
		}

		var sIdMedia = sCurrentMedia.substring(sCurrentMedia.indexOf('-') + 1);

		this._getIllustration()
			.setSet(this._sIllustrationSet, true)
			.setMedia(sIdMedia, true)
			.setType(this._sIllustrationType);

	};

	/**
	 * Returns a fallback media size, for cases when the initially requested asset is not found.
	 * Chooses the illustration breakpoint bigger than the current one (e.g. Dot -> Spot).
	 *
	 * @since 1.108.0
	 * @return {string} The fallback media size
	 * @private
	 */
	 IllustratedMessage.prototype._getFallbackMedia = function () {
		var sMedia = this._sLastKnownMedia,
			aMediaValues = Object.values(IllustratedMessage.MEDIA),
			iIndexOfMedia = aMediaValues.indexOf(sMedia);

		if (iIndexOfMedia > -1 && iIndexOfMedia < aMediaValues.length - 1) {
			return aMediaValues[iIndexOfMedia + 1];
		} else {
			return aMediaValues[aMediaValues.length - 1];
		}
	};

	/**
	 * Handles missing assets by setting the media to a larger size.
	 * Once no larger media size is available, displays no SVG.
	 *
	 * @since 1.108.0
	 * @static
	 * @private
	 */
	IllustratedMessage.prototype._handleMissingAsset = function () {
		var oIllustration,
			aMediaValues = Object.values(IllustratedMessage.MEDIA),
			sFallbackMedia = "";

		if (this._sLastKnownMedia !== aMediaValues[aMediaValues.length - 1]) {
			oIllustration = this._getIllustration();
			sFallbackMedia = this._getFallbackMedia();
			oIllustration.setMedia(sFallbackMedia.substring(sFallbackMedia.indexOf('-') + 1));
			Log.warning(this._sLastKnownMedia + " is unavailable, retrying with larger size...", this);
		} else {
			Log.warning("No larger fallback asset available, no SVG will be displayed.", this);
		}
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
	 * @param {Object} oObject object on which the resize handler is being registered
	 * @param {Function} fnHandler the callback function for each resize
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

	/**
	 * Returns object with ID references of the title and description containers.
	 *
	 * <b>Note:</b> Changing the value of the <code>enableFormattedText</code> property changes the references of
	 * of title and description containers.
	 * @protected
	 * @since 1.98.0
	 * @returns {object} Object with 2 fields representing the ID references of the title and description in the IllustratedMessage
	 */
	 IllustratedMessage.prototype.getAccessibilityReferences = function () {
		return {
			title: this._getTitle().getId(),
			description: this._getDescription().getId()
		};
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {object} Accessibility information for <code>sap.m.IllustratedMessage</code> control
	 * @since 1.101
	 * @protected
	 */
	IllustratedMessage.prototype.getAccessibilityInfo = function () {
		var sTitle = this._getTitle().getText(),
			sDescription = this._getDescription().getText(),
			aAdditionalContent = this.getAdditionalContent();
		return {
			type: this._getResourceBundle().getText("ACC_CTR_ILLUSTRATED_MESSAGE"),
			description: sTitle + ". " + sDescription,
			focusable: !!aAdditionalContent.length,
			children: aAdditionalContent
		};
	};

	IllustratedMessage.prototype.addIllustrationAriaLabelledBy = function(sID) {
		var aAriaLabelledBy = this.getAssociation("ariaLabelledBy"),
			sTitleId = this._getTitle().sId,
			oIllustratedMessageIllustration = this._getIllustration();

		this.addAssociation("ariaLabelledBy", sID, true);

		if (aAriaLabelledBy && aAriaLabelledBy.includes(sTitleId)) {
			this.removeIllustrationAriaLabelledBy(sTitleId);
		}

		oIllustratedMessageIllustration.addAriaLabelledBy(sID);

		return this;
	};

	IllustratedMessage.prototype.removeIllustrationAriaLabelledBy = function(sID) {

		this.removeAssociation("ariaLabelledBy", sID, true);

		var oIllustratedMessageIllustration = this._getIllustration();
		oIllustratedMessageIllustration.removeAriaLabelledBy(sID);

		this._setDefaultIllustrationLabel();

		return this;
	};

	IllustratedMessage.prototype.removeAllAriaLabelledBy = function(sID) {
		this.removeAssociation("ariaLabelledBy", sID, true);

		var oIllustratedMessageIllustration = this._getIllustration();
		oIllustratedMessageIllustration.removeAllAriaLabelledBy(sID);

		this._setDefaultIllustrationLabel();

		return this;
	};

	IllustratedMessage.prototype.setAriaTitleLevel = function(sTitleLevel) {
		this.setProperty("ariaTitleLevel", sTitleLevel, true);

		this._getTitle().setLevel(sTitleLevel);

		return this;
	};

	return IllustratedMessage;

});
