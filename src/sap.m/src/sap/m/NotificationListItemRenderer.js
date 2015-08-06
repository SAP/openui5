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
	var classNameDueDate = 'sapMNLI-DueDate';
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

		//Rendering the notification list item's status
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
		this.renderCloseIcon(oRm, oControl);
		oRm.write('</div>');
	};

	NotificationListItemRenderer.renderBody = function (oRm, oControl) {
		oRm.write('<div class=' + classNameBody + '>');

		this.renderText(oRm, oControl);
		this.renderDueTime(oRm, oControl);

		oRm.write('</div>');
	};

	NotificationListItemRenderer.renderFooter = function (oRm, oControl) {
		var aButtons = oControl.getButtons();

		if (aButtons && aButtons.length && oControl.getShowButtons()) {
			oRm.write('<div class=' + classNameFooter + '>');
			this.renderActionButtons(oRm, oControl, aButtons);
			oRm.write('</div>');
		}

	};

	NotificationListItemRenderer.renderUnreadStatus = function (oRm, oControl) {
		var readStatus = oControl.getRead();
		var statusClass = readStatus ? classNameRead : classNameUnread;

		oRm.write('<div class=' + statusClass + '></div>');
	};

	NotificationListItemRenderer.renderPriority = function (oRm, oControl) {
		var priority = oControl.getPriority();

		if (priority && priority === sap.m.NotificationPriority.High) {
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

	NotificationListItemRenderer.renderCloseIcon = function (oRm, oControl) {
		if (oControl.getShowCloseButton()) {
			oRm.renderControl(oControl._closeButton.addStyleClass(classNameCloseButton));
		}
	};


	NotificationListItemRenderer.renderText = function (oRm, oControl) {
		var text = new sap.m.Text({
			text: oControl.getText(),
			maxLines: 2
		}).addStyleClass(classNameText);

		oRm.renderControl(text);
	};


	NotificationListItemRenderer.renderDueTime = function (oRm, oControl) {
		function _getDayDue() {
			var _created = new Date();

			var MILISECONDS_PER_DAY = (1000 * 60 * 60 * 24);

			/** @type {number} */
			var daysLeft = (new Date(oControl.getDue()) - _created) / MILISECONDS_PER_DAY;

			if (daysLeft > 0) {
				return 'Due in ' + Math.round(daysLeft) + ' days';
			}
			if (daysLeft < 0) {
				return 'Overdue';
			} else {
				return 'Due today';
			}
		}

		var dueTimeText = new sap.m.Text({text: _getDayDue()}).addStyleClass(classNameDueDate);
		oRm.renderControl(dueTimeText);
	};

	NotificationListItemRenderer.renderActionButtons = function (oRm, oControl, aButtons) {
		aButtons.forEach(function (button) {
			oRm.renderControl(button);
		});
	};

	return NotificationListItemRenderer;

}, /* bExport= */ true);
