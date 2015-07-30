# Contributing to OpenUI5

You want to contribute to OpenUI5? Welcome! Please read this document to understand what you can do:
 * [Help Others](#help-others)
 * [Analyze Issues](#analyze-issues)
 * [Report an Issue](#report-an-issue)
 * [Contribute Code](#contribute-code)

## Help Others

You can help OpenUI5 by helping others who use UI5 and need support. You will find them e.g. on [StackOverflow](http://stackoverflow.com/questions/tagged/sapui5) or in the [SAP Community Network forum](http://scn.sap.com/community/developer-center/front-end/content).

## Analyze Issues

Analyzing issue reports can be a lot of effort. Any help is welcome!
Go to [the Github issue tracker](https://github.com/SAP/openui5/issues?state=open) and find an open issue which needs additional work or a bugfix.

Additional work may be further information, or a minimized jsbin example or gist, or it might be a hint that helps understanding the issue. Maybe you can even find and [contribute](#contribute-code) a bugfix?


## Report an Issue

If you find a bug - behavior of UI5 code contradicting its specification - you are welcome to report it.
We can only handle well-reported, actual bugs, so please follow the guidelines below and use forums like [StackOverflow](http://stackoverflow.com/questions/tagged/sapui5) for support questions or when in doubt whether the issue is an actual bug.

Once you have familiarized with the guidelines, you can go to the [Github issue tracker for OpenUI5](https://github.com/SAP/openui5/issues/new) to report the issue.

### Quick Checklist for Bug Reports

 * Issue report checklist:
 * Real, current bug
 * No duplicate
 * Reproducible
 * Good summary
 * Well-documented
 * Minimal example
 * Use the [template](http://openui5.org/bugreport_template.txt)


### Requirements for a bug report

These eight requirements are the mandatory base of a good bug report:
 1. **Only real bugs**: please do your best to make sure to only report real bugs in OpenUI5! Do not report:
   * issues caused by application code or any code outside UI5.
   * issues caused by the usage of non-public UI5 methods. Only the public methods listed in the API documentation may be used.
   * something that behaves just different from what you expected. A bug is when something behaves different than specified. When in doubt, ask in a forum.
   * something you do not get to work properly. Use a support forum like stackoverflow to request help.
   * feature requests. Well, this is arguable: critical or easy-to-do enhancement suggestions are welcome, but we do not want to use the issue tracker as wishlist.
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
 7. Minimal example: it is highly encouraged to provide a minimal example to reproduce in e.g. jsbin: isolate the application code which triggers the issue and strip it down as much as possible as long as the issue still occurs. If several files are required, you can create a gist. This may not always be possible and sometimes be overkill, but it always helps analyzing a bug.
 8. Only one bug per report: open different tickets for different issues

You are encouraged to use [this template](http://openui5.org/bugreport_template.txt).

Please report bugs in English, so all users can understand them.

If the bug appears to be a regression introduced in a new version of UI5, try to find the closest versions between which it was introduced and take special care to make sure the issue is not caused by your application's usage of any internal method which changed its behavior.


### Issue handling process

When an issue is reported, a committer will look at it and either confirm it as a real issue (by giving the "approved" label), close it if it is not an issue, or ask for more details. Approved issues are then either assigned to a committer in GitHub, reported in our internal issue handling system, or left open as "contribution welcome" for easy or not urgent fixes.

An issue that is about a real bug is closed as soon as the fix is committed. The closing comment explains which patch version(s) of UI5 will contain the fix.


### Reporting Security Issues

If you find a security issue, please act responsibly and report it not in the public issue tracker, but directly to us, so we can fix it before it can be exploited:
 * SAP Customers: if the found security issue is not covered by a published security note, please report it by creating a customer message at https://service.sap.com/message.
 * Researchers/non-Customers: please send the related information to secure@sap.com using [PGP for e-mail encryption](http://global.sap.com/pc/security/keyblock.txt).
Also refer to the general [SAP security information page](http://www54.sap.com/pc/tech/application-foundation-security/software/security-at-sap/report.html).


### Usage of Labels

Github offers labels to categorize issues. We defined the following labels so far:

Labels for issue categories:
 * bug: this issue is a bug in the code
 * documentation: this issue is about wrong documentation
 * enhancement: this is not a bug report, but an enhancement request

Status of open issues:
 * unconfirmed: this report needs confirmation whether it is really a bug (no label; this is the default status)
 * approved: this issue is confirmed to be a bug
 * author action: the author is required to provide information
 * contribution welcome: this fix/enhancement is approved and you are invited to contribute it

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

1.  You must be aware of the Apache License (which describes contributions) and **agree to the Contributors License Agreement**. This is common practice in all major Open Source projects. To make this process as simple as possible, we are using *[CLA assistant](https://cla-assistant.io/)* for individual contributions. CLA assistant is an open source tool that integrates with GitHub very well and enables a one-click-experience for accepting the CLA. For company contributers special rules apply. See the respective section below for details.
2.  There are **several requirements regarding code style, quality, and product standards** which need to be met (we also have to follow them). The respective section below gives more details on the coding guidelines.
3.  **Not all proposed contributions can be accepted**. Some features may e.g. just fit a third-party add-on better. The code must fit the overall direction of OpenUI5 and really improve it, so there should be some "bang for the byte". For most bug fixes this is a given, but major feature implementation first need to be discussed with one of the OpenUI5 committers (the top 20 or more of the [Contributors List](https://github.com/SAP/openui5/graphs/contributors)), possibly one who touched the related code recently. The more effort you invest, the better you should clarify in advance whether the contribution fits: the best way would be to just open an enhancement ticket in the issue tracker to discuss the feature you plan to implement. We will then forward the proposal to the respective code owner, this avoids disappointment.

### Contributor License Agreement

When you contribute (code, documentation, or anything else), you have to be aware that your contribution is covered by the same [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0) that is applied to OpenUI5 itself.
In particular you need to agree to the Individual Contributor License Agreement,
which can be [found here](https://gist.github.com/CLAassistant/bd1ea8ec8aa0357414e8).
(This applies to all contributors, including those contributing on behalf of a company). If you agree to its content, you simply have to click on the link posted by the CLA assistant as a comment to the pull request. Click it to check the CLA, then accept it on the following screen if you agree to it. CLA assistant will save this decision for upcoming contributions and will notify you if there is any change to the CLA in the meantime.

#### Company Contributors

If employees of a company contribute code, in **addition** to the individual agreement above, there needs to be one company agreement submitted. This is mainly for the protection of the contributing employees.

A company representative authorized to do so needs to download, fill, and print
the [Corporate Contributor License Agreement](https://github.com/SAP/openui5/blob/master/docs/SAP Corporate Contributor License Agreement.pdf) form. Then either:

-   Scan it and e-mail it to [opensource@sap.com](mailto:opensource@sap.com) and [openui5@sap.com](mailto:openui5@sap.com)
-   Fax it to: +49 6227 78-45813
-   Send it by traditional letter to: *Industry Standards & Open Source Team, Dietmar-Hopp-Allee 16, 69190 Walldorf, Germany*

The form contains a list of employees who are authorized to contribute on behalf of your company. When this list changes, please let us know.

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
2.  Create a branch forking the openui5 repository and do your change
3.  Commit and push your changes on that branch
    -   When you have several commits, squash them into one (see [this explanation](http://davidwalsh.name/squash-commits-git)) - this also needs to be done when additional changes are required after the code review

4.  In the commit message follow the [commit message guidelines](docs/guidelines.md#git-guidelines)
5.  If your change fixes an issue reported at GitHub, add the following line to the commit message: 
    - ```Fixes https://github.com/SAP/openui5/issues/(issueNumber)```
    - Do NOT add a colon after "Fixes" - this prevents automatic closing.
	- When your pull request number is known (e.g. because you enhance a pull request after a code review), you can also add the line ```Closes https://github.com/SAP/openui5/pull/(pullRequestNumber)```
6.  Create a Pull Request to github.com/SAP/openui5
7.  Follow the link posted by the CLA assistant to your pull request and accept it, as described in detail above.
8.  Wait for our code review and approval, possibly enhancing your change on request
    -   Note that the UI5 developers also have their regular duties, so depending on the required effort for reviewing, testing and clarification this may take a while

9.  Once the change has been approved we will inform you in a comment
10.  Your pull request cannot be merged directly into the branch (internal SAP processes), but will be merged internally and immediately appear in the public repository as well. Pull requests for non-code branches (like "gh-pages" for the website) can be directly merged.
11.  We will close the pull request, feel free to delete the now obsolete branch
