---
layout: default
title: Blog
permalink: /blog/
---

# Blog

<ul class="post-list">
  {% for post in site.posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <div class="post-date">{{ post.date | date: "%B %-d, %Y" }}</div>
    {% if post.excerpt %}<div class="desc">{{ post.excerpt | strip_html | truncatewords: 30 }}</div>{% endif %}
  </li>
  {% endfor %}
</ul>
