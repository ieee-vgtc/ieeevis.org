---
title: Technical Information for Recording your Talk
layout: page
sidebar: call-for-participation
permalink: /info/presenter-information/talk-recording-guide
active_nav: "Contribute"
contact: tech@ieeevis.org
---

Please **read the following instructions carefully** for guidelines
on preparing your video presentation for VIS 2020, or a VIS 2020 associated event.
If you're presenting a VIS full or short paper your talk is due with your camera ready submission
on **September 7, 2020**. Due dates for associated events may vary, please check with
your associated event for information.

Your talk submission consists of two pieces:

1. The video recording of your talk, following the encoding and naming conventions described below
2. A subtitles file containing captions for your talk, following the same naming convention as the video

Guidance for creating both and requirements for file encoding and naming are provided below.
Videos will be streamed live to Youtube during the conference, please make sure your video
does not contain copyrighted audio or video content.

## Presentation Length

- VIS Full Papers: the maximum length of your talk is **15 minutes**, including questions. We recommend a 12 minute talk with 3 minutes for questions,
- VIS Short Papers: the maximum length of your talk is **10 minutes**, including questions. We recommend a 7 minute talk with 3 minutes for questions.
- Associated Events: please consult your associated event for information.

## Encoding Your Video
Your presentation must be in the following format:

- 1920x1080 resolution at 30FPS.
- MPEG-4 using H.264 encoding (file extension is .mp4)
- VIS full & short papers: the maximum size for your video is 500MB.
  Associated event talk sizes and lengths may vary, please see your associated event for details
- To encode/re-encode your video in the right format, you can use the free software [Handbrake](https://handbrake.fr/)
- To check that your video is in the right format, you can use the free software [MediaInfo](https://mediaarea.net/en/MediaInfo)

To make full use of the 16x9 video aspect ratio we recommend using the 16x9 wide format Powerpoint template:
[Download the VIS 2020 Powerpoint template here](/year/2020/assets/vis2020-16x9.ppt).

## File Naming Convention
Your video file must be named following a `<shortname>_<uniqueidentifier>.mp4` convention.
The prefix is assigned based on the track or event your video is included in.
For the the short name prefix please find your event or track in the tables [below](#conference-track-and-associated-event-short-name-prefixes).
<!--https://docs.google.com/spreadsheets/d/1unVDXq4kqj0iZ_2d_TYU8a61NG65bg_dX6IU2jdOUJY/edit?usp=sharing-->
Your talk’s unique identifier is:

- VIS Papers: Your submission ID from PCS is your unique identifier
- Associated Events: Your event organizers will send information about the unique identifier

## Recording Your Talk

We recommend using [OBS Studio](https://obsproject.com/) to record your presentation, which is free and cross-platform.
If you are familiar with other recording software please feel free to use it instead.
Watch our tutorial on [Youtube](https://youtu.be/yg1P_Infw5A) or via [direct download](http://sci.utah.edu/~will/public/vis2020-recording-tutorial.mp4)
for a guide on how to use OBS Studio to record your talk,
should you choose to use it.
Please also see our [guide](/year/2020/assets/vis2020-talk-recording-guide.pdf)
for information on recording a compelling and high-quality talk.
We do not recommend using Powerpoint’s built in recording since the recording is done per-slide,
so if you speak during a slide transition **the audio will not be recorded**. These issues can be tough to catch and fix. 

After recording your talk, please rewatch it to ensure the video and audio are recorded correctly.

## Providing Subtitles with Your Video

Youtube can automatically generate captions for you, which you can download and include with your video.
The automatic captions can take some time to generate and may need some correction, so if you use the
automatic generation take this time into account before the deadline (allow at least a half day or more
to provide sufficient buffer). You can also use Youtube’s captioning tool to create the captions yourself.
If you use Youtube’s automatic captioning, be sure to check them for errors in their editor before downloading them.

After the captions have been created (automatically or by hand), you can download them by going to the
subtitles page when editing your video information in Youtube studio. You can then click the three dots
next to the subtitles you want to download and select download from the menu to download the sbv or srt file
containing your subtitles. Include this file with your video, following the same naming convention:
`<shortname>_<uniqueidentifier>.sbv/srt`. This process is also demonstrated in our
[talk recording tutorial](https://youtu.be/yg1P_Infw5A).

You can test your subtitles by playing your video in VLC with the sbv file in the same directory, so
that VLC will find it. Then right-click the VLC window and select the subtitle menu item to pick your
subtitles to play during your video. During the conference your video will be played using the
"small" subtitle size setting in VLC.

If you create the captions using a different software package, subtitles in the SRT format are also acceptable.


## Conference Track and Associated Event Short Name Prefixes

| **VIS Paper Tracks**                      | **Short Name Prefix** |
|--------------------------------------------|-----------------------|
| **VAST**                                   | f-vast                |
| **Info Vis**                               | f-info                |
| **SciVis**                                 | f-scivis              |
| **TVCG**                                   | f-tvcg                |
| **CG & A**                                 | f-cga                 |
| **Short Papers (VAST, Info Vis, SciVis)**  | s-short               |

| **Associated Events**                     | **Short Name Prefix** |
|-------------------------------------------|-----------------------|
| **VIS Arts Program**                      | a-arts                |
| **VisInPractice**                         | a-visinpractice       |
| **VizSec**                                | a-vizsec              |
| **VDS**                                   | a-vds                 |
| **VIS4DH**                                | a-vis4dh              |
| **VISxAI**                                | a-visxai              |
| **Large Data Analysis and Visualization** | a-ldav                |
| **BELIV**                                 | a-beliv               |
| **VAST Challenge**                        | a-vastchallenge       |
| **SciVis Contest**                        | a-sciviscontest       |
| **BioVis Challenge**                      | a-biovischallenge     |

| **Tutorials**                                                          | **Short Name Prefix**  |
|------------------------------------------------------------------------|------------------------|
| **Visualization Analysis and Design**                                  | t-analysisdesign       |
| **Color Basics for Creating Visualizations**                           | t-colorbasics          |
| **Scientific Visualization in Houdini**                                | t-scivishoudini        |
| **Topological Data Analysis Made Easy with the Topology Toolkit**      | t-ttk                  |
| **ParaView Tutorial**                                                  | t-paraview             |
| **Theory and Application of Visualization Color Tools and Strategies** | t-theorycolortools     |
| **How to Make Your Empirical Research Transparent**                    | t-empiricaltransparent |
| **Artifact Based Rendering: VR Visualization by Hand**                 | t-artifactvr           |

| **Workshops**                                      | **Short Name Prefix** |
|----------------------------------------------------|-----------------------|
| **Fail Fest**                                      | w-failfest            |
| **MLUI 2020**                                      | w-mlui                |
| **MoVis**                                          | w-movis               |
| **TREX**                                           | w-trex                |
| **VisActivities**                                  | w-activities          |
| **Visualization in Astrophysics**                  | w-astrophysics        |
| **VisComm**                                        | w-comm                |
| **Vis Futures**                                    | w-futures             |
| **VisGuides**                                      | w-guides              |
| **IEEE VIS Workshop on Visualization Psychology**  | w-psychology          | 

| **Application Spotlights**                                                                | **Short Name Prefix** |
|-------------------------------------------------------------------------------------------|-----------------------|
| **Challenges in the Visualization of Bioelectric Fields for Cardiac and Neural Research** | l-bio                 |
| **Recent Challenges in Medical Visualization**                                            | l-med                 |
| **Opportunities and Challenges in Cosmology Visualization**                               | l-cosmo               |
| **The Role of Visualization in Industrial Production**                                    | l-industrial          |

For questions or more information, please email tech@ieeevis.org.

Technical Committee

- Will Usher, SCI Institute, University of Utah
- Alexander Bock, Linköping University 
- Martin Falk, Linköping University 

