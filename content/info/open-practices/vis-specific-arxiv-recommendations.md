---
title: Open Practices arXiv Guidance
layout: page
permalink: /info/open-practices/vis-specific-arxiv-recommendations
active_nav: "Contribute"
contact: open_practices@ieeevis.org
---

## Metadata related considerations

### Choosing a category

There is currently no category explicitly for visualization. Some categories to consider might be: *cs.HC: Human Computer Interaction, cs.GR: Graphics or cs.LG:Learning*, however, feel free to choose any other category that best fits your paper.

### Updating the arXiv record post-publication

Once your paper is processed for publication by IEEE (post final acceptance) and after you receive the DOI, you must post an IEEE copyright notice on your preprint. According to IEEE author FAQ, you can replace the preprint with either: 1) the full citation to the IEEE work with Digital Object Identifiers (DOI) or a link to the paper’s abstract in IEEE Xplore, or 2) the accepted version only (not the IEEE published version), including the IEEE copyright notice and full citation, with a link to the final, published paper in IEEE Xplore.

After you follow the guidance on the [Open Access Preprint Guide and FAQ](open-practices-faq) under the "**Which version of the paper can I share?**" question and produced a pdf with a DOI link and copyright statement on it, you will also need to revise the version on arXiv. 

When revising the article on arXiv, you can follow the following steps:

* Login to arXiv, and you should see your paper under "Articles You Own"
* Under the "Actions" menu, click the "Replace" icon.
* Once you are on the "Add Files" tab, select the "Bring files forward from previous version" to replace the `TeX` files. However, if you originally were able to submit a pdf directly, you can upload the pdf directly at this stage.

![]({{ 'content/info/open-practices/arxiv_guide_6.png' | relative_url }}) 

* Once arXiv processed your pdf, and you are on the "Metadata" tab. arXiv has [guidance here](https://arxiv.org/help/prep) to support you in entering information here. For VIS papers, make sure to include the following information on this tab:
	* Enter the paper's DOI. arXiv has some guidance [here](https://arxiv.org/help/jref).
	* Include ACM classification keywords. Note that arXiv supports only the [1998 classification](https://www.acm.org/publications/computing-classification-system/1998) in the meta data (*H. Information Systems* and *I. Computing Methodologies* are good starting points).
	* Under the comments section, add a reference to IEEE VIS. You can also add [ACM 2012 classification keywords](https://www.acm.org/publications/class-2012) as the ACM 2012 classification is more representative of visualization research. The comment note could look like (choose one of "InfoVis/VAST/SciVis" and relevant keywords): 
	
		>IEEE VIS (InfoVis/VAST/SciVis) 2020
		>
		>ACM 2012 CCS - Human-centered computing, Visualization, Visualization design and evaluation methods
	* Even though it is for papers on the math archive, you can include a [Mathematics Subject Classification](http://www.ams.org/msc/) as well. `68Uxx` offers some potential candidates
* Once done, arXiv should process your revision in a few days and notify you.

Support pages from arXiv provide further guidance on the replacement process [here](https://arxiv.org/help/replace)


## Content related considerations

### File size limits

arXiv has file size limits as explained [here](https://arxiv.org/help/sizes). The current limitation is either 10MB for your output file or for an individual file (i.e., you'll get a warning if any of the files you are submitting is larger than 10 MB). This could be problematic if you have large figures. You can try to make your figure sizes smaller to overcome that (arXiv has some guidance on that [here](https://arxiv.org/help/bitmap)). If you cannot get sizes down below the limit, arXiv still accepts your submission but you need to drop the administrators an email as suggested [here](https://arxiv.org/help/sizes).