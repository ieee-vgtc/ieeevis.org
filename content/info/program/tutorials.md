---
title: Tutorials
layout: page
permalink: /year/2025/info/program/tutorials
contact: panels_tutorials@ieeevis.org
---

## Accepted Tutorials
Here is the list of the accepted tutorials.
* [Visualization Analysis and Design](#VAD)
* [Building Progressive Visual Analytics Systems with ProgressiVis](#PRG)
* [Visualization for Explainable AI (XAI)](#XAI)
* [User-centered Evaluation in Visualization](#UCE)
* [MLLM4Vis: Multimodal Large Language Models for Information Visualization](#LLM)
* [Running Online User Studies with the reVISit Framework](#RVS)
* [Hands-On TTK Tutorial: Solving Practical Problems in Small Groups](#TTK)
* [Developing Immersive Visualizations and Interactions for the Web with Anu.js](#ANU)
* [Using Color Harmony and Gen AI Suggestion to Transform your Data Visualizations](#CDV)
* [Live Collaborative Immersive Analytics Development with DashSpace](#DASH)

<hr/>

## <a name="VAD"></a> Visualization Analysis and Design

Tamara Munzner, *University of British Columbia* <br>

This introductory tutorial will provide a broad foundation for thinking systematically about visualization systems, built around the idea that becoming familiar with analyzing existing systems is a good springboard for designing new ones. The major data types of concern in visual analytics, information visualization, and scientific visualization will all be covered: tables, networks, and sampled spatial data. This tutorial is focused on data and task abstractions, and the design choices for visual encoding and interaction; it will not cover algorithms. No background in computer science or visualization is assumed.

## <a name="PRG"></a> Building Progressive Visual Analytics Systems with ProgressiVis

Jean-Daniel Fekete, *Université Paris-Saclay, CNRS, Inria* <br>

ProgressiVis is a Python toolkit designed to build PVA systems, allowing progressive processing from data acquisition, analysis, computation, machine learning, and visualization, with support for interaction.
In recent years, Progressive Visual Analytics (PVA) has been introduced as a new paradigm for building scalable visual analytics systems.
Unfortunately, the cost of building progressive applications is very high due to the lack of libraries or languages supporting the PVA paradigm.
The ProgressiVis toolkit is designed to allow practitioners and researchers to enter the PVA world with little effort.
The tutorial will explain the structure of the toolkit and its building blocks to achieve PVA. It will also explain how to extend the toolkit to support more data processing, data structures, computations, visualizations, and interactions to enrich PVA and support a wider range of applications with appropriate visualizations and interactions.
The tutorial is intended for practitioners familiar with the Python environment. It will also gently introd how to build web-based visualizations in a JupyterLab environment to explain how to design and implement web-based progressive visualizations.

## <a name="XAI"></a> Visualization for Explainable AI (XAI)
Roy A Ruddle, *University of Leeds* <br>
Liqun Liu, *University of Leeds* <br>
Mohsen Azarmi, *Institute for Transport Studies* <br>

The learning objectives of this half-day tutorial are for attendees to understand: (1) How XAI requirements vary across stakeholders, (2) How visualization is used in XAI, (3) The types of issue and blooper that occur in XAI visualization, and (4) Scalability – how to make visualization effective for large/complex models. The tutorial is open to everyone, irrespective of their level of knowledge about XAI and visualization. Part 1 (fundamentals) will provide sufficient background to XAI for attendees to enjoy, understand the context of and benefit from the main parts of the tutorial. Part 2 will explain which visualization techniques are effective for different XAI tasks, based on data types and the visual patterns that reveal insights, include a test about issues and misleading visualizations, then provide a hands-on practical challenge. Most of the visualization techniques are well-known (e.g., scatterplots, bar charts and heat maps) but others are more unusual (e.g., violin and beeswarm plots). Part 3 will focus on scalability, explaining how visualizations break down as AI models become larger or more complex, and then describing exemplar solutions that: (a) modify an existing visualization, or (b) involve additional visualizations. That will be followed by a hands-on practical challenge.

## <a name="UCE"></a> User-centered Evaluation in Visualization
Niklas Rönnberg, *Linköping University* <br>
Camilla Forsell, *Linköping University* <br>

Designing and building effective visualization systems requires a clear understanding of how users interpret interactive data representations. Developing this understanding requires sound scientific methodologies to evaluate both existing and novel visualizations, tools, and interaction techniques. This tutorial, aimed at early-career researchers in the field of visualization, is intended to inspire, motivate, and guide participants toward adopting a more scientifically grounded approach towards development in visualization, users’ needs and abilities. It also encourages researchers to contribute to the evolving understanding of the visualization process through the evaluation of their own work.

## <a name="LLM"></a> MLLM4Vis: Multimodal Large Language Models for Information Visualization

Enamul Hoque, *York University* <br>

This tutorial will introd language-centric AI models to researchers in the visualization (Vis) community, with a special focus on Multimodal Large Language Models (MLLMs). We will begin by motivating why MLLM4Vis is a timely and important area of research, and how recent advances in MLLMs can be leveraged to support and enhance visualization tasks. The tutorial will cover the basics of language and vision-language models, including the Transformer architecture, key training paradigms, and techniques such as pre-training, fine-tuning, and prompt engineering. We will then explore the growing ecosystem of MLLMs (e.g., GPT-4V, Claude 3, and LLaVA), highlighting their abilities to reason over both visual and textual modalities. In the latter half, we will focus on practical applications of MLLMs in visualization, including visual text analytics, natural language interfaces for charts, chart question answering, text-to-visualization generation, automated visual storytelling, and improving accessibility in data communication. We will conclude with a forward-looking discussion of the research opportunities and open challenges in this emerging area. This tutorial is designed for visualization researchers interested in multimodal AI as well as those broadly curious about integrating MLLMs into visual analytic systems.

## <a name="RVS"></a> Running Online User Studies with the reVISit Framework

Jack Wilburn, *University of Utah* <br>
Hilson Shrestha, *Worcester Polytechnic Institute* <br>
Zach Cutler, *University of Utah* <br>
Yiren Ding, *Worcester Polytechnic Institute* <br>
Tingying He, *University of Utah* <br>
Andrew M McNutt, *University of Utah* <br>
Lane Harrison, *Worcester Polytechnic Institute* <br>
Alexander Lex, *University of Utah* <br>

There currently are two main approaches for running online user studies: experimenters can use commercial survey tools, which are easy to use but can be costly, hamper reproducibility, and have limitations for complex stimuli; or they can build custom software to run and instrument a study, which is a laborious and complex task.
In this tutorial, we introduce participants to a new, open-source alternative: the reVISit study platform. Many studies quickly reach a level of complexity such that designers have not only to consider their stimuli and experimental tasks, but also the study UI, data hosting, participant recruiting, randomization, etc. ReVISit ameliorates these problems and allows study designers to focus more on the research questions and stimulus design. ReVISit removes the tedium of study design by providing built-in components that most studies will need.
ReVISit provides a domain-specific language and a notebook-oriented library to allow study designers to quickly create studies, and to deploy them as websites that are publicly accessible.
This tutorial will introduce reVISit to the visualization community and allow community members to get hands on experience with it through a series of practical examples.
Throughout the tutorial, participants will improve on a study until they have developed and deployed a study of an interactive, fully instrumented data visualization.

## <a name="TTK"></a> Hands-On TTK Tutorial: Solving Practical Problems in Small Groups

Jonas Lukasczyk, *RPTU Kaiserslautern-Landau* <br>
Christoph Garth, *RPTU Kaiserslautern-Landau* <br>
Michael Will, *RPTU Kaiserslautern-Landau* <br>
Mathieu Pont, *RPTU Kaiserslautern-Landau* <br>
Julien Tierny, *Sorbonne Université* <br>

This TTK tutorial, successfully held annually from 2018 to 2023 [12, 13,15,17–19], returns in 2025 with expanded content and a fresh format. Since its last edition, TTK has evolved significantly—offering broader algorithmic capabilities, enhanced accessibility, and more comprehensive documentation. With an abundance of tutorial materials now available online, including examples and video guides, this year’s session utilizes the unique benefits of a live conference setting: direct interaction and personalized support. In contrast to previous years, the 2025 tutorial is built around active user participation. It is structured in two parts: a 75-minute introduction covering TTK installation and performing TDA with ParaView, followed by a 75-minutes hands-on session. In the second part, participants will work in small groups supported by TTK experts—either tackling a set of application problems provided by the organizers or receiving in-person assistance with their own data and use cases. Departing from a traditional lecture-style format, this new workgroup-based approach—enabled by the large team of organizers and volunteers—allows the tutorial to better address individual needs and foster deeper engagement and collaboration within the TDA community.

## <a name="ANU"></a> Developing Immersive Visualizations and Interactions for the Web with Anu.js

David Saffo, *J.P. Morgan Chase & Co* <br>
Benjamin Lee, *J.P. Morgan Chase & Co* <br>
Cheng Yao Wang, *J.P. Morgan Chase & Co* <br>
Feiyu Lu, *J.P. Morgan Chase & Co* <br>
Blair MacIntyre, *J.P. Morgan Chase & Co* <br>

Immersive Analytics (IA), the use of immersive technologies including augmented and virtual reality for data visualization and analytics, is a rapidly growing area of research. Web technologies have the potential to greatly benefit IA due to its developer accessibility, cross-platform compatibility, and ease of distribution to research participants and consumers. This tutorial is aimed at researchers and developers who want to learn how to implement immersive interactive visualizations with web technologies. Tutorial participants will learn how to use ANU.JS, an open-sourced toolkit we developed that accelerates the development of web-based immersive visualizations in a style similar to D3.js. This will be through a hands-on walkthrough and coding activities which will familiarize participants with web technologies including ANU.JS, Babylon.js, WebXR, D3.js, and Vite. By the end of this half-day tutorial, participants will be able to develop, view, and interact with an immersive visualization of their making in their device’s web browser, and be able to continue using ANU.JS through the resources available on our documentation website.


## <a name="CDV"></a> Using Color Harmony and Gen AI Suggestion to Transform your Data Visualizations

Theresa-Marie Rhyne, *Visualization Consultant* <br>

This tutorial provides an overview of the basics of color theory
and shows how to use Generative AI tools, like ChatGPT,
Gemini, Copilot, and DeepSeek, to expand your data color
scheme choices. You explore how to build your own colormaps
by transforming color harmonies into data color schemes. The half
day course is intended for a broad audience of individuals
interested in understanding, applying, and building color schemes
for data visualization and using Gen AI tools for color scheme
suggestion.

With a five stage colorization process, you learn how to build and
select a data color scheme with color harmony, incorporate color
models concepts and address color deficiency. You discover the
differences between mixing colors in perceptual, display, printer,
and traditional painter color spaces. You explore online and
mobile color apps, like ChatGPT, Google Gemini, Microsoft
Copilot, DeepSeek, Adobe Color, Adobe Capture, ColorBrewer,
HCL Wizard, and Data Color Picker to help with continued
colorization. Along the way, color vision principles, perceptual
uniformity with the Hue Chroma Luminance (HCL) model as well
as color gamut, spaces and systems are examined. Concepts like
extending the fundamentals of the Bauhaus into digital media ,the
Rainbow colormap dilemma, and overviews of appearance
principals are covered. Bring your digital visualization examples
for hands on experiences in generating color schemes.

## <a name="DASH"></a> Live Collaborative Immersive Analytics Development with DashSpace

Marcel Borowski, *Aarhus University* <br>
Peter W. S. Butcher, *Bangor University* <br>
Shannon Jade Jones,  *Bangor University* <br>
Panagiotis D. Ritsos,  *Bangor University* <br>
Clemens Nylandsted Klokmose, *Aarhus University* <br>
Niklas Elmqvist, *Aarhus University* <br>

In this half-day tutorial, we introduce participants to DashSpace, a new, open, malleable, and collaborative platform for immersive, situated and ubiquitous analytics. Participants will learn about the platform, its components and authoring mechanisms, and learn how these can be used to author visualizations which can be experienced in augmented reality. We will explore different usage scenarios and enable participants to build their own prototypes, in their own browsers. The prototypes will be ready to view and interact with through HMDs that we will provide. Finally, we will show how participants can extend their prototypes to use advanced features of the platform. DashSpace builds upon several tools from the Webstrates stack and Web-based immersive analytics platforms.
