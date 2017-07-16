/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './NotificationListBase', 'sap/ui/core/InvisibleText'],
	function (jQuery, library, Control, NotificationListBase, InvisibleText) {

	'use strict';

	/**
	 * Constructor for a new NotificationListItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItem control is suitable for showing notifications to the user.
	 * @extends sap.m.NotificationListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.NotificationListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NotificationListItem = NotificationListBase.extend('sap.m.NotificationListItem', /** @lends sap.m.NotificationListItem.prototype */ {
		metadata: {
			library: 'sap.m',
			properties: {
				/**
				 * Determines the description of the NotificationListItem.
				 */
				description: {type: 'string', group: 'Appearance', defaultValue: ''},

				/**
				 * Determines if the text in the title and the description of the notification are truncated to the first two lines.
				 */
				truncate: {type: 'boolean', group: 'Appearance', defaultValue: true},

				/**
				 * Determines it the "Show More" button should be hidden.
				 */
				hideShowMoreButton: {type: 'boolean', group: 'Appearance', defaultValue: false}
			},
			aggregations: {
				/**
				 * The sap.m.MessageStrip control that holds the information about any error that may occur when pressing the notification buttons
				 */
				processingMessage: {type: 'sap.m.MessageStrip', multiple: false},
				/**
				 * The text control that holds the description text of the NotificationListItem.
				 * @private
				 */
				_bodyText: {type: 'sap.m.Text', multiple: false, visibility: "hidden"}
			}
		}
	});

	NotificationListItem.prototype.init = function () {
		sap.m.NotificationListBase.prototype.init.call(this);

		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		this._expandText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_MORE');
		this._collapseText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_LESS');
		this._closeText = resourceBundle.getText('NOTIFICATION_LIST_BASE_CLOSE');

		//set it to an active ListItemBase to the press and tap events are fired
		this.setType('Active');

		/**
		 * @type {sap.m.Button}
		 * @private
		 */
		var _closeButton = new sap.m.Button(this.getId() + '-closeButton', {
			type: sap.m.ButtonType.Transparent,
			icon: sap.ui.core.IconPool.getIconURI('decline'),
			tooltip: this._closeText,
			press: function () {
				this.close();
			}.bind(this)
		});

		this.setAggregation("_closeButton", _closeButton, true);

		/**
		 * @type {sap.m.Button}
		 * @private
		 */
		var _collapseButton = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			text: this.getTruncate() ? this._expandText : this._collapseText,
			id: this.getId() + '-expandCollapseButton',
			press: function () {
				this._deregisterResize();
				this.setProperty("truncate", !this.getTruncate(), true);
				_collapseButton.setText(this.getTruncate() ? this._expandText : this._collapseText);

				this.$().find('.sapMNLI-Header').toggleClass('sapMNLI-TitleWrapper--is-expanded');
				this.$().find('.sapMNLI-TextWrapper').toggleClass('sapMNLI-TextWrapper--is-expanded', this.getDescription());

				this._registerResize();
			}.bind(this)
		});

		this.setAggregation("_collapseButton", _collapseButton, true);

		/**
		 * InvisibleText used to implement the ARIA specification.
		 * @private
		 */
		this._ariaDetailsText = new InvisibleText({
			id: this.getId() + '-info'
		}).toStatic();
	};

	//================================================================================
	// Overwritten setters and getters
	//================================================================================

	NotificationListItem.prototype.setDescription = function (description) {
		var result = this.setProperty('description', description);

		this._getDescriptionText().setText(description);

		return result;
	};

	NotificationListItem.prototype.setDatetime = function (dateTime) {
		var result = sap.m.NotificationListBase.prototype.setDatetime.call(this, dateTime);
		this._updateAriaAdditionalInfo();

		return result;
	};

	NotificationListItem.prototype.setUnread = function (unread) {
		/* @type {sap.m.NotificationListItem} Reference to <code>this</code> to allow method chaining */
		var result = this.setProperty('unread', unread, true);
		/* @type {sap.m.Title} */
		var title = this.getAggregation('_headerTitle');
		if (title) {
			title.toggleStyleClass('sapMNLI-Unread', this.getUnread());
		}

		return result;
	};

	NotificationListItem.prototype.setPriority = function (priority, suppressInvalidation) {
		var result = this.setProperty('priority', priority, suppressInvalidation);

		this._updateAriaAdditionalInfo();

		return result;
	};

	NotificationListItem.prototype.setAuthorPicture = function (authorPicture, suppressInvalidation) {
		var result = this.setProperty('authorPicture', authorPicture, suppressInvalidation);

		this._getAuthorImage().setSrc(authorPicture);

		return result;
	};

	NotificationListItem.prototype.clone = function () {
		return NotificationListBase.prototype.clone.apply(this, arguments);
	};

	//================================================================================
	// Control methods
	//================================================================================

	NotificationListItem.prototype.onBeforeRendering = function () {
		this._updateAriaAdditionalInfo();
		this._deregisterResize();
	};

	NotificationListItem.prototype.onAfterRendering = function () {
		this._registerResize();
	};

	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	NotificationListItem.prototype.exit = function () {
		this._deregisterResize();

		if (this._ariaDetailsText) {
			this._ariaDetailsText.destroy();
			this._ariaDetailsText = null;
		}
	};

	//================================================================================
	// Private getters and setters
	//================================================================================

	/**
	 * Returns the sap.m.Text control used in the NotificationListItem's description.
	 * @returns {sap.m.Text} The notification description text
	 * @private
	 */
	NotificationListItem.prototype._getDescriptionText = function () {
		var bodyText = this.getAggregation('_bodyText');

		if (!bodyText) {
			bodyText = new sap.m.Text({
				id: this.getId() + '-body',
				text: this.getDescription(),
				maxLines: 2
			}).addStyleClass('sapMNLI-Text');

			this.setAggregation("_bodyText", bodyText, true);
		}

		return bodyText;
	};

	//================================================================================
	// Private and protected internal methods
	//================================================================================

	/**
	 * Overrides the ListItemBase class toggling.
	 * @private
	 */
	NotificationListItem.prototype._activeHandling = function () {
		this.$().toggleClass("sapMNLIActive", this._active);
	};

	/**
	 * Updates the hidden text, used for the ARIA support.
	 * @private
	 */
	NotificationListItem.prototype._updateAriaAdditionalInfo = function () {
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var readUnreadText = this.getUnread() ?
			resourceBundle.getText('NOTIFICATION_LIST_ITEM_UNREAD') : resourceBundle.getText('NOTIFICATION_LIST_ITEM_READ');
		var dueAndPriorityString = resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
			[this.getDatetime(), this.getPriority()]);
		var authorName = this.getAuthorName();
		var ariaText = readUnreadText + ' ';

		if (authorName) {
			ariaText += resourceBundle.getText('NOTIFICATION_LIST_ITEM_CREATED_BY') + ' ' + this.getAuthorName() + ' ';
		}

		ariaText += dueAndPriorityString;
		this._ariaDetailsText.setText(ariaText);
	};

	/**
	 * Returns true if the text in the title or the text in the description is longer than two lines.
	 * @returns {boolean} Whether the control should be truncated.
	 * @private
	 */
	NotificationListItem.prototype._canTruncate = function () {
		var titleHeight = this.getDomRef('title').offsetHeight;
		var titleWrapperHeight = this.getDomRef('title').parentElement.offsetHeight;
		var textHeight;
		var textWrapperHeight;
		if (this._getDescriptionText().getText()) {
			textHeight = this.getDomRef("body").offsetHeight;
			textWrapperHeight = this.getDomRef("body").parentElement.offsetHeight;
		}


		return textHeight > textWrapperHeight || titleHeight > titleWrapperHeight;
	};

	NotificationListItem.prototype._showHideTruncateButton = function () {
		var notificationDomRef = this.getDomRef();

		if (this._canTruncate() && (!this.getHideShowMoreButton())) { // if the Notification has long text

			// show the truncate button
			this.getDomRef('expandCollapseButton').classList.remove('sapMNLI-CollapseButtonHide');

			// set the truncate button text && toggle 'collapse' class
			if (this.getTruncate()) {
				this.getAggregation('_collapseButton').setText(this._expandText);
				notificationDomRef.querySelector('.sapMNLI-Header').classList.remove('sapMNLI-TitleWrapper--is-expanded');

				if (this.getDescription()) {
					notificationDomRef.querySelector('.sapMNLI-TextWrapper').classList.remove('sapMNLI-TextWrapper--is-expanded');
				}
			} else {
				this.getAggregation('_collapseButton').setText(this._collapseText);
				this.$().find('.sapMNLI-TextWrapper').toggleClass('sapMNLI-TextWrapper--is-expanded', this.getDescription());

				notificationDomRef.querySelector('.sapMNLI-Header').classList.add('sapMNLI-TitleWrapper--is-expanded');
			}

		} else {
			// hide the truncate button
			this.getDomRef('expandCollapseButton').classList.add('sapMNLI-CollapseButtonHide');
		}

		// remove classes used only to calculate text size
		if (this.getDescription()) {
			notificationDomRef.querySelector('.sapMNLI-TextWrapper').classList.remove('sapMNLI-TextWrapper--initial-overwrite');
		}

		if (this.getTitle()) {
			notificationDomRef.querySelector('.sapMNLI-Header').classList.remove('sapMNLI-TitleWrapper--initial-overwrite');
		}
	};

	NotificationListItem.prototype._deregisterResize = function () {
		if (this._sNotificationResizeHandler) {
			sap.ui.core.ResizeHandler.deregister(this._sNotificationResizeHandler);
			this._sNotificationResizeHandler = null;
		}
	};

	NotificationListItem.prototype._registerResize = function () {
		var that = this;
		var notificationDomRef = this.getDomRef();
		if (!notificationDomRef) {
			//exit for invisible items
			return;
		}

		that._resizeNotification();

		this._sNotificationResizeHandler = sap.ui.core.ResizeHandler.register(notificationDomRef, function () {
			that._resizeNotification();
		});
	};

	/**
	 * Resize handler for the NotificationListItem.
	 * @private
	 */
	NotificationListItem.prototype._resizeNotification = function () {
		var notificationDomRef = this.getDomRef();
		var core = sap.ui.getCore();

		if (notificationDomRef.offsetWidth >= 640) {
			notificationDomRef.classList.add('sapMNLI-LSize');
		} else {
			notificationDomRef.classList.remove('sapMNLI-LSize');
		}
		if (this._getDescriptionText().getText()) {
			notificationDomRef.querySelector('.sapMNLI-TextWrapper').classList.remove('sapMNLI-TextWrapper--is-expanded');
			notificationDomRef.querySelector('.sapMNLI-TextWrapper').classList.add('sapMNLI-TextWrapper--initial-overwrite');
		}
		notificationDomRef.querySelector('.sapMNLI-Header').classList.remove('sapMNLI-TitleWrapper--is-expanded');
		notificationDomRef.querySelector('.sapMNLI-Header').classList.add('sapMNLI-TitleWrapper--initial-overwrite');

		if (core.isThemeApplied()) {
			this._showHideTruncateButton();
		} else {
			core.attachThemeChanged(this._showHideTruncateButton, this);
		}
	};

	return NotificationListItem;
}, /* bExport= */ true);
