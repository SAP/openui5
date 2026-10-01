/*!
 * ${copyright}
 */
/*global $0*/
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/i18n/Formatting",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/ControlBehavior",
	"sap/ui/security/Security"
], function(Localization, Formatting, Device, Element, ControlBehavior, Security) {
	"use strict";

	const DEBUG_TOOL_NAME = "UI5 Debug Tools";
	const HEADER_COLOR = "#FC4229";
	const GROUP_COLOR = "#0070F2";

	/**
	 * Helper to create a new scope object that does not inherit from Object.prototype.
	 * @param {object} [obj] Initial properties of the scope (can be omitted)
	 * @returns {object} Scope with initial properties set
	 */
	function scope(obj) {
		return Object.assign(Object.create(null), obj);
	}

	// Help entries for the base tools (always available)
	const aBaseHelp = [
		{cmd: "ui5.help()", text: "Show this help"},
		{cmd: "ui5.require(modules)", text: "Load modules asynchronously \u2014 ui5.require('sap/m/Button')"},
		{cmd: "ui5.spy(ctx, fn, cb)", text: "Spy on a function \u2014 returns {restore, callCount, getCalls}"},
		{cmd: "ui5.control($0)", text: "Get UI5 control from DOM node (you can use the special variable $0)"},
		{cmd: "ui5.byId(id)", text: "Get UI5 element by its ID"},
		{cmd: "ui5.device", text: "Device detection API (sap/ui/Device)"},
		{cmd: "ui5.config", text: "Configuration APIs (Localization, Formatting, ControlBehavior, Security)"}
	];

	// Collected help entries from libraries, populated by DebugLoader
	const aLibraryHelp = [];

	/**
	 * Defines a globalThis object 'ui5' that contains basic debugging utils independent of any
	 * library specific tools.
	 * @private
	 */
	const UI5Debug = {
		/**
		 * Loads one or more modules asynchronously.
		 * @param {string | string[]} modules A single module name or an array of module names to load
		 * @returns {Promise<any | any[]>} A promise that resolves with the module if a string was passed,
		 *   or an array of modules if an array was passed
		 */
		require: function(modules) {
			const isArray = Array.isArray(modules);
			modules = isArray ? modules : [modules];
			return new Promise((resolve, reject) => {
				sap.ui.require(modules, function() {
					resolve(isArray ? Array.from(arguments) : arguments[0]);
				}, reject);
			});
		},

		/**
		 * Spies a function
		 *
		 * Example:
		 * <pre>
		 * const hook = ui5debug.Spy(globalThis, "console.log", (spyInfo) => {
		 *    console.error("Hooked!", spyInfo.args);
		 *    return {
		 *      // If true, it does not run the original function at the end
		 *      // If false or not specified it runs the original function
		 *      preventDefault: false,
		 *
		 *      // If preventDefault is true, the return value has to be specified
		 *      // The return value is the object that the original function caller should receive
		 *      returnValue: INSTANCE,
		 *    }
		 * });
		 * </pre>
		 *
		 * @param {object} context The context where the function to hook lives e.g. globalThis
		 * @param {string} functionToHook The namespace of the function to hook e.g. console.log
		 * @param {function(*): Promise<{preventDefault: boolean, returnValue: *}>|{preventDefault: boolean, returnValue: *}} subscriber The callback which to run when spying (interception)
		 * @returns {object} A spy object inspired by the sinon spies, but only exposing the following members:
		 *   - <code>restore()</code> - Removes the spy and restores the original function, clearing all recorded calls
		 *   - <code>callCount</code> - The number of recorded calls
		 *   - <code>getCalls()</code> - Returns a shallow copy of all recorded calls
		 *   - <code>wrappedMethod</code> - The original function that was spied on
		 */
		spy: function(context, functionToHook, subscriber) {
			let calls = [];
			const registeredSubscriber = subscriber;
			const namespaces = functionToHook.split(".");
			const func = namespaces.pop();
			for (let i = 0; i < namespaces.length; i++) {
				context = context[namespaces[i]];
			}
			const originalHookedInstance = context[func];
			const hookingFunction = function() {
				const newCall = {args: arguments};
				try {
					const returnOfSubscriber = registeredSubscriber.call(context, {
						originalFunction: originalHookedInstance,
						args: arguments
					});
					if (returnOfSubscriber.preventDefault) {
						newCall.returnValue = returnOfSubscriber.returnValue;
						calls.push(newCall);
						return returnOfSubscriber.returnValue;
					} else {
						const returnValue = originalHookedInstance.call(context, ...arguments);
						newCall.returnValue = returnValue;
						calls.push(newCall);
						return returnValue;
					}
				} catch (err) {
					newCall.error = err;
					calls.push(newCall);
					throw err;
				}
			};

			for (const property of Object.keys(originalHookedInstance)) {
				hookingFunction[property] = originalHookedInstance[property];
			}

			context[func] = hookingFunction;

			return {
				restore() {
					context[func] = originalHookedInstance;
					calls = [];
				},

				get callCount() {
					return calls.length;
				},

				getCalls() {
					return calls.slice();
				},

				get wrappedMethod() {
					return originalHookedInstance;
				}
			};
		},

		/**
		 * Finds a specific UI5 element from a DOM node.
		 * Use the special variable $0 in the debugger to access the currently selected
		 * DOM node from the "Elements" tab.
		 * @param {HTMLElement} oDomNode The DOM node of the UI5 element
		 * @returns {sap.ui.core.Element | undefined} The corresponding ui5 element or undefined if not found
		 */
		control: function(oDomNode) {
			return Element.closestTo(oDomNode || $0);
		},

		/**
		 * Gets a UI5 element by its ID
		 * @param {string} sId The id of the element
		 * @returns {object} The requested element if found
		 * @throws {Error} If element was not found
		 */
		byId: function(sId) {
			return Element.getElementById(sId);
		},

		device: Device,

		/**
		 * Logs an overview of all available debugging commands to the browser console.
		 * Displays the basic tool descriptions and any library's help entries
		 * that were registered via the <code>__help</code> convention in the "debug-tools.js" modules.
		 */
		help: function() {
			/* eslint-disable no-console */
			var sHeaderStyle = `font:700 13px/20px '72','72 Brand',system-ui; color: ${GROUP_COLOR};`;
			var sGroupStyle = `font:700 12px/18px '72','72 Brand',system-ui; color: lch(from ${GROUP_COLOR} calc(l + 20) c h);`;
			var sSubGroupStyle = `font:700 12px/18px '72','72 Brand',system-ui; color: lch(from ${GROUP_COLOR} calc(l + 30) c h);`;
			var sCmdStyle = "font:700 12px/18px 'Courier New',monospace;";
			var sDescStyle = "font:400 12px/18px '72','72 Brand',system-ui; color:rgb(from currentColor r g b/0.75);";

			console.group(`%c${DEBUG_TOOL_NAME} - Available Commands`, sHeaderStyle);

			// Basic tools
			console.log("%cBasic tools:", sGroupStyle);
			aBaseHelp.forEach(function(entry) {
				console.log("  %c" + entry.cmd + "  %c" + entry.text, sCmdStyle, sDescStyle);
			});

			// Library tools
			aLibraryHelp.forEach(function(section) {
				console.log("%cLibrary specific tools", sGroupStyle);
				console.log("%c  " + section.library, sSubGroupStyle);
				section.entries.forEach(function(entry) {
					console.log("   %c" + entry.cmd + "  %c" + entry.text, sCmdStyle, sDescStyle);
				});
			});
			console.groupEnd();
			/* eslint-enable no-console */
		},

		/**
		 * Configuration classes
		 */
		config: scope({
			/**
			 * @returns {sap.ui.core.ControlBehavior} Instance of sap.ui.core.ControlBehavior
			 */
			ControlBehavior,

			/**
			 * @returns {sap.base.i18n.Formatting} Instance of sap.base.i18n.Formatting
			 */
			Formatting,

			/**
			 * @returns {sap.base.i18n.Localization} Instance of sap.base.i18n.Localization
			 */
			Localization,

			/**
			 * @returns {sap.ui.security.Security} Instance of sap.ui.security.Security
			 */
			Security
		})
	};

	// allow reuse of the scope helper, but without exposing it in the console
	Object.defineProperty(UI5Debug, "scope", {
		value: scope
	});

	// expose help registry for DebugLoader to push library entries into
	Object.defineProperty(UI5Debug, "_libraryHelp", {
		value: aLibraryHelp
	});

	/* eslint-disable no-console */
	console.info(
		`%c${DEBUG_TOOL_NAME}%c Type %cui5.help()%c for available commands`,
		`display:inline-block; margin-block: 16px; padding-left: 64px; font:700 16px/32px '72 Brand','72',system-ui; background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjYiIGhlaWdodD0iMjYiIHZpZXdCb3g9IjAgMCAyNiAyNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPG1hc2sgaWQ9Im1hc2swXzE1NV82Mjg2OSIgc3R5bGU9Im1hc2stdHlwZTpsdW1pbmFuY2UiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjAiIHk9IjAiIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+CjxwYXRoIGQ9Ik0xMi43MTA1IDBDMTIuNzEwNSAwIDEyLjcwNzQgMS4wODIxMiAxNS41MzYyIDIuODAwNzJDMjEuMDI4NCA2LjEzNiAyMS4wMDk3IDkuMTk2MiAyMS4wMDk3IDkuODM4NEMyMS4wMDk3IDEyLjU2NTMgMTguMTcxNSAxNC4zMjgxIDE2Ljg1NDkgMTIuOTAxMkMxNi44NTQ5IDEyLjkwMTIgMTguMTQ3MSAxMS45NDIzIDE4LjE0NzEgMTAuNDY3NkMxOC4xNDcxIDEwLjQ2NzYgMTcuMTk5NiAxMS4wOTE2IDE2LjcwNDEgMTEuMTk5OEMxNi43MDQxIDExLjE5OTggMTcuMzQ5OSAxMC4wNTg0IDE3LjA0ODggOC4wNTU4NEMxNy4wNDg4IDguMDU1ODQgMTYuNTMyIDkuMDY3NzYgMTQuODczNyA5Ljg4NjI0QzE0Ljg3MzcgOS44ODYyNCAxNS41MTk1IDguNDQzMjQgMTQuOTE2OCA3LjA2NTI0QzE0LjkxNjggNy4wNjUyNCAxNS4wNDU4IDguNzg4IDExLjEyNiAxMC42MTg0QzcuMjA2MjggMTIuNDQ4OCA4LjQxMjY4IDE0LjI3OTcgOC40MTI2OCAxNC4yNzk3QzguNDEyNjggMTQuMjc5NyA5LjE5MjY4IDEzLjQ0NzcgMTAuNTIwOCAxNC4wMzI3QzEyLjMxNTMgMTQuODIxIDExLjU4OTkgMTcuOTg0NyA4LjcwMzg4IDE3Ljk4NDdDNS44OTU4OCAxNy45ODQ3IDQuMDUwNCAxNC45MjkyIDQuMDUwNCAxMi41NDI5QzQuMDUwNCAxMS41NTQ5IDQuMTU3NTIgOS43NDE2OCA1LjkzOTU2IDcuNzQ1NEM3LjM1NzA4IDYuMTU3ODQgOS4xMDUzMiA1LjMyMDEyIDkuNDgwMjQgMy41NjQ2QzcuNTM5MDggNS4zNjQzMiA0LjAzNDggNi41Mzk1MiAxLjk1MjIgOS42MkMwLjA4MDIwMzIgMTIuMzg2OSAwLjY4ODYwMyAxNi4wNDcyIDEuMDI1MDQgMTcuMTczQzIuNTUyOCAyMi4yNzg5IDcuMjg2MzYgMjYgMTIuODg4OCAyNkMxOS43Mjc0IDI2IDI1LjM0MTggMjAuNTI4IDI1LjM0MTggMTMuNjg5NUMyNS4zNDE4IDMuMzM3MzYgMTUuNTAwMyAyLjIzOTEyIDEyLjcxMDUgMFpNMTEuMDUzOCAxMi42NzI5QzEwLjg0NTggMTIuNzIxMyAxMC42NDU2IDEyLjYzMzkgMTAuMzEyOCAxMi41MzNDMTAuMDAwOCAxMi40Mzg0IDkuODkxMDQgMTIuNDU2MSA5Ljg5MTA0IDEyLjQ1NjFDMTAuMTAxMyAxMi4zMTQ2IDEwLjMyMTUgMTIuMTg4NCAxMC41NDk5IDEyLjA3ODZDMTAuODgwNiAxMS45MjYyIDExLjE2MzUgMTEuOTE4NCAxMS4yOTQ1IDEyLjIyMUMxMS4zODA4IDEyLjQyMDIgMTEuMjI0MyAxMi42MzI5IDExLjA1MzggMTIuNjcyOVoiIGZpbGw9IndoaXRlIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMF8xNTVfNjI4NjkpIj4KPHBhdGggZD0iTTEyLjcxMDUgMEMxMi43MTA1IDAgMTIuNzA3NCAxLjA4MjEyIDE1LjUzNjIgMi44MDA3MkMyMS4wMjg0IDYuMTM2IDIxLjAwOTcgOS4xOTYyIDIxLjAwOTcgOS44Mzg0QzIxLjAwOTcgMTIuNTY1MyAxOC4xNzE1IDE0LjMyODEgMTYuODU0OSAxMi45MDEyQzE2Ljg1NDkgMTIuOTAxMiAxOC4xNDcxIDExLjk0MjMgMTguMTQ3MSAxMC40Njc2QzE4LjE0NzEgMTAuNDY3NiAxNy4xOTk2IDExLjA5MTYgMTYuNzA0MSAxMS4xOTk4QzE2LjcwNDEgMTEuMTk5OCAxNy4zNDk5IDEwLjA1ODQgMTcuMDQ4OCA4LjA1NTg0QzE3LjA0ODggOC4wNTU4NCAxNi41MzIgOS4wNjc3NiAxNC44NzM3IDkuODg2MjRDMTQuODczNyA5Ljg4NjI0IDE1LjUxOTUgOC40NDMyNCAxNC45MTY4IDcuMDY1MjRDMTQuOTE2OCA3LjA2NTI0IDE1LjA0NTggOC43ODggMTEuMTI2IDEwLjYxODRDNy4yMDYyOCAxMi40NDg4IDguNDEyNjggMTQuMjc5NyA4LjQxMjY4IDE0LjI3OTdDOC40MTI2OCAxNC4yNzk3IDkuMTkyNjggMTMuNDQ3NyAxMC41MjA4IDE0LjAzMjdDMTIuMzE1MyAxNC44MjEgMTEuNTg5OSAxNy45ODQ3IDguNzAzODggMTcuOTg0N0M1Ljg5NTg4IDE3Ljk4NDcgNC4wNTA0IDE0LjkyOTIgNC4wNTA0IDEyLjU0MjlDNC4wNTA0IDExLjU1NDkgNC4xNTc1MiA5Ljc0MTY4IDUuOTM5NTYgNy43NDU0QzcuMzU3MDggNi4xNTc4NCA5LjEwNTMyIDUuMzIwMTIgOS40ODAyNCAzLjU2NDZDNy41MzkwOCA1LjM2NDMyIDQuMDM0OCA2LjUzOTUyIDEuOTUyMiA5LjYyQzAuMDgwMjAzMiAxMi4zODY5IDAuNjg4NjAzIDE2LjA0NzIgMS4wMjUwNCAxNy4xNzNDMi41NTI4IDIyLjI3ODkgNy4yODYzNiAyNiAxMi44ODg4IDI2QzE5LjcyNzQgMjYgMjUuMzQxOCAyMC41MjggMjUuMzQxOCAxMy42ODk1QzI1LjM0MTggMy4zMzczNiAxNS41MDAzIDIuMjM5MTIgMTIuNzEwNSAwWiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzE1NV82Mjg2OSkiLz4KPHBhdGggb3BhY2l0eT0iMC42IiBkPSJNMTEuOTk4OCAxMi45MzE4QzE0LjE3OTIgMTEuODA4MSAxNC44NzgxIDkuODgyNTMgMTQuODc4MSA5Ljg4MjUzQzE0Ljg3ODEgOS44ODI1MyAxNS41MjM5IDguNDM5MDEgMTQuOTIwNyA3LjA1OTQ1QzE0LjkyMDcgNy4wNTk0NSAxNS4wNDk3IDguNzgzNzcgMTEuMTI0NyAxMC42MTU3QzcuMTk5NzQgMTIuNDQ3NyA4LjQwOTI2IDE0LjI3OTYgOC40MDkyNiAxNC4yNzk2QzguNjE0NjYgMTQuMDk2NiA4LjgxMDE4IDEzLjk3MjggOS4xOTc1OCAxMy44Njg4QzkuODQ1NSAxMy42OTUyIDEwLjg2MTEgMTMuNTE5OSAxMS45OTg4IDEyLjkzMThaIiBmaWxsPSIjRkY5NjFFIi8+CjxwYXRoIG9wYWNpdHk9IjAuNCIgZD0iTTEyLjExMTYgMTMuNzI3OUMxMy43OTY0IDEzLjcyNzkgMTUuNzQ1OSAxMi45NDQ4IDE2LjcxMDUgMTEuMTk1NUMxNi44NjEzIDEwLjkyMjUgMTYuOTk1NSAxMC40NzkgMTcuMDYyNSAxMC4wNjE0QzE3LjE2NjUgOS4zOTU4MyAxNy4xNzk1IDguOTAwNzkgMTcuMDU2OCA4LjAwMTcxQzE3LjA1NjggOC4wMDE3MSAxNi43Mzc1IDguODk2NjMgMTQuODc4NSA5Ljg4MDQ3QzE0LjIwMjUgMTAuMjM3NyAxMy4zMzg4IDEwLjU5NDkgMTIuMTk0OCAxMC45NDIzQzcuNzYyMzMgMTIuMjg3NSA4LjQxMjMzIDE0LjI3NzYgOC40MTIzMyAxNC4yNzc2QzkuMTEwNjkgMTMuODE3NCA5LjExNDg1IDEzLjcyNzkgMTIuMTExNiAxMy43Mjc5WiIgZmlsbD0iI0ZGOTYxRSIvPgo8cGF0aCBvcGFjaXR5PSIwLjIiIGQ9Ik0xMi4xMTExIDEzLjcyNzhDMTMuNjYwMiAxMy43Mjc4IDE1Ljc2NjIgMTMuODE1MiAxNi44NjAzIDEyLjg5NThDMTcuNTMxMSAxMi4zMzM3IDE4LjE0MzcgMTEuNTkwNiAxOC4xNTUxIDEwLjQ1ODFDMTguMTU1MSAxMC40NTgxIDE3LjIzNzMgMTEuMDYzOSAxNi43MSAxMS4xOTM5QzE1Ljk4MiAxMS4zNzM4IDE0LjY2NjkgMTEuNjUwNCAxMy40NjU3IDExLjU4MjNDOS4zODg0MiAxMS4zNTA5IDguNDExODcgMTQuMjc1NCA4LjQxMTg3IDE0LjI3NTRDOC45NzM5OSAxMy43NTk1IDkuNjU4MzEgMTMuNzI3OCAxMi4xMTExIDEzLjcyNzhaIiBmaWxsPSIjRkY5NjFFIi8+CjxwYXRoIG9wYWNpdHk9IjAuNCIgZD0iTTExLjk5OTMgMTIuOTMxOUMxNC4xNzk3IDExLjgwODIgMTQuODc4NSA5Ljg4MjYzIDE0Ljg3ODUgOS44ODI2M0MxNC4yMDI1IDEwLjIzOTkgMTMuMzM4OCAxMC41OTcxIDEyLjE5NDggMTAuOTQ0NUM3Ljc2MjMzIDEyLjI4OTcgOC40MTIzMyAxNC4yNzk3IDguNDEyMzMgMTQuMjc5N0M4LjYxNzczIDE0LjA5NjcgOC44MTMyNSAxMy45NzI5IDkuMjAwNjUgMTMuODY4OUM5Ljg0NTk3IDEzLjY5NTMgMTAuODYxNSAxMy41MiAxMS45OTkzIDEyLjkzMTlaIiBmaWxsPSIjRkY5NjFFIi8+CjxwYXRoIGQ9Ik05LjIwMjI3IDEzLjg2ODhDOS44NDc1OSAxMy42OTUxIDEwLjg2MzEgMTMuNTE4MyAxMi4wMDA5IDEyLjkzMjhDMTIuNjU5OSAxMi41OTI5IDEzLjI1NDQgMTIuMTQwNSAxMy43NTc1IDExLjU5NTlDMTMuNjU5NyAxMS41OTU5IDEzLjU2MjUgMTEuNTkyMiAxMy40NjU3IDExLjU4N0M5LjM4ODQyIDExLjM1NTYgOC40MTE4NyAxNC4yODAxIDguNDExODcgMTQuMjgwMUM4LjU4ODk3IDE0LjExMjIgOC44MDI1NSAxMy45ODc2IDkuMDM1ODcgMTMuOTE2MUM5LjA4ODM5IDEzLjkwMSA5LjE0MTQzIDEzLjg4MzkgOS4yMDIyNyAxMy44Njg4WiIgZmlsbD0iI0ZGOTYxRSIvPgo8cGF0aCBvcGFjaXR5PSIwLjQiIGQ9Ik0yNS4zNDEzIDEzLjY4OTVDMjUuMzQxMyAxMS42MjUxIDI0Ljk0OTIgOS45MjkzNSAyNC4zMDEzIDguNTE4MDdDMjQuMzYzMiA4LjcwNDc1IDI1LjYxNjkgMTIuNjI2MSAyMi40NzgyIDE1Ljc2MzJDMjAuNjg2MiAxNy41NTUxIDE3LjYzNzUgMTguMTc1NSAxNS4xODYyIDE2LjIxNjFDMTUuMTg2MiAxNi4yMTYxIDE1LjQ5ODIgMjEuMTM0MyA5LjY3MTA5IDIxLjg1OTdDNS44NjYyNSAyMi4zMzM0IDIuODcyMDkgMTkuOTA5MiAxLjU3MzEzIDE2LjgyMTRDMC42NjkzNjcgMTQuNjczOCAwLjU4NTEyNyAxMi4yMDU0IDEuNjE5OTMgMTAuMTY1NEMwLjE1ODIwNyAxMi44NTAyIDAuNzA5OTI3IDE2LjExOTkgMS4wMjQ1MyAxNy4xNzI5QzIuNTUyMjkgMjIuMjc4OCA3LjI4NTg1IDI1Ljk5OTkgMTIuODg4MyAyNS45OTk5QzE5LjcyNjggMjUuOTk5OSAyNS4zNDEzIDIwLjUyOCAyNS4zNDEzIDEzLjY4OTVaIiBmaWxsPSIjRkY5NjFFIi8+CjxwYXRoIG9wYWNpdHk9IjAuNiIgZD0iTTI0LjA4NDggMTkuMDg5MUMyMy40Mzg5IDE5LjI2MzggMTguMzc3MyAyMC40NjgxIDE1LjE4NiAxNi4yMTYxQzE1LjE4NiAxNi4yMTYxIDE2LjY3MjIgMjEuOTgwMyAxMC4zNTUyIDI1LjczOTlDMTEuMTg4NyAyNS45MTMzIDEyLjAzNzggMjYuMDAwNCAxMi44ODkyIDI1Ljk5OTlDMTcuNzg2IDI1Ljk5OTkgMjIuMDU1MiAyMy4xOTE5IDI0LjA4NDggMTkuMDg5MVoiIGZpbGw9IiNGRjk2MUUiLz4KPHBhdGggb3BhY2l0eT0iMC43IiBkPSJNMjEuMzM1NSAyMi43MzMyQzE3LjM3NzggMjAuNjk1OSAxNS4xODQ5IDE2LjIxNjEgMTUuMTg0OSAxNi4yMTYxQzE2Ljk0ODggMjAuNTE4IDE2LjE4NDQgMjMuODc1MSAxNS4zOTI5IDI1Ljc0OTdDMTcuNjEwNCAyNS4zMDA5IDE5LjY2NDMgMjQuMjU4MyAyMS4zMzU1IDIyLjczMzJaIiBmaWxsPSIjRkY5NjFFIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xNTVfNjI4NjkiIHgxPSIxOS4xMzQiIHkxPSIyNC4zNDEyIiB4Mj0iNi45ODc4OCIgeTI9IjMuMzAzNTYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0ZDNDIyOSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjcwMTQiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K") 0 0 / 64px 32px no-repeat;`,
		`display:inline-block; margin-block:20px; margin-left:16px; border-left: 1px solid rgb(from currentColor r g b/0.75); padding-left:16px; font:400 16px/24px '72 Brand','72',system-ui; color:rgb(from currentColor r g b/0.75);`,
		`font:400 16px/24px 'Courier New', 'monospace'; color: ${HEADER_COLOR};`,
		`font:400 16px/24px '72 Brand','72',system-ui; color:rgb(from currentColor r g b/0.75);`
	);
	/* eslint-enable no-console */

	return UI5Debug;
});
