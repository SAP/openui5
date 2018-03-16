/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library"], function(coreLibrary) {
	'use strict';

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	/**
	 * NotificationListItemGroup renderer.
	 * @namespace
	 */
	var NotificationListGroupRenderer = {};

	var classNameItem = 'sapMNLG';
	var classNameBase = 'sapMNLB';
	var classNameListBaseItem = 'sapMLIB';
	var classNameAuthor = 'sapMNLB-AuthorPicture';
	var classNameBaseHeader = 'sapMNLB-Header';
	var classNameHeader = 'sapMNLG-Header';
	var classNameBody = 'sapMNLG-Body';
	var classNameBaseSubHeader = 'sapMNLB-SubHeader';
	var classNameSubHeader = 'sapMNLG-SubHeader';
	var classNameCloseButton = 'sapMNLB-CloseButton';
	var classNamePriority = 'sapMNLB-Priority';
	var classNameDetails = 'sapMNLG-Details';
	var classNameBullet = 'sapMNLB-Bullet';
	var classNameDescription = 'sapMNLG-Description';
	var classNameCollapsed = 'sapMNLG-Collapsed';
	var classNameSingleItemGroup = 'sapMNLGNoHdrFooter';
	var classMaxNotificationsReached = 'sapMNLG-MaxNotifications';
	var classNoNotifications = 'sapMNLG-NoNotifications';

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.render = function (oRm, oControl) {
		if (oControl.getVisible()) {
			var visibleItemsCount = oControl._getVisibleItemsCount();
			var _bShowGroupHdrFooter = oControl.getShowEmptyGroup() || (visibleItemsCount > 0);

			oRm.write('<li');
			oRm.addClass(classNameItem);
			oRm.addClass(classNameBase);
			oRm.addClass(classNameListBaseItem);

			if (!_bShowGroupHdrFooter) {
				oRm.addClass(classNameSingleItemGroup);
			}

			if (oControl.getCollapsed()) {
				oRm.addClass(classNameCollapsed);
			}

			if (visibleItemsCount == 0) {
				oRm.addClass(classNoNotifications);
			}

			oRm.writeClasses();
			oRm.writeControlData(oControl);
			oRm.writeAttribute('tabindex', '0');
			oRm.writeAccessibilityState(oControl, {
				labelledby : oControl._ariaLabbeledByIds
			});
			oRm.write('>');

			if (_bShowGroupHdrFooter) {
				this.renderHeader(oRm, oControl);
				this.renderSubHeader(oRm, oControl);
				this.renderBody(oRm, oControl);
			}

			oRm.write('</li>');
		} else {
			this.renderInvisibleItem(oRm, oControl);
		}

	};

	//================================================================================
	// Header rendering methods
	//================================================================================

	/**
	 * Renders the header content of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderHeader = function (oRm, oControl) {
		oRm.write('<div');
		oRm.addClass(classNameBaseHeader);
		oRm.addClass(classNameHeader);

		oRm.writeClasses();
		oRm.write('>');

		this.renderInvisibleInfoText(oRm, oControl);
		this.renderPriorityArea(oRm, oControl);
		this.renderCloseButton(oRm, oControl);
		this.renderTitle(oRm, oControl);
		this.renderDetails(oRm, oControl);
		oRm.write('</div>');
	};

	/**
	 * Renders the title of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderTitle = function (oRm, oControl) {
		oRm.renderControl(oControl._getHeaderTitle());
	};

	/**
	 * Renders the close button of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderCloseButton = function (oRm, oControl) {
		if (oControl.getShowCloseButton()) {
			oRm.renderControl(oControl.getAggregation('_closeButton').addStyleClass(classNameCloseButton));
		}
	};

	/**
	 * Renders the picture of the author of the Notification Group.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderAuthorPicture = function(oRm, oControl) {
		if (!oControl.getAuthorPicture()) {
			return;
		}

		oRm.write('<div');
		oRm.addClass(classNameAuthor);
		oRm.writeClasses();
		oRm.write('>');
		oRm.renderControl(oControl._getAuthorImage());
		oRm.write('</div>');
	};

	/**
	 * Renders the details, such as author name and timestamp of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderDetails = function(oRm, oControl) {
		oRm.write('<div class="' + classNameDetails + '">');
		this.renderAuthorPicture(oRm, oControl);

		oRm.write('<div class="' + classNameDescription + '">');
		this.renderAuthorName(oRm, oControl);

		if (oControl.getAuthorName() != "" && oControl.getDatetime() != "") {
			oRm.write('<span class="' + classNameBullet + '">&#x00B7</span>');
		}
		this.renderDatetime(oRm, oControl);
		oRm.write('</div></div>');
	};

	NotificationListGroupRenderer.renderInvisibleInfoText = function (oRm, oControl) {
		oRm.renderControl(oControl.getAggregation('_ariaDetailsText'));
	};

	/**
	 * Renders the name of the author of the notification group.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderAuthorName = function (oRm, oControl) {
		oRm.renderControl(oControl._getAuthorName());
	};


	//================================================================================
	// SubHeader rendering methods
	//================================================================================

	/**
	 * Renders the SubHeader content of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderSubHeader = function (oRm, oControl) {
		/** @type {sap.m.Button[]} */
		var buttons = oControl.getButtons();

		oRm.write('<div');
		oRm.addClass(classNameSubHeader);
		oRm.addClass(classNameBaseSubHeader);

		oRm.writeClasses();
		oRm.write('>');

		this.renderPriorityArea(oRm, oControl);
		this.renderCollapseGroupButton(oRm, oControl);

		if (buttons && buttons.length && oControl.getShowButtons()) {
			oRm.renderControl(oControl.getAggregation('_overflowToolbar'));
		}

		oRm.write('</div>');
	};

	/**
	 * Renders the visual representation of the priority of the NotificationListGroup
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderPriorityArea = function(oRm, oControl) {
		oRm.write('<div');

		var classPriority = '';
		var controlPriority = oControl.getPriority();

		switch (controlPriority) {
			case (Priority.Low):
				classPriority = 'sapMNLB-Low';
				break;
			case (Priority.Medium):
				classPriority = 'sapMNLB-Medium';
				break;
			case (Priority.High):
				classPriority = 'sapMNLB-High';
				break;
			default:
				classPriority = 'sapMNLB-None';
				break;
		}

		oRm.addClass(classNamePriority);
		oRm.addClass(classPriority);

		oRm.writeClasses();
		oRm.write('>');
		oRm.write('</div>');
	};

	/**
	 * Renders the expanded/collapsed status of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderCollapseGroupButton = function (oRm, oControl) {
		oRm.renderControl(oControl.getAggregation('_collapseButton'));
	};

	/**
	 * Renders the invisible item when the visible property is false.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderInvisibleItem = function(oRm, oControl) {
		oRm.write("<li");
		oRm.writeInvisiblePlaceholderData(oControl);
		oRm.write(">");
		oRm.write("</li>");
	};

	//================================================================================
	// Body rendering methods
	//================================================================================

	/**
	 * Renders the body of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderBody = function (oRm, oControl) {
		oRm.write('<ul class=' + classNameBody + '>');

		this.renderNotifications(oRm, oControl);
		if (oControl._maxNumberReached) {
			this.renderMaxNumberReachedMessage(oRm, oControl);
		}

		oRm.write('</ul>');
	};

	/**
	 * Renders the timestamp of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderDatetime = function (oRm, oControl) {
		oRm.renderControl(oControl._getDateTimeText());
	};

	/**
	 * Renders the notifications inside the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderNotifications = function (oRm, oControl) {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = oControl.getItems();
		var notificationsCount = notifications.length;

		//Notifications render
		if (notificationsCount) {
			for (var index = 0; index < oControl._maxNumberOfNotifications; index++) {
				oRm.renderControl(notifications[index]);
			}
		}
	};

	NotificationListGroupRenderer.renderMaxNumberReachedMessage = function(oRm, oControl) {
		//notificationsLeft
		var message = '<span>' + oControl._maxNumberOfNotificationsTitle + '</span> <br>' + oControl._maxNumberOfNotificationsBody;
		oRm.write('<div');
		oRm.addClass(classMaxNotificationsReached);
		oRm.writeClasses();
		oRm.write('>');

		oRm.write(message);

		oRm.write('</div>');
	};

	return NotificationListGroupRenderer;
}, /* bExport= */ true);
