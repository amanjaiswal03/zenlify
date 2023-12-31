// Event listener for when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    let isEnabled = false;
    let url; // Declare url as a global variable

    // Get elements from the DOM
    const urlHostnameElement = document.getElementById('url-hostname');
    const blockSiteButton = document.getElementById('block-site-btn');
    const toggleExtensionButton = document.getElementById('toggle-extension-btn');
    const advancedOptionButton = document.getElementById('advanced-option-btn');

    // Pomodoro timer elements
    const startButton = document.getElementById('start');
    const resetButton = document.getElementById('reset');
    const timerDisplay = document.getElementById('time');
    const pomodoroDurationInput = document.getElementById('pomodoroDuration');
    const breakDurationInput = document.getElementById('breakDuration');

    let isTimerRunning = false; // Add a flag to track if the timer is running
    timerDisplay.textContent = `${pomodoroDurationInput.value ? pomodoroDurationInput.value : '25'}:00`; // Set the initial timer display

    // Check if the timer is running when the popup is opened
    chrome.runtime.sendMessage({ command: 'isRunning' }, (response) => {
        console.log(response);
        if (response) {
            startButton.textContent = 'Pause'; // Set the button text to 'Pause'
            isTimerRunning = true; // Set the timer running flag to true
        } else {
            startButton.textContent = 'Start'; // Set the button text to 'Start'
            isTimerRunning = false; // Set the timer running flag to false
        }
    });

    // Event listener for start button
    startButton.addEventListener('click', function() {
        if (isTimerRunning) {
            // Pause the timer
            chrome.runtime.sendMessage({ command: 'pause' });
            startButton.textContent = 'Start'; // Change the button text to 'Start'
        } else {
            // Start the timer
            const pomodoroDuration = parseInt(pomodoroDurationInput.value) || 25;
            const breakDuration = parseInt(breakDurationInput.value) || 5;
            chrome.runtime.sendMessage({ command: 'start', pomodoroDuration, breakDuration });
            startButton.textContent = 'Pause'; // Change the button text to 'Pause'
        }
        isTimerRunning = !isTimerRunning; // Toggle the timer running flag
    });

    // Event listener for reset button
    resetButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ command: 'reset' });
        startButton.textContent = 'Start'; // Reset the button text to 'Start'
        isTimerRunning = false; // Reset the timer running flag
    });

    // Function to request timer update from background script
    function requestTimerUpdate() {
        chrome.runtime.sendMessage({ command: 'getTimer' });
    }

    // Update timer display when receiving message from background script
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if (msg.minutes != undefined && msg.seconds != undefined) {
            timerDisplay.textContent = `${msg.minutes}:${msg.seconds < 10 ? '0' : ''}${msg.seconds}`;
        }
        response('Timer updated');
    });

    requestTimerUpdate();
    setInterval(requestTimerUpdate, 1000);

    // End of Pomodoro timer

    // Initialize URL and buttons
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab) {
            url = new URL(currentTab.url);
            if (url.protocol === "https:") {
                urlHostnameElement.textContent = url.hostname;
                blockSiteButton.disabled = false;
            }
        }
    });

    // Get extension state from storage and update toggle button
    chrome.storage.sync.get('isEnabled', (data) => {
        isEnabled = !!data.isEnabled;
        toggleExtensionButton.textContent = isEnabled ? 'Disable Extension' : 'Enable Extension';
    });

    // Event listener for block site button
    blockSiteButton.addEventListener('click', function() {
        try {
            if (url){
                chrome.storage.sync.get('blockedWebsites', ({ blockedWebsites }) => {
                    if (!blockedWebsites.includes(url.hostname)) {
                        const updatedBlockedWebsites = [...blockedWebsites, url.hostname];
                        chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites });

                        // Reload current tab
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            const currentTab = tabs[0];
                            chrome.tabs.reload(currentTab.id);
                        });
                        
                    } else {
                        console.log(`URL already blocked: ${url.hostname}`);
                    }
                });
            }
        } catch (error) {
            console.error('Invalid URL:', url.hostname);
        }
    });

    // Event listener for toggle extension button
    toggleExtensionButton.addEventListener('click', function() {
        isEnabled = !isEnabled;
        chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
            console.log(`Extension is ${isEnabled ? 'enabled' : 'disabled'}`);
            toggleExtensionButton.textContent = isEnabled ? 'Disable Extension' : 'Enable Extension';
            // Set badge text to ON or OFF
            chrome.action.setBadgeText({ text: isEnabled ? 'ON' : 'OFF' });
        });
    });

    // Event listener for advanced option button
    advancedOptionButton.addEventListener('click', function() {
        // Open advanced options
        chrome.runtime.openOptionsPage();
    });
});
