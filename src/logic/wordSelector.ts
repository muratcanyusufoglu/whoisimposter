import { WordList } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// STATIC WORD LIST IMPORTS
// All word lists are pre-imported so Metro can bundle them (offline-first).
// Dynamic require() paths with variables are not reliably bundled by Metro.
// ─────────────────────────────────────────────────────────────────────────────

type WordListMap = Record<string, WordList>

const EN_LISTS: WordListMap = {
  food:        require('@/data/words/en/food.json') as WordList,
  animals:     require('@/data/words/en/animals.json') as WordList,
  sports:      require('@/data/words/en/sports.json') as WordList,
  jobs:        require('@/data/words/en/jobs.json') as WordList,
  countries:   require('@/data/words/en/countries.json') as WordList,
  'movies-tv': require('@/data/words/en/movies-tv.json') as WordList,
  music:       require('@/data/words/en/music.json') as WordList,
  objects:     require('@/data/words/en/objects.json') as WordList,
  'party-life': require('@/data/words/en/party-life.json') as WordList,
  nature:      require('@/data/words/en/nature.json') as WordList,
  hobbies:     require('@/data/words/en/hobbies.json') as WordList,
  famous:      require('@/data/words/en/famous.json') as WordList,
  brands:      require('@/data/words/en/brands.json') as WordList,
  education:   require('@/data/words/en/education.json') as WordList,
  technology:  require('@/data/words/en/technology.json') as WordList,
  mythology:   require('@/data/words/en/mythology.json') as WordList,
  spicy:       require('@/data/words/en/spicy.json') as WordList,
  'tv-series': require('@/data/words/en/tv-series.json') as WordList,
  social:      require('@/data/words/en/social.json') as WordList,
  'internet-culture': require('@/data/words/en/internet-culture.json') as WordList,
  places:      require('@/data/words/en/places.json') as WordList,
  vehicles:    require('@/data/words/en/vehicles.json') as WordList,
  science:     require('@/data/words/en/science.json') as WordList,
  scientists:  require('@/data/words/en/scientists.json') as WordList,
  ancient:     require('@/data/words/en/ancient.json') as WordList,
  flowers:     require('@/data/words/en/flowers.json') as WordList,
  superheroes: require('@/data/words/en/superheroes.json') as WordList,
  'video-games': require('@/data/words/en/video-games.json') as WordList,
  drinks:      require('@/data/words/en/drinks.json') as WordList,
  disney:      require('@/data/words/en/disney.json') as WordList,
  fashion:     require('@/data/words/en/fashion.json') as WordList,
  olympics:    require('@/data/words/en/olympics.json') as WordList,
}

const TR_LISTS: WordListMap = {
  food:        require('@/data/words/tr/food.json') as WordList,
  animals:     require('@/data/words/tr/animals.json') as WordList,
  sports:      require('@/data/words/tr/sports.json') as WordList,
  jobs:        require('@/data/words/tr/jobs.json') as WordList,
  countries:   require('@/data/words/tr/countries.json') as WordList,
  'movies-tv': require('@/data/words/tr/movies-tv.json') as WordList,
  music:       require('@/data/words/tr/music.json') as WordList,
  objects:     require('@/data/words/tr/objects.json') as WordList,
  'party-life': require('@/data/words/tr/party-life.json') as WordList,
  nature:      require('@/data/words/tr/nature.json') as WordList,
  hobbies:     require('@/data/words/tr/hobbies.json') as WordList,
  famous:      require('@/data/words/tr/famous.json') as WordList,
  brands:      require('@/data/words/tr/brands.json') as WordList,
  education:   require('@/data/words/tr/education.json') as WordList,
  technology:  require('@/data/words/tr/technology.json') as WordList,
  mythology:   require('@/data/words/tr/mythology.json') as WordList,
  spicy:       require('@/data/words/tr/spicy.json') as WordList,
  'tv-series': require('@/data/words/tr/tv-series.json') as WordList,
  social:      require('@/data/words/tr/social.json') as WordList,
  'internet-culture': require('@/data/words/tr/internet-culture.json') as WordList,
  places:      require('@/data/words/tr/places.json') as WordList,
  vehicles:    require('@/data/words/tr/vehicles.json') as WordList,
  science:     require('@/data/words/tr/science.json') as WordList,
  scientists:  require('@/data/words/tr/scientists.json') as WordList,
  ancient:     require('@/data/words/tr/ancient.json') as WordList,
  flowers:     require('@/data/words/tr/flowers.json') as WordList,
  superheroes: require('@/data/words/tr/superheroes.json') as WordList,
  'video-games': require('@/data/words/tr/video-games.json') as WordList,
  drinks:      require('@/data/words/tr/drinks.json') as WordList,
  disney:      require('@/data/words/tr/disney.json') as WordList,
  fashion:     require('@/data/words/tr/fashion.json') as WordList,
  olympics:    require('@/data/words/tr/olympics.json') as WordList,
}

const DE_LISTS: WordListMap = {
  food:        require('@/data/words/de/food.json') as WordList,
  animals:     require('@/data/words/de/animals.json') as WordList,
  sports:      require('@/data/words/de/sports.json') as WordList,
  jobs:        require('@/data/words/de/jobs.json') as WordList,
  countries:   require('@/data/words/de/countries.json') as WordList,
  'movies-tv': require('@/data/words/de/movies-tv.json') as WordList,
  music:       require('@/data/words/de/music.json') as WordList,
  objects:     require('@/data/words/de/objects.json') as WordList,
  'party-life': require('@/data/words/de/party-life.json') as WordList,
  nature:      require('@/data/words/de/nature.json') as WordList,
  hobbies:     require('@/data/words/de/hobbies.json') as WordList,
  famous:      require('@/data/words/de/famous.json') as WordList,
  brands:      require('@/data/words/de/brands.json') as WordList,
  education:   require('@/data/words/de/education.json') as WordList,
  technology:  require('@/data/words/de/technology.json') as WordList,
  mythology:   require('@/data/words/de/mythology.json') as WordList,
  spicy:       require('@/data/words/de/spicy.json') as WordList,
  'tv-series': require('@/data/words/de/tv-series.json') as WordList,
  social:      require('@/data/words/de/social.json') as WordList,
  'internet-culture': require('@/data/words/de/internet-culture.json') as WordList,
  places:      require('@/data/words/de/places.json') as WordList,
  vehicles:    require('@/data/words/de/vehicles.json') as WordList,
  science:     require('@/data/words/de/science.json') as WordList,
  scientists:  require('@/data/words/de/scientists.json') as WordList,
  ancient:     require('@/data/words/de/ancient.json') as WordList,
  flowers:     require('@/data/words/de/flowers.json') as WordList,
  superheroes: require('@/data/words/de/superheroes.json') as WordList,
  'video-games': require('@/data/words/de/video-games.json') as WordList,
  drinks:      require('@/data/words/de/drinks.json') as WordList,
  disney:      require('@/data/words/de/disney.json') as WordList,
  fashion:     require('@/data/words/de/fashion.json') as WordList,
  olympics:    require('@/data/words/de/olympics.json') as WordList,
}

const FR_LISTS: WordListMap = {
  food:        require('@/data/words/fr/food.json') as WordList,
  animals:     require('@/data/words/fr/animals.json') as WordList,
  sports:      require('@/data/words/fr/sports.json') as WordList,
  jobs:        require('@/data/words/fr/jobs.json') as WordList,
  countries:   require('@/data/words/fr/countries.json') as WordList,
  'movies-tv': require('@/data/words/fr/movies-tv.json') as WordList,
  music:       require('@/data/words/fr/music.json') as WordList,
  objects:     require('@/data/words/fr/objects.json') as WordList,
  'party-life': require('@/data/words/fr/party-life.json') as WordList,
  nature:      require('@/data/words/fr/nature.json') as WordList,
  hobbies:     require('@/data/words/fr/hobbies.json') as WordList,
  famous:      require('@/data/words/fr/famous.json') as WordList,
  brands:      require('@/data/words/fr/brands.json') as WordList,
  education:   require('@/data/words/fr/education.json') as WordList,
  technology:  require('@/data/words/fr/technology.json') as WordList,
  mythology:   require('@/data/words/fr/mythology.json') as WordList,
  spicy:       require('@/data/words/fr/spicy.json') as WordList,
  'tv-series': require('@/data/words/fr/tv-series.json') as WordList,
  social:      require('@/data/words/fr/social.json') as WordList,
  'internet-culture': require('@/data/words/fr/internet-culture.json') as WordList,
  places:      require('@/data/words/fr/places.json') as WordList,
  vehicles:    require('@/data/words/fr/vehicles.json') as WordList,
  science:     require('@/data/words/fr/science.json') as WordList,
  scientists:  require('@/data/words/fr/scientists.json') as WordList,
  ancient:     require('@/data/words/fr/ancient.json') as WordList,
  flowers:     require('@/data/words/fr/flowers.json') as WordList,
  superheroes: require('@/data/words/fr/superheroes.json') as WordList,
  'video-games': require('@/data/words/fr/video-games.json') as WordList,
  drinks:      require('@/data/words/fr/drinks.json') as WordList,
  disney:      require('@/data/words/fr/disney.json') as WordList,
  fashion:     require('@/data/words/fr/fashion.json') as WordList,
  olympics:    require('@/data/words/fr/olympics.json') as WordList,
}

const ES_LISTS: WordListMap = {
  food:        require('@/data/words/es/food.json') as WordList,
  animals:     require('@/data/words/es/animals.json') as WordList,
  sports:      require('@/data/words/es/sports.json') as WordList,
  jobs:        require('@/data/words/es/jobs.json') as WordList,
  countries:   require('@/data/words/es/countries.json') as WordList,
  'movies-tv': require('@/data/words/es/movies-tv.json') as WordList,
  music:       require('@/data/words/es/music.json') as WordList,
  objects:     require('@/data/words/es/objects.json') as WordList,
  'party-life': require('@/data/words/es/party-life.json') as WordList,
  nature:      require('@/data/words/es/nature.json') as WordList,
  hobbies:     require('@/data/words/es/hobbies.json') as WordList,
  famous:      require('@/data/words/es/famous.json') as WordList,
  brands:      require('@/data/words/es/brands.json') as WordList,
  education:   require('@/data/words/es/education.json') as WordList,
  technology:  require('@/data/words/es/technology.json') as WordList,
  mythology:   require('@/data/words/es/mythology.json') as WordList,
  spicy:       require('@/data/words/es/spicy.json') as WordList,
  'tv-series': require('@/data/words/es/tv-series.json') as WordList,
  social:      require('@/data/words/es/social.json') as WordList,
  'internet-culture': require('@/data/words/es/internet-culture.json') as WordList,
  places:      require('@/data/words/es/places.json') as WordList,
  vehicles:    require('@/data/words/es/vehicles.json') as WordList,
  science:     require('@/data/words/es/science.json') as WordList,
  scientists:  require('@/data/words/es/scientists.json') as WordList,
  ancient:     require('@/data/words/es/ancient.json') as WordList,
  flowers:     require('@/data/words/es/flowers.json') as WordList,
  superheroes: require('@/data/words/es/superheroes.json') as WordList,
  'video-games': require('@/data/words/es/video-games.json') as WordList,
  drinks:      require('@/data/words/es/drinks.json') as WordList,
  disney:      require('@/data/words/es/disney.json') as WordList,
  fashion:     require('@/data/words/es/fashion.json') as WordList,
  olympics:    require('@/data/words/es/olympics.json') as WordList,
}

const PT_LISTS: WordListMap = {
  food:        require('@/data/words/pt/food.json') as WordList,
  animals:     require('@/data/words/pt/animals.json') as WordList,
  sports:      require('@/data/words/pt/sports.json') as WordList,
  jobs:        require('@/data/words/pt/jobs.json') as WordList,
  countries:   require('@/data/words/pt/countries.json') as WordList,
  'movies-tv': require('@/data/words/pt/movies-tv.json') as WordList,
  music:       require('@/data/words/pt/music.json') as WordList,
  objects:     require('@/data/words/pt/objects.json') as WordList,
  'party-life': require('@/data/words/pt/party-life.json') as WordList,
  nature:      require('@/data/words/pt/nature.json') as WordList,
  hobbies:     require('@/data/words/pt/hobbies.json') as WordList,
  famous:      require('@/data/words/pt/famous.json') as WordList,
  brands:      require('@/data/words/pt/brands.json') as WordList,
  education:   require('@/data/words/pt/education.json') as WordList,
  technology:  require('@/data/words/pt/technology.json') as WordList,
  mythology:   require('@/data/words/pt/mythology.json') as WordList,
  spicy:       require('@/data/words/pt/spicy.json') as WordList,
  'tv-series': require('@/data/words/pt/tv-series.json') as WordList,
  social:      require('@/data/words/pt/social.json') as WordList,
  'internet-culture': require('@/data/words/pt/internet-culture.json') as WordList,
  places:      require('@/data/words/pt/places.json') as WordList,
  vehicles:    require('@/data/words/pt/vehicles.json') as WordList,
  science:     require('@/data/words/pt/science.json') as WordList,
  scientists:  require('@/data/words/pt/scientists.json') as WordList,
  ancient:     require('@/data/words/pt/ancient.json') as WordList,
  flowers:     require('@/data/words/pt/flowers.json') as WordList,
  superheroes: require('@/data/words/pt/superheroes.json') as WordList,
  'video-games': require('@/data/words/pt/video-games.json') as WordList,
  drinks:      require('@/data/words/pt/drinks.json') as WordList,
  disney:      require('@/data/words/pt/disney.json') as WordList,
  fashion:     require('@/data/words/pt/fashion.json') as WordList,
  olympics:    require('@/data/words/pt/olympics.json') as WordList,
}

const RU_LISTS: WordListMap = {
  food:        require('@/data/words/ru/food.json') as WordList,
  animals:     require('@/data/words/ru/animals.json') as WordList,
  sports:      require('@/data/words/ru/sports.json') as WordList,
  jobs:        require('@/data/words/ru/jobs.json') as WordList,
  countries:   require('@/data/words/ru/countries.json') as WordList,
  'movies-tv': require('@/data/words/ru/movies-tv.json') as WordList,
  music:       require('@/data/words/ru/music.json') as WordList,
  objects:     require('@/data/words/ru/objects.json') as WordList,
  'party-life': require('@/data/words/ru/party-life.json') as WordList,
  nature:      require('@/data/words/ru/nature.json') as WordList,
  hobbies:     require('@/data/words/ru/hobbies.json') as WordList,
  famous:      require('@/data/words/ru/famous.json') as WordList,
  brands:      require('@/data/words/ru/brands.json') as WordList,
  education:   require('@/data/words/ru/education.json') as WordList,
  technology:  require('@/data/words/ru/technology.json') as WordList,
  mythology:   require('@/data/words/ru/mythology.json') as WordList,
  spicy:       require('@/data/words/ru/spicy.json') as WordList,
  'tv-series': require('@/data/words/ru/tv-series.json') as WordList,
  social:      require('@/data/words/ru/social.json') as WordList,
  'internet-culture': require('@/data/words/ru/internet-culture.json') as WordList,
  places:      require('@/data/words/ru/places.json') as WordList,
  vehicles:    require('@/data/words/ru/vehicles.json') as WordList,
  science:     require('@/data/words/ru/science.json') as WordList,
  scientists:  require('@/data/words/ru/scientists.json') as WordList,
  ancient:     require('@/data/words/ru/ancient.json') as WordList,
  flowers:     require('@/data/words/ru/flowers.json') as WordList,
  superheroes: require('@/data/words/ru/superheroes.json') as WordList,
  'video-games': require('@/data/words/ru/video-games.json') as WordList,
  drinks:      require('@/data/words/ru/drinks.json') as WordList,
  disney:      require('@/data/words/ru/disney.json') as WordList,
  fashion:     require('@/data/words/ru/fashion.json') as WordList,
  olympics:    require('@/data/words/ru/olympics.json') as WordList,
}

const IT_LISTS: WordListMap = {
  food:        require('@/data/words/it/food.json') as WordList,
  animals:     require('@/data/words/it/animals.json') as WordList,
  sports:      require('@/data/words/it/sports.json') as WordList,
  jobs:        require('@/data/words/it/jobs.json') as WordList,
  countries:   require('@/data/words/it/countries.json') as WordList,
  'movies-tv': require('@/data/words/it/movies-tv.json') as WordList,
  music:       require('@/data/words/it/music.json') as WordList,
  objects:     require('@/data/words/it/objects.json') as WordList,
  'party-life': require('@/data/words/it/party-life.json') as WordList,
  nature:      require('@/data/words/it/nature.json') as WordList,
  hobbies:     require('@/data/words/it/hobbies.json') as WordList,
  famous:      require('@/data/words/it/famous.json') as WordList,
  brands:      require('@/data/words/it/brands.json') as WordList,
  education:   require('@/data/words/it/education.json') as WordList,
  technology:  require('@/data/words/it/technology.json') as WordList,
  mythology:   require('@/data/words/it/mythology.json') as WordList,
  spicy:       require('@/data/words/it/spicy.json') as WordList,
  'tv-series': require('@/data/words/it/tv-series.json') as WordList,
  social:      require('@/data/words/it/social.json') as WordList,
  'internet-culture': require('@/data/words/it/internet-culture.json') as WordList,
  places:      require('@/data/words/it/places.json') as WordList,
  vehicles:    require('@/data/words/it/vehicles.json') as WordList,
  science:     require('@/data/words/it/science.json') as WordList,
  scientists:  require('@/data/words/it/scientists.json') as WordList,
  ancient:     require('@/data/words/it/ancient.json') as WordList,
  flowers:     require('@/data/words/it/flowers.json') as WordList,
  superheroes: require('@/data/words/it/superheroes.json') as WordList,
  'video-games': require('@/data/words/it/video-games.json') as WordList,
  drinks:      require('@/data/words/it/drinks.json') as WordList,
  disney:      require('@/data/words/it/disney.json') as WordList,
  fashion:     require('@/data/words/it/fashion.json') as WordList,
  olympics:    require('@/data/words/it/olympics.json') as WordList,
}

const NL_LISTS: WordListMap = {
  food:        require('@/data/words/nl/food.json') as WordList,
  animals:     require('@/data/words/nl/animals.json') as WordList,
  sports:      require('@/data/words/nl/sports.json') as WordList,
  jobs:        require('@/data/words/nl/jobs.json') as WordList,
  countries:   require('@/data/words/nl/countries.json') as WordList,
  'movies-tv': require('@/data/words/nl/movies-tv.json') as WordList,
  music:       require('@/data/words/nl/music.json') as WordList,
  objects:     require('@/data/words/nl/objects.json') as WordList,
  'party-life': require('@/data/words/nl/party-life.json') as WordList,
  nature:      require('@/data/words/nl/nature.json') as WordList,
  hobbies:     require('@/data/words/nl/hobbies.json') as WordList,
  famous:      require('@/data/words/nl/famous.json') as WordList,
  brands:      require('@/data/words/nl/brands.json') as WordList,
  education:   require('@/data/words/nl/education.json') as WordList,
  technology:  require('@/data/words/nl/technology.json') as WordList,
  mythology:   require('@/data/words/nl/mythology.json') as WordList,
  spicy:       require('@/data/words/nl/spicy.json') as WordList,
  'tv-series': require('@/data/words/nl/tv-series.json') as WordList,
  social:      require('@/data/words/nl/social.json') as WordList,
  'internet-culture': require('@/data/words/nl/internet-culture.json') as WordList,
  places:      require('@/data/words/nl/places.json') as WordList,
  vehicles:    require('@/data/words/nl/vehicles.json') as WordList,
  science:     require('@/data/words/nl/science.json') as WordList,
  scientists:  require('@/data/words/nl/scientists.json') as WordList,
  ancient:     require('@/data/words/nl/ancient.json') as WordList,
  flowers:     require('@/data/words/nl/flowers.json') as WordList,
  superheroes: require('@/data/words/nl/superheroes.json') as WordList,
  'video-games': require('@/data/words/nl/video-games.json') as WordList,
  drinks:      require('@/data/words/nl/drinks.json') as WordList,
  disney:      require('@/data/words/nl/disney.json') as WordList,
  fashion:     require('@/data/words/nl/fashion.json') as WordList,
  olympics:    require('@/data/words/nl/olympics.json') as WordList,
}

const AR_LISTS: WordListMap = {
  food:        require('@/data/words/ar/food.json') as WordList,
  animals:     require('@/data/words/ar/animals.json') as WordList,
  sports:      require('@/data/words/ar/sports.json') as WordList,
  jobs:        require('@/data/words/ar/jobs.json') as WordList,
  countries:   require('@/data/words/ar/countries.json') as WordList,
  'movies-tv': require('@/data/words/ar/movies-tv.json') as WordList,
  music:       require('@/data/words/ar/music.json') as WordList,
  objects:     require('@/data/words/ar/objects.json') as WordList,
  'party-life': require('@/data/words/ar/party-life.json') as WordList,
  nature:      require('@/data/words/ar/nature.json') as WordList,
  hobbies:     require('@/data/words/ar/hobbies.json') as WordList,
  famous:      require('@/data/words/ar/famous.json') as WordList,
  brands:      require('@/data/words/ar/brands.json') as WordList,
  education:   require('@/data/words/ar/education.json') as WordList,
  technology:  require('@/data/words/ar/technology.json') as WordList,
  mythology:   require('@/data/words/ar/mythology.json') as WordList,
  spicy:       require('@/data/words/ar/spicy.json') as WordList,
  'tv-series': require('@/data/words/ar/tv-series.json') as WordList,
  social:      require('@/data/words/ar/social.json') as WordList,
  'internet-culture': require('@/data/words/ar/internet-culture.json') as WordList,
  places:      require('@/data/words/ar/places.json') as WordList,
  vehicles:    require('@/data/words/ar/vehicles.json') as WordList,
  science:     require('@/data/words/ar/science.json') as WordList,
  scientists:  require('@/data/words/ar/scientists.json') as WordList,
  ancient:     require('@/data/words/ar/ancient.json') as WordList,
  flowers:     require('@/data/words/ar/flowers.json') as WordList,
  superheroes: require('@/data/words/ar/superheroes.json') as WordList,
  'video-games': require('@/data/words/ar/video-games.json') as WordList,
  drinks:      require('@/data/words/ar/drinks.json') as WordList,
  disney:      require('@/data/words/ar/disney.json') as WordList,
  fashion:     require('@/data/words/ar/fashion.json') as WordList,
  olympics:    require('@/data/words/ar/olympics.json') as WordList,
}

const JA_LISTS: WordListMap = {
  ancient: require('@/data/words/ja/ancient.json') as WordList,
  animals: require('@/data/words/ja/animals.json') as WordList,
  brands: require('@/data/words/ja/brands.json') as WordList,
  countries: require('@/data/words/ja/countries.json') as WordList,
  disney: require('@/data/words/ja/disney.json') as WordList,
  drinks: require('@/data/words/ja/drinks.json') as WordList,
  education: require('@/data/words/ja/education.json') as WordList,
  famous: require('@/data/words/ja/famous.json') as WordList,
  fashion: require('@/data/words/ja/fashion.json') as WordList,
  flowers: require('@/data/words/ja/flowers.json') as WordList,
  food: require('@/data/words/ja/food.json') as WordList,
  hobbies: require('@/data/words/ja/hobbies.json') as WordList,
  jobs: require('@/data/words/ja/jobs.json') as WordList,
  "movies-tv": require('@/data/words/ja/movies-tv.json') as WordList,
  music: require('@/data/words/ja/music.json') as WordList,
  mythology: require('@/data/words/ja/mythology.json') as WordList,
  nature: require('@/data/words/ja/nature.json') as WordList,
  objects: require('@/data/words/ja/objects.json') as WordList,
  'party-life': require('@/data/words/ja/party-life.json') as WordList,
  olympics: require('@/data/words/ja/olympics.json') as WordList,
  places: require('@/data/words/ja/places.json') as WordList,
  science: require('@/data/words/ja/science.json') as WordList,
  scientists: require('@/data/words/ja/scientists.json') as WordList,
  social: require('@/data/words/ja/social.json') as WordList,
  'internet-culture': require('@/data/words/ja/internet-culture.json') as WordList,
  spicy: require('@/data/words/ja/spicy.json') as WordList,
  sports: require('@/data/words/ja/sports.json') as WordList,
  superheroes: require('@/data/words/ja/superheroes.json') as WordList,
  technology: require('@/data/words/ja/technology.json') as WordList,
  "tv-series": require('@/data/words/ja/tv-series.json') as WordList,
  vehicles: require('@/data/words/ja/vehicles.json') as WordList,
  "video-games": require('@/data/words/ja/video-games.json') as WordList,
}

const KO_LISTS: WordListMap = {
  ancient: require('@/data/words/ko/ancient.json') as WordList,
  animals: require('@/data/words/ko/animals.json') as WordList,
  brands: require('@/data/words/ko/brands.json') as WordList,
  countries: require('@/data/words/ko/countries.json') as WordList,
  disney: require('@/data/words/ko/disney.json') as WordList,
  drinks: require('@/data/words/ko/drinks.json') as WordList,
  education: require('@/data/words/ko/education.json') as WordList,
  famous: require('@/data/words/ko/famous.json') as WordList,
  fashion: require('@/data/words/ko/fashion.json') as WordList,
  flowers: require('@/data/words/ko/flowers.json') as WordList,
  food: require('@/data/words/ko/food.json') as WordList,
  hobbies: require('@/data/words/ko/hobbies.json') as WordList,
  jobs: require('@/data/words/ko/jobs.json') as WordList,
  "movies-tv": require('@/data/words/ko/movies-tv.json') as WordList,
  music: require('@/data/words/ko/music.json') as WordList,
  mythology: require('@/data/words/ko/mythology.json') as WordList,
  nature: require('@/data/words/ko/nature.json') as WordList,
  objects: require('@/data/words/ko/objects.json') as WordList,
  'party-life': require('@/data/words/ko/party-life.json') as WordList,
  olympics: require('@/data/words/ko/olympics.json') as WordList,
  places: require('@/data/words/ko/places.json') as WordList,
  science: require('@/data/words/ko/science.json') as WordList,
  scientists: require('@/data/words/ko/scientists.json') as WordList,
  social: require('@/data/words/ko/social.json') as WordList,
  'internet-culture': require('@/data/words/ko/internet-culture.json') as WordList,
  spicy: require('@/data/words/ko/spicy.json') as WordList,
  sports: require('@/data/words/ko/sports.json') as WordList,
  superheroes: require('@/data/words/ko/superheroes.json') as WordList,
  technology: require('@/data/words/ko/technology.json') as WordList,
  "tv-series": require('@/data/words/ko/tv-series.json') as WordList,
  vehicles: require('@/data/words/ko/vehicles.json') as WordList,
  "video-games": require('@/data/words/ko/video-games.json') as WordList,
}

const ZH_HANT_LISTS: WordListMap = {
  ancient: require('@/data/words/zh-Hant/ancient.json') as WordList,
  animals: require('@/data/words/zh-Hant/animals.json') as WordList,
  brands: require('@/data/words/zh-Hant/brands.json') as WordList,
  countries: require('@/data/words/zh-Hant/countries.json') as WordList,
  disney: require('@/data/words/zh-Hant/disney.json') as WordList,
  drinks: require('@/data/words/zh-Hant/drinks.json') as WordList,
  education: require('@/data/words/zh-Hant/education.json') as WordList,
  famous: require('@/data/words/zh-Hant/famous.json') as WordList,
  fashion: require('@/data/words/zh-Hant/fashion.json') as WordList,
  flowers: require('@/data/words/zh-Hant/flowers.json') as WordList,
  food: require('@/data/words/zh-Hant/food.json') as WordList,
  hobbies: require('@/data/words/zh-Hant/hobbies.json') as WordList,
  jobs: require('@/data/words/zh-Hant/jobs.json') as WordList,
  "movies-tv": require('@/data/words/zh-Hant/movies-tv.json') as WordList,
  music: require('@/data/words/zh-Hant/music.json') as WordList,
  mythology: require('@/data/words/zh-Hant/mythology.json') as WordList,
  nature: require('@/data/words/zh-Hant/nature.json') as WordList,
  objects: require('@/data/words/zh-Hant/objects.json') as WordList,
  'party-life': require('@/data/words/zh-Hant/party-life.json') as WordList,
  olympics: require('@/data/words/zh-Hant/olympics.json') as WordList,
  places: require('@/data/words/zh-Hant/places.json') as WordList,
  science: require('@/data/words/zh-Hant/science.json') as WordList,
  scientists: require('@/data/words/zh-Hant/scientists.json') as WordList,
  social: require('@/data/words/zh-Hant/social.json') as WordList,
  'internet-culture': require('@/data/words/zh-Hant/internet-culture.json') as WordList,
  spicy: require('@/data/words/zh-Hant/spicy.json') as WordList,
  sports: require('@/data/words/zh-Hant/sports.json') as WordList,
  superheroes: require('@/data/words/zh-Hant/superheroes.json') as WordList,
  technology: require('@/data/words/zh-Hant/technology.json') as WordList,
  "tv-series": require('@/data/words/zh-Hant/tv-series.json') as WordList,
  vehicles: require('@/data/words/zh-Hant/vehicles.json') as WordList,
  "video-games": require('@/data/words/zh-Hant/video-games.json') as WordList,
}

const SV_LISTS: WordListMap = {
  ancient: require('@/data/words/sv/ancient.json') as WordList,
  animals: require('@/data/words/sv/animals.json') as WordList,
  brands: require('@/data/words/sv/brands.json') as WordList,
  countries: require('@/data/words/sv/countries.json') as WordList,
  disney: require('@/data/words/sv/disney.json') as WordList,
  drinks: require('@/data/words/sv/drinks.json') as WordList,
  education: require('@/data/words/sv/education.json') as WordList,
  famous: require('@/data/words/sv/famous.json') as WordList,
  fashion: require('@/data/words/sv/fashion.json') as WordList,
  flowers: require('@/data/words/sv/flowers.json') as WordList,
  food: require('@/data/words/sv/food.json') as WordList,
  hobbies: require('@/data/words/sv/hobbies.json') as WordList,
  jobs: require('@/data/words/sv/jobs.json') as WordList,
  "movies-tv": require('@/data/words/sv/movies-tv.json') as WordList,
  music: require('@/data/words/sv/music.json') as WordList,
  mythology: require('@/data/words/sv/mythology.json') as WordList,
  nature: require('@/data/words/sv/nature.json') as WordList,
  objects: require('@/data/words/sv/objects.json') as WordList,
  'party-life': require('@/data/words/sv/party-life.json') as WordList,
  olympics: require('@/data/words/sv/olympics.json') as WordList,
  places: require('@/data/words/sv/places.json') as WordList,
  science: require('@/data/words/sv/science.json') as WordList,
  scientists: require('@/data/words/sv/scientists.json') as WordList,
  social: require('@/data/words/sv/social.json') as WordList,
  'internet-culture': require('@/data/words/sv/internet-culture.json') as WordList,
  spicy: require('@/data/words/sv/spicy.json') as WordList,
  sports: require('@/data/words/sv/sports.json') as WordList,
  superheroes: require('@/data/words/sv/superheroes.json') as WordList,
  technology: require('@/data/words/sv/technology.json') as WordList,
  "tv-series": require('@/data/words/sv/tv-series.json') as WordList,
  vehicles: require('@/data/words/sv/vehicles.json') as WordList,
  "video-games": require('@/data/words/sv/video-games.json') as WordList,
}

const PL_LISTS: WordListMap = {
  ancient: require('@/data/words/pl/ancient.json') as WordList,
  animals: require('@/data/words/pl/animals.json') as WordList,
  brands: require('@/data/words/pl/brands.json') as WordList,
  countries: require('@/data/words/pl/countries.json') as WordList,
  disney: require('@/data/words/pl/disney.json') as WordList,
  drinks: require('@/data/words/pl/drinks.json') as WordList,
  education: require('@/data/words/pl/education.json') as WordList,
  famous: require('@/data/words/pl/famous.json') as WordList,
  fashion: require('@/data/words/pl/fashion.json') as WordList,
  flowers: require('@/data/words/pl/flowers.json') as WordList,
  food: require('@/data/words/pl/food.json') as WordList,
  hobbies: require('@/data/words/pl/hobbies.json') as WordList,
  jobs: require('@/data/words/pl/jobs.json') as WordList,
  "movies-tv": require('@/data/words/pl/movies-tv.json') as WordList,
  music: require('@/data/words/pl/music.json') as WordList,
  mythology: require('@/data/words/pl/mythology.json') as WordList,
  nature: require('@/data/words/pl/nature.json') as WordList,
  objects: require('@/data/words/pl/objects.json') as WordList,
  'party-life': require('@/data/words/pl/party-life.json') as WordList,
  olympics: require('@/data/words/pl/olympics.json') as WordList,
  places: require('@/data/words/pl/places.json') as WordList,
  science: require('@/data/words/pl/science.json') as WordList,
  scientists: require('@/data/words/pl/scientists.json') as WordList,
  social: require('@/data/words/pl/social.json') as WordList,
  'internet-culture': require('@/data/words/pl/internet-culture.json') as WordList,
  spicy: require('@/data/words/pl/spicy.json') as WordList,
  sports: require('@/data/words/pl/sports.json') as WordList,
  superheroes: require('@/data/words/pl/superheroes.json') as WordList,
  technology: require('@/data/words/pl/technology.json') as WordList,
  "tv-series": require('@/data/words/pl/tv-series.json') as WordList,
  vehicles: require('@/data/words/pl/vehicles.json') as WordList,
  "video-games": require('@/data/words/pl/video-games.json') as WordList,
}

// Map of all available locale → category → WordList
const ALL_LISTS: Record<string, WordListMap> = {
  en: EN_LISTS,
  tr: TR_LISTS,
  de: DE_LISTS,
  fr: FR_LISTS,
  es: ES_LISTS,
  pt: PT_LISTS,
  ru: RU_LISTS,
  it: IT_LISTS,
  nl: NL_LISTS,
  ar: AR_LISTS,
  ja: JA_LISTS,
  ko: KO_LISTS,
  'zh-Hant': ZH_HANT_LISTS,
  sv: SV_LISTS,
  pl: PL_LISTS,
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD SELECTOR
// Pure object — no React, no AsyncStorage, fully unit-testable.
// ─────────────────────────────────────────────────────────────────────────────

export const wordSelector = {

  /**
   * Pick one random word from the selected categories in the given locale.
   * Excludes words already used this session.
   * Falls back to 'en' if the locale has no list for a category.
   * If all words are exhausted, the pool resets (all words eligible again).
   */
  pick(categoryIds: string[], locale: string, usedWords: string[], customWords?: string[]): string {
    const pool = this.buildPool(categoryIds, locale, customWords)

    if (pool.length === 0) return ''

    const available = pool.filter((w) => !usedWords.includes(w))

    // Reset when exhausted
    const source = available.length > 0 ? available : pool

    return source[Math.floor(Math.random() * source.length)]
  },

  /**
   * Build the full word pool for given categories and locale.
   * Merges words from all selected categories.
   * Falls back to EN if the locale doesn't have a list for a given category.
   * If 'custom' is in categoryIds, injects the user's customWords.
   */
  buildPool(categoryIds: string[], locale: string, customWords?: string[]): string[] {
    const pool: string[] = []
    const seen = new Set<string>()
    const localeMap = ALL_LISTS[locale] ?? ALL_LISTS['en']

    for (const catId of categoryIds) {
      if (catId === 'custom') {
        for (const word of (customWords ?? [])) {
          const key = word.trim().toLowerCase()
          if (!key || seen.has(key)) continue
          seen.add(key)
          pool.push(word.trim())
        }
        continue
      }
      const list = localeMap?.[catId] ?? EN_LISTS[catId]
      if (list?.words) {
        for (const word of list.words) {
          const key = word.trim().toLowerCase()
          if (seen.has(key)) continue
          seen.add(key)
          pool.push(word)
        }
      }
    }

    return pool
  },

  /**
   * Get the word count for a specific category + locale.
   * Returns 0 if not available.
   */
  getWordCount(categoryId: string, locale: string): number {
    const localeMap = ALL_LISTS[locale]
    return localeMap?.[categoryId]?.words?.length ?? 0
  },

  /**
   * Check if a locale has a word list for the given category.
   */
  hasLocale(categoryId: string, locale: string): boolean {
    return !!ALL_LISTS[locale]?.[categoryId]
  },
}
