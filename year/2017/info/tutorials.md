---
title: Tutorials
layout: main-2017
permalink: /year/2017/info/tutorials
contact: "tutorials@ieeevis.org"
---

* [Large-scale Web-based Visual Analytics Made Easy (half-day)](#Large-scale_Web-based_VA)
* [Visualization Analysis and Design (full-day)](#Visualization_Analysis_Design)
* [Applying Color Theory to VIS (half-day)](#Applying_Color_Theory)
* [Visual Analytics for High-Dimensional Data (half-day)](#VA_High-Dim)
* [Interactive Visualization of Large Dynamic Particle Data (half-day)](#Interactive_Particle_Vis)
* [Vis+ML: Symbiosis of Visualization and Machine Learning (half-day)](#Vis+ML)
* [Sketching Designs for Data-Visualization using the Five Design-Sheet Methodology (half-day)](#Five_Design-Sheet)
* [Visual Analytics of Cohort Study Data – From Individuals to Populations (half-day)](#Cohort_Study)
* [Analyzing Qualitative Data (half-day)](#Qualitative_Data)


## <a name="Large-scale_Web-based_VA"></a> Large-scale Web-based Visual Analytics Made Easy (half-day)

Xiaoji Chen (Uber Technologies, Inc.)  
Shan He (Uber Technologies, Inc.)  
Lezhi Li (Uber Technologies, Inc.)  
Yang Wang (Uber Technologies, Inc.)  

The advancement of almost every modern domain depends on data. Companies and organizations invest heavily in infrastructure for data storage and processing, but unless they are able to extract meaning from the data, the investment is a sunk cost with little reward. Visualization, as an effective means of bridging human knowledge and data to drive decisions, has gained popularity in recent years. Nonetheless, despite the amount of effort being put forth by the community, it is still nontrivial for scientists and practitioners to quickly create actionable visualizations with data at scale that are also reusable and beneficial in the long-term. To narrow this gap, we present a series of hands-on tutorials distilled from inter-/external workshops. We start by introducing a "primitive-instancing-layering" (PIL) paradigm for architecting visualizations, followed by an overview of a set of open-source frameworks sharing the same design concept. We then showcase real-world examples distilled from our day-to-day work covering both geospatial and non-geospatial use cases, together with lessons learned from developing data-heavy visual analytics tools in an enterprise setting. Finally, we incorporate a deep dive into advanced topics on layer customization and performance optimizations for more advanced use cases. In the course of the tutorial, we expect the attendees to become acquainted with patterns on how to architect a visualization, and to be able to quickly prototype and verify ideas leveraging these open-source frameworks. We believe the hands-on experiences together with the best practices from an industry perspective will complement the IEEE VIS Tutorials, which are often structured in favor for academic scenarios. We also envision that our tutorial will benefit both researchers and practitioners providing building blocks to jump-start their projects and will bring in more people to contribute to the visualization community.


## <a name="Visualization_Analysis_Design"></a> Visualization Analysis and Design (full-day)

Tamara Munzner (University of British Columbia)  

This introductory tutorial will provide a broad foundation for thinking systematically about visualization systems, built around the idea that becoming familiar with analyzing existing systems is a good springboard for designing new ones. The major data types of concern in visual analytics, information visualization, and scientific visualization will all be covered: tables, networks, and sampled spatial data. This tutorial is focused on data and task abstractions, and the design choices for visual encoding and interaction; it will not cover algorithms. No background in computer science or visualization is assumed.


## <a name="Applying_Color_Theory"></a> Applying Color Theory to VIS (half-day)

Theresa-Marie Rhyne (Visualization Consultant)  

The foundations of color theory & how these methods apply to building effective visualizations are examined. We define color harmony & demonstrate the application of color harmony to case studies. New to this year, we review how mobile devices are advancing to address the full range of color spaces and provide a brief overview of recent color research in the IEEE VIS, ACM SIG CHI and ACM SIGGRAPH communities. Colorization of Black & White digital images using Colorize-It, as presented at the 2016 European Conference on Computer Vision and noted at ACM SIGGRAPH 2017, is demonstrated. We also include our solutions using Colourmap Hospital and Colorgorical tools, introduced at IEEE VIS 2016, as well as new Munsell color harmony work in Visual Analytics. The features of the new Pantone Studio app, ColorBrewer, Colourlover’s COPASO tool, Adobe’s Capture CC app, & Josef Albers “Interaction of Color” app are examined. We also introduce “Gamut Mask” & “Color Proportions of an Image” analysis tools. Our tutorial concludes with a hands-on session that teaches how to use online and mobile apps to successfully capture, analyze and store color schemes for future use in visual analytics. This includes evaluations for color deficiencies using Vizcheck, Coblis & Paletton’s Color Scheme Designer. These color suggestion tools are available online for your continued use in creating new visualizations. Please bring small JPEG examples of your visualizations for performing color analyses during the hands on session.

## <a name="VA_High-Dim"></a> Visual Analytics for High-Dimensional Data (half-day)

Klaus Mueller, (Stony Brook University)  
Shenghui Cheng, (Stony Brook University)  

Analyzing high-dimensional data and finding hidden patterns in them is a difficult problem and has attracted numerous research efforts in the visualization community and beyond. Gaining insight into high dimensional data is at the core of big data analysis and data science. Automated methods can be useful to some extent but bringing the data analyst into the loop via interactive visual tools can help the discovery process tremendously. All of these visual tools use some kind of projection strategy to convey the high dimensional space within the confines of the two screen dimensions. Since this projection is an inherently ill-posed problem in all but the most trivial cases, all methods will bear certain trade-offs. Knowing the strengths and weaknesses of the various paradigms existing in the field can inform the design of the most appropriate visualization strategy for the task at hand. It can help practitioners in selecting the best among the many tools available, and it can help researchers in devising new tools to advance the state of the art. This tutorial aims to serve both of these factions of the visualization community.


## <a name="Interactive_Particle_Vis"></a> Interactive Visualization of Large Dynamic Particle Data (half-day)

Martin Falk (Linköping University)  
Aaron Knoll (University of Utah)  
Michael Krone (University of Stuttgart)  
Guido Reina (University of Stuttgart)  

We propose a half-day tutorial that covers fundamental techniques for interactive particle-based visualization. Particle data typically originates from measurements and simulations in various fields such as life sciences or physics. Often, the particles are visualized directly, that is, by simple representations like spheres. Interactive rendering facilitates the exploration and visual analysis of the data. With increasing data set sizes in terms of particle numbers, interactive high-quality visualization is a challenging task. This is especially true for dynamic data or abstract representations that are based on the raw particle data. Our intermediate-level tutorial will cover direct particle visualization using simple glyphs as well as abstractions that are application-driven such as clustering and aggregation. It targets visualization researchers and developers who are interested in visualization techniques for large, dynamic particle-based data. We will focus on GPU-accelerated algorithms for high-performance rendering and data processing that run in real-time on modern desktop hardware as well as CPU-based visualizations that use interactive ray tracing methods for desktop and in situ application scenarios. Consequently, we will discuss the implementation of said algorithms and the required data structures to make use of the capabilities of modern graphics APIs. Furthermore, we will discuss GPU- and CPU-parallelized methods for the generation of application-dependent abstract representations. This includes various representations commonly used in application areas such as structural biology, thermodynamics, and astrophysics.
Guido Reina (University of Stuttgart)


## <a name="Vis+ML"></a> Vis+ML: Symbiosis of Visualization and Machine Learning (half-day)

Abon Chaudhuri (WalmartLabs)  
Yifan Hu (Yahoo Research)  
Xiaotong Liu (IBM Research)  
Yang Wang (Uber Technologies Inc.)  

Visualization and machine learning (ML) have come close to each other in recent years more than ever before. Visualization has emerged as a popular technique to understand the inner working and performance of machine learning and of late, deep learning algorithms. At the same time, machine learning techniques such as dimensionality reduction, clustering, and classification have been used on a regular basis to transform large datasets to representations well-suited for visual exploration. As a result, both research fields have witnessed significant growth in the literature in recent years. The number of initiatives in the forms of workshops, panels, and open source releases to bring these two communities together have been growing as well. We propose to contribute to this developing body of knowledge with a half-day tutorial at IEEE VIS 2017. The proposed tutorial offers a concise yet complete coverage of the recent exchange of ideas and techniques between these two fields. Using engaging case studies and demos based on our previous and ongoing work, we plan to highlight how visualization and ML techniques (both supervised and unsupervised) are used hand-in-hand to understand hidden patterns in various types of structured and unstructured data. This tutorial should appeal to researchers and practitioners alike since it plans to discuss the inception of new techniques in the visualization or machine learning research community as well as their applications in the big data and software industry.


## <a name="Five_Design-Sheet"></a> Sketching Designs for Data-Visualization using the Five Design-Sheet Methodology (half-day)

Jonathan Roberts (Bangor University)  
Christopher Headleand (University of Lincoln)  
Panagiotis Ritsos (Bangor University)  

This tutorial leads the attendees through sketching designs following the Five Design-Sheet methodology (FdS). When developing interactive visualization software, researchers and developers need to plan what they are going to build. Low fidelity methods, such as sketching, can be used to explore a range of possible ideas. The tutorial is split into five parts (1) introduction to the tutorial and overview of the methodology, (2) types of problems and creative thinking (where do ideas come from?) (3) sketching techniques, graphical marks and creative thinking, (4) working through the FdS, and (5) Using the FdS in teaching and practice. The tutorial includes practical exercises, an opportunity to work through the Five Design-Sheets, and presentation and discussion of using the FdS in practice


## <a name="Cohort_Study"></a>Visual Analytics of Cohort Study Data – From Individuals to Populations (half-day)

Steffen Oeltze-Jafra (University Leipzig)  
Uli Niemann (Otto-von-Guericke University Magdeburg)  
J&uuml;rgen Bernard (Technische Universität Darmstadt)  
Adam Perer (IBM T. J. Watson Research Center)  

Medicine is one of the primary drivers of visualization research and medical visualization is a vibrant and successful field with a tradition of dozens of years. Traditionally, a lot of medical visualization research has been focused on the visualization of data obtained from a single individual, i.e. a single, uni-modal patient dataset, being usually defined on a regular grid in 3D and capturing a selected part of the human anatomy. In recent years, however, the most pressing challenges in medical visualization have broadened including the investigation of data obtained from populations. Large pools of image and non-image data are acquired for hundreds to thousands of individuals and their analysis poses tremendous new challenges. These include the blending of analysis and visualization techniques to make sense out of this big data, the combined visualization of image and non-image data, the integrated visualization of very heterogeneous data as well as the effective and efficient interactive exploration of the data.

Exemplary fields that acquire such data pools are epidemiology, where longitudinal studies of defined populations (cohorts) are conducted, and healthcare, where large patient databases are compiled from Electronic Health Records (EHR) of hospitals. Epidemiologists aim to discover meaningful relationships between multiple risk factors and an outcome in cohort study data and to assess per individual the risk of falling ill with a specific disease. Clinical researchers and healthcare analysts search for interesting patterns, e.g., complications after interventions correlated with specific prior symptoms, and aim at building and exploring specific patient cohorts and preparing clinical studies efficiently. With the ever-growing volume and heterogeneity of the data in both fields, a purely hypothesis-driven workflow becomes increasingly impractical because inherent associations between variables could remain undiscovered. Hence, analysis tools from data mining are needed to detect interesting patterns and support a data-driven hypothesis generations. While data in epidemiology is acquired in a highly standardized manner within the scope of a specific study, EHR data comprise redundant, irrelevant, as well as subjective measures challenging users in synthesizing information. Additional data transformation steps such as data cleansing are crucial, e.g., to establish comparability between patients or between results of one patient over time. Studies in modern epidemiological research also include medical imaging. Dedicated automatic methods are required to derive measures from these very large amounts of image data, that can be integrated in the epidemiological data analysis workflow.

In this tutorial, we present approaches that blend analysis and visualization techniques to achieve and tackle the above-mentioned goals and challenges, respectively. We emphasize commonalities across the two fields and stress differences. We further showcase software prototypes that we have developed in our research. Finally, we elaborate on open problems and current trends.


## <a name="Qualitative_Data"></a> Analyzing Qualitative Data (half-day)

Sheelagh Carpendale (University of Calgary)  
Uta Hinrichs (University of St Andrews)  
S&oslash;ren Knudsen, Alice Thudt (University of Calgary)  
Melanie Tory (Tableau Research)  

Evaluation is increasingly recognized as an essential component of visualization research. However, evaluation itself is a changing research area. In particular, the many variations of qualitative research are emerging as important empirical methods. This half-day tutorial is designed for beginning to intermediate audiences. We will focus on the basic methods for analyzing qualitative data using a mixture of talks and hands-on activities. In particular we will consider closed and open coding as well as clustering and categorizing coded data. After completing this tutorial, attendees will have a richer understanding of the benefits and challenges of qualitative empirical research and, more specifically, how to analyze qualitative data.
