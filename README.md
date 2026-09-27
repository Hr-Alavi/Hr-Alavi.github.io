# Hamidreza Alavi: academic website

Live at <https://hr-alavi.github.io>. Built with Jekyll on GitHub Pages, starting from the Academic Pages template (see Credits). Every commit to `master` republishes the site within a minute or two.

## Editing the site

| To change | Edit |
|---|---|
| Biography and yearly highlights on the homepage | `_pages/about.md`, the Markdown below the front matter. Keep the `<!-- highlights -->` line between the biography and the highlights. |
| Homepage hero text, research interests, credentials, research-theme cards, photos | The front matter at the top of `_pages/about.md` (commented). The same `moments` photo list also feeds the `/gallery/` page. |
| Publications | One file per item in `_publications/`. `category` is `books`, `manuscripts`, `conferences` or `preprints`; optional `status: "Accepted"` or `"Under Review"`; `oaurl:` adds an "Open access" link (e.g. a repository copy); `note:` adds one line; books can set `cover:` (an image inside `/images/`) and `chapters:` (title, pages, DOI). BibTeX files live in `files/bibtex/`. |
| Research projects | `_portfolio/`: `short_title`, `subtitle`, `role`, `sponsor`, `period`, `start` / `end` (`YYYY-MM`, drives the Ongoing/Completed badge), `website`, and either `logo` (image) or `icon` (Font Awesome name). `home: false` keeps a project off the homepage. Smaller commissioned projects are listed in the front matter of `_pages/portfolio.html`. |
| Talks and media | `_talks/`. Optional `kind:` (`talk`, `lecture`, `seminar`, `press`, `tv`, `award`, `video`) overrides the automatic icon. Use the 1st of the month when only the month is known; it is then shown as month and year. |
| Teaching and supervision | `_teaching/` (one file per module); institutions, supervision and prospective-student topics are in the front matter of `_pages/teaching.html`. |
| Name, photo, profile links, email | `_config.yml`, under `author:` (`uri` / `uri_label` for the main staff profile, `extra_links` for further profiles). |
| CV page | `_pages/cv.md`; the publication, talk and teaching lists at the end are generated automatically. |
| Colours and fonts | The tokens at the top of `assets/css/site.css`. |

The homepage counts publications, books, projects, talks and modules automatically (papers under review and preprints are listed but not counted). Web-optimised copies of the photos live in `images/web/`; resize large photos (to roughly 300 KB or less) before adding them.

## Adding files for students

1. Upload the file to `files/revit/` on GitHub: open the folder, click **Add file → Upload files**, drag the file in and click **Commit changes**. Use short lowercase names without spaces (for example `week03-structural-model.zip`) and keep each file under 25 MB, the browser upload limit.
2. Link it from the Revit page, `_pages/student-revit.md` (or from `_pages/student-resources.md`):
   `- [Week 3 lab model (Revit 2025, ZIP)](/files/revit/week03-structural-model.zip)`
   The link must match the file name exactly, including capital letters.
3. Check <https://hr-alavi.github.io/student-resources/revit/> a minute or two later.

For files over 25 MB, attach them to a GitHub release (**Releases → Draft a new release**, up to 2 GB per file) and link to the file there. Everything in this repository is public.

## Tab icon

The browser-tab icon is `images/favicon.svg` (a digital-twin cube on the site's gradient), with `.ico` and `.png` copies in `images/` for older browsers and phones. After replacing the icon files, raise the `?v=` number in `_includes/head/custom.html` so browsers drop their cached copy.

## Preview locally (optional)

GitHub Pages builds the site on every commit, so this is only needed to preview changes first. With Ruby installed, run `bundle install` once, then `bundle exec jekyll serve` and open <http://localhost:4000>.

## Credits

Built on the [Academic Pages](https://github.com/academicpages/academicpages.github.io) template, which derives from the [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) Jekyll theme (© 2016 Michael Rose). Both are released under the MIT License; see `LICENSE`.
