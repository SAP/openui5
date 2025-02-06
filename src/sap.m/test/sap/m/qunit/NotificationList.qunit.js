/*global QUnit */

sap.ui.define([
	"sap/m/NotificationList",
	"sap/m/NotificationListGroup",
	"sap/m/NotificationListItem",
	"sap/ui/test/utils/nextUIUpdate"
], function(
	NotificationList,
	NotificationListGroup,
	NotificationListItem,
	nextUIUpdate
) {
	'use strict';

	var RENDER_LOCATION = 'qunit-fixture';

	QUnit.module('Rendering', {
		beforeEach: async function() {
			this.notificationList = new NotificationList({
				items: [
					new NotificationListGroup({
						title: 'Group 1',
						items: [
							new NotificationListItem({
								title: 'Item 1',
								description: 'Item 1 Description'
							}),
							new NotificationListItem({
								title: 'Item 2',
								description: 'Item 2 Description'
							})
						]
					}),
					new NotificationListGroup({
						title: 'Group 2',
						items: [
							new NotificationListItem({
								title: 'Item 1',
								description: 'Item 1 Description'
							}),
							new NotificationListItem({
								title: 'Item 2',
								description: 'Item 2 Description'
							})
						]
					})
				]
			});

			this.notificationList.placeAt(RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function() {
			this.notificationList.destroy();
		}
	});

	QUnit.test('ACC role', function(assert) {
		var $listUl = this.notificationList.$('listUl');
		assert.strictEqual($listUl.attr('role'), 'list', 'acc role is correct');
	});
});
