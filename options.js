document.addEventListener("DOMContentLoaded", () => {
  loadSettings();

  document.getElementById("saveBtn").addEventListener("click", saveSettings);
  document.getElementById("resetBtn").addEventListener("click", resetSettings);
  document.getElementById("clearDataBtn").addEventListener("click", clearStoredData);
});

async function loadSettings() {
  try {
    const defaults = getDefaultSettings();
    
    const result = await chrome.storage.local.get({
      strictNoLogs: defaults.strictNoLogs,
      autoConnect: defaults.autoConnect,
      dnsLeakProtection: defaults.dnsLeakProtection,
      webrtcLeakProtection: defaults.webrtcLeakProtection,
      connectionTimeout: defaults.connectionTimeout,
      reconnectAttempts: defaults.reconnectAttempts,
      preferredNodeType: defaults.preferredNodeType
    });

    document.getElementById("strictNoLogs").checked = result.strictNoLogs;
    document.getElementById("autoConnect").checked = result.autoConnect;
    document.getElementById("dnsLeakProtection").checked = result.dnsLeakProtection;
    document.getElementById("webrtcLeakProtection").checked = result.webrtcLeakProtection;
    document.getElementById("connectionTimeout").value = result.connectionTimeout;
    document.getElementById("reconnectAttempts").value = result.reconnectAttempts;
    document.getElementById("preferredNodeType").value = result.preferredNodeType;
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
}

async function saveSettings() {
  const settings = {
    strictNoLogs: document.getElementById("strictNoLogs").checked,
    autoConnect: document.getElementById("autoConnect").checked,
    dnsLeakProtection: document.getElementById("dnsLeakProtection").checked,
    webrtcLeakProtection: document.getElementById("webrtcLeakProtection").checked,
    connectionTimeout: parseInt(document.getElementById("connectionTimeout").value) || 15,
    reconnectAttempts: parseInt(document.getElementById("reconnectAttempts").value) || 3,
    preferredNodeType: document.getElementById("preferredNodeType").value
  };

  try {
    await chrome.storage.local.set(settings);
    showNotification("Settings saved successfully!", "success");
    
    await chrome.runtime.sendMessage({ type: "SETTINGS_CHANGED", settings });
  } catch (error) {
    showNotification("Failed to save settings: " + error.message, "error");
  }
}

function resetSettings() {
  const defaults = getDefaultSettings();
  
  document.getElementById("strictNoLogs").checked = defaults.strictNoLogs;
  document.getElementById("autoConnect").checked = defaults.autoConnect;
  document.getElementById("dnsLeakProtection").checked = defaults.dnsLeakProtection;
  document.getElementById("webrtcLeakProtection").checked = defaults.webrtcLeakProtection;
  document.getElementById("connectionTimeout").value = defaults.connectionTimeout;
  document.getElementById("reconnectAttempts").value = defaults.reconnectAttempts;
  document.getElementById("preferredNodeType").value = defaults.preferredNodeType;
  
  showNotification("Settings reset to defaults", "info");
}

function getDefaultSettings() {
  return {
    strictNoLogs: true,
    autoConnect: false,
    dnsLeakProtection: true,
    webrtcLeakProtection: true,
    connectionTimeout: 15,
    reconnectAttempts: 3,
    preferredNodeType: "balanced"
  };
}

async function clearStoredData() {
  if (confirm("This will clear all stored VPN data including connections. Continue?")) {
    try {
      const keysToRemove = [
        "exitLocation_preston_vpn",
        "killSwitch_preston_vpn",
        "strictNoLogs",
        "autoConnect",
        "dnsLeakProtection",
        "webrtcLeakProtection",
        "connectionTimeout",
        "reconnectAttempts",
        "preferredNodeType"
      ];
      
      await chrome.storage.local.remove(keysToRemove);
      loadSettings();
      showNotification("All data cleared successfully", "success");
    } catch (error) {
      showNotification("Failed to clear data: " + error.message, "error");
    }
  }
}

function showNotification(message, type) {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    z-index: 1000;
    ${type === "success" ? "background: var(--accent-green);" : 
     type === "error" ? "background: #e74c3c;" : "background: var(--accent);"}
  `;
  notification.textContent = message;
  document.querySelector(".options-container").appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}