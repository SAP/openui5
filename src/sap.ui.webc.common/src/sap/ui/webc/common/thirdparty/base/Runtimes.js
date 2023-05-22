sap.ui.define(["exports", "./generated/VersionInfo", "./getSharedResource"], function (_exports, _VersionInfo, _getSharedResource) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setRuntimeAlias = _exports.registerCurrentRuntime = _exports.getCurrentRuntimeIndex = _exports.getAllRuntimes = _exports.compareRuntimes = void 0;
  _VersionInfo = _interopRequireDefault(_VersionInfo);
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  let currentRuntimeIndex;
  let currentRuntimeAlias = "";
  const compareCache = new Map();
  /**
   * Central registry where all runtimes register themselves by pushing an object.
   * The index in the registry servers as an ID for the runtime.
   * @type {*}
   */
  const Runtimes = (0, _getSharedResource.default)("Runtimes", []);
  /**
   * Registers the current runtime in the shared runtimes resource registry
   */
  const registerCurrentRuntime = () => {
    if (currentRuntimeIndex === undefined) {
      currentRuntimeIndex = Runtimes.length;
      const versionInfo = _VersionInfo.default;
      Runtimes.push({
        ...versionInfo,
        alias: currentRuntimeAlias,
        description: `Runtime ${currentRuntimeIndex} - ver ${versionInfo.version}${currentRuntimeAlias ? ` (${currentRuntimeAlias})` : ""}`
      });
    }
  };
  /**
   * Returns the index of the current runtime's object in the shared runtimes resource registry
   * @returns {*}
   */
  _exports.registerCurrentRuntime = registerCurrentRuntime;
  const getCurrentRuntimeIndex = () => {
    return currentRuntimeIndex;
  };
  /**
   * Compares two runtimes and returns 1 if the first is of a bigger version, -1 if the second is of a bigger version, and 0 if equal
   * @param index1 The index of the first runtime to compare
   * @param index2 The index of the second runtime to compare
   * @returns {number}
   */
  _exports.getCurrentRuntimeIndex = getCurrentRuntimeIndex;
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
    // If any of the two is a next version, bigger buildTime wins
    if (runtime1.isNext || runtime2.isNext) {
      return runtime1.buildTime - runtime2.buildTime;
    }
    // If major versions differ, bigger one wins
    const majorDiff = runtime1.major - runtime2.major;
    if (majorDiff) {
      return majorDiff;
    }
    // If minor versions differ, bigger one wins
    const minorDiff = runtime1.minor - runtime2.minor;
    if (minorDiff) {
      return minorDiff;
    }
    // If patch versions differ, bigger one wins
    const patchDiff = runtime1.patch - runtime2.patch;
    if (patchDiff) {
      return patchDiff;
    }
    // Bigger suffix wins, f.e. rc10 > rc9
    // Important: suffix is alphanumeric, must use natural compare
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base"
    });
    const result = collator.compare(runtime1.suffix, runtime2.suffix);
    compareCache.set(cacheIndex, result);
    return result;
  };
  /**
   * Set an alias for the the current app/library/microfrontend which will appear in debug messages and console warnings
   * @param alias
   */
  _exports.compareRuntimes = compareRuntimes;
  const setRuntimeAlias = alias => {
    currentRuntimeAlias = alias;
  };
  _exports.setRuntimeAlias = setRuntimeAlias;
  const getAllRuntimes = () => {
    return Runtimes;
  };
  _exports.getAllRuntimes = getAllRuntimes;
});