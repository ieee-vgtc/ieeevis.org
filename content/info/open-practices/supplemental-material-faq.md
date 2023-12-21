---
title: Open Practices Supplemental Material FAQ
layout: page
permalink: /info/open-practices/supplemental-material-faq
active_nav: "Contribute"
sidebar: call-for-participation
contact: open_practices@ieeevis.org
---

This page presents recommendations for supplemental materials to be included with each paper. The inclusion of supplemental materials, like software artifacts, code, experimental stimuli, and data tables, and code for analysis, allows research to be **transparent** and for readers to **scrutinize** the claims in the paper, and in turn make work at VIS (1) reproducible, (2) replicable, and/or (3) extensible by future researchers. 

 **Note: these are recommendations only, not requirements.** _Following ANY of them, even if you do not follow them all, can improve the long-term value of your research to the community and the health of our field._
 
To provide some background on this initiative, the [2016 IEEE Workshop on the Future of Research Curation and Research Reproducibility](https://www.ieee.org/content/dam/ieee-org/ieee/web/org/ieee_reproducibility_workshop_report_final.pdf), at which IEEE employees were heavily represented, determined that:

1. Encouraging reproducibility and better curation of supplemental materials will lead to faster and more efficient science and 
2. Better curation can lead to faster commercialization and innovation.

The workshop's report recommended that  research communities encourage reproducible content and set standards for it. The report argued:

* Research artifacts should be storable, discoverable, and citable to be reused and so their creation is incentivized.
* Code must be supplemented by documentation sufficient to run it (e.g,. recreate runtime environments, virtual environments).
* Data must be supplemented by a description of how it was produced and how to interpret it.

This page provides additional details and background for each of those recommendations. In particular, it answers the following questions:

* [Where should I upload supplemental material?](#where-should-i-upload-supplemental-material)
* [What supplemental material should I share?](#what-supplemental-material-should-i-share)
* [What documentation should I include?](#what-documentation-should-i-include)
* [Should I specify a license for supplemental materials?](#should-i-specify-a-license-for-supplemental-materials)
* [What license should I choose?](#what-license-should-i-choose)
* [What if I have questions, comments, concerns?](#what-if-i-have-questions-comments-concerns)

## Where should I upload supplemental material?

There are many possible locations where supplemental material could live: IEEE Xplore, IEEE Dataport, OSF, Databrary, GitHub, GitLab, Databrary, Dataverse, institutional repositories, authors' homepages...

The ideal repository for your supplemental materials is:

1. **Accessible**—The data is freely accessible without any cost or sign-up requirement to enable future researchers from all backgrounds to build on the work.

2. **Identifiable**—The repository provides a persistent identifier to avoid link rot and enable citation tracking.

3. **Updatable**—The repository allows for post-submission updates to correct errors and address omissions.

4. **Immutable**—The repository offers immutable versioning to support preregistrations.

5. **Reliable**—The repository enables permanent advancement of knowledge and understanding by providing the supplemental material in perpetuity. E.g., it has a long-term sustainability plan (e.g. [OSF's](https://help.osf.io/hc/en-us/articles/360019737894-FAQs#what-if-you-run-out-of-funding-what-happens-to-my-data)) and is otherwise resilient to financial or corporate pressures.

Based on these criteria, and for the sake of simplicity and consistency across VIS submissions, **we recommend that supplemental material be submitted to IEEE and/or to [OSF.io](https://osf.io/)**. Naturally, mirrors on both are even better for the community!

## What supplemental material should I share?

We recommend that you share all supplemental materials required to allow readers to scrutinize and interrogate the work. For many types of contributions to VIS, full scrutiny entails being able to reproduce all of the claims of the paper. The type of work conducted as part of each paper will naturally determine what sort of material is relevant for these goals. The following are examples of material that can or has been included along with VIS papers, but is by no means an exhaustive list:

* Datasets used for usage scenarios, case studies, demonstrations, and benchmarks
* The code to load and visualize or otherwise use that data
* The code for any presented technique, device, or system, if an implementation exists
* Building files, 3D models, or other specifications for any physical artifacts
* All stimuli used in user studies or representative examples of them
* Code for executing an experiment, benchmark, or user study
* Code for analyzing the raw experimental data and any analysis results
* Figure-generation code for any data figures. We also suggest including source files for any manual touch-ups (e.g. Inkscape, Illustrator, Gimp, Photoshop)
* Interview scripts, anonymized or de-idenitified transcripts, and qualitative codebooks
* Sketches, prototypes, or other artifacts from the design process
* Research diaries, mind maps, affinity diagrams, or reflective memos
* Notes or other records from participatory workshops or co-design sessions

In some cases, it is infeasible or unethical to share all the data that was part of a submission (for instance, if the authors collected sensitive or proprietary data from vulnerable populations). In this case, the authors should disclose their rationale, and do their best to balance the goal of research transparency with their ethical or professional commitments.

In other cases, such as work that is largely qualitative or interpretative in nature, notions of reproducibility and transparency may be more complex. In these cases, authors can still strive for rigor and transparency by including as much information as possible to allow the re-use or re-interpretation of their work by others.

## What documentation should I include?

We recommend that authors include enough detail in their documentation so that their work can be easily used or extended by future researchers and practitioners. For example,

* A README.md file at the root folder of your supplemental material can explain the file and folder organization.
* Include sufficient detail for others to understand how the materials relate to what is presented in the paper.
* Include data dictionaries, codebooks, or metadata describing each  dataset, how it was produced, and how to interpret it.
* Source code should be supplemented by a README.md file that explains how to set up and run the code, including instructions for creating runtime or virtual environments.

## Should I specify a license for supplemental materials?

Yes! Including a clear license lets future researchers and practitioners know what they are allowed to do with your materials and whether they will be opening themselves to liability by using it.

## What license should I choose?

We strongly recommend that authors release their supplemental materials under a license that permits re-use by future researchers and practitioners. In particular:

* Release all code under a license approved by the [Open Source Initiative](https://opensource.org/licenses/category)—e.g., [the Apache License 2.0](https://opensource.org/licenses/Apache-2.0).
* Release all digital materials (aside from code) under a [Creative Commons license](https://creativecommons.org/licenses/) allowing for derivatives—e.g., [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

[Copyleft licenses](https://www.gnu.org/licenses/copyleft.en.html) like [GPL](https://opensource.org/licenses/GPL-3.0) can help encourage future users to release their improvements and changes back to the community. But they may limit the adoption of your work by commercial entities.

## What if I have questions, comments, concerns?

If you have any questions or concerns related to this page or open practices, please contact the Open Practice chairs: open_practices@ieeevis.org.
