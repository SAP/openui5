# Contributing to OpenUI5

You want to contribute to OpenUI5? Welcome! Please read this document to understand what you can do:
 * [Help Others](#help-others)
 * [Analyze Issues](#analyze-issues)
 * [Report Bugs](#report-bugs)
 * [Request Features](#request-features)
 * [Report Security Issues](#report-security-issues)
 * [Know Our Process for Handling Issues](#know-our-process-for-handling-issues)
 * [Contribute Code](#contribute-code)

## Help Others

You can help OpenUI5 by helping others who use UI5 and need support. You will find them e.g. on [StackOverflow](http://stackoverflow.com/questions/tagged/sapui5) or in the [SAP.com UI5 Community](https://answers.sap.com/tags/500983881501772639608291559920477).

## Analyze Issues

Analyzing issue reports can be a lot of effort. Any help is welcome!
Go to [the Github issue tracker](https://github.com/UI5/openui5/issues?state=open) and find an open issue which needs additional work or a bugfix.

Additional work may be further information, or a minimized jsbin example or gist, or it might be a hint that helps understanding the issue. Maybe you can even find and [contribute](#contribute-code) a bugfix?

## Report Bugs

If you find a bug - behavior of UI5 code contradicting its specification - you are welcome to report it.
We can only handle well-reported, actual bugs, so please follow the guidelines below and use forums like [StackOverflow](http://stackoverflow.com/questions/tagged/sapui5) for support questions or when in doubt whether the issue is an actual bug.

Once you have familiarized with the guidelines, you can go to the [Github issue tracker for OpenUI5](https://github.com/UI5/openui5/issues/new) to report the issue.

### Quick Checklist for Bug Reports

Issue report checklist:
 * Real, current bug
 * No duplicate
 * Reproducible
 * Good summary
 * Well-documented
 * Minimal example
 * Use the [template](ISSUE_TEMPLATE.md)


### Requirements for a bug report

These eight requirements are the mandatory base of a good bug report:
1. **Only real bugs**: please do your best to make sure to only report real bugs in OpenUI5! Do not report:
   * issues caused by application code or any code outside UI5.
   * issues caused by the usage of non-public UI5 methods. Only the public methods listed in the API documentation may be used.
   * something that behaves just different from what you expected. A bug is when something behaves different than specified. When in doubt, ask in a forum.
   * something you do not get to work properly. Use a support forum like stackoverflow to request help.
   * feature requests. For more information, see [Request Features](#request-features).
2. No duplicate: you have searched the issue tracker to make sure the bug has not yet been reported
3. Good summary: the summary should be specific to the issue
4. Current bug: the bug can be reproduced in the most current version (state the tested version!)
5. Reproducible bug: there are clear steps to reproduce given. This includes:
   * a URL to access the example
   * any required user/password information (do not reveal any credentials that could be mis-used!)
   * detailed and complete step-by-step instructions to reproduce the bug
6. Precise description:
   * precisely state the expected and the actual behavior
   * give information about the used browser/device and its version, if possible also the behavior in other browsers/devices
   * if the bug is about wrong UI appearance, attach a screenshot and mark what is wrong
   * generally give as much additional information as possible. (But find the right balance: do not invest hours for a very obvious and easy to solve issue. When in doubt, give more information.)
7. Minimal example: it is highly encouraged to provide a minimal example to reproduce in e.g. jsbin: 
   * isolate the application code which triggers the issue and strip it down as much as possible as long as the issue still occurs
   * if several files are required, you can create a gist
   * this may not always be possible and sometimes be overkill, but it always helps analyzing a bug
8. Only one bug per report: open different tickets for different issues

You are encouraged to use [this template](.github/ISSUE_TEMPLATE/bug-report.md).

Please report bugs in English, so all users can understand them.

If the bug appears to be a regression introduced in a new version of UI5, try to find the closest versions between which it was introduced and take special care to make sure the issue is not caused by your application's usage of any internal method which changed its behavior.

## Request Features

You have an idea for enhancing existing OpenUI5 functionality? Then we'd suggest you create a feature request. As you might guess, OpenUI5 receives many feature requests each year, far more than the OpenUI5 team could possibly tackle. Only create a feature request if you think that the missing feature is critical or an easy-to-do enhancement. Please be considerate and don't mistake the issue tracker for a wishlist.

## Report Security Issues

We take security issues in our projects seriously. We appreciate your efforts to responsibly disclose your findings.

Please do not report security issues directly on GitHub but using one of the channels listed below. This allows us to provide a fix before an issue can be exploited.

- **Researchers/Non-SAP Customers:** Please consult SAPs [disclosure guidelines](https://wiki.scn.sap.com/wiki/display/PSR/Disclosure+Guidelines+for+SAP+Security+Advisories) and send the related information in a PGP encrypted e-mail to secure@sap.com. Find the public PGP key [here](https://www.sap.com/dmc/policies/pgp/keyblock.txt).
- **SAP Customers:** If the security issue is not covered by a published security note, please report it by creating a customer message at https://launchpad.support.sap.com.

Please also refer to the general [SAP security information page](https://www.sap.com/about/trust-center/security/incident-management.html).

## Know Our Process for Handling Issues

When you report an issue, a committer will look at it and either confirm it (by labeling it "in progress"), close it (if it is not considered an issue), or ask you for more details. In-progress issues are then either assigned to a committer in GitHub, reported in our internal issue-handling system, or left open as "contribution welcome" for easy or non-urgent fixes.

An issue that concerns a real bug is closed once a fix has been committed. The closing comment explains which patch version(s) of UI5 will contain the fix.

### Usage of Labels

Github offers labels to categorize issues. We defined the following labels so far:

General issue types:
 * Bug: This issue is caused by a bug in the code.
 * Feature: This is not a bug report but a feature request.

Specific issue categories for OpenUI5:
 * documentation: this issue is about wrong documentation

Status of open issues:
 * unconfirmed: this report needs confirmation whether it is really a bug (no label; this is the default status)
 * in progress: this issue has been triaged and is now being handled, e.g. because it looks like an actual bug
 * author action: the author is required to provide information
 * contribution welcome: this bug fix/feature request is something we would like to have and you are invited to contribute it

Status/resolution of closed issues:
 * fixed: a fix for the issue was provided
 * duplicate: the issue is also reported in a different ticket and is handled there
 * invalid: for some reason or another this issue report will not be handled further (maybe lack of information or issue does not apply anymore)
 * works: not reproducible or working as expected
 * wontfix: while acknowledged to be an issue, a fix cannot or will not be provided

The labels can only be set and modified by committers.

### Issue Reporting Disclaimer

We want to improve the quality of UI5 and good bug reports are welcome! But our capacity is limited, so we cannot handle questions or consultation requests and we cannot afford to ask for required details. So we reserve the right to close or to not process insufficient bug reports in favor of those which are very cleanly documented and easy to reproduce. Even though we would like to solve each well-documented issue, there is always the chance that it won't happen - remember: OpenUI5 is Open Source and comes without warranty.

Bug report analysis support is very welcome! (e.g. pre-analysis or proposing solutions)

## Contribute Code

You are welcome to contribute code to OpenUI5 in order to fix bugs or to implement new features.

There are three important things to know:

1.  You must be aware of the Apache License (which describes contributions) and **agree to the Developer Certificate of Origin**. This is common practice in all major Open Source projects. To make this process as simple as possible, we are using *[CLA assistant](https://cla-assistant.io/)*. CLA assistant is an open source tool that integrates with GitHub very well and enables a one-click-experience for accepting the DCO. See the respective section below for details.
2.  There are **several requirements regarding code style, quality, and product standards** which need to be met (we also have to follow them). The respective section below gives more details on the coding guidelines.
3.  **Not all proposed contributions can be accepted**. Some features may e.g. just fit a third-party add-on better. The code must fit the overall direction of OpenUI5 and really improve it, so there should be some "bang for the byte". For most bug fixes this is a given, but major feature implementation first need to be discussed with one of the OpenUI5 committers (the top 20 or more of the [Contributors List](https://github.com/UI5/openui5/graphs/contributors)), possibly one who touched the related code recently. The more effort you invest, the better you should clarify in advance whether the contribution fits: the best way would be to just open a feature request in the issue tracker to discuss the feature you plan to implement (make it clear you intend to contribute). We will then forward the proposal to the respective code owner, this avoids disappointment.


### Developer Certificate of Origin (DCO)

Due to legal reasons, contributors will be asked to accept a DCO before they submit the first pull request to this project. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).  
This happens in an automated fashion during the submission process: the CLA assistant tool will add a comment to the pull request. Click it to check the DCO, then accept it on the following screen. CLA assistant will save this decision for upcoming contributions.

This DCO replaces the previously used CLA ("Contributor License Agreement") as well as the "Corporate Contributor License Agreement" with new terms which are well-known standards and hence easier to approve by legal departments. Contributors who had already accepted the CLA in the past may be asked once to accept the new DCO.


### Contribution Content Guidelines

Contributed content can be accepted if it:

1. is useful to improve OpenUI5 (explained above)
2. follows the applicable guidelines and standards

The second requirement could be described in entire books and would still lack a 100%-clear definition, so you will get a committer's feedback if something is not right. Extensive conventions and guidelines documentation is [available here](docs/guidelines.md).

These are some of the most important rules to give you an initial impression:

-   Apply a clean coding style adapted to the surrounding code, even though we are aware the existing code is not fully clean
-   Use tabs for indentation (except if the modified file consistently uses spaces)
-   Use variable and CSS class naming conventions like in the other files you are seeing (e.g. hungarian notation)
-   No global variables, of course, and [use "jQuery" instead of "$"](http://learn.jquery.com/using-jquery-core/avoid-conflicts-other-libraries/)
-   No console.log() - use jQuery.sap.log.\*
-   Run the ESLint code check and make it succeed
-   Use jQuery.sap.byId("someId") instead of jQuery("\#someId") - certain characters in IDs need to be escaped for jQuery to work correctly
-   Only access public APIs of other entities (there are exceptions, but this is the rule)
-   Comment your code where it gets non-trivial and remember to keep the public JSDoc documentation up-to-date
-   Controls need to be accessible (operable by keyboard and read properly by screenreaders, through ARIA support), support right-to-left languages, and run fine in all supported browsers/devices
-   Translation and Localization must be supported
-   Keep databinding in mind - users expect it to work for basically everything
-   Keep an eye on performance and memory consumption, properly destroy objects when not used anymore (e.g. avoid ancestor selectors in CSS)
-   Try to write slim and "modern" HTML and CSS, avoid using images and affecting any non-UI5 content in the page/app
-   Avoid `!important` in the CSS files and don't apply outer margins to controls; make them work also when positioned absolutely
-   Do not use oEvent.preventDefault(); or oEvent.stopPropagation(); without a good reason or without documentation why it is really required
-   Write a unit test
-   Do not do any incompatible changes, especially do not modify the name or behavior of public API methods or properties
-   Always consider the developer who USES your control/code!
    -   Think about what code and how much code he/she will need to write to use your feature
    -   Think about what she/he expects your control/feature to do

If this list sounds lengthy and hard to achieve - well, that's what WE have to comply with as well, and it's by far not complete…

### How to contribute - the Process

1.  Make sure the change would be welcome (e.g. a bugfix or a useful feature); best do so by proposing it in a GitHub issue
2.  Create a branch forking the openui5 repository
3.  Get familiar with the [development setup](docs/developing.md)
4.  Do your changes
5.  Commit and push your changes on that branch
    -   When you have several commits, squash them into one (see [this explanation](http://davidwalsh.name/squash-commits-git)) - this also needs to be done when additional changes are required after the code review

6.  In the commit message follow the [commit message guidelines](docs/guidelines.md#git-guidelines)
7.  If your change fixes an issue reported at GitHub, add the following line to the commit message:
    - ```Fixes https://github.com/UI5/openui5/issues/(issueNumber)```
    - Do NOT add a colon after "Fixes" - this prevents automatic closing.
	- When your pull request number is known (e.g. because you enhance a pull request after a code review), you can also add the line ```Closes https://github.com/UI5/openui5/pull/(pullRequestNumber)```
8.  Create a Pull Request to github.com/UI5/openui5
9.  Follow the link posted by the CLA assistant to your pull request and accept the Developer Certificate of Origin, as described in detail above.
10. Wait for our code review and approval, possibly enhancing your change on request
    -   Note that the UI5 developers also have their regular duties, so depending on the required effort for reviewing, testing and clarification this may take a while

11. Once the change has been approved we will inform you in a comment
12. Your pull request cannot be merged directly into the branch (internal SAP processes), but will be merged internally and immediately appear in the public repository as well. Pull requests for non-code branches (like "gh-pages" for the website) can be directly merged.
13. We will close the pull request, feel free to delete the now obsolete branch

### Contributing with AI-generated code
As artificial intelligence evolves, AI-generated code is becoming valuable for many software projects, including open-source initiatives. While we recognize the potential benefits of incorporating AI-generated content into our open-source projects there are certain requirements that need to be reflected and adhered to when making contributions.

Please see our [guideline for AI-generated code contributions to SAP Open Source Software Projects](https://github.com/SAP/.github/blob/main/CONTRIBUTING_USING_GENAI.md) for these requirements.