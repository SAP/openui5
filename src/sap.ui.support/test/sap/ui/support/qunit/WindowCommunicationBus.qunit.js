/*global QUnit*/
sap.ui.define([
		"sap/ui/support/supportRules/WindowCommunicationBus",
		"sap/ui/support/supportRules/WCBConfig"
], function (WindowCommunicationBus, CommunicationBusConfig) {
	"use strict";

	QUnit.module('Testing subscribe functionality', {
		beforeEach: function () {
			this.sNamespace = "test";
			this.communicationBus = new WindowCommunicationBus(new CommunicationBusConfig({
				modulePath: "test",
				receivingWindow: "test1",
				uriParams: {
					origin: "test-origin",
					frameId: "test-identifier"
				},
				namespace: this.sNamespace
			}));
			WindowCommunicationBus.channels = {};
		},
		afterEach: function () {
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
		assert.strictEqual(jQuery.isEmptyObject(WindowCommunicationBus.channels), true,
			'The channels object should be empty before initial subscription');

		// act
		this.communicationBus.subscribe(channelName, testFunction, scope);

		// assert
		assert.strictEqual(WindowCommunicationBus.channels[this.sNamespace][channelName][0].context.id, 'testScope', 'Should set the scope correctly');
		assert.strictEqual(WindowCommunicationBus.channels[this.sNamespace][channelName][0].callback, testFunction, 'Should set the callback correctly');
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
		assert.strictEqual(jQuery.isEmptyObject(WindowCommunicationBus.channels), true,
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
		var subscriber = WindowCommunicationBus.channels[this.sNamespace][channelName];

		// assert
		assert.strictEqual(subscriber.length, 2, 'Should set both of the functions.');
		assert.strictEqual(subscriber[0].callback, testFunction, 'Should set the first passed function first.');
		assert.strictEqual(subscriber[1].callback, secondTestFunction, 'Should set the second passed function after that.');
	});
});
