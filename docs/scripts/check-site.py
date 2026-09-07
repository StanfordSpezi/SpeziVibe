"""Check generated pages, local navigation, assets, and accessible references."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1] / 'build'


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.ids = []
        self.references = []
        self.links = []
        self.assets = []
        self.h1 = 0
        self.description = None
        self.title = ''
        self.in_title = False
        self.feed(file.read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for name in ('aria-labelledby', 'aria-describedby', 'for'):
            self.references.extend(attrs.get(name, '').split())
        if tag == 'h1':
            self.h1 += 1
        if tag == 'title':
            self.in_title = True
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = attrs.get('content')
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in ('img', 'script') and attrs.get('src'):
            self.assets.append(attrs['src'])
        if tag == 'img':
            assert 'alt' in attrs, 'Image is missing alt text'
        if tag == 'link' and attrs.get('rel') in ('icon', 'stylesheet', 'preload'):
            self.assets.append(attrs['href'])

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


pages = {file: Page(file) for file in ROOT.rglob('*.html')}
assert pages, 'Build the site before running this check'
errors = []
link_count = asset_count = 0
for file, page in pages.items():
    route = '/' + str(file.relative_to(ROOT)).removesuffix('index.html')
    for message, valid in (
        ('exactly one H1', page.h1 == 1),
        ('page title', bool(page.title.strip())),
        ('meta description', file.name == '404.html' or bool(page.description)),
        ('unique IDs', len(page.ids) == len(set(page.ids))),
        ('valid labels and descriptions', set(page.references).issubset(page.ids)),
    ):
        if not valid:
            errors.append(f'{route}: missing or invalid {message}')
    for url in page.links + page.assets:
        parsed = urlsplit(urljoin('https://spezivibe.com' + route, url))
        if parsed.scheme not in ('http', 'https') or parsed.netloc != 'spezivibe.com':
            continue
        target = ROOT / unquote(parsed.path).lstrip('/')
        if target.is_dir():
            target /= 'index.html'
        elif not target.exists():
            target = target.with_suffix('.html')
        if not target.exists():
            errors.append(f'{route}: missing target {url}')
        elif parsed.fragment and target in pages and unquote(parsed.fragment) not in pages[target].ids:
            errors.append(f'{route}: missing anchor {url}')
        if url in page.links:
            link_count += 1
        else:
            asset_count += 1

titles = Counter(page.title for page in pages.values())
errors.extend(f'Duplicate title: {title}' for title, count in titles.items() if count > 1)
assert not errors, '\n'.join(errors)
print(f'Site checks passed: {len(pages)} pages, {link_count} local links, {asset_count} local asset references; titles, descriptions, H1s, IDs, and accessible references.')
