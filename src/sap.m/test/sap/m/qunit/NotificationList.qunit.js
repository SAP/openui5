/*global QUnit */

sap.ui.define([
	"sap/m/NotificationList",
	"sap/m/NotificationListGroup",
	"sap/m/NotificationListItem",
	"sap/ui/qunit/utils/nextUIUpdate"
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


	QUnit.module('Focus', {
		beforeEach: async function() {
			this.notificationList = new NotificationList({
				items: [
					new NotificationListGroup({
						title: 'Group 1',
						collapsed: true,
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
						showCloseButton: true,
						title: 'Group 2',
						collapsed: true,
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

	QUnit.test('Focus stays inside notification list after close and invalidation', async function(assert) {
		var oList = this.notificationList;

		oList.getItems()[1]._getCloseButton().firePress();
		await nextUIUpdate();
		oList.setHeaderText('New Header Text');
		await nextUIUpdate();
		oList.removeItem(oList.getItems()[1]);
		await nextUIUpdate();

		assert.ok(oList.getDomRef().contains(document.activeElement), 'Focus stays inside the list');
	});
});
