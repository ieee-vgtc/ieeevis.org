---
title: Application Spotlights
layout: page
permalink: /info/spotlights
contact: spotlights@ieeevis.org
---

# Accepted Application Spotlights
Below you will find the list of the accepted Spotlights. If you have any questions about any of the spotlight sessions, please contact the organizers listed below directly.
* [Data Analysis Methods for Climate Modeling of Extreme Weather Events](#spot1)
* [Audio-Visual Analytics: Potential Applications of Combined Sonifications and Visualizations](#spot2)
* [Application Papers: How should we deal with them?](#spot3)
<hr/>

## <a name="spot1"></a>Data Analysis Methods for Climate Modeling of Extreme Weather Events
When: Friday, October 21, 2022 - 9:00 AM-10:15 AM CDT (UTC-5)

### Organizers

Divya Banesh, *Los Alamos National Laboratory, United States*
James Benedict, *Los Alamos National Laboratory, United States*
Rupsa Bhowmick, *Los Alamos National Laboratory, United States*
Ayan Biswas, *Los Alamos National Laboratory, United States*
Soumya Dutta, *Los Alamos National Laboratory, United States*
Michael Grosskopf, *Los Alamos National Laboratory, United States*

Contact: [dbanesh@lanl.gov](mailto:dbanesh@lanl.gov)

### Summary

The Energy Exascale Earth System Model (E3SM) is a global weather and climate model that couples independent components for atmosphere, ocean, rivers, land surface, sea ice and land ice. The model is being leveraged to address scientific queries related to water availability, carbon cycling and its influence on energy decisions, and cryospheric systems and their contribution to sea-level rise and coastal impacts. E3SM is targeted to run on emerging exascale computing facilities at very high spatio-temporal resolutions. Scientific investigations of relevance require in situ analysis to accurately answer these science questions and to visualize simulation outputs. A minimum resolution in space and time would require roughly 18 GB of memory per snapshot of the atmospheric state. At one snapshot every six hours, a typical simulation run over 100 years would result in approximately 2.6 petabytes of data. Saving this data to disk for post hoc analysis is prohibitive, thus in situ statistics are computed during model integration to facilitate assessment of climate features and extreme weather.

In this session, we discuss various methods for the analysis and visualization of E3SM climate data. Our applications broadly focus on planetary scale modes of climate variability and their influence on extreme weather events. First, we will briefly introduce the E3SM simulation, its components, and the background for our domain-specific problems. Then, we will discuss a Julia-based in situ analysis pathway we have developed so that a wide range of in situ climate analyses and visualization can be done with minimal programming overhead. Next, we present an application of this in situ pathway through a technique for in situ detection of an extreme weather event called sudden stratospheric warming (SSW). We discuss how SSW-guided in situ extreme-value distribution models can be used to study the impacts of SSW on surface temperatures. To perform sophisticated spatial analysis on climate data variables, streaming temporal modeling capabilities are necessary to account for smooth spatial variation on large-scale distributed spatial fields. In this regard, we will present capabilities for sparse, distributed Gaussian process modeling in Julia for in situ spatial inference. In a follow-up application, algorithms for tracking tropical cyclones will be presented to highlight changes in the probability of extreme precipitation events as mediated by tropical cyclones and equatorial climate modes of variability. Finally, a fourth technique will be discussed that explores the utilization of machine learning models for Bayesian parameter estimation to fix Gaussian models to E3SM data. Such a method allows for in situ data reduction of large climate models into a more manageable size for analysis and visualization.

### Schedule
1. In-Situ Inference for E3SM Climate Model: Ayan Biswas
2. Earth System Simulation using E3SM: James Benedict
3. Efficient Predictive Analytics of Extreme Weather Events via In Situ Data Modeling: Soumya Dutta
4. Distributed Gaussian Processes for Climate Modeling: Mike Grosskopf
5. Cyclone analysis: Rupsa Bhowmick
6. Neural Networks for Data Regression in Climate Data: Divya Banesh
7. Q&A

### Speakers
**Ayan Biswas** is a scientist in the Data Science at Scale team (CCS-3) at Los Alamos National Laboratory. His research interests include exascale data analysis and reduction, in situ workflows, uncertainty quantification, statistical analysis and high-dimensional data visualization. He also has vast experience in working with vector fields and information theory applications for visualization and analysis. He received his PhD in Data Visualization from The Ohio State University in 2016. Contact Ayan at ayan@lanl.gov

**James Benedict** joined LANL in 2020 as a staff scientist to assist in development, evaluation, and applications of the DOE’s Energy Exascale Earth System Model (E3SM).  Jim received his Ph.D. in atmospheric science from Colorado State University, focusing on a multiscale climate modeling approach aimed at improving the representation of moist (cumulus) convection.  He has since broadened his scope in investigations spanning tropical and midlatitude weather extremes to tropical cyclones to climate change using both observations and several global climate models.  Contact Jim at benedict@lanl.gov.

**Soumya Dutta** is a staff scientist in the Information Sciences group (CCS-3) at Los Alamos National Laboratory (LANL). Before that, Soumya was a postdoctoral researcher in the Applied Computer Sciences group (CCS-7) at LANL from June 2018 - July 2019. Soumya obtained his Ph.D. degree in Computer Science and Engineering, with a focus on Visualization and Computer Graphics, from the Ohio State University in May 2018. His current research interests include big data science & visualization, statistical techniques for big data, in situ analysis, machine learning for visual computing, and high performance visualization. Contact Soumya at soumya.cvpr@gmail.com.

**Mike Grosskopf** is a staff scientist in the Statistical Sciences group (CCS-6) at Los Alamos National Laboratory (LANL). Before that, he was a research engineer in laboratory astrophysics for the Center for Radiative Shock Hydrodynamics at the University of Michigan until 2013 and obtained his Ph.D. in Statistics from Simon Fraser University in December 2017. His current research interests include uncertainty quantification, machine learning interpretability for science applications, in situ analysis, and Bayesian optimization. Contact Mike at mikegros@lanl.gov.

**Rupsa Bhowmick** is a postdoctoral research associate at the Los Alamos National Lab from 2020. She completed her Ph.D. from Louisiana State University focusing Southwest Pacific Tropical Cyclone Frequency and Intensity Related to Observed and Modeled Geophysical and Aerosol Variables. Currently her work focuses on hurricane feature detection using novel detection techniques, understanding their climatology, extreme precipitation analysis and building probabilistic models for extreme events related phenomena. Contact Rupsa at ruplanl9@lanl.gov.

**Divya Banesh** (CCS-3) is a staff scientist in the Data Science at Scale Team, part of the Information Sciences group (CCS-3). Divya received her B.S. in Electrical Engineering and Computer Science from the University of California, Berkeley, and her Ph.D. in Computer Science from the University of California, Davis. She joined LANL as a summer student in 2015, eventually moving into a postdoctoral research appointment. Her interests are in feature identification and analysis in computer vision, image processing, topological data analysis, and machine learning.

***

## <a name="spot2"></a>Audio-Visual Analytics: Potential Applications of Combined Sonifications and Visualizations
When: Thursday, October 20, 2022 - 10:45 AM-12:00 PM CDT (UTC-5)

### Organizers
Wolfgang Aigner, *Institute of Creative\\Media/Technologies, St. Poelten University of Applied Sciences, St. Poelten, Austria*
Michael Iber, *St. Pölten University of Applied Sciences, St. Pölten, Austria*
Kajetan Enge, *Institute of Creative\\Media/Technologies, St. Poelten University of Applied Sciences, St. Poelten, Austria*
Alexander Rind, *Institute of Creative\\Media/Technologies, St. Poelten University of Applied Sciences, St. Poelten, Austria*
Niklas Elmqvist, *College of Information Studies, University of Maryland, College Park, College Park, Maryland, United States*
Robert Höldrich, *Institute of Electronic Music and Acoustics, University of Music and Performing Arts Graz, Graz, Austria*
PhD Niklas Rönnberg, *Media and Information technology, Linköping University, Norrköping, Sweden*
Bruce N. Walker, *Georgia Institute of Technology , Atlanta, Georgia, United States*

Contact: [kajetan.enge@fhstp.ac.at](mailto:kajetan.enge@fhstp.ac.at)

### Summary
In this Application Spotlight, we will focus on audio-visual analytics and its (potential) applications. Visualization and sonification are two approaches for conveying data to humans based on complementary high-bandwidth information processing systems and both address the purpose of involving humans in data analysis. Although extensive research has been carried out both on the auditory and visual representation of data, comparatively little is known about their systematic and complementary combination for data analysis. Existing research on combinations has often focused only on one of the modalities. However, there are potentially powerful synergies in combining both modalities to address the individual limitations of each one. 

Inspired by existing applications such as in health promotion and rehabilitation and solutions such as the Highcharts Sonification Studio, we will discuss the potential of audio-visual analysis tools.
We will have 3 invited talks and an open discussion with the audience.
With this Application Spotlight our goal is to build and strengthen a community of members from the sonification and the visualization communities that are interested in combining the two modalities. We believe that in the long term, establishing bridges between the communities will have a positive impact on both disciplines separately as well as on multi-modal data analysis methods.

### Schedule
1. Opening: Kajetan Enge, Wolfgang Aigner
2. Highcharts Sonification Studio: Overview and demo : Øystein Moseng, Bruce N. Walker
3. Mapping and Interdisciplinary ground: the Data Sonification Archive: Sara Lenzi, Paolo Ciuccarelli
4. Real time sonification to support motor learning in health promotion and rehabilitation: Victor-Adriel de-Jesus-Oliveira
5. Panel Q&A and Closing

### Speakers
**Kajetan Enge** is a junior researcher at the St. Pölten University of Applied Sciences in Austria and a doctoral student at the University of Music and Performing Arts Graz. He conducts basic research on the combination of sonification and visualization for exploratory data analysis and is the leading organizer of the AVAC, the Audio-Visual Analytics Community.

**Øystein Moseng** is the Head of Accessibility at Highsoft, the company behind the leading data visualization technology Highcharts. He started computer programming at the young age of 8, and has since worked with companies across different sectors, including laboratory technology, medical equipment, and consumer products. In later years, he has led the accessibility research and development efforts of Highcharts products, going beyond compliance to focus on advancing the field of data visualization accessibility.

**Bruce Walker**’s Sonification Lab studies human-computer interaction (HCI) in non-traditional interfaces, such as mobile devices, cockpits, vehicle displays, and multimodal interfaces in education. Particular interests include sonification and auditory displays, which are highly useful for persons living with vision impairment. This has led to decades of work on assistive technology, especially for education. Dr. Walker is passionate about making schools and educational materials more accessible for all learners. Professor Walker teaches HCI, Research Methods, Sensation & Perception, and Assistive Technology. He has over 250 publications, and has worked on projects for NASA, state and federal governments, the military, and private companies.

**Sara Lenzi** is a Post-doc Researcher at the Critical Alarms Lab, Faculty of Industrial Design Engineering, TU Delft. A trained classical musician, she holds a MA in Philosophy of Science. After a decade in the sound design industry, she pursued a PhD in Design at Politecnico di Milano. Her research focuses on the use of sound to represent and describe complex phenomena. She is particularly active in the current debate on a designerly approach to data sonification and on the formalisation of shared tools and methods for sound design.

**Paolo Ciuccarelli** is professor of Design at Northeastern University, where he founded and directs the Center for Design. He is member of the board in the Interdisciplinary Design and Media PhD program at the College of Arts, Media and Design and affiliated member of Harvard MetaLab and the Roux Institute at Northeastern. His research focuses on design-driven data transformations across different languages and modalities, to address non-expert stakeholders especially. Paolo is currently co-editor of Big Data & Society (SAGE) and chaired the Communication Design program at Politecnico di Milano, where he also founded and directed the DensityDesign Research Lab from 2010 to 2019.

**Victor-Adriel de-Jesus-Oliveira** is a human-computer interaction researcher and lecturer at St. Poelten University of Applied Sciences. He also holds an MSc and a PhD in Computer Science from the Federal University of Rio Grande do Sul, where he worked on his thesis on haptic interfaces and their application to computer-mediated tactile communication. Victor works mainly in the field of Human-Computer Interaction, especially in UX Design, Quantitative UX Research, and Data Visualization, Sonification, and Haptization.
 	
***

## <a name="spot3"></a>Application Papers: How should we deal with them?
When: Wednesday, October 19, 2022 - 2:00 PM-3:15 PM CDT (UTC-5)

### Organizers

Christina Gillmann, *Leipzig University, Leipzig, Germany*
Daniel Wiegreffe, *Leipzig University, Leipzig, Germany*
Dr. Johanna Schmidt, *VRVis Zentrum für Virtual Reality und Visualisierung Forschungs-GmbH, Vienna, Austria*

Contact: [gillmann@informatik.uni-leipzig.de](mailto:gillmann@informatik.uni-leipzig.de)

### Summary
Applications build a driving force in visualization research and trigger basic research questions in the visualization community. Therefore, application papers are one of the 6 official new areas defined for the visualization community area model. According to the area model, this area allows different styles of application-driven manuscripts. Still, this leaves massive room for interpretation what exactly needs to be covered in an application paper and how the quality of such a paper can be measured in a standardized manner. In addition, there exist a gap between generalized application papers and specific use case solutions that require specific domain knowledge in the respective application area.

This application spotlight is intended to shed light on this question and build a basic to formulate requirements and quality measures for these types of papers further. To achieve this, we aim to give a general introduction to application papers and what is defined for their review process to far. Next, we aim to invite three speakers that are known to publish mainly in the application area model and let them formulate their point of view of what applications papers are and how they can be judged. At last, we aim to have an open discussion with the audience to collect further opinions on application papers and their review process.

The goal of this application spotlight is to create a more systematic guideline for reviewing and judging application papers that eases the creation of these papers as well as their review process.

### Speakers
TBA

### Schedule
TBA
 	
