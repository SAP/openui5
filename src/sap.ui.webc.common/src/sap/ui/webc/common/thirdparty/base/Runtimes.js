sap.ui.define(['exports', './generated/VersionInfo', './getSharedResource'], function (exports, VersionInfo, getSharedResource) { 'use strict';

	let currentRuntimeIndex;
	let currentRuntimeAlias = "";
	const compareCache = new Map();
	const Runtimes = getSharedResource("Runtimes", []);
	const registerCurrentRuntime = () => {
		if (currentRuntimeIndex === undefined) {
			currentRuntimeIndex = Runtimes.length;
			Runtimes.push({
				...VersionInfo,
				alias: currentRuntimeAlias,
				description: `Runtime ${currentRuntimeIndex} - ver ${VersionInfo.version}${currentRuntimeAlias ? ` (${currentRuntimeAlias})` : ""}`,
			});
		}
	};
	const getCurrentRuntimeIndex = () => {
		return currentRuntimeIndex;
	};
	const compareRuntimes = (index1, index2) => {
		const cacheIndex = `${index1},${index2}`;
		if (compareCache.has(cacheIndex)) {
			return compareCache.get(cacheIndex);
		}
		const runtime1 = Runtimes[index1];
		const runtime2 = Runtimes[index2];
		if (!runtime1 || !runtime2) {
			throw new Error("Invalid runtime index supplied");
		}
		if (runtime1.isNext || runtime2.isNext) {
			return runtime1.buildTime - runtime2.buildTime;
		}
		const majorDiff = runtime1.major - runtime2.major;
		if (majorDiff) {
			return majorDiff;
		}
		const minorDiff = runtime1.minor - runtime2.minor;
		if (minorDiff) {
			return minorDiff;
		}
		const patchDiff = runtime1.patch - runtime2.patch;
		if (patchDiff) {
			return patchDiff;
		}
		const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
		const result = collator.compare(runtime1.suffix, runtime2.suffix);
		compareCache.set(cacheIndex, result);
		return result;
	};
	const setRuntimeAlias = alias => {
		currentRuntimeAlias = alias;
	};
	const getAllRuntimes = () => {
		return Runtimes;
	};

	exports.compareRuntimes = compareRuntimes;
	exports.getAllRuntimes = getAllRuntimes;
	exports.getCurrentRuntimeIndex = getCurrentRuntimeIndex;
	exports.registerCurrentRuntime = registerCurrentRuntime;
	exports.setRuntimeAlias = setRuntimeAlias;

	Object.defineProperty(exports, '__esModule', { value: true });

});
