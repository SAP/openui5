sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
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
  var _default = AnimationQueue;
  _exports.default = _default;
});