---
title: Open Access Preprint Guide and FAQ
layout: main-2019
permalink: /year/2019/info/open-practices/open-practices-faq
---

Visualization research is better communicated and acted on if it is freely accessible to the research community, practitioners, and the general public. This accessibility can be improved if authors post the final version of their accepted paper to a reliable open access repository. VIS can facilitate an increase in sharing of papers by informing authors of this option, establishing guidelines for which repositories are freely accessible and reliable, helping authors use those repositories, and dispelling misconceptions.


## Open Access Repository Criteria

In order to ensure that papers are discoverable and remain accessible long-term, authors are encouraged to post their work to an open access repository that meets the following criteria:

1. Findable - Research is most effectively disseminated if it can be easily searched for, especially when people do not know exactly what they are looking for. This discoverability can be critical for scholars trying to find research from which they can build. Therefore, papers in the archive must be indexed or registered via commonly used search engines. Thorough metadata, such as title, author, and possibly publication information about the peer-reviewed version should also be indexed with the paper.
 
2. Accessible - Research is better communicated and acted on if it is freely accessible to the research community, practitioners, and the general public. Therefore, there can be no cost or sign-up requirement for viewing papers on the archive.
 
3. Identifiable - For citations and references to be useful, papers must have a globally unique and persistent identifier (e.g., a DOI). Content posted to the repository must also be immutable and timestamped. Multiple versions of a paper are acceptable, as long as previous versions and timestamps are retained.
 
4. Reliable - Research should represent a permanent advancement of knowledge and understanding, so it is important that posted papers are available for perpetuity. The archive must therefore have an explicitly stated plan for long-term reliability ([example](https://help.osf.io/hc/en-us/articles/360019737894-FAQs#what-if-you-run-out-of-funding-what-happens-to-my-data)), or it must deposit all papers in a dedicated “dark archive” such as [Portico](https://www.portico.org/) or [Clockss](https://clockss.org/).


A repository that meets the criteria for long-term reliability and is inline with IEEE policy is [arXiv.org](http://arxiv.org) ([instructions](open-practices-arxiv)). If you would like to use another repository such as an institutional repository, please email an explanation of how it meets the criteria to open_practices@ieeevis.org. A personal website, lab website, or any site that is not immutable and has no explicit plans for long-term availability (e.g. GitHub) does not meet the criteria.

## Sharing the Open Version with VIS

After your paper is accepted and before the camera-ready deadline, PCS will have a textbox where you can enter the URL that points to the preprint version of your article in the open access repository if you have shared it. This paper should be the final “author version”. If you have any issues or questions, please contact the open practice chairs. If you cannot share the paper on an approved open access repository, please enter the reason instead of the URL.

  

## Is sharing the preprint compatible with IEEE’s publication policy?

Yes! Until you sign the IEEE copyright policy, the paper is 100% yours, and you can post your preprint anywhere you like. After you sign the copyright form, IEEE explicitly allows you to keep the article on a non-profit open access repository. This quote comes from the [IEEE author FAQ](https://www.ieee.org/content/dam/ieee-org/ieee/web/org/pubs/author_faq.pdf):

Can an author post their manuscript on a preprint server such as ArXiv?

> Yes. The IEEE recognizes that many authors share their unpublished
> manuscripts on public sites. Once manuscripts have been accepted for
> publication by IEEE, an author is required to post an IEEE copyright
> notice on their preprint. Upon publication, the author must replace the
> preprint with either 1) the full citation to the IEEE work with
> Digital Object Identifiers (DOI) or a link to the paper’s abstract in
> IEEE Xplore, or 2) the accepted version only (not the IEEE published
> version), including the IEEE copyright notice and full citation, with
> a link to the final, published paper in IEEE Xplore.

In other words, you may post your paper to a preprint server, but after acceptance, you must comply with IEEE regulations - for example by adding the DOI (which links to the IEEE version), the IEEE copyright notice and the full citation.

## Where can I share the paper?
You are encouraged to share your paper on a repository that meets the Open Access Repository criteria that is also in line with IEEE's publication policies. 

IEEE's current publication policies allow authors to submit preprints only to IEEE approved third-party repositories or institutional repositories. Currently, the only IEEE approved third-party repository is [arXiv.org](http://arxiv.org). We are working with IEEE to expand the list of approved repositories in the future.

To sum up, you are encouraged to share your paper either on [arXiv.org](http://arxiv.org)  or on your institutional repository as long as it meets the Open Access Repository criteria outlined above.

## Which version of the paper can I share?
Share the final preprint version of your accepted article that you create after all rounds of review because it is the most scrutinized and polished. Please do not share the version created by IEEE, which typically has page numbers. If you are using `LaTeX` to produce your paper, indicating the `preprint` option on your main `TeX` file will ensure that you produce a version that is compliant with IEEE's regulations. For submitting to arXiv, you can follow the guidance [here](open-practices-arxiv).
 
**After you receive the DOI from IEEE**, you must either add the DOI to the repository to add a link to the IEEEXplore page or include that information directly on the pdf. Depending on how you produced your document and requirements of the repository (for instance, arXiV requires TeX files to be submitted), you have two options:

* If you have produced your pdf using LaTeX, you can follow the following steps:
	- Replace your existing `vgtc.cls` file with the new `vgtc.cls` file included in the revised IEEE VIS latex template, which you can [download from here](http://junctionpublishing.org/vgtc/Track/vis-tvcg.html). Note that there are different templates for TVCG and conference papers. Also note that you should not be making any changes to the `.cls` file, you just need to replace the old `vgtc.cls` file you used with the new version.
	- Use the `\documentclass[preprint,journal]{vgtc}` in your main TeX file
	- Insert a `\ieeedoi` command with your DOI within the preamble of your main `TeX` file (i.e., anywhere between the `\documentclass` and `\begin{document}` commands), e.g.,`\ieeedoi{10.1109/TVCG.2019.2934609} `
	- Compile and produce a new pdf file

* If you have produced your pdf using other means, you can get an IEEE-produced copy of your paper for reposting at [https://authorgateway.ieee.org](https://authorgateway.ieee.org). Once logged in, download the “Author-submitted manuscript” pdf which will have the required information included.
 
Make sure that the revised version has: i) the copyright statement on the bottom-left on the first page and ii) a statement with a link to the paper on IEEEXplore on the first page (or on top of odd-numbered pages). Once everything is in place, resubmit the revised preprint to the OA repository to replace the version you submitted earlier. 

If you have uploaded your preprint to arXiv, you can follow the [guidance on this page](http://ieeevis.org/year/2019/info/open-practices/open-practices-arxiv) under the “**5.Update arXiv record post publication**” step for revising your record on arXiv.


## What about other repositories such as OSF, bioaRxiv, etc?
[IEEE publication policy](https://www.ieee.org/publications/rights/author-posting-policy.html) requires repositories that authors consider submitting their preprints to be approved by The IEEE Publication Services & Products Board (PSPB). At the moment, the only IEEE approved third-party repository is ArXiV. We are in the process of working with IEEE to expand their list of approved repositories. If you have recommendations for 3rd party servers to be considered by IEEE, you can either contact the Open Practices chairs or submit a request to [IEEE directly here](https://www.ieee.org/publications/rights/third-party-servers.html).

## Can I put my paper on my personal/institutional webpage?
You are free to share a preprint of your paper on your personal or institutional webpage. However, since such pages do not necessarily meet the Open Access criteria outlined above, we encourage authors to first share their preprints through repositories that meet the criteria and inline with IEEE policies. You can, of course, share your preprint on your personal or institutional webpage in addition to sharing it on a suitable repository. If you do, you need to make sure that you follow the preprint sharing guidance outlined on this page to be inline with IEEE's publishing policy.

## What about Plan-S?
[Plan-S](https://www.coalition-s.org/) is an upcoming European policy requiring publicly funded research publications to be open access (available for free). However, it only relates to open access of papers via the publisher, not preprints or other open practices such as open materials, open data, or preregistration. It can, however, impact which publisher you choose.



