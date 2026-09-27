---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
eyebrow: "Curriculum Vitae"
intro: "Education, experience and skills, followed by full lists of publications, talks and teaching (generated from the rest of the site)."
redirect_from:
  - /resume
---

{% include base_path %}

You may also view my professional profile on [LinkedIn](https://www.linkedin.com/in/hamidreza-alavi-729b0416b/).

Education
======
* Ph.D. in Construction Engineering
* M.S. in Construction Engineering and Management
* M.Eng. in Project Engineering
* B.S. in Civil Engineering 

Work experience
======
* **Senior Lecturer in Construction Informatics**  
  * Oxford Brookes University, UK  
  * 2025 – Present  

* **Academic Affiliate**  
  * Department of Engineering, University of Cambridge, UK  
  * 2025 – Present  

* **Research and Teaching Associate**  
  * Department of Engineering, University of Cambridge, UK  
  * 2023 – 2025  
  * Curriculum development, teaching, and research on digital twins, BIM, AI, and decision-support systems  
  * Work Package Leader for digital twin development in large-scale European research projects  

* **Associate Professor**  
  * Universitat Politècnica de Catalunya (UPC), Barcelona, Spain  
  * 2022 – 2023  

* **Visiting Researcher**  
  * BIM TOPiCS Lab, Faculty of Applied Science  
  * University of British Columbia (UBC), Vancouver, Canada  
  * 2021 – 2022  

* **Project Manager (Digital Construction & Health Infrastructure)**  
  * Top Health Tech, Spain  
  * 2022 – 2023  

* **BIM Specialist**  
  * MK Building Construction, Canberra, Australia  
  * 2014 – 2017

Skills
======
* **Research & Methods**
  * Digital Twins, BIM, AI & Machine Learning
  * Data-driven decision support systems
  * Facility and asset management analytics
  * Point clouds, LiDAR, computer vision

* **Software & Programming**
  * Revit, Navisworks, Dynamo, Solibri, ReCap
  * Python for data analytics and automation
  * IFC-based workflows and interoperability

* **Teaching & Pedagogy**
  * Curriculum design and module leadership
  * Problem-Based Learning (PBL)
  * Digital and immersive learning (VR/AR)
  * Assessment design and examination

Publications
======

<ol class="cv-list">
{% assign cv_pubs = site.publications | sort: "date" | reverse %}{% for post in cv_pubs %}<li>{{ post.citation }} <a href="{{ base_path }}{{ post.url }}">Details</a></li>
{% endfor %}</ol>

Talks
======

<ol class="cv-list">
{% assign cv_talks = site.talks | sort: "date" | reverse %}{% for post in cv_talks %}<li><a href="{{ base_path }}{{ post.url }}"><strong>{{ post.title }}</strong></a>, {{ post.venue }}{% if post.location %}, {{ post.location }}{% endif %} ({{ post.date | date: "%b %Y" }}).</li>
{% endfor %}</ol>

Teaching
======

<ul class="cv-list">
{% assign cv_teaching = site.teaching | where_exp: "t", "t.venue" %}{% for post in cv_teaching reversed %}<li><a href="{{ base_path }}{{ post.url }}"><strong>{{ post.title }}</strong></a>, {{ post.type }}, {{ post.venue }}.</li>
{% endfor %}</ul>

Service and leadership
======
* Editorial Board Member, *Smart and Sustainable Built Environment* (Q1 journal)
* Guest Editor, *Buildings* (Special Issue on Net-Zero Energy Buildings)
* Reviewer for leading journals (Automation in Construction, Energy and Buildings, Building and Environment, etc.)
* Member, American Society of Civil Engineers (ASCE)
* Fellow of the Higher Education Academy (FHEA)
* Member, UK Engineering Professors’ Council (EPC)
* Session Chair and Scientific Committee Member for international conferences
* Supervision and examination of PhD, MSc, and BSc theses
