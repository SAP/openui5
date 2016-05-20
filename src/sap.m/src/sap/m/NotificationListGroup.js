/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './ListItemBase', './Title', './Text',
		'./Button', 'sap/ui/core/InvisibleText', './Link', 'sap/ui/core/Icon', './Image', './OverflowToolbar'],
	function (jQuery, library, Control, ListItemBase, Title, Text, Button, InvisibleText, Link, Icon, Image, OverflowToolbar) {

	'use strict';

	/**
	 * Constructor for a new NotificationListGroup.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItemGroup control is used for grouping NotificationListItems of the same type.
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34
	 * @alias sap.m.NotificationListGroup
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NotificationListGroup = ListItemBase.extend('sap.m.NotificationListGroup', /** @lends sap.m.NotificationListGroup.prototype */ {
		metadata: {
			library: 'sap.m',
			properties: {
				/**
				 * Determines the priority of the NotificationListGroup.
				 */
				priority: {
					type: 'sap.ui.core.Priority',
					group: 'Appearance',
					defaultValue: sap.ui.core.Priority.None
				},

				/**
				 * Determines the title of the NotificationListGroup.
				 */
				title: {type: 'string', group: 'Appearance', defaultValue: ''},

				/**
				 * Determines the due date of the NotificationListGroup.
				 */
				datetime: {type: 'string', group: 'Appearance', defaultValue: ''},

				/**
				 * Determines the visibility of the action buttons.
				 */
				showButtons: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines the visibility of the close button.
				 */
				showCloseButton: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines if the group is collapsed or expanded.
				 */
				collapsed: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the group will automatically set the priority based on the highest priority of its notifications or get its priority from the developer.
				 */
				autoPriority: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines the notification group's author name.
				 */
				authorName: {type: 'string', group: 'Appearance', defaultValue: ''},

				/**
				 * Determines the URL of the notification group's author picture.
				 */
				authorPicture: {type: 'sap.ui.core.URI',  multiple: false}
			},
			aggregations: {
				/**
				 * Action buttons.
				 */
				buttons: {type: 'sap.m.Button', multiple: true},

				/**
				 * The NotificationListItems inside the group.
				 */
				items: {type: 'sap.m.NotificationListItem', multiple: true, singularName: 'item'},

				/**
				 * The header title of the NotificationListGroup.
				 */
				_headerTitle: {type: 'sap.m.Title', multiple: false, visibility: 'hidden'},

				/**
				 * The timestamp string that will be displayed in the NotificationListGroup.
				 */
				_dateTime: {type: 'sap.m.Text', multiple: false, visibility: 'hidden'},

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
				 * The OverflowToolbar control that holds the footer buttons.
				 * @private
				 */
				_overflowToolbar: {type: 'sap.m.OverflowToolbar', multiple: false, visibility: "hidden"},

				/**
				 * The close button of the notification item/group.
				 * @private
				 */
				_closeButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"},

				/**
				 * The collapse button of the notification item/group.
				 * @private
				 */
				_collapseButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"}
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

	NotificationListGroup.prototype.init = function () {
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
			press: function () {
				this.setCollapsed(!this.getCollapsed());
			}.bind(this)
		});

		this.setAggregation('_overflowToolbar', new OverflowToolbar());
	};

	NotificationListGroup.prototype.setTitle = function (title) {
		var result = this.setProperty('title', title, true);

		this._getHeaderTitle().setText(title);

		return result;
	};

	NotificationListGroup.prototype.setDatetime = function(dateTime) {
		var result = this.setProperty('datetime', dateTime, true);

		this._getDateTimeText().setText(dateTime);

		return result;
	};

	NotificationListGroup.prototype.setCollapsed = function (collapsed) {
		this._toggleCollapsed();
		//Setter overwritten to suppress invalidation
		return this.setProperty('collapsed', collapsed, true);
	};

	NotificationListGroup.prototype.setAuthorName = function(authorName) {
		var result = this.setProperty('authorName', authorName, true);

		this._getAuthorName().setText(authorName);

		return result;
	};

	NotificationListGroup.prototype.getPriority = function () {
		//If the autoPriority flag is off then return what has been set by the developer
		if (!this.getAutoPriority()) {
			return this.getProperty('priority');
		}

		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		/** @type {sap.ui.core.Priority|string} */
		var priority = sap.ui.core.Priority.None;

		if (notifications) {
			notifications.forEach(function (item) {
				priority = comparePriority(priority, item.getPriority());
			});
		} else {
			priority = this.getProperty('priority');
		}

		return priority;
	};

	NotificationListGroup.prototype.getUnread = function () {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		if (notifications) {
			return notifications.some(function (item) {
				return item.getUnread();
			});
		}
		return this.getProperty('unread');
	};

	NotificationListGroup.prototype.onBeforeRendering = function() {
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var expandText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_EXPAND');
		var collapseText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_COLLAPSE');

		//Making sure the Expand/Collapse link text is set correctly
		this._collapseButton.setText(this.getCollapsed() ? expandText : collapseText);
	};

	NotificationListGroup.prototype.close = function () {
		var parent = this.getParent();
		this.fireClose();
		parent && parent instanceof sap.ui.core.Element && parent.focus();
		this.destroy();
	};

	/**
	 * Returns the sap.m.Title control used in the NotificationListGroup's title.
	 * @returns {sap.m.Title} The hidden title control aggregation used in the group title
	 * @private
	 */
	NotificationListGroup.prototype._getHeaderTitle = function () {
		/** @type {sap.m.Title} */
		var title = this.getAggregation('_headerTitle');

		if (!title) {
			title = new sap.m.Title({
				id: this.getId() + '-title',
				text: this.getTitle()
			});

			this.setAggregation('_headerTitle', title);
		}

		if (this.getUnread()) {
			title.addStyleClass('sapMNLGTitleUnread');
		}

		return title;
	};

	/**
	 * Returns the sap.m.Text control used in the NotificationListGroup's datetime.
	 * @returns {sap.m.Text} The hidden text control aggregation used in the group's timestamp
	 * @private
	 */
	NotificationListGroup.prototype._getDateTimeText = function () {
		/** @type {sap.m.Text} */
		var dateTime = this.getAggregation('_dateTime');

		if (!dateTime) {
			dateTime = new sap.m.Text({
				text: this.getDatetime(),
				textAlign: 'End'
			}).addStyleClass('sapMNLG-Datetime');

			this.setAggregation('_dateTime', dateTime, true);
		}

		return dateTime;
	};

	/**
	 * Returns the sap.m.Text control used in the NotificationListGroup's author name.
	 * @returns {sap.m.Text} The notification author name text
	 * @private
	 */
	NotificationListGroup.prototype._getAuthorName = function() {
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
	NotificationListGroup.prototype._getAuthorImage = function() {
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
	 * Toggles the NotificationListGroup state between collapsed/expanded.
	 * @private
	 */
	NotificationListGroup.prototype._toggleCollapsed = function () {
		/** @type {boolean} */
		var newCollapsedState = !this.getCollapsed();
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var expandText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_EXPAND');
		var collapseText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_COLLAPSE');

		this._collapseButton.setText(newCollapsedState ? expandText : collapseText, true);

		this.$().toggleClass('sapMNLG-Collapsed', newCollapsedState);
	};

	//================================================================================
	// Delegation aggregation methods to the Overflow Toolbar
	//================================================================================

	NotificationListGroup.prototype.bindAggregation = function (aggregationName, bindingInfo) {
		if (aggregationName == 'buttons') {
			this.getAggregation('_overflowToolbar').bindAggregation('content', bindingInfo);
			return this;
		} else {
			return sap.ui.core.Control.prototype.bindAggregation.call(this, aggregationName, bindingInfo);
		}
	};

	NotificationListGroup.prototype.validateAggregation = function (aggregationName, object, multiple) {
		if (aggregationName == 'buttons') {
			this.getAggregation('_overflowToolbar').validateAggregation('content', object, multiple);
			return this;
		} else {
			return sap.ui.core.Control.prototype.validateAggregation.call(this, aggregationName, object, multiple);
		}
	};

	NotificationListGroup.prototype.setAggregation = function (aggregationName, object, suppressInvalidate) {
		if (aggregationName == 'buttons') {
			this.getAggregation('_overflowToolbar').setAggregation('content', object, suppressInvalidate);
			return this;
		} else {
			return sap.ui.core.Control.prototype.setAggregation.call(this, aggregationName, object, suppressInvalidate);
		}
	};

	NotificationListGroup.prototype.getAggregation = function (aggregationName, defaultObjectToBeCreated) {
		if (aggregationName == 'buttons') {
			var toolbar = this.getAggregation('_overflowToolbar');

			return toolbar.getContent().filter(function (item) {
				return item instanceof sap.m.Button;
			});
		} else {
			return sap.ui.core.Control.prototype.getAggregation.call(this, aggregationName, defaultObjectToBeCreated);
		}
	};

	NotificationListGroup.prototype.indexOfAggregation = function (aggregationName, object) {
		if (aggregationName == 'buttons') {
			this.getAggregation('_overflowToolbar').indexOfAggregation('content', object);
			return this;
		} else {
			return sap.ui.core.Control.prototype.indexOfAggregation.call(this, aggregationName, object);
		}
	};

	NotificationListGroup.prototype.insertAggregation = function (aggregationName, object, index, suppressInvalidate) {
		if (aggregationName == 'buttons') {
			this.getAggregation('_overflowToolbar').insertAggregation('content', object, index, suppressInvalidate);
			return this;
		} else {
			return sap.ui.core.Control.prototype.insertAggregation.call(this, object, index, suppressInvalidate);
		}
	};

	NotificationListGroup.prototype.addAggregation = function (aggregationName, object, suppressInvalidate) {
		if (aggregationName == 'buttons') {
			var toolbar = this.getAggregation('_overflowToolbar');

			return toolbar.addAggregation('content', object, suppressInvalidate);
		} else {
			return sap.ui.core.Control.prototype.addAggregation.call(this, aggregationName, object, suppressInvalidate);
		}
	};

	NotificationListGroup.prototype.removeAggregation = function (aggregationName, object, suppressInvalidate) {
		if (aggregationName == 'buttons') {
			return this.getAggregation('_overflowToolbar').removeAggregation('content', object, suppressInvalidate);
		} else {
			return sap.ui.core.Control.prototype.removeAggregation.call(this, aggregationName, object, suppressInvalidate);
		}
	};

	NotificationListGroup.prototype.removeAllAggregation = function (aggregationName, suppressInvalidate) {
		if (aggregationName == 'buttons') {
			return this.getAggregation('_overflowToolbar').removeAllAggregation('content', suppressInvalidate);
		} else {
			return sap.ui.core.Control.prototype.removeAllAggregation.call(this, aggregationName, suppressInvalidate);
		}
	};

	NotificationListGroup.prototype.destroyAggregation = function (aggregationName, suppressInvalidate) {
		if (aggregationName == 'buttons') {
			return this.getAggregation('_overflowToolbar').destroyAggregation('content', suppressInvalidate);
		} else {
			return sap.ui.core.Control.prototype.destroyAggregation.call(this, aggregationName, suppressInvalidate);
		}
	};

	NotificationListGroup.prototype.getBinding = function (aggregationName) {
		if (aggregationName == 'buttons') {
			return this.getAggregation('_overflowToolbar').getBinding('content');
		} else {
			return sap.ui.core.Control.prototype.getBinding.call(this, aggregationName);
		}
	};

	NotificationListGroup.prototype.getBindingInfo = function (aggregationName) {
		if (aggregationName == 'buttons') {
			return this.getAggregation('_overflowToolbar').getBindingInfo('content');
		} else {
			return sap.ui.core.Control.prototype.getBindingInfo.call(this, aggregationName);
		}
	};

	NotificationListGroup.prototype.getBindingPath = function (aggregationName) {
		if (aggregationName == 'buttons') {
			return this.getAggregation('_overflowToolbar').getBindingPath('content');
		} else {
			return sap.ui.core.Control.prototype.getBindingPath.call(this, aggregationName);
		}
	};

		NotificationListGroup.prototype.clone = function () {
		var clonedObject = Control.prototype.clone.apply(this, arguments);

		// "_overflowToolbar" aggregation is hidden and it is not cloned by default
		var overflowToolbar = this.getAggregation('_overflowToolbar');
		clonedObject.setAggregation("_overflowToolbar", overflowToolbar.clone(), true);

		return clonedObject;
	};

	/**
	 * Compares two priorities and returns the higher one.
	 * @param {sap.ui.core.Priority} firstPriority First priority string to be compared
	 * @param {sap.ui.core.Priority} secondPriority Second priority string to be compared
	 * @returns {sap.ui.core.Priority} The highest priority
	 * @private
	 */
	function comparePriority(firstPriority, secondPriority) {
		if (firstPriority == secondPriority) {
			return firstPriority;
		}

		if ((firstPriority == 'None')) {
			return secondPriority;
		}

		if ((firstPriority == 'Low') && (secondPriority != 'None')) {
			return secondPriority;
		}

		if ((firstPriority == 'Medium') && (secondPriority != 'None' && secondPriority != 'Low')) {
			return secondPriority;
		}

		return firstPriority;
	}

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

	return NotificationListGroup;
}, /* bExport= */ true);
