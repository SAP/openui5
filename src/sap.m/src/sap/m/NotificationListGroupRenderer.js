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
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
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

	NotificationListGroupRenderer.renderIcons = function (oRm, oControl) {
		oRm.write('<div class=' + classNameIcons + '>');
		this.renderUnreadStatus(oRm, oControl);
		this.renderPriority(oRm, oControl);
		oRm.write('</div>');
	};

	NotificationListGroupRenderer.renderUnreadStatus = function (oRm, oControl) {
		var unreadStatus = oControl.getUnread();
		var statusClass = unreadStatus ? classNameUnread : classNameRead;

		oRm.write('<div');
		oRm.writeAttribute('class', statusClass);
		oRm.write('></div>');
	};

	NotificationListGroupRenderer.renderPriority = function (oRm, oControl) {
		var priority = oControl.getPriority();

		if (priority && priority === sap.ui.core.Priority.High) {
			oRm.writeIcon('sap-icon://warning');
		}
	};

	//================================================================================
	// Header rendering methods
	//================================================================================

	NotificationListGroupRenderer.renderHeader = function (oRm, oControl) {
		oRm.write('<div class=' + classNameHeader + '>');
		this.renderTitle(oRm, oControl);
		this.renderCloseButton(oRm, oControl);
		oRm.write('</div>');
	};

	NotificationListGroupRenderer.renderTitle = function (oRm, oControl) {
		oRm.renderControl(oControl._getHeaderTitle());
	};

	NotificationListGroupRenderer.renderCloseButton = function (oRm, oControl) {
		if (oControl.getShowCloseButton()) {
			oRm.renderControl(oControl._closeButton.addStyleClass(classNameCloseButton));
		}
	};

	//================================================================================
	// Body rendering methods
	//================================================================================

	NotificationListGroupRenderer.renderBody = function (oRm, oControl) {
		oRm.write('<ul class=' + classNameBody + '>');

		this.renderDatetime(oRm, oControl);
		this.renderNotifications(oRm, oControl);

		oRm.write('</ul>');
	};

	NotificationListGroupRenderer.renderDatetime = function (oRm, oControl) {
		oRm.renderControl(oControl._getDateTimeText());
	};

	NotificationListGroupRenderer.renderNotifications = function (oRm, oControl) {
		/** @type {sap.m.NotificationListItem[]} */
		var notifications = oControl.getAggregation('items');
		/** @type {boolean} */
		var collapsed = oControl.getCollapsed();

		notifications.forEach(function (notification) {
			if (collapsed) {
			    notification.addStyleClass('sapMNLG-Collapsed');
			}
			oRm.renderControl(notification);
		});
	};

	//================================================================================
	// Footer rendering methods
	//================================================================================

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

	NotificationListGroupRenderer.renderButtons = function (oRm, oControl, aButtons) {
		aButtons.forEach(function (button) {
			oRm.renderControl(button);
		});
	};

	NotificationListGroupRenderer.renderCollapseGroupLink = function (oRm, oControl) {
		oRm.renderControl(oControl._collapseLink);
	};

	return NotificationListGroupRenderer;

}, /* bExport= */ true);
