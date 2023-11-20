sap.ui.define(["exports", "./getSharedResource", "./Runtimes"], function (_exports, _getSharedResource, _Runtimes) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerTag = _exports.recordTagRegistrationFailure = _exports.isTagRegistered = _exports.getAllRegisteredTags = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const Tags = (0, _getSharedResource.default)("Tags", new Map());
  const Definitions = new Set();
  let Failures = new Map();
  let failureTimeout;
  const UNKNOWN_RUNTIME = -1;
  const registerTag = tag => {
    Definitions.add(tag);
    Tags.set(tag, (0, _Runtimes.getCurrentRuntimeIndex)());
  };
  _exports.registerTag = registerTag;
  const isTagRegistered = tag => {
    return Definitions.has(tag);
  };
  _exports.isTagRegistered = isTagRegistered;
  const getAllRegisteredTags = () => {
    return [...Definitions.values()];
  };
  _exports.getAllRegisteredTags = getAllRegisteredTags;
  const recordTagRegistrationFailure = tag => {
    let tagRegRuntimeIndex = Tags.get(tag);
    if (tagRegRuntimeIndex === undefined) {
      tagRegRuntimeIndex = UNKNOWN_RUNTIME; // If the tag is taken, but not registered in Tags, then a version before 1.1.0 defined it => use the "unknown" key
    }

    if (!Failures.has(tagRegRuntimeIndex)) {
      Failures.set(tagRegRuntimeIndex, new Set());
    }
    Failures.get(tagRegRuntimeIndex).add(tag);
    if (!failureTimeout) {
      failureTimeout = setTimeout(() => {
        displayFailedRegistrations();
        Failures = new Map();
        failureTimeout = undefined;
      }, 1000);
    }
  };
  _exports.recordTagRegistrationFailure = recordTagRegistrationFailure;
  const displayFailedRegistrations = () => {
    const allRuntimes = (0, _Runtimes.getAllRuntimes)();
    const currentRuntimeIndex = (0, _Runtimes.getCurrentRuntimeIndex)();
    const currentRuntime = allRuntimes[currentRuntimeIndex];
    let message = `Multiple UI5 Web Components instances detected.`;
    if (allRuntimes.length > 1) {
      message = `${message}\nLoading order (versions before 1.1.0 not listed): ${allRuntimes.map(runtime => `\n${runtime.description}`).join("")}`;
    }
    [...Failures.keys()].forEach(otherRuntimeIndex => {
      let comparison;
      let otherRuntime;
      if (otherRuntimeIndex === UNKNOWN_RUNTIME) {
        // version < 1.1.0 defined the tag
        comparison = 1; // the current runtime is considered newer
        otherRuntime = {
          description: `Older unknown runtime`
        };
      } else {
        comparison = (0, _Runtimes.compareRuntimes)(currentRuntimeIndex, otherRuntimeIndex);
        otherRuntime = allRuntimes[otherRuntimeIndex];
      }
      let compareWord;
      if (comparison > 0) {
        compareWord = "an older";
      } else if (comparison < 0) {
        compareWord = "a newer";
      } else {
        compareWord = "the same";
      }
      message = `${message}\n\n"${currentRuntime.description}" failed to define ${Failures.get(otherRuntimeIndex).size} tag(s) as they were defined by a runtime of ${compareWord} version "${otherRuntime.description}": ${[...Failures.get(otherRuntimeIndex)].sort().join(", ")}.`;
      if (comparison > 0) {
        message = `${message}\nWARNING! If your code uses features of the above web components, unavailable in ${otherRuntime.description}, it might not work as expected!`;
      } else {
        message = `${message}\nSince the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;
      }
    });
    message = `${message}\n\nTo prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/03-scoping.md.`;
    console.warn(message); // eslint-disable-line
  };
});