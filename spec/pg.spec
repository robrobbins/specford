visit http://www.plangrid.com:

query .menu-bar:
  query .logo:
    selector 'a[href="/en"]' exists
    selector 'a img[src="http://www.plangrid.com/images/plangrid-logo.png"]' exists

  query .menu:
    selector '.headerLoginLink' exists
    click selector '.headerLoginLink'
    after url change

query body:
  selector '.popup-container' exists
