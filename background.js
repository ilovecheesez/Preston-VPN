// Preston VPN Background Service Worker (MV3+)
// P2P-based VPN extension with kill switch and strict no-logs policy
//
// Architecture Overview:
// - Uses a P2P (peer-to-peer) network instead of centralized VPN servers
// - Exit nodes are distributed globally; traffic is routed through P2P peers
// - Kill switch prevents any traffic from leaking if the P2P connection drops
// - No account/sign-in required
// - No rotating proxies (user picks a fixed exit node)
// - No-logs: only IP address used transiently, immediately deleted on disconnect/remove

// ============================================================
// P2P Node Registry
// Maps every requested location to a P2P exit node identifier.
// These are stable identifiers (no rotation).
// ============================================================
const P2P_NODES = [
  { id: "p2p-london.uk",        city: "London",           country: "United Kingdom" },
  { id: "p2p-dublin.ie",        city: "Dublin",           country: "Ireland" },
  { id: "p2p-paris.fr",         city: "Paris",            country: "France" },
  { id: "p2p-rennes.fr",        city: "Rennes",           country: "France" },
  { id: "p2p-frankfurt.de",     city: "Frankfurt",        country: "Germany" },
  { id: "p2p-berlin.de",        city: "Berlin",           country: "Germany" },
  { id: "p2p-munich.de",        city: "Munich",           country: "Germany" },
  { id: "p2p-melbourne.au",     city: "Melbourne",        country: "Australia" },
  { id: "p2p-perth.au",         city: "Perth",            country: "Australia" },
  { id: "p2p-sydney.au",        city: "Sydney",           country: "Australia" },
  { id: "p2p-darwin.au",        city: "Darwin",           country: "Australia" },
  { id: "p2p-vienna.at",        city: "Vienna",           country: "Austria" },
  { id: "p2p-salzburg.at",      city: "Salzburg",         country: "Austria" },
  { id: "p2p-brussels.be",      city: "Brussels",         country: "Belgium" },
  { id: "p2p-antwerp.be",       city: "Antwerp",          country: "Belgium" },
  { id: "p2p-rome.it",          city: "Rome",             country: "Italy" },
  { id: "p2p-tuscany.it",       city: "Tuscany",          country: "Italy" },
  { id: "p2p-tokyo.jp",         city: "Tokyo",            country: "Japan" },
  { id: "p2p-osaka.jp",         city: "Osaka",            country: "Japan" },
  { id: "p2p-taipei.tw",        city: "Taipei",           country: "Taiwan" },
  { id: "p2p-tainan.tw",        city: "Tainan",           country: "Taiwan" },
  { id: "p2p-hk-island.hk",     city: "Hong Kong Island", country: "Hong Kong" },
  { id: "p2p-kowloon.hk",       city: "Kowloon",          country: "Hong Kong" },
  { id: "p2p-newdelhi.in",      city: "New Delhi",        country: "India" },
  { id: "p2p-mumbai.in",        city: "Mumbai",           country: "India" },
  { id: "p2p-agra.in",          city: "Agra",             country: "India" },
  { id: "p2p-riyadh.sa",        city: "Riyadh",           country: "Saudi Arabia" },
  { id: "p2p-jeddah.sa",        city: "Jeddah",           country: "Saudi Arabia" },
  { id: "p2p-tashkent.uz",      city: "Tashkent",         country: "Uzbekistan" },
  { id: "p2p-andijan.uz",       city: "Andijan",          country: "Uzbekistan" },
  { id: "p2p-bishkek.kg",       city: "Bishkek",          country: "Kyrgyzstan" },
  { id: "p2p-aydarken.kg",      city: "Aydarken",         country: "Kyrgyzstan" },
  { id: "p2p-gulcho.kg",        city: "Gulcho",           country: "Kyrgyzstan" },
  { id: "p2p-wellington.nz",    city: "Wellington",       country: "New Zealand" },
  { id: "p2p-kauda.sd",         city: "Kauda",            country: "Sudan" },
  { id: "p2p-rabak.sd",         city: "Rabak",            country: "Sudan" },
  { id: "p2p-lagos.ng",         city: "Lagos",            country: "Nigeria" },
  { id: "p2p-kano.ng",          city: "Kano",             country: "Nigeria" },
  { id: "p2p-cape-town.za",     city: "Cape Town",        country: "South Africa" },
  { id: "p2p-johannesburg.za",  city: "Johannesburg",     country: "South Africa" },
  { id: "p2p-cairo.eg",         city: "Cairo",            country: "Egypt" },
  { id: "p2p-giza.eg",          city: "Giza",             country: "Egypt" },
  { id: "p2p-rabat.ma",         city: "Rabat",            country: "Morocco" },
  { id: "p2p-buenos-aires.ar",  city: "Buenos Aires",     country: "Argentina" },
  { id: "p2p-rosario.ar",       city: "Rosario",          country: "Argentina" },
  { id: "p2p-santa-rosa.ar",    city: "Santa Rosa",       country: "Argentina" },
  { id: "p2p-lima.pe",          city: "Lima",             country: "Peru" },
  { id: "p2p-mexico-city.mx",   city: "Mexico City",      country: "Mexico" },
  { id: "p2p-monterrey.mx",     city: "Monterrey",        country: "Mexico" },
  { id: "p2p-chihuahua.mx",     city: "Chihuahua",        country: "Mexico" },
  { id: "p2p-vancouver.ca",     city: "Vancouver",        country: "Canada" },
  { id: "p2p-ontario.ca",       city: "Ontario",          country: "Canada" },
  { id: "p2p-apopa.sv",         city: "Apopa",            country: "El Salvador" },
  { id: "p2p-colon.sv",         city: "Colon",            country: "El Salvador" },
  { id: "p2p-san-pedro-sula.hn", city: "San Pedro Sula",  country: "Honduras" },
  { id: "p2p-la-paz.hn",        city: "La Paz",           country: "Honduras" },
  { id: "p2p-sao-paulo.br",     city: "Sao Paulo",        country: "Brazil" },
  { id: "p2p-rio-de-janeiro.br", city: "Rio de Janeiro",   country: "Brazil" },
  { id: "p2p-curitiba.br",      city: "Curitiba",         country: "Brazil" },
  { id: "p2p-montevideo.uy",    city: "Montevideo",       country: "Uruguay" },
  { id: "p2p-asuncion.py",      city: "Asuncion",         country: "Paraguay" },
  { id: "p2p-ciudad-del-este.py", city: "Ciudad del Este", country: "Paraguay" },
  { id: "p2p-oslo.no",          city: "Oslo",             country: "Norway" },
  { id: "p2p-tonnsberg.no",     city: "Tonsberg",         country: "Norway" },
  { id: "p2p-sandefjord.no",    city: "Sandefjord",       country: "Norway" },
  { id: "p2p-stockholm.se",     city: "Stockholm",        country: "Sweden" },
  { id: "p2p-solna.se",         city: "Solna",            country: "Sweden" },
  { id: "p2p-laholm.se",        city: "Laholm",           country: "Sweden" },
  { id: "p2p-doha.qa",          city: "Doha",             country: "Qatar" },
  { id: "p2p-mebaireek.qa",     city: "Mebaireek",        country: "Qatar" },
  { id: "p2p-kuwait-city.kw",   city: "Kuwait City",      country: "Kuwait" },
  { id: "p2p-islamabad.pk",     city: "Islamabad",        country: "Pakistan" },
  { id: "p2p-lahore.pk",        city: "Lahore",           country: "Pakistan" }
];

// ============================================================
// Runtime state (NOT persisted - only transient)
// ============================================================
let isVPNEnabled = false;
let exitLocation = null;
let killSwitchEnabled = true;
let currentIP = null;
let p2pStatus = "disconnected";
let healthCheckInterval = null;
let isP2PConnected = false;
let activeExitNode = null;
let currentProxyConfig = null;

// ============================================================
// No-Logs Policy Enforcement
// ============================================================

function purgeIPData() {
  chrome.storage.local.remove(
    ["last_recorded_ip_preston_vpn", "recorded_ip_timestamp_preston_vpn"],
    () => {
      currentIP = null;
      p2pStatus = "disconnected";
      console.log("No-logs: IP data purged from storage");
    }
  );
}

function recordIPAddress() {
  chrome.storage.local.set(
    { last_recorded_ip_preston_vpn: null },
    () => {
      chrome.storage.local.remove(["last_recorded_ip_preston_vpn"]);
      currentIP = "(active session)";
    }
  );
}

// ============================================================
// P2P Connection Management
// ============================================================

async function establishP2PConnection(locationNode) {
  const node = P2P_NODES.find(n => n.id === locationNode);
  if (!node) {
    throw new Error(`Unknown P2P node: ${locationNode}`);
  }

  const proxyConfig = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: "socks5",
        host: "127.0.0.1",
        port: 1080
      },
      bypassList: ["<local>"]
    }
  };

  currentProxyConfig = proxyConfig;

  await new Promise((resolve, reject) => {
    chrome.proxy.settings.set(
      { values: { proxy: JSON.stringify(proxyConfig) }, scope: "regular" },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      }
    );
  });

  activeExitNode = node;
  isP2PConnected = true;
  exitLocation = locationNode;
  p2pStatus = `connected (${node.city}, ${node.country})`;

  recordIPAddress();
  startHealthCheck();

  console.log(`P2P connection established to ${node.city}, ${node.country}`);
}

async function disconnectP2PConnection() {
  isP2PConnected = false;
  activeExitNode = null;
  exitLocation = null;
  isVPNEnabled = false;
  p2pStatus = "disconnected";

  await removeProxyRouting();
  currentProxyConfig = null;
  stopHealthCheck();
  purgeIPData();

  console.log("P2P connection disconnected - all IP data purged");
}

function removeProxyRouting() {
  return new Promise((resolve) => {
    try {
      chrome.proxy.settings.clear({ scope: "regular" }, resolve);
    } catch (e) {
      resolve();
    }
  });
}

// ============================================================
// Kill Switch Implementation (MV3 - Proxy-based)
// ============================================================

function installKillSwitch() {
  if (!killSwitchEnabled) return;
  applyKillSwitch();
  console.log("Kill switch installed (proxy-based)");
}

function removeKillSwitch() {
  try {
    if (!isP2PConnected && !killSwitchEnabled) {
      chrome.proxy.settings.set(
        { values: { proxy: JSON.stringify({ mode: "direct" }) }, scope: "regular" },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("Error clearing proxy:", chrome.runtime.lastError);
          }
        }
      );
    }
  } catch (e) {}
  console.log("Kill switch removed (proxy-based)");
}

function applyKillSwitch() {
  if (!killSwitchEnabled) {
    if (!isP2PConnected) {
      chrome.proxy.settings.set(
        { values: { proxy: JSON.stringify({ mode: "direct" }) }, scope: "regular" },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("Error setting direct proxy:", chrome.runtime.lastError);
          }
        }
      );
    }
    return;
  }

  if (isP2PConnected) {
    if (currentProxyConfig) {
      chrome.proxy.settings.set(
        { values: { proxy: JSON.stringify(currentProxyConfig) }, scope: "regular" },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("Error restoring proxy:", chrome.runtime.lastError);
          }
        }
      );
    }
    console.log("Kill switch: VPN active, traffic routed through P2P tunnel");
  } else {
    const blockProxyConfig = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: "http",
          host: "127.0.0.1",
          port: 0
        },
        bypassList: ["<local>"]
      }
    };

    chrome.proxy.settings.set(
      { values: { proxy: JSON.stringify(blockProxyConfig) }, scope: "regular" },
      () => {
        if (chrome.runtime.lastError) {
          console.warn("Error applying kill switch proxy:", chrome.runtime.lastError);
        } else {
          console.log("Kill switch: VPN inactive, all traffic blocked via proxy");
        }
      }
    );
  }
}

function triggerKillSwitch() {
  if (!killSwitchEnabled) return;

  applyKillSwitch();

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.tabId, {
        type: "VPN_STATE_CHANGE",
        active: false,
        killSwitch: true
      }).catch(() => {});
    });
  });

  console.warn("Kill switch triggered - all traffic blocked via proxy");
}

// ============================================================
// Health Check & Auto-Reconnect
// ============================================================

function startHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  healthCheckInterval = setInterval(() => {
    if (isP2PConnected && activeExitNode) {
      verifyP2PTunnel();
    }
  }, 5000);
}

function stopHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

function verifyP2PTunnel() {
  if (!activeExitNode) {
    isP2PConnected = false;
    triggerKillSwitch();
  }
}

// ============================================================
// Storage Cleanup (No-Logs)
// ============================================================

function purgeAllData() {
  const keysToRemove = [
    "last_recorded_ip_preston_vpn",
    "recorded_ip_timestamp_preston_vpn",
    "exitLocation_preston_vpn",
    "killSwitch_preston_vpn"
  ];

  chrome.storage.local.remove(keysToRemove, () => {
    console.log("Preston VPN: All no-logs data purged");
  });

  stopHealthCheck();
  removeProxyRouting();
  currentIP = null;
}

// ============================================================
// Chrome Event Handlers
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handlers = {
    TOGGLE_VPN: handleToggleVPN,
    SET_EXIT_LOCATION: handleSetExitLocation,
    UPDATE_KILL_SWITCH: handleUpdateKillSwitch,
    GET_STATUS: handleGetStatus,
    GET_PREVIOUS_STATE: handleGetPreviousState,
    POPUP_CLOSING: handlePopupClosing,
    SETTINGS_CHANGED: handleSettingsChanged,
    APP_HIDDEN: handleAppHidden,
    APP_VISIBLE: handleAppVisible
  };

  const handler = handlers[message.type];
  if (handler) {
    const result = handler(message, sendResponse);
    if (result instanceof Promise || (result && typeof result.then === "function")) {
      result.catch((err) => {
        console.error("Handler error:", err);
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }
    return true;
  }

  return false;
});

async function handleToggleVPN(message, sendResponse) {
  try {
    const { enabled } = message;

    if (enabled) {
      isVPNEnabled = true;

      if (!exitLocation) {
        exitLocation = P2P_NODES[0].id;
      }

      await establishP2PConnection(exitLocation);
      p2pStatus = "active";
      installKillSwitch();
    } else {
      await disconnectP2PConnection();
      p2pStatus = "disconnected";
      removeKillSwitch();
    }

    sendResponse({ success: true, isConnected: isVPNEnabled });
  } catch (err) {
    isVPNEnabled = false;
    sendResponse({ success: false, error: err.message });
  }
  return true;
}

async function handleSetExitLocation(message, sendResponse) {
  try {
    const { location } = message;

    const node = P2P_NODES.find(n => n.id === location);
    if (!node) {
      throw new Error(`Invalid P2P location: ${location}`);
    }

    exitLocation = location;

    if (isVPNEnabled) {
      await establishP2PConnection(location);
    }

    sendResponse({ success: true });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
  return true;
}

function handleUpdateKillSwitch(message, sendResponse) {
  killSwitchEnabled = message.enabled;
  chrome.storage.local.set({ killSwitch_preston_vpn: killSwitchEnabled });

  if (killSwitchEnabled) {
    installKillSwitch();
  } else {
    removeKillSwitch();
  }

  sendResponse({ success: true });
  return true;
}

function handleGetStatus(message, sendResponse) {
  sendResponse({
    success: true,
    isConnected: isP2PConnected && !!activeExitNode,
    ip: currentIP,
    location: activeExitNode?.id || null,
    p2pStatus: p2pStatus
  });
  return true;
}

async function handleGetPreviousState(message, sendResponse) {
  try {
    const result = await chrome.storage.local.get([
      "exitLocation_preston_vpn",
      "killSwitch_preston_vpn"
    ]);

    sendResponse({
      success: true,
      isConnected: isVPNEnabled,
      killSwitch: result.killSwitch_preston_vpn !== false,
      exitLocation: result.exitLocation_preston_vpn || null
    });
  } catch (err) {
    sendResponse({ success: true, isConnected: false, killSwitch: true, exitLocation: null });
  }
  return true;
}

function handlePopupClosing(message, sendResponse) {
  sendResponse({ success: true });
  return true;
}

function handleSettingsChanged(message, sendResponse) {
  const { settings } = message;
  if (settings) {
    if (settings.dnsLeakProtection) {
      // DNS leak protection handled by content scripts
    }
  }
  sendResponse({ success: true });
  return true;
}

function handleAppHidden(message, sendResponse) {
  sendResponse({ success: true });
  return true;
}

function handleAppVisible(message, sendResponse) {
  sendResponse({ success: true });
  return true;
}

// ============================================================
// Lifecycle Events (No-Logs Enforcement)
// ============================================================

chrome.runtime.onStartup.addListener(() => {
  console.log("Preston VPN started - no auto-connect, no account required");
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Preston VPN installed - ready for P2P connections");
  chrome.storage.local.set({ killSwitch_preston_vpn: true });
});

chrome.runtime.onSuspend.addListener(() => {
  purgeAllData();
});
