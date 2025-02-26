document.addEventListener("DOMContentLoaded", function () {
  loadAutoOpenLinks();
  const searchInput = document.getElementById("search");
  const tabList = document.getElementById("tab-list");

  const autoOpenInput = document.getElementById("auto-open-input");
  const addAutoOpenBtn = document.getElementById("add-auto-open");
  const autoOpenList = document.getElementById("auto-open-list");

  if (searchInput) {
    searchInput.focus();
  }

  chrome.tabs.query({}, function (tabs) {
    let allTabs = tabs;

    function updateList(filterText = "") {
      tabList.innerHTML = "";

      allTabs
        .filter(
          (tab) =>
            tab.title.toLowerCase().includes(filterText.toLowerCase()) ||
            tab.url.toLowerCase().includes(filterText.toLowerCase())
        )
        .forEach((tab) => {
          let li = document.createElement("li");
          li.innerHTML = `<div class="tab-info">
          <img src="${
            tab.favIconUrl ? tab.favIconUrl : "icons/no-favicon.png"
          }" 
            width="16" class="tab-icon" onerror="this.src='icons/no-favicon.png';"> 
            <span class="tab-title">${tab.title}</span>
            </div> 
            <button class="close-btn" data-id="${tab.id}">❌</button>`;

          li.dataset.id = tab.id;

          li.onclick = () => {
            chrome.windows.update(tab.windowId, { focused: true }, () => {
              chrome.tabs.update(tab.id, { active: true });
            });
          };

          li.querySelector(".close-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            chrome.tabs.remove(tab.id);
            li.remove();
          });

          tabList.appendChild(li);
        });
    }

    updateList();

    searchInput.addEventListener("input", function () {
      updateList(this.value);
    });
  });

  function loadAutoOpenLinks() {
    chrome.storage.local.get(["autoOpenLinks"], function (result) {
      const links = result.autoOpenLinks || [];
      autoOpenList.innerHTML = "";

      links.forEach((link) => {
        let li = document.createElement("li");
        li.innerHTML = `<img src="https://www.google.com/s2/favicons?sz=16&domain=${link}" class="favicon"> 
                        <span class="link-text">${link}</span> 
                        <button class="remove-btn">❌</button>`;

        li.querySelector(".remove-btn").addEventListener("click", function () {
          removeAutoOpenLink(link);
        });
        autoOpenList.appendChild(li);
      });
    });
  }

  addAutoOpenBtn.addEventListener("click", function () {
    const url = autoOpenInput.value.trim();
    if (!url) return;

    chrome.storage.local.get(["autoOpenLinks"], function (result) {
      let links = result.autoOpenLinks || [];
      if (!links.includes(url)) {
        links.push(url);
        chrome.storage.local.set({ autoOpenLinks: links }, loadAutoOpenLinks);
      }
    });

    autoOpenInput.value = "";
  });

  function removeAutoOpenLink(url) {
    chrome.storage.local.get(["autoOpenLinks"], function (result) {
      let links = result.autoOpenLinks || [];
      links = links.filter((link) => link !== url);
      chrome.storage.local.set({ autoOpenLinks: links }, loadAutoOpenLinks);
    });
  }

  loadAutoOpenLinks();
});
