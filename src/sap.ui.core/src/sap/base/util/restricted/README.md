# What is it?

This folder contains restricted utility functions only to be used by framework libraries.
The functions are subject to change without prior notice.

Some utils are implemented using lodash, but this may change in future releases.

## How to add new functions

* **Consider polyfills first.**

* Naming of modules: Every restricted module must start with `_` (to indicate restricted usage).

* Important: The functions must not be used for public documentation/examples. Mark all modules and APIs as `@private` and `@ui5-restricted` (`@private` has to come first).

* New functions must be reviewed by lead architects.

* The `ownership.json` file must be maintained. The contributing team is and remains responsible for the respective functions.

* Keep size in mind.

## How to add lodash functions

1. Install [lodash-cli](https://www.npmjs.com/package/lodash-cli). The version has to be the same as the version of the approved lodash library.

2. Generate a new custom bundle by following the instructions here — https://lodash.com/custom-builds.

	**Important:** Do not forget to include previously bundled functions. The list can be found in JSDoc in the current bundle (./_/lodash.custom.js).

	Custom bundle example:
	```
	lodash strict include=omit,uniq,uniqBy,uniqWith,intersection,intersectionBy,intersectionWith,pick,pickBy,debounce,throttle,max,min,castArray,curry,merge,mergeWith
	```