chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  chrome.storage.sync.set({ minResults: 10 }, () => {
    console.log('Default minimum results value set to 10');
  });

  chrome.contextMenus.create({
    id: 'startCheck',
    title: 'เริ่มทำงาน',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'startCheck') {
    checkTabs(() => {
      alert('ทำการคัดกรอง SR เรียบร้อยค่ะ');
    });
  }
});

chrome.action.onClicked.addListener(() => {
  checkTabs(() => {
    alert('ทำการคัดกรอง SR เรียบร้อยค่ะ');
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkTabs') {
    checkTabs(() => {
      sendResponse({ completed: true });
    });
    return true;  // Keep the message channel open for sendResponse
  }
});

function checkTabs(callback) {
  chrome.storage.sync.get(['minResults'], (result) => {
    const minResults = result.minResults || 10;
    chrome.windows.getCurrent({ populate: true }, (window) => {
      const tabs = window.tabs;
      let checkedTabs = 0;

      tabs.forEach((tab) => {
        // Skip tabs with 'chrome://' URL
        if (tab.url.startsWith('chrome://')) {
          checkedTabs++;
          if (checkedTabs === tabs.length && callback) {
            callback();
          }
          return;
        }

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const resultStats = document.querySelector("#result-stats");
            return resultStats ? resultStats.innerText : null;
          }
        }, (results) => {
          if (chrome.runtime.lastError || !results || !results[0] || !results[0].result) {
            checkedTabs++;
            if (checkedTabs === tabs.length && callback) {
              callback();
            }
            return;
          }

          const resultStatsText = results[0].result;
          if (resultStatsText) {
            const resultsMatch = resultStatsText.match(/[\d,]+/g);
            if (resultsMatch) {
              const resultCount = parseInt(resultsMatch[0].replace(/,/g, ''), 10);
              if (resultCount < minResults) {
                chrome.tabs.remove(tab.id);
              }
            }
          }
          checkedTabs++;
          if (checkedTabs === tabs.length && callback) {
            callback();
          }
        });
      });
    });
  });
}
