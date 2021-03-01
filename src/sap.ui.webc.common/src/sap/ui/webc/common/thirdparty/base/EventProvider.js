sap.ui.define(function () { 'use strict';

	class EventProvider {
		constructor() {
			this._eventRegistry = {};
		}
		attachEvent(eventName, fnFunction) {
			const eventRegistry = this._eventRegistry;
			let eventListeners = eventRegistry[eventName];
			if (!Array.isArray(eventListeners)) {
				eventRegistry[eventName] = [];
				eventListeners = eventRegistry[eventName];
			}
			eventListeners.push({
				"function": fnFunction,
			});
		}
		detachEvent(eventName, fnFunction) {
			const eventRegistry = this._eventRegistry;
			let eventListeners = eventRegistry[eventName];
			if (!eventListeners) {
				return;
			}
			eventListeners = eventListeners.filter(event => {
				return event["function"] !== fnFunction;
			});
			if (eventListeners.length === 0) {
				delete eventRegistry[eventName];
			}
		}
		fireEvent(eventName, data) {
			const eventRegistry = this._eventRegistry;
			const eventListeners = eventRegistry[eventName];
			if (!eventListeners) {
				return [];
			}
			return eventListeners.map(event => {
				return event["function"].call(this, data);
			});
		}
		fireEventAsync(eventName, data) {
			return Promise.all(this.fireEvent(eventName, data));
		}
		isHandlerAttached(eventName, fnFunction) {
			const eventRegistry = this._eventRegistry;
			const eventListeners = eventRegistry[eventName];
			if (!eventListeners) {
				return false;
			}
			for (let i = 0; i < eventListeners.length; i++) {
				const event = eventListeners[i];
				if (event["function"] === fnFunction) {
					return true;
				}
			}
			return false;
		}
		hasListeners(eventName) {
			return !!this._eventRegistry[eventName];
		}
	}

	return EventProvider;

});
