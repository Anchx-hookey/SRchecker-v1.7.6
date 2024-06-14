document.addEventListener('DOMContentLoaded', () => {
  // Load the saved minimum results value
  chrome.storage.sync.get(['minResults'], (result) => {
    if (result.minResults) {
      document.getElementById('minResults').value = result.minResults;
    }
  });

  // Save the new minimum results value
  document.getElementById('save').addEventListener('click', () => {
    const minResults = document.getElementById('minResults').value;
    chrome.storage.sync.set({ minResults: parseInt(minResults, 10) }, () => {
      const message = document.getElementById('message');
      message.textContent = 'บันทึกแล้ว';
      setTimeout(() => {
        message.textContent = '';
      }, 3000);
    });
  });

  // Start the tab check process
  document.getElementById('start').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'checkTabs' }, (response) => {
      if (response && response.completed) {
        const message = document.getElementById('message');
        message.textContent = 'ทำการคัดกรอง SR เรียบร้อยค่ะ';
        setTimeout(() => {
          message.textContent = '';
        }, 3000);
      }
    });
  });
});
