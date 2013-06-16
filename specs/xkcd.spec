visit http://xkcd.com/149:
  $ #topContainer:

    -- search for '#masthead' in '#topContainer'
    selector ? '#masthead'

    $ #masthead:
      text ? 'A webcomic of'

    $ #news:
      text ? 'You can get'
      -- text ? 'go fuck yourself'

  $ #middleContainer:
    selector ? '#ctitle'

    text ? 'Sandwich'

    $ .comicNav:
      click link 'a[rel="next"]'

      url ^= '/xkcd.com\/150/'

  $ #middleContainer:
    text ? 'Grownups'
