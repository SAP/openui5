/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/Device',
	'./NotificationListBase',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/IconPool',
	'sap/ui/core/ResizeHandler',
	'sap/m/Button',
	'sap/m/Text',
	'./NotificationListItemRenderer'
],
function(
	library,
	Device,
	NotificationListBase,
	InvisibleText,
	IconPool,
	ResizeHandler,
	Button,
	Text,
	NotificationListItemRenderer
	) {
	'use strict';

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	/**
	 * Constructor for a new NotificationListItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItem control shows notifications to the user.
	 * <h4>Structure</h4>
	 * The notification item holds properties for the following elements:
	 * <ul>
	 * <li><code>description</code> - additional detail text.</li>
	 * <li><code>hideShowMoreButton</code> - visibility of the "Show More" button.</li>
	 * <li><code>truncate</code> - determines if title and description are truncated to the first two lines (usually needed on mobile devices).</li>
	 * </ul>
	 * For each item you can set some additional status information about the item processing by adding a {@link sap.m.MessageStrip} to the <code>processingMessage</code> aggregation.
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
				 * Determines if the "Show More" button should be hidden.
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

	/**
	 * Sets initial values for the control.
	 *
	 * @public
	 */
	NotificationListItem.prototype.init = function () {
		NotificationListBase.prototype.init.call(this);

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
		var _closeButton = new Button(this.getId() + '-closeButton', {
			type: ButtonType.Transparent,
			icon: IconPool.getIconURI('decline'),
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
		var _collapseButton = new Button({
			type: ButtonType.Transparent,
			text: this.getTruncate() ? this._expandText : this._collapseText,
			id: this.getId() + '-expandCollapseButton',
			press: function () {
				this._deregisterResize();
				this.setProperty("truncate", !this.getTruncate(), true);
				_collapseButton.setText(this.getTruncate() ? this._expandText : this._collapseText);

				this.$().find('.sapMNLI-Header').toggleClass('sapMNLI-TitleWrapper--is-expanded');
				this.$().find('.sapMNLI-TextWrapper').toggleClass('sapMNLI-TextWrapper--is-expanded', !!this.getDescription());

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

	/**
	 * Sets the description.
	 *
	 * @public
	 * @param {string} description Description.
	 * @returns {sap.m.NotificationListItem} NotificationListItem reference for chaining.
	 */
	NotificationListItem.prototype.setDescription = function (description) {
		var result = this.setProperty('description', description);

		this._getDescriptionText().setText(description);

		return result;
	};

	/**
	 * Sets the DateTime.
	 *
	 * @public
	 * @param {object} dateTime DateTime.
	 * @returns {sap.m.NotificationListBase} NotificationListBase reference for chaining.
	 */
	NotificationListItem.prototype.setDatetime = function (dateTime) {
		var result = NotificationListBase.prototype.setDatetime.call(this, dateTime);
		this._updateAriaAdditionalInfo();

		return result;
	};

	/**
	 * Sets the unread text.
	 *
	 * @public
	 * @param {boolean} unread Indication of unread list item.
	 * @returns {sap.m.NotificationListItem} NotificationListItem reference for chaining.
	 */
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

	/**
	 * Sets the priority of the list item.
	 *
	 * @public
	 * @param {string} priority Priority of the list item.
	 * @param {boolean} suppressInvalidation Indication for suppressing invalidation.
	 * @returns {sap.m.NotificationListItem} NotificationListItem reference for chaining.
	 */
	NotificationListItem.prototype.setPriority = function (priority, suppressInvalidation) {
		var result = this.setProperty('priority', priority, suppressInvalidation);

		this._updateAriaAdditionalInfo();

		return result;
	};

	/**
	 * Sets the author picture for list item.
	 *
	 * @public
	 * @param {string} authorPicture Picture url in string format.
	 * @param {boolean} suppressInvalidation Indication for suppressing invalidation.
	 * @returns {sap.m.NotificationListItem} NotificationListItem reference for chaining.
	 */
	NotificationListItem.prototype.setAuthorPicture = function (authorPicture, suppressInvalidation) {
		var result = this.setProperty('authorPicture', authorPicture, suppressInvalidation);

		this._getAuthorImage().setSrc(authorPicture);

		return result;
	};

	//================================================================================
	// Control methods
	//================================================================================

	/**
	 * Overwrites onBeforeRendering
	 *
	 * @public
	 */
	NotificationListItem.prototype.onBeforeRendering = function () {
		this._updateAriaAdditionalInfo();
		this._deregisterResize();
	};

	/**
	 * Overwrites onAfterRendering
	 *
	 * @public
	 */
	NotificationListItem.prototype.onAfterRendering = function () {
		this._registerResize();
	};

	/**
	 * Handles the <code>focusin</code> event.
	 *
	 * @param {jQuery.Event} event The event object.
	 */
	NotificationListItem.prototype.onfocusin = function (event) {

		if (!Device.browser.msie) {
			return;
		}

		// in IE the elements inside can get the focus (IE issue)
		// https://stackoverflow.com/questions/18259754/ie-click-on-child-does-not-focus-parent-parent-has-tabindex-0
		// in that case just focus the whole item
		var target = event.target;

		if (target !== this.getDomRef() && !target.classList.contains('sapMBtn')) {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.focus();
		}
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
	 *
	 * @private
	 * @returns {sap.m.Text} The notification description text
	 */
	NotificationListItem.prototype._getDescriptionText = function () {
		var bodyText = this.getAggregation('_bodyText');

		if (!bodyText) {
			bodyText = new Text({
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
	 *
	 * @private
	 */
	NotificationListItem.prototype._activeHandling = function () {
		this.$().toggleClass("sapMNLIActive", this._active);
	};

	/**
	 * Updates the hidden text, used for the ARIA support.
	 *
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
	 *
	 * @private
	 * @returns {boolean} Whether the control should be truncated.
	 */
	NotificationListItem.prototype._canTruncate = function () {
		var iTitleHeight = this.getDomRef('title-inner').scrollHeight,
			iTitleWrapperHeight = this.$('title').parent().height();

		if (iTitleHeight > iTitleWrapperHeight) {
			return true;
		}

		if (this.getDomRef('body-inner')) {
			var iBodyHeight = this.getDomRef('body-inner').scrollHeight,
				iBodyWrapperHeight = this.$('body').parent().height();

			if (iBodyHeight > iBodyWrapperHeight) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Shows and hides truncate button.
	 *
	 * @private
	 */
	NotificationListItem.prototype._showHideTruncateButton = function () {

		var notificationDomRef = this.getDomRef(),
			oCore = sap.ui.getCore(),
			oHeaderDomRef,
			oTextWrapperDomRef,
			oCollapseButtonDomRef;

		if (!notificationDomRef) {
			return;
		}

		oHeaderDomRef = notificationDomRef.querySelector('.sapMNLI-Header');
		oTextWrapperDomRef = notificationDomRef.querySelector('.sapMNLI-TextWrapper');
		oCollapseButtonDomRef = this.getDomRef('expandCollapseButton');

		if (this._canTruncate() && (!this.getHideShowMoreButton())) { // if the Notification has long text
			// show the truncate button
			if (oCollapseButtonDomRef) {
				oCollapseButtonDomRef.classList.remove('sapMNLI-CollapseButtonHide');
			}

			// set the truncate button text && toggle 'collapse' class
			if (this.getTruncate()) {
				this.getAggregation('_collapseButton').setText(this._expandText);
				if (oHeaderDomRef) {
					oHeaderDomRef.classList.remove('sapMNLI-TitleWrapper--is-expanded');
				}

				if (this.getDescription() && oTextWrapperDomRef) {
					oTextWrapperDomRef.classList.remove('sapMNLI-TextWrapper--is-expanded');
				}
			} else {
				this.getAggregation('_collapseButton').setText(this._collapseText);
				this.$().find('.sapMNLI-TextWrapper').toggleClass('sapMNLI-TextWrapper--is-expanded', !!this.getDescription());

				if (oHeaderDomRef) {
					oHeaderDomRef.classList.add('sapMNLI-TitleWrapper--is-expanded');
				}
			}

		} else if (oCollapseButtonDomRef) {
			// hide the truncate button
			oCollapseButtonDomRef.classList.add('sapMNLI-CollapseButtonHide');
		}

		// remove classes used only to calculate text size
		if (this.getDescription() && oTextWrapperDomRef) {
			oTextWrapperDomRef.classList.remove('sapMNLI-TextWrapper--initial-overwrite');
		}

		if (this.getTitle() && oHeaderDomRef) {
			oHeaderDomRef.classList.remove('sapMNLI-TitleWrapper--initial-overwrite');
		}

		oCore.detachThemeChanged(this._showHideTruncateButton, this);
	};

	/**
	 * Deregisters resize handler.
	 *
	 * @private
	 */
	NotificationListItem.prototype._deregisterResize = function () {
		if (this._sNotificationResizeHandler) {
			ResizeHandler.deregister(this._sNotificationResizeHandler);
			this._sNotificationResizeHandler = null;
		}
	};

	/**
	 * Registers resize handler.
	 *
	 * @public
	 */
	NotificationListItem.prototype._registerResize = function () {
		var that = this;
		var notificationDomRef = this.getDomRef();
		if (!notificationDomRef) {
			//exit for invisible items
			return;
		}
		that._resizeNotification();

		this._sNotificationResizeHandler = ResizeHandler.register(notificationDomRef, function () {
			that._resizeNotification();
		});
	};

	/**
	 * Resize handler for the NotificationListItem.
	 *
	 * @private
	 */
	NotificationListItem.prototype._resizeNotification = function () {
		var notificationDomRef = this.getDomRef(),
			oDescriptionWrapper = notificationDomRef.querySelector('.sapMNLI-TextWrapper'),
			oHeaderWrapper = notificationDomRef.querySelector('.sapMNLI-Header'),
			core = sap.ui.getCore();

		if (notificationDomRef.offsetWidth >= 640) {
			notificationDomRef.classList.add('sapMNLI-LSize');
		} else {
			notificationDomRef.classList.remove('sapMNLI-LSize');
		}

		if (oDescriptionWrapper) {
			oDescriptionWrapper.classList.remove('sapMNLI-TextWrapper--is-expanded');
			oDescriptionWrapper.classList.add('sapMNLI-TextWrapper--initial-overwrite');
		}

		oHeaderWrapper.classList.remove('sapMNLI-TitleWrapper--is-expanded');
		oHeaderWrapper.classList.add('sapMNLI-TitleWrapper--initial-overwrite');

		if (core.isThemeApplied()) {
			this._showHideTruncateButton();
		} else {
			core.attachThemeChanged(this._showHideTruncateButton, this);
		}
	};

	return NotificationListItem;
});
