/*!
 * ${copyright}
 */

window.addEventListener("load", function () {
	"use strict";

	var ACE_BASE_PATH = new URL("./js/ace/", document.baseURI).href;
	var workers = new Map();

	// listen for messages from ace
	window.addEventListener("message", function (event) {
		var message = event.data.message;
		var workerId = event.data.workerId;
		var senderOrigin = event.origin;

		if (message.createWorker) {
			var workerEntry = createWorkerEntry(message.workerUrl, senderOrigin, workerId);

			if (workerEntry) {
				workers.set(workerId, workerEntry);
			}
		} else if (message.terminateWorker) {
			workers.get(workerId).worker.terminate();
			workers.delete(workerId);
		} else if (senderOrigin === workers.get(workerId).creatorOrigin) { // send message to the worker only from the origin that created it
			workers.get(workerId).worker.postMessage(message);
		}
	});

	function createWorkerEntry(url, origin, workerId) {
		if (!url || typeof url !== "string") {
			return null;
		}

		var absoluteWorkerUrl = new URL(url, document.baseURI).href;

		// create worker only if it's located on the same origin and is in the "./js/ace/" folder
		if (!absoluteWorkerUrl.startsWith(ACE_BASE_PATH)) {
			return null;
		}

		var worker = new Worker(absoluteWorkerUrl);
		// forward messages from worker to ace
		worker.addEventListener("message", function(event) {
			event.data.workerId = workerId;
			window.parent.postMessage(event.data, origin);
		});

		return {
			creatorOrigin: origin,
			worker: worker
		};
	}
});