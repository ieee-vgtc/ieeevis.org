---
title: Make PDF submission accessible
layout: page
permalink: /year/2025/info/call-participation/make-pdf-accessible
active_nav: "Contribute"
sidebar: call-for-participation
contact: accessibility@ieeevis.org
---

The instructions on this page are based on the [SIGACCESS Guide for Accessible PDFs in Word](https://www.sigaccess.org/welcome-to-sigaccess/resources/acm-submission-with-ms-word/) and the [SIGCHI Guide to an Accessible Submission](https://sigchi.org/conferences/author-resources/accessibility-guide). [SIGACCESS has more resources](https://www.sigaccess.org/welcome-to-sigaccess/resources/) for making accessible submissions including writing guidelines and how to make an accessible presentation.

We highly encourage creating accessible final submissions so that your contribution is readable by the broader audiences. This includes taking steps as you author your document and making your submitted PDF accessible. These steps can improve usability for many people, especially those of us who use screen readers.

## Contents

- [Authoring an Accessible Document](#authoring-an-accessible-document)
  - [For Word Users](#for-word-users)
  - [For LaTeX Users](#for-latex-users)
- [Adding Accessibility Metadata to a PDF](#adding-accessibility-metadata-to-a-PDF)
- [Checking Accessibility of PDF Documents](#checking-accessibility-of-pdf-documents)



## Authoring an Accessible Document

Your paper will be read in different ways: on paper, on screen, through speech, on a braille display, etc. Some of us enlarge the text or change the colors on our displays for easier reading. Not everyone can see the colors and shapes in the figures. Some can’t see the figures at all and rely on you to provide a text description of your essential content.

You can make your submission document accessible by following these steps:

1. **Mark up content such as headings and lists appropriately**, using the correct Word template style or LaTeX markup.
2. **Don’t rely only on color**. Charts that rely only on color to differentiate elements may not be usable for those of us with color vision differences, or for those who print papers in black and white. In figures, legends and the text that refers to the figures, use different shapes and patterns to provide another way to visually distinguish elements.
3. **Provide a text description for all figures.** Figure descriptions are different to figure captions. Descriptions are an alternative to seeing the figure, and should provide important information that is not already in the paper or the caption. Do not simply repeat the caption. To learn about writing good alt texts, you can follow the [SIGACCESS guide for describing figures](https://www.sigaccess.org/welcome-to-sigaccess/resources/describing-figures/).
4. **Create every table as a real table**, not an image, and indicate which cells are headers.
5. **Create every equation as a marked-up equation**, not an image of an equation.
6. **Set the metadata** of your document.


### For Word Users

Microsoft Word can produce accessible documents.

1. **Ensure that built-in styles are used.** Word is able to produce accessible documents if the content is created using the built-in styles. Ensure that headings are created using heading styles, tables are created using the table features (rather than an image), and lists are created as bulleted or numbered lists. You can expand the `Styles Pane` to see a list of all available styles.
2. **Add figure descriptions (alternative text) to all figures.** For each image in your document, right-click the image and select `Format Picture`. In the Format Picture window, select the `Layout & Properties` tab. In the `Alt Text` section, provide a textual description of the image. Remember that this description should include the equivalent information to the image itself so that the content is accessible to readers and reviewers who cannot view the image.
3. **Mark table headers.** Mark the header row of each table so that a screen reader or other accessibility software can navigate the table. Highlight the header row or column in the table, click the Table Design tab in the Word ribbon, and check the `Header Row `and/or `First Column` checkbox if either contains header information for the table. Additionally, remember to use `TableCell` style for table contents, and `TableCaption` style for the table caption.
4. **Add a title.** On Word for Windows, open the `File` tab and click on `Info`. On Word for Mac, click the `File` Menu and select `Properties`, then click the `Summary` tab. Fill in the title of your document.
5. **Set the document language.** Click the `Review` tab in the ribbon menu. Click the `Language` button and select the document language from the pop-up.


### For LaTeX Users

1. Download the latest [template for full papers](https://tc.computer.org/vgtc/publications/journal/) or the [template for all other submissions](https://tc.computer.org/vgtc/publications/conference/).
2. **Use appropriate commands to create sections**, ordered/unordered lists, figures, tables, equations, etc.
3. Add alt texts to the LaTeX sources (see [below](#adding-alt-texts-to-figures)) so that you can easily copy and paste them into the PDF in the next step. In future versions of LaTeX, alt texts will be automatically added to the PDF.
4. Tag the document, add alt text to all figures and equations, and correctly annotate tables with Adobe Acrobat. Details are [below](#adding-accessibility-metadata-to-a-PDF).
5. Test the document complete with a screen reader to make sure that there are tags for all content.

#### Adding Alt Texts to Figures

Add alt texts inline in the `includegraphics` call. In your paper, the alt texts should [describe the figure in sufficient detail](https://www.sigaccess.org/welcome-to-sigaccess/resources/describing-figures/).

```latex
\includegraphics[alt={An image of a duck in a pond.},width=0.5\columnwidth]{duck.png}
```

## Adding Accessibility Metadata to a PDF

You can add missing accessibility metadata to a PDF file using [Adobe Acrobat](https://www.adobe.com/acrobat/acrobat-pro.html). Note that this requires **the pro version of Adobe Acrobat**. If you need assistance in making your PDF accessible, please contact the accessibility chairs as they might be able to provide support.

Note that these steps will need to be performed **each time a new PDF is exported or generated from your source documents.** Since Word can produce accessible documents, these steps are designed for LaTeX users.

We walk through the process of tagging a PDF and adding alt texts in this video that we made in August 2023.

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/N8sjpJlmkXs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

We wrote these instructions for Adobe Acrobat Pro 2023.006.20380.

1. **Tag the PDF.** The PDF file must be "tagged" with metadata about the document structure and text. You can check to see if your document is tagged by using the accessibility check function: select `All Tools` > `Prepare for Accessibility`, then click `Accessibility Check`. If the document is not tagged, you will see "Tagged PDF - Failed" under `Document`.
    1. To add tags to the document, select `Autotag Document`. Many tags will not be correct so you need to manually check and correct all pages. To quickly inspect the tags, switch to the `Order` side panel.
    2. Correct heading tags by opening the `Reading Order` tool. Then draw a box around the first heading and click the button for the correct heading level (start with H2). Repeat for all headings.
    3. To correct figure captions, open the `Accessibility Tags` side panel. Then find the the first figure caption (which should be a `<P>`), right click, `Properties...` > `Type` > `Caption`. Repeat for all figure captions. 
    4. Delete the accessibility tag for the diamond as is is not needed.
    5. The author list may not be correctly tagged and part of the teaser figure. To fix this, drag the tags for the authors (`<Reference>`) above the figure in the accessibility tags hierarchy.
    6. Change the reading order for the author details list. The list should be read right after the authors after the title to drag and drop the list (`L`) right after the last author `<Reference>`.
    7. Move footnotes to the end of the first paragraph where they are mentioned.
    8. If you notice that some tags are containing multiple things or should be grouped, you can break them up or combine by dragging nested tags in the `Accessibility Tags` side panel.
2. **Add figure descriptions (alternative text) to all figures and equations.** From `Prepare for Accessibility`, select `Set alternate text`. The dialog will walk you through each image and ask you to provide alternative text. Also add alt texts for equations. You can check the alternative texts in the `Accessibility tags` side panel by right clicking on a `<Figure>` in `Properties...`.
3. **Tag tables.**
    1. Right-click the `<Table>` in the `Accessibility tags` side panel and select `Table Editor`.
    2. Within the editor, each table cell should be labeled as a header (TH) or data (TD). If a cell is mislabeled, right-click the cell and select `Table Cell Properties`, and set either `Header Cell` or `Data Cell` as appropriate, and indicate whether it is a header for the row, column, or both on the `Scope` dropdown menu. You can shift-click to select multiple cells at once.
6. **Save tagged PDF**. Use the accessibility check tool to verify that your PDF is accessible.
    1. Select `Accessibility check` and make sure there are no errors (? are ok).
    2. Saving the PDF in Acrobat should save the relevant accessibility data by default.


## Checking Accessibility of PDF Documents

If you have followed the above steps, your final documents should be accessible. Now we can test the document with a screen reader. 

1. Open your PDF version a PDF viewer.
2. Enable a screen reader. On Windows, you can use [NVDA](https://www.nvaccess.org/files/nvda/documentation/userGuide.html#NVDAQuickStartGuide) or the built-in [Narrator](https://support.microsoft.com/en-us/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1). On Mac, use [VoiceOver](https://support.apple.com/guide/voiceover/get-started-vo4be8816d70/10/mac/14.0). If you are not familiar with your screen reader, read the linked guides.
3. Navigate the document paying attention to correct reading order and alternative texts for figures and equations. If you notice any issues, correct them using Acrobat.

## Contact

### Accessibility Chairs

* Dominik Moritz *Carnegie Mellon University*
* John Alexis Guerra Gómez *Northeastern University*
* Ab Mosca *Northeastern University*

*Email: [accessibility@ieeevis.org](mailto:accessibility@ieeevis.org)*
