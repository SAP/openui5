/*global QUnit*/
sap.ui.define([
		"sap/ui/support/supportRules/WindowCommunicationBus",
		"sap/ui/support/supportRules/WCBConfig",
		"sap/base/util/isEmptyObject"
], function (WindowCommunicationBus, WCBConfig, isEmptyObject) {
	"use strict";

	QUnit.module('Testing subscribe functionality', {
		beforeEach: function () {
			this.communicationBus = new WindowCommunicationBus(new WCBConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				}
			}));
		},
		afterEach: function () {
			this.communicationBus.destroyChannels();
			this.communicationBus = null;
		}
	});

	QUnit.test('Subscribe method', function (assert) {
		// arrange
		var channelName = 'testChannel';
		var scope = {id: 'testScope'};
		var testFunction = function () {
			return 'Test';
		};

		// assert
		assert.ok(isEmptyObject(this.communicationBus._channels), 'The channels object should be empty before initial subscription');

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);

		// assert
		assert.strictEqual(this.communicationBus._channels[channelName][0].context.id, 'testScope', 'Should set the scope correctly');
		assert.strictEqual(this.communicationBus._channels[channelName][0].callback, testFunction, 'Should set the callback correctly');
	});

	QUnit.test('Destroy channels', function (assert) {
		// arrange
		var channelName = 'testChannel';
		var scope = {id: 'testScope'};
		var testFunction = function () {
			return 'test function';
		};

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);
		this.communicationBus.destroyChannels();

		// assert
		assert.strictEqual(isEmptyObject(this.communicationBus._channels), true,
			'Should clear all of the subscriptions');
	});

	QUnit.test('Subscribing multiple times to one channel', function (assert) {
		// arrange
		var channelName = 'testChannel';
		var scope = {id: 'testScope'};
		var testFunction = function () {
			return 'This is the first function';
		};
		var secondTestFunction = function () {
			return 'This is the second function';
		};

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);
		this.communicationBus.subscribe(channelName, secondTestFunction, scope);
		var subscriber = this.communicationBus._channels[channelName];

		// assert
		assert.strictEqual(subscriber.length, 2, 'Should set both of the functions.');
		assert.strictEqual(subscriber[0].callback, testFunction, 'Should set the first passed function first.');
		assert.strictEqual(subscriber[1].callback, secondTestFunction, 'Should set the second passed function after that.');
	});

	QUnit.module('Properties', {
		beforeEach: function () {
			this.oWindowCommunicationBus = new WindowCommunicationBus(new WCBConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				}
			}));

		},
		afterEach: function () {
			this.oWindowCommunicationBus.destroyChannels();
			this.oWindowCommunicationBus = null;
		}
	});

	QUnit.test('bSilentMode', function (assert) {
		// assert
		assert.strictEqual(this.oWindowCommunicationBus.bSilentMode, false, 'Default value of silent mode should be "false".');

		// act - turn silent mode on
		this.oWindowCommunicationBus.bSilentMode = true;
		this.oWindowCommunicationBus.subscribe('test_channel', function () {});

		// assert
		assert.ok(isEmptyObject(this.oWindowCommunicationBus._channels), 'There should NOT be any communication subscriptions when in silent mode.');
	});
});
