/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	'use strict';

	/**
	 * NotificationListItem renderer.
	 * @namespace
	 */
	var NotificationListItemRenderer = {};

	var classNameItem = 'sapMNLI';
	var classNameIcons = 'sapMNLI-Icons';
	var classNameUnread = 'sapMNLI-UnreadStatus';
	var classNameRead = 'sapMNLI-ReadStatus';
	var classNameHeader = 'sapMNLI-Header';
	var classNameBody = 'sapMNLI-Body';
	var classNameFooter = 'sapMNLI-Footer';
	var classNameCloseButton = 'sapMNLI-CloseButton';

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.render = function (oRm, oControl) {
		var id = oControl.getId();

		oRm.write('<li');
		oRm.addClass(classNameItem);
		oRm.writeControlData(oControl);
		oRm.writeAttribute('tabindex', '0');

		// ARIA
		oRm.writeAccessibilityState(oControl, {
			role: "listitem",
			labelledby: id + '--title',
			describedby: (id + '--body') + ' ' + (id + '--info')
		});

		oRm.writeClasses();
		oRm.write('>');

		this.renderIcons(oRm, oControl);
		this.renderHeader(oRm, oControl);
		this.renderBody(oRm, oControl);
		this.renderFooter(oRm, oControl);

		oRm.write('</li>');
	};

	NotificationListItemRenderer.renderIcons = function (oRm, oControl) {
		oRm.write('<div class=' + classNameIcons + '>');
		this.renderUnreadStatus(oRm, oControl);
		this.renderPriority(oRm, oControl);
		oRm.write('</div>');
	};

	NotificationListItemRenderer.renderHeader = function (oRm, oControl) {
		oRm.write('<div class=' + classNameHeader + '>');
		this.renderTitle(oRm, oControl);
		this.renderCloseButton(oRm, oControl);
		oRm.write('</div>');
	};

	NotificationListItemRenderer.renderBody = function (oRm, oControl) {
		oRm.write('<div class=' + classNameBody + '>');

		this.renderDescription(oRm, oControl);
		this.renderDatetime(oRm, oControl);

		oRm.write('</div>');
	};

	NotificationListItemRenderer.renderFooter = function (oRm, oControl) {
		var aButtons = oControl.getButtons();

		if (aButtons && aButtons.length && oControl.getShowButtons()) {
			oRm.write('<div class=' + classNameFooter + '>');
			this.renderButtons(oRm, oControl, aButtons);
			oRm.write('</div>');
		}
	};

	//================================================================================
	// Icon rendering methods
	//================================================================================

	NotificationListItemRenderer.renderUnreadStatus = function (oRm, oControl) {
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var unreadStatus = oControl.getUnread();
		var statusClass = unreadStatus ? classNameUnread : classNameRead;
		var statusTitle = unreadStatus ? resourceBundle.getText('NOTIFICATION_LIST_ITEM_UNREAD') : resourceBundle.getText('NOTIFICATION_LIST_ITEM_READ');

		oRm.write('<div');
		oRm.writeAttribute('class', statusClass);
		oRm.writeAttribute('title', statusTitle);
		oRm.write('></div>');
	};

	NotificationListItemRenderer.renderPriority = function (oRm, oControl) {
		var priority = oControl.getPriority();

		if (priority && priority === sap.ui.core.Priority.High) {
			var icon = new sap.ui.core.Icon({src: 'sap-icon://warning'});
			oRm.renderControl(icon);
		}
	};

	//================================================================================
	// Header rendering methods
	//================================================================================

	NotificationListItemRenderer.renderTitle = function (oRm, oControl) {
		oRm.renderControl(oControl._getHeaderTitle());
	};

	NotificationListItemRenderer.renderCloseButton = function (oRm, oControl) {
		if (oControl.getShowCloseButton()) {
			oRm.renderControl(oControl._closeButton.addStyleClass(classNameCloseButton));
		}
	};

	//================================================================================
	// Body rendering methods
	//================================================================================

	NotificationListItemRenderer.renderDescription = function (oRm, oControl) {
		oRm.renderControl(oControl._getDescriptionText());
	};

	NotificationListItemRenderer.renderDatetime = function (oRm, oControl) {
		this.renderAriaText(oRm, oControl);

		oRm.renderControl(oControl._getDateTimeText());
	};

	/**
	 * Provides aria support for the additional control information such as: read status, due date and priority
	 *
	 * @param {Object} oRm - The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.NotificationListItem} oControl - An object representation of the Notification List Item that should be rendered
	 */
	NotificationListItemRenderer.renderAriaText = function (oRm, oControl) {
		oRm.renderControl(oControl._ariaDetailsText);
	};

	//================================================================================
	// Footer rendering methods
	//================================================================================

	NotificationListItemRenderer.renderButtons = function (oRm, oControl, aButtons) {
		aButtons.forEach(function (button) {
			oRm.renderControl(button);
		});
	};

	return NotificationListItemRenderer;

}, /* bExport= */ true);
