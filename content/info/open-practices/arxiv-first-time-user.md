---
title: Open Practices arXiv Guidance for First Time Users
layout: page
permalink: /info/open-practices/arxiv-first-time-user
active_nav: "Contribute"
contact: open_practices@ieeevis.org
---

## Step-1.Register as an author
See: [https://arxiv.org/user/register](https://arxiv.org/user/register)

You will need:

- An email address, username and password
- Some personal information such as current affiliation and default categories you will submit to.

**Important note:** If possible, it is preferred to use an official email address when registering, e.g., one finishing with *.gov, .edu, .ac.uk, etc.*. The reason is that emails coming from official accounts seem to be getting through [arXiv's endorsement process](https://arxiv.org/help/endorsement) more easily (see the discussion on Step-3 below on endorsements).

## Step-2.Create a new submission
After your account is created, you can view your current submissions and create new ones from
[https://arxiv.org/user/](https://arxiv.org/user/)

![]({{ 'content/info/open-practices/arxiv_guide_1.png' | relative_url }}) 

## Step-3.Complete the submission process

a) Choose a license (the default arXiv license is recommended by IEEE)

![]({{ 'content/info/open-practices/arxiv_guide_2.png' | relative_url }}) 
![]({{ 'content/info/open-practices/arxiv_guide_3.png' | relative_url }}) 

Note that you may need endorsement in a category if it is the first time you’ve submitted to arXiv.org, especially in this category.  See [https://arxiv.org/help/endorsement](https://arxiv.org/help/endorsement).  

**Important:** Getting the endorsement might take some time in certain cases, so please make sure that you consider this in your planning for putting your preprint up.

There is currently no category explicitly for visualization. Some categories to consider might be: *cs.HC: Human Computer Interaction, cs.GR: Graphics or cs.LG:Learning*, however, feel free to choose any other category that best fits your paper.

b) Upload the pdf in the correct format, or alternatively in (La)Tex. Note that if the paper is generated using (La)Tex, arXiv won't accept the pdf format so you will need to submit using the `TeX/LaTeX` format. 

**Important:** Please refer to **Note-1** at the end of the document for further guidance on submitting in `TeX/LaTeX` format.

![]({{ 'content/info/open-practices/arxiv_guide_4.png' | relative_url }}) 

c) Complete the metadata (title, abstract, authors)

![]({{ 'content/info/open-practices/arxiv_guide_5.png' | relative_url }}) 

d) After previewing, the system may need to process for a few minutes before you will have the option to submit it from the preview section.

## Step-4.Wait for Processing by arXiv     
After the submission is processed, keep an eye out for an email from arXiv.org that provides a unique identifier for the paper.  You can share this with your co-authors so that they can add it to their list of articles that they own.



## Further guidance

### Note-1: Submitting articles in  `TeX/LaTeX` format
arXiv prefers articles to be submitted in `TeX/LaTeX` format for reasons of stability and portability. If you are submitting in this format, you will notice that arXiv has some expectations to make things work smoothly. The arXiv guidance on this is helpful: [https://arxiv.org/help/submit_tex](https://arxiv.org/help/submit_tex).

In the following, we are highlighting a number of issues and key steps to be aware when submitting to arXiv in `TeX/LaTeX` format:

**Renaming ``.tex`` files** If you have multiple files, arXiv usually infers what your main file is, however, you can name the main TeX file `ms.tex` to make sure that it is the file that is processed first. Note that you will need to rename your `.bib` file as `ms.bib` as well. 

**Getting references to work, i.e., including the `bbl` file:** One step that needs pointing out here is the requirement to use `.bbl` files to get your references included in the output. This is due to arXiv's compiler not running the BibTeX command. Luckily, it's easy to produce the `.bbl` file. Once you compile your paper in any TeX editor, the `.bbl` file should be in the directory as a by-product, just include that in the files to be submitted to arXiv. Make sure that the `.bbl` file has the same name as the main `.tex` file.

**Submitting files in bulk:** One step you might find tedious is to submit all the individual files separately. What you can do speed this up is to submit a packaged folder with all your files. The arXiv manual provides further guidance [here](https://arxiv.org/help/submit_tex):

>*You can submit a collection of TeX input/include files, e.g. separate chapters, foreword, appendix, etc, and custom macros (see below) packaged in a (possibly compressed) .tar or .zip file. AutoTeX will generally figure out how to properly process multi-part submissions, and you don't need to adhere to special packaging rules or naming conventions for your tex files. However, there are certain caveats. Naming your primary (or toplevel) file ms.tex will cause AutoTeX to always process that file first. Otherwise, tex files will be processed in alphanumeric order.*

Or you can upload `tex` files separately and then put all images in a `zip` file and upload. Note that the relative paths for images should be correct. For example, if you have all images in a folder called "*figs*", then you can upload "*figs.zip*" and it should work.

**File size limits:** arXiv has file size limits as explained [here](https://arxiv.org/help/sizes). The current limitation is either 10MB for your output file or for an individual file (i.e., you'll get a warning if any of the files you are submitting is larger than 10 MB). This could be problematic if you have large figures. You can try to make your figure sizes smaller to overcome that (arXiv has some guidance on that [here](https://arxiv.org/help/bitmap)). If you cannot get sizes down below the limit, arXiv still accepts your submission but you need to drop the administrators an email as suggested [here](https://arxiv.org/help/sizes).

**Compilation error that mentions "00README.XXX":** You might get a compilation error from arXiv's TeX compiler due to a clash between arXiv's `HyperTeX` package with a few style and class files. If that's the case, this will be highlighted in the error logs. You can add a new file named `00README.XXX` and add the text `nohypertex` in it to address this issue.

**Other common mistakes:** There are a few other issues that can make the autocompiler break. [This guidance](https://arxiv.org/help/faq/mistakes) on arXiv highlights those common mistakes and your issue might be mentioned in there as well.
