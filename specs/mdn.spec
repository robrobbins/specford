visit https://developer.mozilla.org/en-US/:
  $ section.home-search:
    fill 'form input[name="q"]' 'input value'
    click selector 'form'

  $ section#content-main:
    selector 'div#search-results' exists
