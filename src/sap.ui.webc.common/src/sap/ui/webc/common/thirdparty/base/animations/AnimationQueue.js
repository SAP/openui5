sap.ui.define(function () { 'use strict';

	const tasks = new WeakMap();
	class AnimationQueue {
		static get tasks() {
			return tasks;
		}
		static enqueue(element, task) {
			if (!tasks.has(element)) {
				tasks.set(element, []);
			}
			tasks.get(element).push(task);
		}
		static run(element, task) {
			if (!tasks.has(element)) {
				tasks.set(element, []);
			}
			return task().then(() => {
				const elementTasks = tasks.get(element);
				if (elementTasks.length > 0) {
					return AnimationQueue.run(element, elementTasks.shift());
				}
				tasks.delete(element);
			});
		}
		static push(element, task) {
			const elementTasks = tasks.get(element);
			if (elementTasks) {
				AnimationQueue.enqueue(element, task);
			} else {
				AnimationQueue.run(element, task);
			}
		}
	}

	return AnimationQueue;

});
