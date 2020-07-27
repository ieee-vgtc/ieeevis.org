---
title: Blog
layout: blog-page
permalink: /blog
contact: web@ieeevis.org
---

{% for post in site.posts limit:3 %}
<h2>{{ post.title }}</h2>
<p class="tiny">{{ post.date | date: '%B %d, %Y' }}</p>
{% if post.image %}
<img src="{{ post.image }}" />
{% endif %}
<p>{{ post.url }}</p>
<div>{{ post.content }}</div>
<hr/>
{% endfor %}



