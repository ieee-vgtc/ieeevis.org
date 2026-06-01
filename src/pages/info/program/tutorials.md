---
title: Tutorials
layout: /src/layouts/PageLayout.astro
contact: panels_tutorials@ieeevis.org
sidebar: program
active_nav: "Program"
---

The following tutorials went through our [submission/review process](/year/2026/info/call-participation/tutorials).

- [Introduction to Quantum Computing for Visualization Researchers](#quantum)
- [Running Online User Studies with the reVISit Framework](#revisit)
- [Custom widgets for Python notebooks with anywidget and marimo](#nb)
- [Lossy Compression for Scientific Data: Principles, Tools, and Implications for Visualization](#compression)
- [From Decisions to Designs: A Hands-On Tutorial with the Typology of Decision-Making Tasks](#decision-making)
- [Visualization Analysis and Design](#vad)

<hr/>

## <a name="quantum"></a> Introduction to Quantum Computing for Visualization Researchers

Hyeok Kim, _University of Washington_  
Sara Mouradian, _University of Washington_  
Leilani Battle, _University of Washington_

Quantum computers, while powerful, are extremely difficult to use. Additionally, many quantum computer users, such as scientists and financial analysts, are not necessarily well-trained programmers and often struggle with everyday computing tasks. These challenges motivate user interfaces that lower barriers for using quantum devices through visual representations of quantum programs and their outcomes. However, many visualization researchers lack opportunities to learn and experience quantum computing in an HCI-oriented way. Therefore, we offer an introductory tutorial for quantum computing to facilitate research at an intersection of visualization and quantum computing. Specifically, our tutorial will cover fundamental concepts in quantum computing, the current landscape of HCI/VIS research in quantum computing, writing simple quantum programs, and a short brainstorming session about future research goals for the field.

## <a name="revisit"></a> Running Online User Studies with the reVISit Framework

Zach Cutler, _University of Utah_  
Jack Wilburn, _University of Utah_  
Hilson Shrestha, _Worcester Polytechnic Institute_  
Yiren Ding, _Worcester Polytechnic Institute_  
Andrew M McNutt, _University of Utah_  
Lane Harrison, _Worcester Polytechnic Institute_  
Alexander Lex, _Graz University of Technology_, _University of Utah_

There are currently two main approaches for running online user studies: experimenters can use commercial survey tools, which are easy to use but can be costly, hamper reproducibility, and have limitations for complex stimuli; or they can build custom software to run and instrument a study, which is a laborious and complex task. In this tutorial, we introduce participants to a new, open-source alternative: the reVISit study platform. Many studies quickly reach a burdensome level of complexity, necessitating design of stimuli and experimental tasks as well as the study UI, data hosting, participant recruiting, randomization, etc. ReVISit ameliorates these problems and allows study designers to focus more on the research questions and stimulus design. ReVISit removes the tedium of study design by providing built-in components that most studies will need. ReVISit provides a domain-specific language and a notebook-oriented library that enables study designers to quickly create studies and deploy them as publicly accessible websites. This tutorial will introduce reVISit to the visualization community and allow community members to get hands-on experience with it through a series of practical examples. Participants will improve on a study until they have developed and deployed a study of an interactive, fully instrumented data visualization.

## <a name="nb"></a> Custom widgets for Python notebooks with anywidget and marimo

Trevor Manz, _marimo_  
Kiran Gadhave, _marimo_

This tutorial is for authors of interactive visualization systems that want to reach users in Python notebooks. Widgets are interactive views or controls for Python objects that render inside notebook cells. Many interactive visualization systems are built as standalone JavaScript applications. A widget lets us integrate such tools into a notebook, where it can live alongside the data that drives it. The tutorial teaches how to author and package widgets for multiple notebook environments so they become shareable, pip-installable building blocks. We use anywidget (https://anywidget.dev) for building widgets and marimo (https://marimo.io), a reactive Python notebook in the style of Observable, for prototyping and using them. Because marimo is reactive, widgets become first-class participants in its dataflow: a user interaction in the browser turns into a variable change that downstream cells react to. We cover the anywidget contract, two-way state between JavaScript and Python, composing widgets with marimo's reactivity, and packaging for distribution to Jupyter, marimo, Colab, VS Code, and Databricks.

## <a name="compression"></a> Lossy Compression for Scientific Data: Principles, Tools, and Implications for Visualization

Franck Cappello, _Argonne National Laboratory_  
Dr. Peter Lindstrom, _Lawrence Livermore National Laboratory_  
Sheng Di, _Argonne National Laboratory_  
Robert Underwood, _Argonne National Laboratory_  
Hanqi Guo, _The Ohio State University_

Large-scale simulations, observations, and experiments generate massive scientific datasets that pose significant challenges for storage, transfer, and interactive visualization. Lossy compression is an effective technique to reduce data size while preserving essential scientific information. This tutorial introduces the visualization community to the principles, state-of-the-art tools, and implications of lossy compression for scientific data. We first cover the motivation and use cases of lossy compression, the underlying techniques (decorrelation, quantization, and coding), and the leading compressors, including SZ, ZFP, MGARD, and SPERR. We then focus on topics particularly relevant to the visualization community: how lossy compression affects visualization quality and feature preservation, error assessment metrics, hands-on exercises with compression tools, and customization of compressors using the FZ framework. The tutorial is presented by the leading researchers in scientific data compression, who have collectively developed the most widely used compressors in this domain. This tutorial builds on highly rated tutorials given at SC17--25 and ISC17--22, and is adapted here for the IEEE VIS audience, with emphasis on visualization-specific considerations.

## <a name="decision-making"></a> From Decisions to Designs: A Hands-On Tutorial with the Typology of Decision-Making Tasks

Camelia D. Brumar, _Tufts University_  
Remco Chang, _Tufts University_

Designing visualizations for decision-making often requires structuring complex, multi-stage workflows that remain implicit during the design process. This hands-on tutorial introduces the Typology of Decision-Making Tasks for Visualization, a concise framework for modeling decision workflows using three composable tasks: choose, activate, and create. Participants will learn how to represent decision problems as structured node-link diagrams that make task hierarchy, information flow, and iteration explicit. Through guided small-group exercises, attendees will model a real-world decision-support scenario and then translate their task diagrams into visualization design sketches. The tutorial emphasizes the transition from structured problem definition to interface design, demonstrating how different decision tasks naturally inform interaction components, layout structure, and system logic. Designed for visualization researchers, designers, and practitioners at all experience levels, the tutorial combines conceptual foundations with collaborative exercises and discussion. Participants will leave with a practical methodology for externalizing decision problems and using them as blueprints for designing interactive decision-support visualizations.

## <a name="vad"></a> Visualization Analysis and Design

Tamara Munzner, _University of British Columbia_

This introductory tutorial will provide a broad foundation for thinking systematically about visualization systems, built around the idea that becoming familiar with analyzing existing systems is a good springboard for designing new ones. The major data types of concern in visual analytics, information visualization, and scientific visualization will all be covered: tables, networks, and sampled spatial data. This tutorial is focused on data and task abstractions, and the design choices for visual encoding and interaction; it will not cover algorithms. No background in computer science or visualization is assumed.
