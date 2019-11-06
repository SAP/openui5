/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Core',
	'sap/ui/Device',
	'./NotificationListBase',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/IconPool',
	'sap/ui/core/Icon',
	'sap/ui/core/ResizeHandler',
	'sap/m/Link',
	"sap/ui/events/KeyCodes",
	'./NotificationListItemRenderer'
],
function(
	library,
	Core,
	Device,
	NotificationListBase,
	InvisibleText,
	IconPool,
	Icon,
	ResizeHandler,
	Link,
	KeyCodes,
	NotificationListItemRenderer
	) {
	'use strict';

	var resourceBundle = Core.getLibraryResourceBundle('sap.m'),
		expandText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_MORE'),
		collapseText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_LESS'),
		readText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_READ'),
		unreadText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_UNREAD'),
		createdByText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_CREATED_BY');

	// anything better?
	var maxTruncationHeight = 44;

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
				 * The show more button of the notification item.
				 * @private
				 */
				_showMoreButton: {type: 'sap.m.Link', multiple: false, visibility: "hidden"}
			}
		}
	});

	NotificationListItem.prototype.init = function() {
		// set it to an active ListItemBase to the press and tap events are fired
		this.setType('Active');
	};

	NotificationListItem.prototype.onBeforeRendering = function() {
		NotificationListBase.prototype.onBeforeRendering.call(this);

		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};

	NotificationListItem.prototype.onAfterRendering = function() {

		if (this.getHideShowMoreButton()) {
			return;
		}

		this._updateShowMoreButtonVisibility();

		if (this.getDomRef()) {
			this._resizeListenerId = ResizeHandler.register(this.getDomRef(),  this._onResize.bind(this));
		}
	};

	/**
	 * Handles the <code>focusin</code> event.
	 *
	 * @param {jQuery.Event} event The event object.
	 */
	NotificationListItem.prototype.onfocusin = function (event) {
		NotificationListBase.prototype.onfocusin.apply(this, arguments);

		if (!Device.browser.msie) {
			return;
		}

		// in IE the elements inside can get the focus (IE issue)
		// https://stackoverflow.com/questions/18259754/ie-click-on-child-does-not-focus-parent-parent-has-tabindex-0
		// in that case just focus the whole item
		var target = event.target;

		if (target !== this.getDomRef() &&
			!target.classList.contains('sapMBtn') &&
			!target.classList.contains('sapMLnk')) {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.focus();
		}
	};

	NotificationListItem.prototype.onkeydown = function(event) {

		if (event.target !== this.getDomRef()) {
			return;
		}

		var notificationGroup = this.getParent(),
			visibleItems,
			groupIndex;

		if (!notificationGroup || !notificationGroup.isA('sap.m.NotificationListGroup')) {
			return;
		}

		visibleItems = notificationGroup.getVisibleItems();
		groupIndex = visibleItems.indexOf(this);

		switch (event.which) {
			case KeyCodes.ARROW_UP:
				if (groupIndex === 0) {
					return;
				}

				var previousIndex = groupIndex - 1;
				visibleItems[previousIndex].focus();
				break;
			case KeyCodes.ARROW_DOWN:
				var nextIndex = groupIndex + 1;
				if (nextIndex === visibleItems.length) {
					return;
				}

				visibleItems[nextIndex].focus();
				break;
		}
	};

	NotificationListItem.prototype.exit = function() {
		if (this._resizeListenerId) {
			ResizeHandler.deregister(this._resizeListenerId);
			this._resizeListenerId = null;
		}
	};

	NotificationListItem.prototype._onResize = function () {
		this._updateShowMoreButtonVisibility();
	};

	NotificationListItem.prototype._updateShowMoreButtonVisibility = function () {
		var $this = this.$(),
			title = $this.find('.sapMNLITitleText')[0],
			description = $this.find('.sapMNLIDescription')[0],
			canTruncate;

		if ($this.length > 0) {
			canTruncate = title.scrollHeight > maxTruncationHeight || description.scrollHeight > maxTruncationHeight;
		}

		this._getShowMoreButton().setVisible(canTruncate);
	};

	NotificationListItem.prototype._getShowMoreButton = function() {
		var showMoreButton = this.getAggregation('_showMoreButton');

		if (!showMoreButton) {
			showMoreButton = new Link(this.getId() + '-showMoreButton', {
				text: this.getTruncate() ? expandText : collapseText,
				press: function () {
					var truncate = !this.getTruncate();
					this._getShowMoreButton().setText(truncate ? expandText : collapseText);
					this.setTruncate(truncate);
				}.bind(this)
			});

			this.setAggregation("_showMoreButton", showMoreButton, true);
		}

		return showMoreButton;
	};

	NotificationListItem.prototype.getAccessibilityText = function() {

		var readUnreadText = this.getUnread() ? unreadText : readText,
			dueAndPriorityString = resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY', [this.getDatetime(), this.getPriority()]),
			authorName = this.getAuthorName(),
			ariaTexts = [this.getTitle(), this.getDescription(), readUnreadText];

		if (authorName) {
			ariaTexts.push(createdByText);
			ariaTexts.push(authorName);
		}

		ariaTexts.push(dueAndPriorityString);

		return ariaTexts.join(' ');
	};

	return NotificationListItem;
});
