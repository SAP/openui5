/*global QUnit*/
(function () {
	'use strict';

	jQuery.sap.require('sap/ui/support/supportRules/WindowCommunicationBus');

	QUnit.module('Testing subscribe functionality', {
		setup: function () {
			this.communicationBus = sap.ui.support.supportRules.WindowCommunicationBus;
			this.communicationBus.channels = {};
		},
		teardown: function () {
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
		assert.strictEqual(jQuery.isEmptyObject(this.communicationBus.channels), true,
			'The channels object should be empty before initial subscription');

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);

		// assert
		assert.strictEqual(this.communicationBus.channels[channelName][0].context.id, 'testScope', 'Should set the scope correctly');
		assert.strictEqual(this.communicationBus.channels[channelName][0].callback, testFunction, 'Should set the callback correctly');
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
		assert.strictEqual(jQuery.isEmptyObject(this.communicationBus.channels), true,
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
		var subscriber = this.communicationBus.channels[channelName];

		// assert
		assert.strictEqual(subscriber.length, 2, 'Should set both of the functions.');
		assert.strictEqual(subscriber[0].callback, testFunction, 'Should set the first passed function first.');
		assert.strictEqual(subscriber[1].callback, secondTestFunction, 'Should set the second passed function after that.');
	});

	QUnit.module('Publish method functionality', {
		setup: function () {
			this.communicationBus = sap.ui.support.supportRules.WindowCommunicationBus;
			this.communicationBus.destroyChannels();

			this.channelName = 'testChannel';
		},
		teardown: function () {
			this.communicationBus = null;
			this.channelName = null;
		}
	});
}());
