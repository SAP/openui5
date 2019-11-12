/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Core',
	'./NotificationListBase',
	'sap/ui/core/InvisibleText',
	'./ListItemBase',
	'sap/ui/core/IconPool',
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/m/Button',
	'./NotificationListGroupRenderer',
	"sap/ui/events/KeyCodes"
],
function(
	library,
	Core,
	NotificationListBase,
	InvisibleText,
	ListItemBase,
	IconPool,
	coreLibrary,
	Device,
	Button,
	NotificationListGroupRenderer,
	KeyCodes
) {
	'use strict';

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	var resourceBundle = Core.getLibraryResourceBundle('sap.m'),
		expandText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_EXPAND'),
		collapseText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_COLLAPSE'),
		expandIcon = 'sap-icon://slim-arrow-right',
		collapseIcon = 'sap-icon://slim-arrow-down';

	var maxNumberOfNotifications = Device.system.desktop ? 400 : 100;

	/**
	 * Constructor for a new NotificationListGroup.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NotificationListItemGroup control is used for grouping {@link sap.m.NotificationListItem notification items} of the same type.
	 * <h4>Behavior</h4>
	 * The group handles specific behavior for different use cases:
	 * <ul>
	 * <li><code>autoPriority</code> - sets the group priority to the highest priority of an item in the group.</li>
	 * <li><code>enableCollapseButtonWhenEmpty</code> - displays a collapse button for an empty group.</li>
	 * <li><code>showEmptyGroup</code> - determines if the header/footer of an empty group is displayed.</li>
	 * </ul>
	 * @extends sap.m.NotificationListBase
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
	var NotificationListGroup = NotificationListBase.extend('sap.m.NotificationListGroup', /** @lends sap.m.NotificationListGroup.prototype */ {
		metadata: {
			library: 'sap.m',
			properties: {

				/**
				 * Determines if the group is collapsed or expanded.
				 */
				collapsed: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the group will automatically set the priority based on the highest priority of its notifications or get its priority from the "priority" property.
				 */
				autoPriority: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines if the group header/footer of the empty group will be always shown. By default groups with 0 notifications are not shown.
				 */
				showEmptyGroup: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the collapse/expand button should be enabled for an empty group.
				 */
				enableCollapseButtonWhenEmpty: {type: 'boolean', group: 'Behavior', defaultValue: false},

				/**
				 * Determines if the items counter inside the group header will be visible.
				 *
				 *<b>Note:</b> Counter value represents the number of currently visible (loaded) items inside the group.
				 */
				showItemsCounter: {type: 'boolean', group: 'Behavior', defaultValue: true},

				/**
				 * Determines the notification group's author name.
				 *
				 * @deprecated Since version 1.73
				 */
				authorName: {type: 'string', group: 'Appearance', defaultValue: '', deprecated: true},

				/**
				 * Determines the URL of the notification group's author picture.
				 *
				 *  @deprecated Since version 1.73
				 */
				authorPicture: {type: 'sap.ui.core.URI', multiple: false, deprecated: true},

				/**
				 * Determines the due date of the NotificationListGroup.
				 *
				 *  @deprecated Since version 1.73
				 */
				datetime: {type: 'string', group: 'Appearance', defaultValue: '', deprecated: true}
			},
			defaultAggregation : 'items',
			aggregations: {

				/**
				 * The NotificationListItems inside the group.
				 */
				items: {type: 'sap.m.NotificationListItem', multiple: true, singularName: 'item'},

				/**
				 * The collapse/expand button.
				 * @private
				 */
				_collapseButton: {type: 'sap.m.Button', multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * This event is called when collapse property value is changed
				 * @since 1.44
				 */
				onCollapse: {
					parameters: {
						/**
						 * Indicates exact collapse direction
						 */
						collapsed: {type: 'boolean'}
					}
				}
			}
		}
	});

	NotificationListGroup.prototype._getCollapseButton = function() {
		var collapseButton = this.getAggregation('_collapseButton'),
			collapsed = this.getCollapsed();

		if (!collapseButton) {
			collapseButton = new Button(this.getId() + '-collapseButton', {
				type: ButtonType.Transparent,
				icon: collapsed ? expandIcon : collapseIcon,
				tooltip: collapsed ? expandText : collapseText,
				press: function () {
					this.setCollapsed(!this.getCollapsed());
				}.bind(this)
			});

			this.setAggregation("_collapseButton", collapseButton, true);
		}

		return collapseButton;
	};

	NotificationListGroup.prototype.setCollapsed = function (bCollapsed) {

		var $that = this.$(),
			collapseButton = this._getCollapseButton(),
			display = "",
			areActionButtonsVisible = !bCollapsed && this.getShowButtons();

		$that.toggleClass('sapMNLGroupCollapsed', bCollapsed);
		$that.attr('aria-expanded', !bCollapsed);
		areActionButtonsVisible ? display = "block" : display = "none";
		$that.find(".sapMNLGroupHeader .sapMNLIActions").css("display", display);

		collapseButton.setIcon(bCollapsed ? expandIcon : collapseIcon);
		collapseButton.setTooltip(bCollapsed ? expandText : collapseText);

		// Setter overwritten to suppress invalidation
		this.setProperty('collapsed', bCollapsed, true);
		this.fireOnCollapse({collapsed: bCollapsed});

		return this;
	};

	NotificationListGroup.prototype.getVisibleItems = function () {
		var visibleItems = this.getItems().filter(function (item) {
			return item.getVisible();
		});

		return visibleItems;
	};

	/**
	 * Gets the number of visible NotificationListItems inside the group.
	 *
	 * @private
	 * @returns {number} The number of visible notifications.
	 */
	NotificationListGroup.prototype._getVisibleItemsCount = function () {
		return this.getVisibleItems().length;
	};

	NotificationListGroup.prototype.getAccessibilityText = function() {
		var ariaTexts = [this.getTitle()];

		return ariaTexts.join(' ');
	};

	/**
	 * Overrides the getter for priority property.
	 *
	 * @override
	 * @public
	 * @returns {sap.ui.core.Priority} Items by priority.
	 */
	NotificationListGroup.prototype.getPriority = function () {
		//If the autoPriority flag is off then return what has been set by the developer
		if (!this.getAutoPriority()) {
			return this.getProperty('priority');
		}

		/** @type {sap.m.NotificationListItem[]} */
		var notifications = this.getAggregation('items');

		/** @type {sap.ui.core.Priority|string} */
		var priority = Priority.None;

		if (notifications) {
			notifications.forEach(function (item) {
				priority = comparePriority(priority, item.getPriority());
			});
		} else {
			priority = this.getProperty('priority');
		}

		return priority;
	};

	/**
	 * Compares two priorities and returns the higher one.
	 *
	 * @private
	 * @param {sap.ui.core.Priority} firstPriority First priority string to be compared.
	 * @param {sap.ui.core.Priority} secondPriority Second priority string to be compared.
	 * @returns {sap.ui.core.Priority} The highest priority.
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

	NotificationListGroup.prototype.onBeforeRendering = function () {

		NotificationListBase.prototype.onBeforeRendering.apply(this, arguments);

		this._getCollapseButton().setVisible(this.getEnableCollapseButtonWhenEmpty() || this._getVisibleItemsCount() > 0);
	};

	/**
	 * Checks if the max number of notification is reached
	 *
	 * @private
	 * @returns {boolean} Whether the max number of notification is reached
	 */
	NotificationListGroup.prototype._isMaxNumberReached = function () {
		return this.getItems().length > maxNumberOfNotifications;
	};

	/**
	 * Returns the messages, which should be displayed, when the notification limit is reached
	 *
	 * @private
	 * @returns {object} The messages
	 */
	NotificationListGroup.prototype._getMaxNumberReachedMsg = function () {
		return {
			title: resourceBundle.getText('NOTIFICATION_LIST_GROUP_MAX_NOTIFICATIONS_TITLE', this.getItems().length - maxNumberOfNotifications),
			description: resourceBundle.getText('NOTIFICATION_LIST_GROUP_MAX_NOTIFICATIONS_BODY')
		};
	};

	return NotificationListGroup;
});
