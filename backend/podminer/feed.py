import requests


class FeedException(Exception):
    pass


class ShowDataException(Exception):
    pass




class TopShowsFeed:
    def __init__(self, country, genre, limit=100):
        self.country = country
        self.genre = genre
        self.api_url = f"https://itunes.apple.com/{country.country_code}/rss/topaudiopodcasts/limit={limit}/genre={genre.genre_id}/explicit=true/json"
        self.shows = None
        self.errors = []

    def fetch(self):
        response = requests.get(self.api_url)
        if (response.status_code) != 200:
            raise FeedException("Failed to fetch data from iTunes API")
        data = response.json()
        self.shows = data['feed']['entry']
        return self.get_data()

    def get_data(self):
        shows = []
        for (ranking, show) in enumerate(self.shows, start=1):
            try:
                shows.append(self.get_show_data(show, ranking))
            except ShowDataException as e:
                self.errors.append(e)

        return shows

    def get_show_data(self, show, ranking=None):
        try:
            podcast_id = int(show['id']['attributes']['im:id'])
        except:
            raise ShowDataException("Cannot process ID")

        description = show.get('summary', '')
        if description: description = show['summary']['label']

        url = show.get('link', '')
        if url: url = url['attributes']['href']

        slug = 'no-slug'
        url_chunks = url.split('/')
        if len(url_chunks) >= 2:
            slug = url_chunks[-2]

        name = show.get('title', '')
        if name: name = name['label'][:98]

        image_link = show.get("im:image", "")
        if image_link: image_link = image_link[-1]['label']

        publisher = show.get("im:artist", "")
        if publisher: publisher = publisher['label'][:98]

        releaseDate = show.get("im:releaseDate", "")
        if releaseDate: releaseDate = releaseDate['attributes']['label']

        return {
            'podcast_id': podcast_id,
            'name': name,
            'description': description,
            'url': url,
            'ranking': ranking,
            'image_link': image_link,
            'slug': slug,
            'publisher': publisher,
            'releaseDate': releaseDate
        }
