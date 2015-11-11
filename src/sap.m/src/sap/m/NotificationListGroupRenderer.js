/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	'use strict';

	/**
	 * NotificationListItemGroup renderer.
	 * @namespace
	 */
	var NotificationListGroupRenderer = {};

	var classNameItem = 'sapMNLG';
	var classNameListBaseItem = 'sapMLIB';
	var classNameIcons = 'sapMNLG-Icons';
	var classNameUnread = 'sapMNLG-UnreadStatus';
	var classNameRead = 'sapMNLG-ReadStatus';
	var classNameHeader = 'sapMNLG-Header';
	var classNameBody = 'sapMNLG-Body';
	var classNameFooter = 'sapMNLG-Footer';
	var classNameCloseButton = 'sapMNLG-CloseButton';


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.render = function (oRm, oControl) {
		oRm.write('<li');
		oRm.addClass(classNameItem);
		oRm.addClass(classNameListBaseItem);
		oRm.writeClasses();
		oRm.writeControlData(oControl);
		oRm.writeAttribute('tabindex', '0');
		oRm.write('>');
			this.renderIcons(oRm, oControl);
			this.renderHeader(oRm, oControl);
			this.renderBody(oRm, oControl);
			this.renderFooter(oRm, oControl);
		oRm.write('</li>');
	};


	//================================================================================
	// Icon rendering methods
	//================================================================================

	/**
	 * Renders the priority icons.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderIcons = function (oRm, oControl) {
		oRm.write('<div class=' + classNameIcons + '>');
		this.renderUnreadStatus(oRm, oControl);
		this.renderPriority(oRm, oControl);
		oRm.write('</div>');
	};

	/**
	 * Renders the read/unread status of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderUnreadStatus = function (oRm, oControl) {
		var unreadStatus = oControl.getUnread();
		var statusClass = unreadStatus ? classNameUnread : classNameRead;

		oRm.write('<div');
		oRm.writeAttribute('class', statusClass);
		oRm.write('></div>');
	};

	/**
	 * Renders the priority of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderPriority = function (oRm, oControl) {
		var priority = oControl.getPriority();

		if (priority && priority === sap.ui.core.Priority.High) {
			oRm.writeIcon('sap-icon://warning');
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
		oRm.write('<div class=' + classNameHeader + '>');
		this.renderTitle(oRm, oControl);
		this.renderCloseButton(oRm, oControl);
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
			oRm.renderControl(oControl._closeButton.addStyleClass(classNameCloseButton));
		}
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

		this.renderDatetime(oRm, oControl);
		this.renderNotifications(oRm, oControl);

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
		var notifications = oControl.getAggregation('items');
		/** @type {boolean} */
		var collapsed = oControl.getCollapsed();

		if (notifications) {
			notifications.forEach(function (notification) {
				if (collapsed) {
					notification.addStyleClass('sapMNLG-Collapsed');
				}
				oRm.renderControl(notification);
			});
		}
	};

	//================================================================================
	// Footer rendering methods
	//================================================================================

	/**
	 * Renders the footer content of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderFooter = function (oRm, oControl) {
		/** @type {sap.m.Button[]} */
		var buttons = oControl.getButtons();

		oRm.write('<div class=' + classNameFooter + '>');
		this.renderCollapseGroupLink(oRm, oControl);

		if (buttons && buttons.length && oControl.getShowButtons()) {
			this.renderButtons(oRm, oControl, buttons);
		}

		oRm.write('</div>');
	};

	/**
	 * Renders the footer buttons of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderButtons = function (oRm, oControl, aButtons) {
		aButtons.forEach(function (button) {
			oRm.renderControl(button);
		});
	};

	/**
	 * Renders the expanded/collapsed status of the NotificationListGroup.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.renderCollapseGroupLink = function (oRm, oControl) {
		oRm.renderControl(oControl._collapseLink);
	};

	return NotificationListGroupRenderer;

}, /* bExport= */ true);
