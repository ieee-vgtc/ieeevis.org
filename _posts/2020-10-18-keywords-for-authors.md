---
title: Keywords and their Role in the Reviewing Process (for Authors)
description: And article about keywords and their role in the reviewing process
layout: blog-page
active_nav: Blog
authors: The reVISe Committee
corresponding: Petra Isenberg
author_contact: revise@ieeevis.org
permalink: /blog/keywords-for-authors
---

Hello VIS community,

Keyword selection has been a familiar fixture in the submission and review processes of IEEE VIS for decades. The primary use of keywords in the current PCS system is to create a “match score” between a paper and a potential reviewer. Such match scores are displayed in several stages during the review processes. For example, during the phase for program committee (PC) members to bid on papers, PC members can sort papers in the pool according to the match scores computed based on their individual expertise. When a PC member is looking for reviewers for a specific paper, match scores are automatically computed for the potential reviewers. The algorithm for allocating papers to PC members can be configured with different weighting of bidding information and match scores. Currently, the recommendation is to rely on the bidding information only. The VIS papers co-chairs often compute, visualize, and analyze the distribution of papers in relation to keywords. In the coming year, such information will be extremely useful to the Area Curation Committee (ACC) that reviews the VIS area model and the keyword set regularly.

One major task undertaken by the reVISe committee was to define a new set of keywords as part of the unification of the three conferences. In IEEE VIS 2020, [this new set of keywords](http://ieeevis.org/year/2020/info/call-participation/paper-keywords#keywords) was deployed in the submission and review processes for several tracks including the full paper tracks of VAST, InfoVis, and SciVis, ahead of their unification in VIS 2021. The purpose of this blog post (Part 1) is to explain how the keywords matter to paper authors and to offer a little help in choosing keywords. This will be followed by a second blog post ([Part 2]({% post_url 2020-10-18-keywords-for-pc-members %})) where we explain how the keywords matter to PC members.

<!--more-->

## Part 1: Keywords for Paper Authors

If you are the author of a paper, short or long, sent to IEEE VIS you will have to choose keywords for your submission inside the paper submission system (PCS) where the page looks like this:

![]({{ 'assets/posts/pcs-keywords.jpg' | relative_url }})

You might wonder whether it is possible to tick “wrong” boxes and how doing so would affect your paper. In this blog post we explain in a little more detail what the effect of ticking keyword boxes are in practice. In short: t**he main purpose of keywords is to make sure that your paper gets the best possible reviewers**. But how? Let’s first take a step back and talk a little about a typical reviewing process.

### Background: what are PC members and what is bidding?

Generally at VIS each paper gets assigned two reviewers from a pre-selected list. People on this list who have shown expertise in Visualization/Visual Analytics and past reviewing skills and have agreed to review and supervise reviewing of a certain number of papers in a given year. This list of people is called the **program committee, or PC** for short. Each paper currently gets two PC members assigned. It is important that these PC members are excited to review your paper and have expertise on the topic of the paper because they will each have to find one additional reviewer outside of the program committee, called the **external reviewer**.

#### Ok, so what does this have to do with my keywords?

As you read above, it is important that your paper gets PC members that are a good fit for your paper. One mechanism that ensures this fit is called **bidding**. Think of bidding as a self-declaration of PC members about which papers they would like to review. PC members see an abstract, title, and keywords for each paper submitted to the conference and need to select if they “want” to, are “willing” to or “reluctant” to review each paper from the list.

When PC members bid on papers they go through an interface that looks like this:

![]({{ 'assets/posts/pcs-bidding.jpg' | relative_url }})

In the bid column on the left they give their bid for a paper. The second column is called “score”, this is a matching score calculated **based on the keywords** you selected for your paper and the expertise each PC member declared for the keywords you selected (details about the expertise selection will be the subject of another blog post). The score here is 0.83 which is pretty high. Next are the other information authors will see about your paper: title,  they keywords you selected, and the abstract you entered.

PC members have a large number of papers to go through in the interface above and they often sort by the score column to get papers that best match their expertise or they use the search field to search for keywords. In the future there will also be features that allow PC members to filter by keywords they rated themselves highly on.

So the purpose of selecting keywords as a paper author is to get your paper rated highly for the right kind of people so that they will see your paper in their list and will declare it as a paper they want to or are willing to review.

### Keyword Selection Strategies for Authors

So what can you do to get rated highly for the right PC members? It’s rather simple, select those keywords that describe **an expertise** that you wish your reviewers to have. In contrast to many other keyword selection exercises you **do NOT select keywords to describe the content of your paper**. Focus on reviewing expertise you would like to have.

For example, let’s take one of the highest cited paper of recent years:

> [D3: Data-Driven Documents](http://vis.stanford.edu/files/2011-D3-InfoVis.pdf)
  Michael Bostock, Vadim Ogievetsky, Jeffrey Heer
  IEEE Trans. Visualization & Comp. Graphics (Proc. InfoVis), 2011

This paper could benefit from reviewers with expertise in building visualization toolkits and libraries and people and building of concrete implementations. So for this paper we would primarily select keywords: "**Software Architecture, Toolkit/Library, Language**" and "**Software Prototype**". Now any PC member who rated themselves expert on these keywords would see the paper pop up higher in their list.

We wouldn’t select some other keywords that would describe the content of the paper because they don’t describe the reviewing expertise that would be important for the paper: For example “Computational Benchmark Studies”. The paper includes such a study but it is not the main contribution and we’d rather have reviewers with expertise on the software design.

### What are the “Other” keywords and the textfields for in the keyword selection interface?

With the move of the whole conference to the new unified model there is now a process in place for updating keywords. There is a new committee called the _Area Curation Committee_ (ACC) that every year will do an analysis of how keywords are used. They will look at whether certain keywords are too broad (too many papers select it), underused, and which keywords may be missing.

When you select “Other Data”, “Other Application Area”, “Other Contribution”, or “Other Topics and Techniques”  you are encouraged to provide Missing Keywords in text fields just below the main list of keywords. The ACC will look at all suggestions for missing keywords and if they are sufficiently frequent will propose an update to the keyword list in the future. In addition, the ACC will look at feedback provided in the text field “feedback on the list of keywords” in order to suggest improvements for the future.


### FAQ


#### What is the worst thing I can do?

There are three things you can do wrong:

1. Select no keyword at all. If you do this your paper will always have a match score of -1 and will be at the bottom of the list for every PC member.
2. Select only one or multiple of “datatype agnostic”, “domain agnostic”, “other contribution”, or “other topic”. PC members cannot rate themselves on these keywords and hence the result will be the same as if you selected no keyword at all
3. Select many (>5) or even all keywords. Doing this will ensure that you have a matching score but the score will be rather low for every PC member making your paper reside somewhere at the bottom of the bidding list.

#### What happens if nobody bids on my paper?

This can happen but it is rather rare. If it did happen then the paper chairs will ensure that your paper is assigned appropriate PC members.

#### What else can I do so people bid on my paper?

Besides selecting appropriate keywords there are a few things you can do to make sure that your paper is bid on: 1) have a descriptive title, 2) write a good abstract that is not too long and describes in the first sentences what the paper is about. Imagine a PC member reading 100+ abstracts during bidding - they will want to know foremost a) what the paper is about and b) why they should care about your paper. Make sure to say this concisely and clearly.

#### What is the relationship between keywords and areas?

There is no formal mapping between keywords and areas. Your selection of keywords is not restricted by the area you chose for your paper. The keywords you chose don’t affect the areas you can choose from.
