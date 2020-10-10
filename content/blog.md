---
title: Blog
layout: blog-page
permalink: /blog/index
active_nav: Blog
contact: web@ieeevis.org
---

{% for post in site.posts limit:3 %}
<h1>{{ post.title }}</h1>
<div class="byline-container">
    {% if post.author_contact %}
    <p class="byline"><a href="mailto:{{ post.author_contact }}">{{ post.authors }}</a></p>
    {% else %}
    <p class="byline">{{ post.authors }}</p>
    {% endif %}
    <p class="post-date">{{ post.date | date: '%B %d, %Y' }}</p>
</div>
{% if post.image %}
<img src="{{ post.image }}" />
{% endif %}
<div>{{ post.content }}</div>
<hr/>
{% endfor %}



