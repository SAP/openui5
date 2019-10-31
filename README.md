![openui5](http://openui5.org/images/OpenUI5_new_big_side.png)
=======
[OpenUI5. Build Once. Run on any device.](http://openui5.org)

What is it?
-----------
OpenUI5 lets you build enterprise-ready web applications, responsive to all devices, running on almost
any browser of your choice. It's based on JavaScript, using jQuery as its foundation and follows web standards.
It eases your development with a client-side HTML5 rendering library including a rich set of controls
and supports data binding to different data models (JSON, XML and OData).

And... it's free and open source: OpenUI5 is licensed under the Apache License, Version 2.0 - see [LICENSE.txt](LICENSE.txt)

Try it!
-------
Check out our [interactive control playground](https://openui5.hana.ondemand.com/#/controls)
as well as a number of [sample applications](https://openui5.hana.ondemand.com/#/demoapps).

Get it!
-------
Go to the [download page](http://openui5.org/download.html) and get the complete UI5 runtime
and the UI5 SDK containing the documentation and many example apps as well as the complete runtime.

You can also consume [every OpenUI5 library](https://www.npmjs.com/org/openui5) individually via [npm](https://docs.npmjs.com/getting-started/what-is-npm), for example:
```sh
npm install @openui5/sap.ui.core @openui5/sap.m @openui5/themelib_sap_belize [...]
```

The UI5 distribution via Bower is stopped with 1.60+, as Bower itself is now [deprecated](https://github.com/bower/bower/issues/2298).

⚠️ **Note**: Contrary to the bower releases, the npm releases do not contain library preload files. The npm packages only contain the raw source files of the OpenUI5 libraries.

Preload packages for components and libraries can be built using the [UI5 Tooling](https://github.com/SAP/ui5-tooling).

See also: [CLI guideline](https://github.com/SAP/ui5-cli#cli-usage)


Get started!
------------
Try the [Hello World](http://openui5.org/getstarted.html), read
the [Developer Guide](https://openui5.hana.ondemand.com/#docs/guide/Documentation.html)
and refer to the [API Reference](https://openui5.hana.ondemand.com/#docs/api/symbols/sap.ui.html).
Use [App Templates](https://openui5.hana.ondemand.com/#docs/guide/a460a7348a6c431a8bd967ab9fb8d918.html) as a foundation for your developments (available in SAP Web IDE or here on [GitHub](https://github.com/SAP?q=openui5-worklist-app%20OR%20openui5-masterdetail-app%20OR%20openui5-sample-app)).
Check out the [SCN Forum](http://scn.sap.com/community/developer-center/front-end/content) and
[stackoverflow](http://stackoverflow.com/questions/tagged/sapui5) (use the tag "sapui5") to discuss code-related
problems and questions.

Hack it!
--------
You can get the sources and build UI5 on your own, please check the [documentation for the UI5 development setup](docs/developing.md). You might then want to understand how [control libraries are structured and controls are developed](docs/controllibraries.md).
Maybe there's a bug you could analyze and fix?

