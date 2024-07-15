/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'./NotificationListBase',
	'sap/ui/core/InvisibleText',
	"sap/ui/core/Lib",
	'sap/ui/core/library',
	'sap/m/Link',
	'sap/m/Avatar',
	"sap/ui/events/KeyCodes",
	'./NotificationListItemRenderer'
],
function(
	library,
	NotificationListBase,
	InvisibleText,
	Library,
	coreLibrary,
	Link,
	Avatar,
	KeyCodes,
	NotificationListItemRenderer
	) {
	'use strict';

	var RESOURCE_BUNDLE = Library.getResourceBundleFor('sap.m'),
		EXPAND_TEXT = RESOURCE_BUNDLE.getText('NOTIFICATION_LIST_ITEM_SHOW_MORE'),
		COLLAPSE_TEXT = RESOURCE_BUNDLE.getText('NOTIFICATION_LIST_ITEM_SHOW_LESS'),
		READ_TEXT = RESOURCE_BUNDLE.getText('NOTIFICATION_LIST_ITEM_READ'),
		UNREAD_TEXT = RESOURCE_BUNDLE.getText('NOTIFICATION_LIST_ITEM_UNREAD');

	var maxTruncationHeight = 44;

	// shortcut for sap.m.AvatarSize
	var AvatarSize = library.AvatarSize;

	// shortcut for sap.m.AvatarColor
	var AvatarColor = library.AvatarColor;

	// shortcut for sap.m.LinkAccessibleRole
	var LinkAccessibleRole = library.LinkAccessibleRole;

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	/**
	 * Constructor for a new <code>NotificationListItem<code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItem control shows notification to the user.
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
	 */
	var NotificationListItem = NotificationListBase.extend('sap.m.NotificationListItem', /** @lends sap.m.NotificationListItem.prototype */ {
		metadata: {
			library: 'sap.m',
			properties: {
				/**
				 * Determines the description of the NotificationListItem.
				 */
				description: {type: 'string', group: 'Data', defaultValue: ''},

				/**
				 * Defines the displayed author initials.
				 */
				authorInitials: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Determines if the text in the title and the description of the notification are truncated to the first two lines.
				 */
				truncate: {type: 'boolean', group: 'Appearance', defaultValue: true},

				/**
				 * Determines if the "Show More" button should be hidden.
				 */
				hideShowMoreButton: {type: 'boolean', group: 'Appearance', defaultValue: false},

				/**
				 * Determines the background color of the avatar of the author.
				 *
				 * <b>Note:</b> By using background colors from the predefined sets,
				 * your colors can later be customized from the Theme Designer.
				 */
				authorAvatarColor: {type: "sap.m.AvatarColor", group: "Appearance", defaultValue: AvatarColor.Accent6},

				/**
				 * Determines the notification author name.
				 */
				authorName: {type: 'string', group: 'Appearance', defaultValue: ''},

				/**
				 * Determines the URL of the notification author picture.
				 */
				authorPicture: {type: 'sap.ui.core.URI'},

				/**
				 * The time stamp of the notification.
				 */
				datetime: {type: 'string', group: 'Appearance', defaultValue: ''}
			},
			aggregations: {
				/**
				 * The sap.m.MessageStrip control that holds the information about any error that may occur when pressing the notification buttons
				 */
				processingMessage: {type: 'sap.m.MessageStrip', multiple: false},

				/**
				 * The "Show More" button of the notification item.
				 * @private
				 */
				_showMoreButton: {type: 'sap.m.Link', multiple: false, visibility: "hidden"}
			}
		},

		renderer: NotificationListItemRenderer
	});

	/**
	 * Handles the internal event init.
	 *
	 * @private
	 */
	NotificationListItem.prototype.init = function() {
		// set it to an active ListItemBase to the press and tap events are fired
		this.setType('Active');
		this._footerIvisibleText = new InvisibleText({id: this.getId() + "-invisibleFooterText"});
	};

	NotificationListItem.prototype._getAuthorAvatar = function() {
		if (this.getAuthorInitials() || this.getAuthorPicture()) {
			if (!this._avatar) {
				this._avatar = new Avatar({
					displaySize: AvatarSize.XS
				});
			}

			this._avatar.setInitials(this.getAuthorInitials());
			this._avatar.setSrc(this.getAuthorPicture());
			this._avatar.setBackgroundColor(this.getAuthorAvatarColor());

			return this._avatar;
		}
	};

	NotificationListItem.prototype.onAfterRendering = function() {
		NotificationListBase.prototype.onAfterRendering.call(this);

		if (this.getHideShowMoreButton()) {
			return;
		}

		this._updateShowMoreButtonVisibility();
	};

	NotificationListItem.prototype.exit = function() {
		NotificationListBase.prototype.exit.apply(this, arguments);

		if (this._footerIvisibleText) {
			this._footerIvisibleText.destroy();
			this._footerIvisibleText = null;
		}

		if (this._avatar) {
			this._avatar.destroy();
			this._avatar = null;
		}
	};

	NotificationListItem.prototype._onResize = function () {
		NotificationListBase.prototype._onResize.apply(this, arguments);

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
				accessibleRole: LinkAccessibleRole.Button,
				text: this.getTruncate() ? EXPAND_TEXT : COLLAPSE_TEXT,
				press: function () {
					var truncate = !this.getTruncate();
					this._getShowMoreButton().setText(truncate ? EXPAND_TEXT : COLLAPSE_TEXT);
					this.setProperty("truncate", truncate, true);
					this.$().find(".sapMNLITitleText, .sapMNLIDescription").toggleClass("sapMNLIItemTextLineClamp", truncate);
				}.bind(this)
			});

			this.setAggregation("_showMoreButton", showMoreButton, true);
		}

		return showMoreButton;
	};

	/**
	 * Updates invisible text.
	 *
	 * @private
	 */
	NotificationListItem.prototype._getFooterInvisibleText = function() {

		var readUnreadText = this.getUnread() ? UNREAD_TEXT : READ_TEXT,
			authorName = this.getAuthorName(),
			dateTime = this.getDatetime(),
			priority = this.getPriority(),
			ariaTexts = [readUnreadText];

		if (authorName) {
			authorName = RESOURCE_BUNDLE.getText('NOTIFICATION_LIST_ITEM_CREATED_BY');
			ariaTexts.push(authorName);
			ariaTexts.push(this.getAuthorName());
		}

		if (dateTime) {
			ariaTexts.push( RESOURCE_BUNDLE.getText('NOTIFICATION_LIST_ITEM_DATETIME', [dateTime]));
		}

		if (priority !== Priority.None) {
			ariaTexts.push(RESOURCE_BUNDLE.getText('NOTIFICATION_LIST_ITEM_PRIORITY', [priority]));
		}

		return this._footerIvisibleText.setText(ariaTexts.join(' '));
	};

	return NotificationListItem;
});
