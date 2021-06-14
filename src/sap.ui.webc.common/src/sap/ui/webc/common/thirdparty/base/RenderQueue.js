sap.ui.define(function () { 'use strict';

	const MAX_PROCESS_COUNT = 10;
	class RenderQueue {
		constructor() {
			this.list = [];
			this.lookup = new Set();
		}
		add(webComponent) {
			if (this.lookup.has(webComponent)) {
				return;
			}
			this.list.push(webComponent);
			this.lookup.add(webComponent);
		}
		remove(webComponent) {
			if (!this.lookup.has(webComponent)) {
				return;
			}
			this.list = this.list.filter(item => item !== webComponent);
			this.lookup.delete(webComponent);
		}
		shift() {
			const webComponent = this.list.shift();
			if (webComponent) {
				this.lookup.delete(webComponent);
				return webComponent;
			}
		}
		isEmpty() {
			return this.list.length === 0;
		}
		isAdded(webComponent) {
			return this.lookup.has(webComponent);
		}
		process(callback) {
			let webComponent;
			const stats = new Map();
			webComponent = this.shift();
			while (webComponent) {
				const timesProcessed = stats.get(webComponent) || 0;
				if (timesProcessed > MAX_PROCESS_COUNT) {
					throw new Error(`Web component processed too many times this task, max allowed is: ${MAX_PROCESS_COUNT}`);
				}
				callback(webComponent);
				stats.set(webComponent, timesProcessed + 1);
				webComponent = this.shift();
			}
		}
	}

	return RenderQueue;

});
