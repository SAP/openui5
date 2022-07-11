sap.ui.define([], function () {
  "use strict";

  if (!customElements.get("ui5-static-area")) {
    customElements.define("ui5-static-area", class extends HTMLElement {});
  }
});