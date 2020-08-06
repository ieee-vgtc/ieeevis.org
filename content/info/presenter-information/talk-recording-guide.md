---
title: Technical Information for Recording your Talk
layout: page
sidebar: call-for-participation
permalink: /info/presenter-information/talk-recording-guide
active_nav: "Contribute"
contact: tech@ieeevis.org
---

Please **read the following instructions carefully** for guidelines
on preparing your video presentation for VIS 2020, or a VIS 2020 co-located event.
If you’re presenting at VIS 2020, your talk is due with your camera ready submission
on **September 7, 2020**. Due dates for co-located events may vary, please check with
your co-located event.

Your talk submission consists of two pieces:

1. The video recording of your talk, following the encoding and naming conventions described below
2. A subtitles file containing captions for your talk, following the same naming convention as the video

Guidance for creating both and requirements for file encoding and naming are provided below.
Videos will be streamed live to Youtube during the conference, please make sure your video
does not contain copyrighted audio or video content.

## Encoding Your Video
Your presentation must be in the following format:

- 1920x1080 resolution at 30FPS
- MPEG-4 using H.264 encoding (file extension is .mp4)
- VIS full & short papers: the maximum size for your video is 500MB.
  Co-located event talk sizes and lengths may vary, please see your co-located event for details
- To encode/re-encode your video in the right format, you can use the free software [Handbrake](https://handbrake.fr/)
- To check that your video is in the right format, you can use the free software [MediaInfo](https://mediaarea.net/en/MediaInfo)


<style>
td.header {
    background-color: #fde5cc;
}
td.left {
    font-weight: bold;
    vertical-align: top;
}
</style>

## File Naming Convention
Your video file must be named following a `<shortname>_<uniqueidentifier>.mp4` convention.
The prefix is assigned based on the track or event your video is included in.
For the the short name prefix please find your event or track in the tables [below](#conference-track-and-colocated-event-short-name-prefixes).
<!--https://docs.google.com/spreadsheets/d/1unVDXq4kqj0iZ_2d_TYU8a61NG65bg_dX6IU2jdOUJY/edit?usp=sharing-->
Your talk’s unique identifier is:

- VIS Papers: Your submission ID from PCS is your unique identifier
- Colocated Events: Your event organizers will send information about the unique identifier


## Recording Your Talk

We recommend using [OBS Studio](https://obsproject.com/) to record your presentation, which is free and cross-platform.
If you are familiar with other recording software please feel free to use it instead.
See our [tutorial](https://youtu.be/yg1P_Infw5A) for a guide on how to use OBS Studio to record your talk,
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


## Conference Track and Colocated Event Short Name Prefixes

<table>
<thead align="center">
<td class="header"><b>VIS Full Papers Tracks</b></td>
<td class="header"><b>Short Name Prefix</b></td></thead>
<tbody>
<tr><td class="left">VAST</td><td>f-vast</td></tr>
<tr><td class="left">Info Vis</td><td>f-info</td></tr>
<tr><td class="left">SciVis</td><td>f-scivis</td></tr>
</tbody>
</table>

<table>
<thead align="center">
<td class="header"><b>VIS Short Papers Tracks</b></td>
<td class="header"><b>Short Name Prefix</b></td></thead>
<tbody>
<tr><td class="left">VAST</td><td>s-vast</td></tr>
<tr><td class="left">Info Vis</td><td>s-info</td></tr>
<tr><td class="left">SciVis</td><td>s-scivis</td></tr>
</tbody>
</table>

<table>
<thead align="center">
<td class="header"><b>Colocated Events</b></td>
<td class="header"><b>Short Name Prefix</b></td></thead>
<tbody>
<tr><td class="left">VIS Arts Program</td><td>a-arts</td></tr>
<tr><td class="left">VisInPractice</td><td>a-visinpractice</td></tr>
<tr><td class="left">VizSec</td><td>a-vizsec</td></tr>
<tr><td class="left">VDS</td><td>a-vds</td></tr>
<tr><td class="left">VIS4DH</td><td>a-vis4dh</td></tr>
<tr><td class="left">VISxAI</td><td>a-visxai</td></tr>
<tr><td class="left">Large</td><td>Data Analysis and Visualization	a-ldav</td></tr>
<tr><td class="left">BELIV</td><td>a-beliv</td></tr>
<tr><td class="left">VAST Challenge</td><td>a-vastchallenge</td></tr>
<tr><td class="left">SciVis Contest</td><td>a-sciviscontest</td></tr>
<tr><td class="left">BioVis Challenge</td><td>a-biovischallenge</td></tr>
</tbody>
</table>

<table>
<thead align="center">
<td class="header"><b>Tutorials</b></td>
<td class="header"><b>Short Name Prefix</b></td></thead>
<tbody>
<tr><td class="left">Visualization Analysis and Design</td><td>t-analysisdesign</td></tr>
<tr><td class="left">Color Basics for Creating Visualizations</td><td>t-colorbasics</td></tr>
<tr><td class="left">Scientific Visualization in Houdini</td><td>t-scivishoudini</td></tr>
<tr><td class="left">Topological Data Analysis Made Easy with the Topology Toolkit</td><td>t-ttk</td></tr>
<tr><td class="left">ParaView Tutorial</td><td>t-paraview</td></tr>
<tr><td class="left">Theory and Application of Visualization Color Tools and Strategies</td><td>t-theorycolortools</td></tr>
<tr><td class="left">How to Make Your Empirical Research Transparent</td><td>t-empiricaltransparent</td></tr>
<tr><td class="left">Artifact Based Rendering: VR Visualization by Hand</td><td>t-artifactvr</td></tr>
</tbody>
</table>

<table>
<thead align="center">
<td class="header"><b>Workshops</b></td>
<td class="header"><b>Short Name Prefix</b></td></thead>
<tbody>
<tr><td class="left">Fail Fest</td><td>w-failfest</td></tr>
<tr><td class="left">MLUI 2020</td><td>w-mlui</td></tr>
<tr><td class="left">MoVis</td><td>w-movis</td></tr>
<tr><td class="left">TREX</td><td>w-trex</td></tr>
<tr><td class="left">VisActivities</td><td>w-activities</td></tr>
<tr><td class="left">Visualization in Astrophysics</td><td>w-astrophysics</td></tr>
<tr><td class="left">VisComm</td><td>w-comm</td></tr>
<tr><td class="left">Vis Futures</td><td>w-futures</td></tr>
<tr><td class="left">VisGuides</td><td>w-guides</td></tr>
<tr><td class="left">IEEE VIS Workshop on Visualization Psychology</td><td>w-psychology</td></tr>
</tbody>
</table>

For questions or more information, please email tech@ieeevis.org.

Technical Committee

- Will Usher, SCI Institute, University of Utah
- Alexander Bock, Linköping University 
- Martin Falk, Linköping University 

