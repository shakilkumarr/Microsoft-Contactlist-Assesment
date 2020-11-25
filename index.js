const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const GROUP_MAP = {
  ALL: 'All Contacts',
  FAMILY: 'Family',
  HACKATHON: 'Hackathon',
  LUNCH_GROUP: 'Lunch group',
  OTHER: 'Other contacts',
};

const API_KEY_MAP = {
  NAME: 'Name',
  JOB_TITLE: 'Job Title',
  EMAIL: 'Email',
  PHONE: 'Phone',
  LOCATION: 'Location',
};

const Contacts = {
  $searchInput: undefined,
  $leftPanel: undefined,
  $rightPanelHeader: undefined,
  $rightPanelBody: undefined,
  $rightPanelTableHeader: undefined,
  conatctList: EMPTY_OBJECT,
  groups: EMPTY_ARRAY,
  selectedGroupIndex: 0,
  init(){
    // SAVE ELEMENTS
    const $container = document.getElementById('container');
    this.$searchInput = $container.getElementsByClassName('searchInput')[0];
    this.$leftPanel = $container.getElementsByClassName('contactsLeftPanel')[0];
    this.$rightPanelHeader = $container.getElementsByClassName('contactsTitle')[0];
    this.$rightPanelTableHeader = $container.getElementsByClassName('tableHeader')[0];
    this.$rightPanelBody = $container.getElementsByClassName('tableBody')[0];

    // RENDER LOADER
    this.renderSpinner();

    // API
    fetch('https://raw.githubusercontent.com/tusharpahuja/Data/master/data.json')
      .then(async (res) => {
        // UPDATE VALUES
        const contactList = await res.json();
        this.conatctList = contactList;
        this.groups = Object.keys(contactList);

        // RENDER UI ELEMENTS
        this.closeSpinner();
        this.renderLeftPanel();
        this.rednerTableHeader();
        this.renderRightPanel();
        this.renderRightPanelTitle();

        // EV BIND
        this.bindEvents();
      })
      .catch(() => {
        this.closeSpinner();
      });
  },
  getSpinner() {
    return `<div class="spinner"><div class="spinnerText">Loading...</div></div>`;
  },
  renderSpinner() {
    const spinnerHTMLStr = this.getSpinner();
    this.$leftPanel.innerHTML = spinnerHTMLStr;
    this.$rightPanelBody.innerHTML = spinnerHTMLStr;
  },
  closeSpinner() {
    this.$leftPanel.innerHTML = '';
    this.$rightPanelBody.innerHTML = '';
  },
  getDIV(className) {
    const $div = document.createElement('div');
    if (className) $div.className = className;
    return $div;
  },
  getGroupListHTML(name, index, selectedGroupIndex) {
    const $div = this.getDIV('groupList');
    if (selectedGroupIndex) $div.classList.add('sel');
    $div.setAttribute('data-value', index);
    $div.innerHTML = name;
    return $div;
  },
  getContactList(contact) {
    const $container = this.getDIV('contactList');
    const $name = this.getDIV('contactListItem');
    const $title = this.getDIV('contactListItem');
    const $email = this.getDIV('contactListItem');
    const $phone = this.getDIV('contactListItem');
    const $location = this.getDIV('contactListItem');

    $name.innerText = contact[API_KEY_MAP.NAME];
    $title.innerText = contact[API_KEY_MAP.JOB_TITLE];
    $email.innerText = contact[API_KEY_MAP.EMAIL];
    $phone.innerText = contact[API_KEY_MAP.PHONE];
    $location.innerText = contact[API_KEY_MAP.LOCATION];
    
    $container.appendChild($name);
    $container.appendChild($title);
    $container.appendChild($email);
    $container.appendChild($phone);
    $container.appendChild($location);

    return $container;
  },
  renderLeftPanel() {
    const $leftPanel = this.$leftPanel;
    const selectedGroupIndex = this.selectedGroupIndex;
    $leftPanel.innerHTML = '';
    this.groups.map((name, index) => {
      $leftPanel.appendChild(this.getGroupListHTML(name, index, index == selectedGroupIndex));
    });
  },
  renderRightPanelTitle() {
    this.$rightPanelHeader.innerText = this.groups[this.selectedGroupIndex];
  },
  getFilteredContacts() {
    if (this.selectedGroupIndex == 0) return this.conatctList[GROUP_MAP.ALL];
    const groupFilter = this.conatctList[this.groups[this.selectedGroupIndex]];
    let contactList = [];
    const allContacts = this.conatctList[GROUP_MAP.ALL];
    groupFilter.map((index) => {
      contactList.push(allContacts[index-1]);
    });
    // SEARCH HANDLER - TODO
    // if (this.$searchInput.value) {
    //   contactList = contactList.filter((contact) => {
    //     const contactObjStr = `${contact[API_KEY_MAP.NAME]}${contact[API_KEY_MAP.PHONE]}${contact[API_KEY_MAP.JOB_TITLE]}${contact[API_KEY_MAP.EMAIL]}${contact[API_KEY_MAP.LOCATION]}`;
    //     return contactObjStr.split(' ').join('').toLowerCase().indexOf(this.$searchInput.value) > -1;
    //   });
    // }
    return contactList;
  },
  rednerTableHeader() {
    const contactHead = {
      [API_KEY_MAP.NAME]: API_KEY_MAP.NAME,
      [API_KEY_MAP.EMAIL]: API_KEY_MAP.EMAIL,
      [API_KEY_MAP.PHONE]: API_KEY_MAP.PHONE,
      [API_KEY_MAP.JOB_TITLE]: API_KEY_MAP.JOB_TITLE,
      [API_KEY_MAP.LOCATION]: API_KEY_MAP.LOCATION,
    };
    this.$rightPanelTableHeader.appendChild(this.getContactList(contactHead));
  },
  renderEmpty() {
    return `<div class="empty"><div>NO DATA FOUND</div></div>`;
  },
  renderRightPanel(contacts) {
    const filteredContacts = contacts || this.getFilteredContacts();
    if (!filteredContacts.length) {
      this.$rightPanelBody.innerHTML = this.renderEmpty();
      return;
    }

    this.$rightPanelBody.innerHTML = '';
    filteredContacts.map((contact) => {
      this.$rightPanelBody.appendChild(this.getContactList(contact));
    });
  },
  handleSearch(ev) {
    const filteredContacts = this.getFilteredContacts();
    const searchStr = ev.target.value.toLowerCase();
    const filterValue = filteredContacts.filter((contact) => {
      const contactObjStr = `${contact[API_KEY_MAP.NAME]}${contact[API_KEY_MAP.PHONE]}${contact[API_KEY_MAP.JOB_TITLE]}${contact[API_KEY_MAP.EMAIL]}${contact[API_KEY_MAP.LOCATION]}`;
      return contactObjStr.split(' ').join('').toLowerCase().indexOf(searchStr) > -1;
    });
    this.renderRightPanel(filterValue);
  },
  bindEvents() {
    this.$leftPanel.addEventListener('click', this.handleGroupChange.bind(this));
    this.$searchInput.addEventListener('keyup', this.handleSearch.bind(this));
  },
  handleGroupChange(ev) {
    const isList = ev.target.className.indexOf('groupList') > -1;
    if (!isList) return;
    this.$leftPanel.getElementsByClassName('sel')[0].classList.remove('sel');
    ev.target.classList.add('sel');
    this.selectedGroupIndex = ev.target.getAttribute('data-value');
    this.renderRightPanelTitle();
    this.renderRightPanel();
  }
}