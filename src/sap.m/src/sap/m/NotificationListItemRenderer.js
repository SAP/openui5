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
	var classNameText = 'sapMNLI-Text';
	var classNameDatetime = 'sapMNLI-Datetime';
	var classNameFooter = 'sapMNLI-Footer';
	var classNameCloseButton = 'sapMNLI-CloseButton';

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	NotificationListItemRenderer.render = function (oRm, oControl) {
		oRm.write('<li');
		oRm.addClass(classNameItem);

		oRm.writeControlData(oControl);
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

	NotificationListItemRenderer.renderUnreadStatus = function (oRm, oControl) {
		var unreadStatus = oControl.getUnread();
		var statusClass = unreadStatus ? classNameUnread : classNameRead;

		oRm.write('<div class=' + statusClass + '></div>');
	};

	NotificationListItemRenderer.renderPriority = function (oRm, oControl) {
		var priority = oControl.getPriority();

		if (priority && priority === sap.ui.core.Priority.High) {
			var icon = new sap.ui.core.Icon({src: 'sap-icon://warning'});
			oRm.renderControl(icon);
		}
	};

	NotificationListItemRenderer.renderTitle = function (oRm, oControl) {
		var title = new sap.m.Title({
			text: oControl.getTitle()
		});

		oRm.renderControl(title);
	};

	NotificationListItemRenderer.renderCloseButton = function (oRm, oControl) {
		if (oControl.getShowCloseButton()) {
			oRm.renderControl(oControl._closeButton.addStyleClass(classNameCloseButton));
		}
	};

	NotificationListItemRenderer.renderDescription = function (oRm, oControl) {
		var text = new sap.m.Text({
			text: oControl.getDescription(),
			maxLines: 2
		}).addStyleClass(classNameText);

		oRm.renderControl(text);
	};

	NotificationListItemRenderer.renderDatetime = function (oRm, oControl) {
		var datetimeTextControl = new sap.m.Text({
			text: oControl.getDatetime(),
			textAlign: 'End'
		}).addStyleClass(classNameDatetime);
		oRm.renderControl(datetimeTextControl);
	};

	NotificationListItemRenderer.renderButtons = function (oRm, oControl, aButtons) {
		aButtons.forEach(function (button) {
			oRm.renderControl(button);
		});
	};

	return NotificationListItemRenderer;

}, /* bExport= */ true);
