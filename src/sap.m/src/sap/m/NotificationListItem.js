/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './ListItemBase', './Text', './Button',
		'sap/ui/core/InvisibleText', './Image', './OverflowToolbar', './ToolbarSpacer', 'sap/ui/core/Icon'],
	function (jQuery, library, Control, ListItemBase, Text, Button, InvisibleText, Image, OverflowToolbar, ToolbarSpacer, Icon) {

		'use strict';

		/**
		 * Constructor for a new NotificationListItem.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The NotificationListItem control is suitable for showing notifications to the user.
		 * @extends sap.m.ListItemBase
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
		var NotificationListItem = ListItemBase.extend('sap.m.NotificationListItem', /** @lends sap.m.NotificationListItem.prototype */ {
			metadata: {
				library: 'sap.m',
				properties: {
					// unread is inherit from the ListItemBase.

					/**
					 * Determines the priority of the Notification.
					 */
					priority: {
						type: 'sap.ui.core.Priority',
						group: 'Appearance',
						defaultValue: sap.ui.core.Priority.None
					},

					/**
					 * Determines the title of the NotificationListItem.
					 */
					title: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the description of the NotificationListItem.
					 */
					description: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the due date of the NotificationListItem.
					 */
					datetime: {type: 'string', group: 'Appearance'},

					/**
					 * Determines the action buttons visibility.
					 */
					showButtons: {type: 'boolean', group: 'Behavior', defaultValue: true},

					/**
					 * Determines the close button visibility.
					 */
					showCloseButton: {type: 'boolean', group: 'Behavior', defaultValue: true},

					/**
					 * Determines the notification's author name.
					 */
					authorName: {type: 'string', group: 'Appearance', defaultValue: ''},

					/**
					 * Determines the notification's author picture address.
					 */
					authorPicture: {type: 'sap.ui.core.URI',  multiple: false},

					/**
					 * Determines if the text in the title and the description of the notification are truncated to the first two lines.
					 */
					truncate: {type: 'boolean', group: 'Appearance', defaultValue: true}
				},
				aggregations: {
					/**
					 * Action buttons.
					 */
					buttons: {type: 'sap.m.Button', multiple: true},

					/**
					 * The title control that holds the datetime text of the NotificationListItem.
					 * @private
					 */
					_headerTitle: {type: 'sap.m.Text', multiple: false, visibility: "hidden"},

					/**
					 * The text control that holds the description text of the NotificationListItem.
					 * @private
					 */
					_bodyText: {type: 'sap.m.Text', multiple: false, visibility: "hidden"},

					/**
					 * The text control that holds the datetime text of the NotificationListItem.
					 * @private
					 */
					_dateTime: {type: 'sap.m.Text', multiple: false, visibility: "hidden"},

					/**
					 * The OverflowToolbar control that holds the footer buttons.
					 * @private
					 */
					_overflowToolbar: {type: 'sap.m.OverflowToolbar', multiple: false, visibility: "hidden"},

					/**
					 * The sap.m.Text that holds the author name.
					 * @private
					 */
					_authorName: {type: 'sap.m.Text', multiple: false, visibility: "hidden"},

					/**
					 * The sap.m.Image or sap.ui.core.Control control that holds the author image or icon.
					 * @private
					 */
					_authorImage: {type: 'sap.ui.core.Control', multiple: false, visibility: "hidden"},

					/**
					 * The close button of the notification item/group.
					 * @private
					 */
					_closeButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"},

					/**
					 * The collapse button of the notification item/group.
					 * @private
					 */
					_collapseButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"},

					/**
					 * InvisibleText used to implement the ARIA specification.
					 * @private
					 */
					_ariaDetailsText: {type: 'sap.ui.core.InvisibleText', multiple: false, visibility: "hidden"}
				},
				events: {
					/**
					 * Fired when the list item is closed.
					 */
					close: {}

					// 'tap' and 'press' events are inherited from ListItemBase.
				}
			}
		});

		NotificationListItem.prototype.init = function () {
			var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
			this._expandText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_MORE');
			this._collapseText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_LESS');

			//set it to an active ListItemBase to the press and tap events are fired
			this.setType('Active');

			/**
			 * @type {sap.m.Button}
			 * @private
			 */
			this._closeButton = new sap.m.Button(this.getId() + '-closeButton', {
				type: sap.m.ButtonType.Transparent,
				icon: sap.ui.core.IconPool.getIconURI('decline'),
				press: function () {
					this.close();
				}.bind(this)
			});

			/**
			 * @type {sap.m.Button}
			 * @private
			 */
			this._collapseButton = new sap.m.Button({
				type: sap.m.ButtonType.Transparent,
                text: this.getTruncate() ? this._expandText : this._collapseText,
                id: this.getId() + '-expandCollapseButton',
				press: function () {
					this._deregisterResize();
					this.setProperty("truncate", !this.getTruncate(), true);
                    this._collapseButton.setText(this.getTruncate() ? this._expandText : this._collapseText);
                    this.getDomRef().querySelector('.sapMNLI-TextWrapper').classList.toggle('sapMNLI-TextWrapper--is-expanded');
					this.getDomRef().querySelector('.sapMNLI-Header').classList.toggle('sapMNLI-TitleWrapper--is-expanded');
					this._registerResize();
                }.bind(this)
			});

			/**
			 * @type {sap.ui.core.InvisibleText}
			 * @private
			 */
			this._ariaDetailsText = new InvisibleText({
				id: this.getId() + '-info'
			}).toStatic();

			/**
			 * @type {sap.m.OverflowToolbar}
			 * @private
			 */
			this.setAggregation('_overflowToolbar', new OverflowToolbar());
		};

		NotificationListItem.prototype.onBeforeRendering = function () {
			this._deregisterResize();
		};

		NotificationListItem.prototype.onAfterRendering = function () {
			this._showHideTruncateButton();
			this._registerResize();
		};

		//================================================================================
		// Overwritten setters and getters
		//================================================================================

		NotificationListItem.prototype.setTitle = function (title) {
			var result = this.setProperty('title', title, true);

			this._getHeaderTitle().setText(title);

			return result;
		};

		NotificationListItem.prototype.setDescription = function (description) {
			var result = this.setProperty('description', description, true);

			this._getDescriptionText().setText(description);

			return result;
		};

		NotificationListItem.prototype.setDatetime = function (dateTime) {
			var result = this.setProperty('datetime', dateTime, true);

			this._getDateTimeText().setText(dateTime);
			this._updateAriaAdditionalInfo();

			return result;
		};

		NotificationListItem.prototype.setUnread = function (unread) {
			/** @type {sap.m.NotificationListItem} Reference to <code>this</code> to allow method chaining */
			var result = this.setProperty('unread', unread, true);
			/** @type {sap.m.Title} */
			var title = this.getAggregation("_headerTitle");
			if (title) {
				title.toggleStyleClass('sapMNLI-Unread', this.getUnread());
			}

			return result;
		};

		NotificationListItem.prototype.setPriority = function(priority, suppressInvalidation) {
			var result = this.setProperty('priority', priority, suppressInvalidation);

			this._updateAriaAdditionalInfo();

			return result;
		};

		NotificationListItem.prototype.setAuthorName = function(authorName) {
			var result = this.setProperty('authorName', authorName, true);

			this._getAuthorName().setText(authorName);

			return result;
		};

		NotificationListItem.prototype.setAuthorPicture = function(authorPicture, suppressInvalidation) {
			var result = this.setProperty('authorPicture', authorPicture, suppressInvalidation);

			this._getAuthorImage().setSrc(authorPicture);

			return result;
		};

		//================================================================================
		// Delegation aggregation methods to the Overflow Toolbar
		//================================================================================

		NotificationListItem.prototype.bindAggregation = function (aggregationName, bindingInfo) {
			if (aggregationName == 'buttons') {
				this.getAggregation('_overflowToolbar').bindAggregation('content', bindingInfo);
				return this;
			} else {
				 return sap.ui.core.Control.prototype.bindAggregation.call(this, aggregationName, bindingInfo);
			}
		};

		NotificationListItem.prototype.validateAggregation = function (aggregationName, object, multiple) {
			if (aggregationName == 'buttons') {
				this.getAggregation('_overflowToolbar').validateAggregation('content', object, multiple);
				return this;
			} else {
				return sap.ui.core.Control.prototype.validateAggregation.call(this, aggregationName, object, multiple);
			}
		};

		NotificationListItem.prototype.setAggregation = function (aggregationName, object, suppressInvalidate) {
			if (aggregationName == 'buttons') {
				this.getAggregation('_overflowToolbar').setAggregation('content', object, suppressInvalidate);
				return this;
			} else {
				return sap.ui.core.Control.prototype.setAggregation.call(this, aggregationName, object, suppressInvalidate);
			}
		};

		NotificationListItem.prototype.getAggregation = function (aggregationName, defaultObjectToBeCreated) {
			if (aggregationName == 'buttons') {
				var toolbar = this.getAggregation('_overflowToolbar');

				return toolbar.getContent().filter(function (item) {
					return item instanceof sap.m.Button;
				});
			} else {
				return sap.ui.core.Control.prototype.getAggregation.call(this, aggregationName, defaultObjectToBeCreated);
			}
		};

		NotificationListItem.prototype.indexOfAggregation = function (aggregationName, object) {
			if (aggregationName == 'buttons') {
				this.getAggregation('_overflowToolbar').indexOfAggregation('content', object);
				return this;
			} else {
				return sap.ui.core.Control.prototype.indexOfAggregation.call(this, aggregationName, object);
			}
		};

		NotificationListItem.prototype.insertAggregation = function (aggregationName, object, index, suppressInvalidate) {
			if (aggregationName == 'buttons') {
				this.getAggregation('_overflowToolbar').insertAggregation('content', object, index, suppressInvalidate);
				return this;
			} else {
				return sap.ui.core.Control.prototype.insertAggregation.call(this, object, index, suppressInvalidate);
			}
		};

		NotificationListItem.prototype.addAggregation = function (aggregationName, object, suppressInvalidate) {
			if (aggregationName == 'buttons') {
				var toolbar = this.getAggregation('_overflowToolbar');

				return toolbar.addAggregation('content', object, suppressInvalidate);
			} else {
				return sap.ui.core.Control.prototype.addAggregation.call(this, aggregationName, object, suppressInvalidate);
			}
		};

		NotificationListItem.prototype.removeAggregation = function (aggregationName, object, suppressInvalidate) {
			if (aggregationName == 'buttons') {
				return this.getAggregation('_overflowToolbar').removeAggregation('content', object, suppressInvalidate);
			} else {
				return sap.ui.core.Control.prototype.removeAggregation.call(this, aggregationName, object, suppressInvalidate);
			}
		};

		NotificationListItem.prototype.removeAllAggregation = function (aggregationName, suppressInvalidate) {
			if (aggregationName == 'buttons') {
				return this.getAggregation('_overflowToolbar').removeAllAggregation('content', suppressInvalidate);
			} else {
				return sap.ui.core.Control.prototype.removeAllAggregation.call(this, aggregationName, suppressInvalidate);
			}
		};

		NotificationListItem.prototype.destroyAggregation = function (aggregationName, suppressInvalidate) {
			if (aggregationName == 'buttons') {
				return this.getAggregation('_overflowToolbar').destroyAggregation('content', suppressInvalidate);
			} else {
				return sap.ui.core.Control.prototype.destroyAggregation.call(this, aggregationName, suppressInvalidate);
			}
		};

		NotificationListItem.prototype.getBinding = function (aggregationName) {
			if (aggregationName == 'buttons') {
				return this.getAggregation('_overflowToolbar').getBinding('content');
			} else {
				return sap.ui.core.Control.prototype.getBinding.call(this, aggregationName);
			}
		};

		NotificationListItem.prototype.getBindingInfo = function (aggregationName) {
			if (aggregationName == 'buttons') {
				return this.getAggregation('_overflowToolbar').getBindingInfo('content');
			} else {
				return sap.ui.core.Control.prototype.getBindingInfo.call(this, aggregationName);
			}
		};

		NotificationListItem.prototype.getBindingPath = function (aggregationName) {
			if (aggregationName == 'buttons') {
				return this.getAggregation('_overflowToolbar').getBindingPath('content');
			} else {
				return sap.ui.core.Control.prototype.getBindingPath.call(this, aggregationName);
			}
		};

		NotificationListItem.prototype.clone = function () {
			var clonedObject = Control.prototype.clone.apply(this, arguments);

			// "_overflowToolbar" aggregation is hidden and it is not cloned by default
			var overflowToolbar = this.getAggregation('_overflowToolbar');
			clonedObject.setAggregation("_overflowToolbar", overflowToolbar.clone(), true);

			return clonedObject;
		};

		NotificationListItem.prototype.close = function () {
			var parent = this.getParent();
			this.fireClose();

			if (parent && parent instanceof sap.ui.core.Element) {
				parent.focus();
			}
		};

		/**
		 * Called when the control is destroyed.
		 *
		 * @private
		 */
		NotificationListItem.prototype.exit = function () {
			this._deregisterResize();
		};

		//================================================================================
		// Private getters and setters
		//================================================================================

		/**
		 * Returns the sap.m.Title control used in the NotificationListItem's header title.
		 * @returns {sap.m.Title} The title control inside the Notification List Item
		 * @private
		 */
		NotificationListItem.prototype._getHeaderTitle = function () {
			var title = this.getAggregation("_headerTitle");

			if (!title) {
				title = new Text({
					id: this.getId() + '-title',
					text: this.getTitle(),
					maxLines: 2
				});

				this.setAggregation("_headerTitle", title, true);
			}

			return title;
		};

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

		/**
		 * Returns the sap.m.Text control used in the NotificationListItem's datetime.
		 * @returns {sap.m.Text} The notification datetime text
		 * @private
		 */
		NotificationListItem.prototype._getDateTimeText = function () {
			var dateTime = this.getAggregation('_dateTime');

			if (!dateTime) {
				dateTime = new sap.m.Text({
					text: this.getDatetime()
				}).addStyleClass('sapMNLI-Datetime');

				this.setAggregation('_dateTime', dateTime, true);
			}

			return dateTime;
		};

		/**
		 * Returns the sap.m.Text control used in the NotificationListItem's author name.
		 * @returns {sap.m.Text} The notification author name text
		 * @private
		 */
		NotificationListItem.prototype._getAuthorName = function() {
			/** @type {sap.m.Text} */
			var authorName = this.getAggregation('_authorName');

			if (!authorName) {
			    authorName = new Text({
					text: this.getAuthorName()
				}).addStyleClass('sapMNLI-Text');

				this.setAggregation('_authorName', authorName, true);
			}

			return authorName;
		};

		/**
		 * Returns the sap.m.Image or the sap.ui.core.Control used in the NotificationListItem's author picture.
		 * @returns {sap.m.Image|sap.ui.core.Control} The notification author picture text
		 * @private
		 */
		NotificationListItem.prototype._getAuthorImage = function() {
			/** @type {sap.m.Image|sap.ui.core.Control} */
			var authorImage = this.getAggregation('_authorImage');

			if (!authorImage) {
				var authorPicture = this.getAuthorPicture();
				var authorName = this.getAuthorName();

				if (isIcon(authorPicture)) {
					authorImage = new Icon({
						src: authorPicture,
						alt: authorName
					});
				} else {
					authorImage = new Image({
						src: authorPicture,
						alt: authorName
					});
				}

				this.setAggregation('_authorImage', authorImage, true);
			}

			return authorImage;
		};

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

			this._ariaDetailsText.setText(readUnreadText + ' ' + dueAndPriorityString);
		};

		/**
		 * Returns true if the text in the title or the text in the description is longer than two lines.
		 * @returns {boolean}
		 * @private
		 */
        NotificationListItem.prototype._canTruncate = function () {
			var titleHeight = this.getDomRef('title').offsetHeight;
			var titleWrapperHeight = this.getDomRef('title').parentElement.offsetHeight;
            var textHeight = this.getDomRef("body").offsetHeight;
            var textWrapperHeight = this.getDomRef("body").parentElement.offsetHeight;

            return textHeight > textWrapperHeight || titleHeight > titleWrapperHeight;
        };

		NotificationListItem.prototype._showHideTruncateButton = function() {
			var notificationDomRef = this.getDomRef();

			if (this._canTruncate()) { // if the Notification has long text
				// show the truncate button
				this.getDomRef('expandCollapseButton').classList.remove('sapMNLI-CollapseButtonHide');

				// set the truncate button text && toggle 'collapse' class
				if (this.getTruncate()) {
					this._collapseButton.setText(this._expandText);
					notificationDomRef.querySelector('.sapMNLI-TextWrapper').classList.remove('sapMNLI-TextWrapper--is-expanded');
					notificationDomRef.querySelector('.sapMNLI-Header').classList.remove('sapMNLI-TitleWrapper--is-expanded');
				} else {
					this._collapseButton.setText(this._collapseText);
					notificationDomRef.querySelector('.sapMNLI-TextWrapper').classList.add('sapMNLI-TextWrapper--is-expanded');
					notificationDomRef.querySelector('.sapMNLI-Header').classList.add('sapMNLI-TitleWrapper--is-expanded');
				}

			} else {
				// hide the truncate button
				this.getDomRef('expandCollapseButton').classList.add('sapMNLI-CollapseButtonHide');
			}

			// remove classes used only to calculate text size
			notificationDomRef.querySelector('.sapMNLI-TextWrapper').classList.remove('sapMNLI-TextWrapper--initial-overwrite');
			notificationDomRef.querySelector('.sapMNLI-Header').classList.remove('sapMNLI-TitleWrapper--initial-overwrite');
		};

		NotificationListItem.prototype._deregisterResize = function() {
			if (this._sPopupResizeHandler) {
				sap.ui.core.ResizeHandler.deregister(this._sPopupResizeHandler);
				this._sPopupResizeHandler = null;
			}
		};

		NotificationListItem.prototype._registerResize = function () {
			var that = this;

			this._sPopupResizeHandler = sap.ui.core.ResizeHandler.register(this.getDomRef(), function() {
				that.getDomRef().querySelector('.sapMNLI-TextWrapper').classList.remove('sapMNLI-TextWrapper--is-expanded');
				that.getDomRef().querySelector('.sapMNLI-Header').classList.remove('sapMNLI-TitleWrapper--is-expanded');
				that.getDomRef().querySelector('.sapMNLI-TextWrapper').classList.add('sapMNLI-TextWrapper--initial-overwrite');
				that.getDomRef().querySelector('.sapMNLI-Header').classList.add('sapMNLI-TitleWrapper--initial-overwrite');

				that._showHideTruncateButton();
			});
		};

		/**
		 * Checks is a sap.ui.core.URI parameter is a icon src or not.
		 * @param {string} source The source to be checked.
         * @returns {bool} The result of the check
		 * @private
         */
		function isIcon(source) {
			if (!source) {
			    return false;
			}

			var result = window.URI.parse(source);
			return (result.protocol && result.protocol == 'sap-icon');
		}

		return NotificationListItem;
	}, /* bExport= */ true);
