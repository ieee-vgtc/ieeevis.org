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
When: TBA

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

### Speakers
TBA

### Schedule
TBA

***

## <a name="spot2"></a>Audio-Visual Analytics: Potential Applications of Combined Sonifications and Visualizations
When: TBA

### Organizers
Wolfgang Aigner, *Institute of CreativeMedia/Technologies, St. Poelten University of Applied Sciences, St. Poelten, Austria*
Michael Iber, *St. Pölten University of Applied Sciences, St. Pölten, Austria*
Kajetan Enge, *Institute of CreativeMedia/Technologies, St. Poelten University of Applied Sciences, St. Poelten, Austria*
Alexander Rind, *Institute of CreativeMedia/Technologies, St. Poelten University of Applied Sciences, St. Poelten, Austria*
Niklas Elmqvist, *College of Information Studies, University of Maryland, College Park, College Park, Maryland, United States*
Robert Höldrich, *Institute of Electronic Music and Acoustics, University of Music and Performing Arts Graz, Graz, Austria*
PhD Niklas Rönnberg, *Media and Information technology, Linköping University, Norrköping, Sweden*
Bruce N. Walker, *Georgia Institute of Technology , Atlanta, Georgia, United States*

Contact: [kajetan.enge@fhstp.ac.at](mailto:kajetan.enge@fhstp.ac.at))

### Summary
In this Application Spotlight, we will focus on audio-visual analytics and its (potential) applications. Visualization and sonification are two approaches for conveying data to humans based on complementary high-bandwidth information processing systems and both address the purpose of involving humans in data analysis. Although extensive research has been carried out both on the auditory and visual representation of data, comparatively little is known about their systematic and complementary combination for data analysis. Existing research on combinations has often focused only on one of the modalities. However, there are potentially powerful synergies in combining both modalities to address the individual limitations of each one. Inspired by existing applications such as the Doppler ultrasound device, we will discuss the potential of audio-visual analysis tools. We will have 2-3 invited talks and an open discussion with the audience. With this Application Spotlight our goal is to build and strengthen a community of members from the sonification and the visualization communities that are interested in combining the two modalities. We believe that in the long term, establishing bridges between the communities will have a positive impact on both disciplines separately as well as on multi-modal data analysis methods.

### Speakers
TBA

### Schedule
TBA
 	
***

## <a name="spot3"></a>Application Papers: How should we deal with them?
When: TBA

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
 	
