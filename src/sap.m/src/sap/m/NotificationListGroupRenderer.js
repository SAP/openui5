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
	var classNameBase = 'sapMNLB';
	var classNameListBaseItem = 'sapMLIB';
	var classNameAuthor = 'sapMNLB-AuthorPicture';
	var classNameBaseHeader = 'sapMNLB-Header';
	var classNameHeader = 'sapMNLG-Header';
	var classNameBody = 'sapMNLG-Body';
	var classNameBaseFooter = 'sapMNLB-Footer';
	var classNameFooter = 'sapMNLG-Footer';
	var classNameCloseButton = 'sapMNLB-CloseButton';
	var classNamePriority = 'sapMNLB-Priority';
	var classNameDetails = 'sapMNLG-Details';
	var classNameBullet = 'sapMNLB-Bullet';
	var classNameDescription = 'sapMNLG-Description';
	var classNameCollapsed = 'sapMNLG-Collapsed';

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	NotificationListGroupRenderer.render = function (oRm, oControl) {
		oRm.write('<li');
		oRm.addClass(classNameItem);
		oRm.addClass(classNameBase);
		oRm.addClass(classNameListBaseItem);

		if (oControl.getCollapsed()) {
			oRm.addClass(classNameCollapsed);
		}

		oRm.writeClasses();
		oRm.writeControlData(oControl);
		oRm.writeAttribute('tabindex', '0');
		oRm.writeAccessibilityState(oControl, {
			labelledby : oControl._getHeaderTitle().getId()
		});
		oRm.write('>');
			this.renderHeader(oRm, oControl);
			this.renderBody(oRm, oControl);
			this.renderFooter(oRm, oControl);
		oRm.write('</li>');
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
			oRm.renderControl(oControl._closeButton.addStyleClass(classNameCloseButton));
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

		if (notifications) {
			notifications.forEach(function (notification) {
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

		//oRm.write('<div class=' + classNameFooter + '>');

		oRm.write('<div');
		oRm.addClass(classNameFooter);
		oRm.addClass(classNameBaseFooter);

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
			case (sap.ui.core.Priority.Low):
				classPriority = 'sapMNLB-Low';
				break;
			case (sap.ui.core.Priority.Medium):
				classPriority = 'sapMNLB-Medium';
				break;
			case (sap.ui.core.Priority.High):
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
		oRm.renderControl(oControl._collapseButton);
	};

	return NotificationListGroupRenderer;

}, /* bExport= */ true);
