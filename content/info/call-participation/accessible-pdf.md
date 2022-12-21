---
title: Make PDF submission accessible
layout: page
permalink: /info/call-participation/make-pdf-accessible
active_nav: "Contribute"
sidebar: call-for-participation
contact: accessibility@ieeevis.org
---


{% comment %}
Program chairs added the following note until this page is updated
{% endcomment %}
2023 note: this document reflects the guidelines for VIS 2022.  We anticipate a similar set of guidelines for VIS 2023

The instructions on this page are based on the [SIGACCESS Guide for Accessible PDFs in Word](https://www.sigaccess.org/welcome-to-sigaccess/resources/acm-submission-with-ms-word/) and the [SIGCHI Guide to an Accessible Submission](https://sigchi.org/conferences/author-resources/accessibility-guide).

We highly encourage creating accessible submissions so that your contribution is readable by the broader audiences. This includes taking steps as you author your document and making your submitted PDF accessible. These steps can improve usability for many people, especially those of us with visual impairments. 

## Contents

- [Authoring an Accessible Document](#authoring-an-accessible-document)
  - [For Word Users](#for-word-users)
  - [For LaTeX Users](#for-latex-users)
- [Adding Accessibility Metadata to a PDF](#adding-accessibility-metadata-to-a-PDF)
- [Checking Accessibility of PDF Documents](#checking-accessibility-of-pdf-documents)



## Authoring an Accessible Document

Your paper will be read in different ways: on paper, on screen, through speech, on a braille display, etc. Some of us enlarge the text or change the colors on our displays for easier reading. Not everyone can see the colors and shapes in the figures. Some of us can’t see the figures at all and rely on you to provide a text description of your essential content.

You can make your submission document accessible by following these steps:

1. **Mark up content such as headings and lists appropriately**, using the correct Word template style or LaTeX markup.
2. **Don’t rely only on color**. Charts that rely only on color to differentiate elements may not be usable for those of us with color vision differences, or for those who print papers in black and white. In figures, legends and the text that refers to the figures, use different shapes and patterns to provide another way to visually distinguish elements.
3. **Provide a text description for all figures.** Figure descriptions are different to figure captions. Descriptions are an alternative to seeing the figure, and should provide important information that is not already in the paper or the caption.  Do not simply repeat the caption. 
4. **Create every table as a real table**, not an image, and indicate which cells are headers.
5. **Create every equation as a marked-up equation**, not an image of an equation.
6. **Set the metadata** of your document.


### For Word Users

Microsoft Word can produce accessible documents. This works in most versions of Word for Windows, and works on the latest versions of Word for MacOS. If you do not have access to the latest Word for MacOS, you can edit the document on MacOS and perform the last step on a PC with Windows Word.

1. Use the latest template.
2. **Ensure that built-in styles are used.** Word is able to produce accessible documents if the content is created using the built-in styles. Ensure that headings are created using heading styles, tables are created using the table features (rather than an image), and lists are created as bulleted or numbered lists. You can expand the `Styles Pane` to see a list of all available styles.
3. **Add figure descriptions (alternative text) to all figures.** For each image in your document, right-click the image and select `Format Picture`. In the Format Picture window, select the `Layout & Properties` tab. In the `Alt Text` section, provide a textual description of the image. Remember that this description should include the equivalent information to the image itself so that the content is accessible to readers and reviewers who cannot view the image. 
4. **Mark table headers.** Mark the header row of each table so that a screen reader or other accessibility software can navigate the table. Highlight the header row or column in the table, click the Table Design tab in the Word ribbon, and check the `Header Row `and/or `First Column` checkbox if either contains header information for the table. Additionally, remember to use `TableCell` style for table contents, and `TableCaption` style for the table caption.
5. **Add a title.** On Word for Windows, open the `File` tab and click on `Info`. On Word for Mac, click the `File` Menu and select `Properties`, then click the `Summary` tab. Fill in the title of your document. Remember to not include any author information here during the review phase.
6. **Set the document language.** Click the `Review` tab in the ribbon menu. Click the `Language` button and select the document language from the pop-up.


### For LaTeX Users
1. Download the latest [template for full papers](https://tc.computer.org/vgtc/publications/journal/) or the [template for all other submissions](https://tc.computer.org/vgtc/publications/conference/).
2. **Use appropriate commands to create sections**, ordered/unordered lists, figures, tables, equations, etc.

## Adding Accessibility Metadata to a PDF

You can add missing accessibility metadata to a PDF file using [Adobe Acrobat](https://www.adobe.com/acrobat/acrobat-pro.html). Note that this requires **the pro version of Adobe Acrobat**. If you do not have access to Acrobat Pro, and you need assistance in making your PDF accessible, please contact the accessibility chairs (or venue chairs) as they might be able to provide support.

Note that these steps will need to be performed **each time a new PDF is exported or generated from your source documents.**

1. **Add document tags.** The PDF file must be "tagged" with metadata about the document structure and text. You can check to see if your document is tagged by using the accessibility check function: select `Tools` > `Accessibility` from the menu, then click Full Check. If the document is not tagged, you will see a message stating that "This document is not structured". To add tags to the document, select `Tools` > `Accessibility` from the menu and click Add Tags to Document.
2. **Add figure descriptions (alternative text) to all figures.**
    1. From the application menu, select `View` > `Tools` > `Accessibility`. The accessibility tools will open in a panel on the right.
    2. Select `Set Alternate Text` from this menu. This option will walk you through each image and ask you to provide alternative text.
    If you are using an older version of Acrobat, this option might not be available. In that case, you can add the alt text manually. Select `View` > `Tools` > `Content` from the top menu. Select the `Edit Option` tool. For each figure in your PDF, right-click the figure and select `Properties`. Click the Tag tab in the pop-up window, and enter the figure description in the field named `Alternative Text`. 
3. **Mark table headers.**
    1. Right-click the table in your document. You should see an option named Table Editor. If that option is not available, Acrobat may not have correctly identified the table. You may use the TouchUp Reading Order tool to label the table in the PDF.
    2. Within the editor, each table cell should be labeled as a header (TH) or data (TD). If a cell is mislabeled, right-click the cell and select `Table Cell Properties`, and set either `Header Cell` or `Table Cell` as appropriate, and indicate whether it is a header for the row, column, or both on the `Scope` dropdown menu.
4. **Set title and language and other metadata.**
    1. Select `File` > `Properties` from the menu.
    2. Select the `Description` tab.
    3. Fill the `Title` field with the document title.
    4. Select the `Initial View` tab.
    5. In the `Show` dropdown, select `Document Title`.
    6. Select the `Advanced` tab.
    7. In the `Reading Options` section, select your document language from the `Language` dropdown menu.
5. **Set tab order.** Setting the tab order is necessary so that a keyboard user can use the tab key to navigate through the document. To set the tab order:
    1. Click the `Page Thumbnails` icon to show thumbnail images for each page (or, in the top menu, select `View` > `Show/Hide` > `Navigation Panes` > `Page Thumbnails`).
    2. Select all pages with `Control + A` (Windows) or `Command(⌘)+ A` (MacOS).
    3. Right-click and select `Page Properties`.
    4. In the popup window, select `Use Document Structure` on the `Tab Order` tab, and click `OK` to set the tab order.
6. **Save tagged PDF**. Before you save your PDF, use the accessibility check tool to verify that your PDF is accessible:
    1. Select `Tools` > `Accessibility` from the menu, then click `Full Check`.
    2. Saving the PDF in Acrobat should save the relevant accessibility data by default. No extra steps are necessary.

**Your PDF should now have all accessibility metadata included!**

## Checking Accessibility of PDF Documents

If you have followed the above steps, your final documents should be accessible. You are encouraged to double-check that all accessibility metadata is included.

1. Open your PDF version in Adobe Acrobat (commercial version).
2. Select `Tools` > `Accessibility` > `Full Check`.
3. Use the default options, and select `Start Checking`. An accessibility check will be performed, and the report will be generated.
4. You should now be able to see an overview in the `Accessibility Checker` side panel.
Verify that none of the checks have failed here.
Some checks (e.g "Logical Reading Order") might give you a warning saying "Needs manual check"; these can be ignored.
5. The `Headings` section might indicate that the "Appropriate Nesting" check failed; this can be ignored too.

## Contact

### Accessibility Chairs

* Kim Marriott *Monash University*
* Dominik Moritz *Carnegie Mellon University*

*Email: [accessibility@ieeevis.org](mailto:accessibility@ieeevis.org)*
