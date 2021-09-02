sap.ui.define(function () { 'use strict';

	class EventProvider {
		constructor() {
			this._eventRegistry = new Map();
		}
		attachEvent(eventName, fnFunction) {
			const eventRegistry = this._eventRegistry;
			const eventListeners = eventRegistry.get(eventName);
			if (!Array.isArray(eventListeners)) {
				eventRegistry.set(eventName, [fnFunction]);
				return;
			}
			if (!eventListeners.includes(fnFunction)) {
				eventListeners.push(fnFunction);
			}
		}
		detachEvent(eventName, fnFunction) {
			const eventRegistry = this._eventRegistry;
			let eventListeners = eventRegistry.get(eventName);
			if (!eventListeners) {
				return;
			}
			eventListeners = eventListeners.filter(fn => fn !== fnFunction);
			if (eventListeners.length === 0) {
				eventRegistry.delete(eventName);
			}
		}
		fireEvent(eventName, data) {
			const eventRegistry = this._eventRegistry;
			const eventListeners = eventRegistry.get(eventName);
			if (!eventListeners) {
				return [];
			}
			return eventListeners.map(fn => {
				return fn.call(this, data);
			});
		}
		fireEventAsync(eventName, data) {
			return Promise.all(this.fireEvent(eventName, data));
		}
		isHandlerAttached(eventName, fnFunction) {
			const eventRegistry = this._eventRegistry;
			const eventListeners = eventRegistry.get(eventName);
			if (!eventListeners) {
				return false;
			}
			return eventListeners.includes(fnFunction);
		}
		hasListeners(eventName) {
			return !!this._eventRegistry.get(eventName);
		}
	}

	return EventProvider;

});
