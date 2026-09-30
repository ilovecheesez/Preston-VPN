// Preston VPN Popup Controller
// Manages the browser action popup UI for P2P VPN connection

class PrestonVPN {
  constructor() {
    this.isConnected = false;
    this.currentLocation = null;
    this.currentIP = null;
    this.p2pNodeStatus = null;
    
    // Complete P2P node registry with all requested locations
    // Key format: "City, Country" => P2P node endpoint
    this.p2pNodes = [
      { value: "p2p-london.uk", label: "London, United Kingdom" },
      { value: "p2p-dublin.ie", label: "Dublin, Ireland" },
      { value: "p2p-paris.fr", label: "Paris, France" },
      { value: "p2p-rennes.fr", label: "Rennes, France" },
      { value: "p2p-frankfurt.de", label: "Frankfurt, Germany" },
      { value: "p2p-berlin.de", label: "Berlin, Germany" },
      { value: "p2p-munich.de", label: "Munich, Germany" },
      { value: "p2p-melbourne.au", label: "Melbourne, Australia" },
      { value: "p2p-perth.au", label: "Perth, Australia" },
      { value: "p2p-sydney.au", label: "Sydney, Australia" },
      { value: "p2p-darwin.au", label: "Darwin, Australia" },
      { value: "p2p-vienna.at", label: "Vienna, Austria" },
      { value: "p2p-salzburg.at", label: "Salzburg, Austria" },
      { value: "p2p-brussels.be", label: "Brussels, Belgium" },
      { value: "p2p-antwerp.be", label: "Antwerp, Belgium" },
      { value: "p2p-rome.it", label: "Rome, Italy" },
      { value: "p2p-tuscany.it", label: "Tuscany, Italy" },
      { value: "p2p-tokyo.jp", label: "Tokyo, Japan" },
      { value: "p2p-osaka.jp", label: "Osaka, Japan" },
      { value: "p2p-taipei.tw", label: "Taipei, Taiwan" },
      { value: "p2p-tainan.tw", label: "Tainan, Taiwan" },
      { value: "p2p-hk-island.hk", label: "Hong Kong Island, Hong Kong" },
      { value: "p2p-kowloon.hk", label: "Kowloon, Hong Kong" },
      { value: "p2p-newdelhi.in", label: "New Delhi, India" },
      { value: "p2p-mumbai.in", label: "Mumbai, India" },
      { value: "p2p-agra.in", label: "Agra, India" },
      { value: "p2p-riyadh.sa", label: "Riyadh, Saudi Arabia" },
      { value: "p2p-jeddah.sa", label: "Jeddah, Saudi Arabia" },
      { value: "p2p-tashkent.uz", label: "Tashkent, Uzbekistan" },
      { value: "p2p-andijan.uz", label: "Andijan, Uzbekistan" },
      { value: "p2p-bishkek.kg", label: "Bishkek, Kyrgyzstan" },
      { value: "p2p-aydarken.kg", label: "Aydarken, Kyrgyzstan" },
      { value: "p2p-gulcho.kg", label: "Gulcho, Kyrgyzstan" },
      { value: "p2p-wellington.nz", label: "Wellington, New Zealand" },
      { value: "p2p-kauda.sd", label: "Kauda, Sudan" },
      { value: "p2p-rabak.sd", label: "Rabak, Sudan" },
      { value: "p2p-lagos.ng", label: "Lagos, Nigeria" },
      { value: "p2p-kano.ng", label: "Kano, Nigeria" },
      { value: "p2p-cape-town.za", label: "Cape Town, South Africa" },
      { value: "p2p-johannesburg.za", label: "Johannesburg, South Africa" },
      { value: "p2p-cairo.eg", label: "Cairo, Egypt" },
      { value: "p2p-giza.eg", label: "Giza, Egypt" },
      { value: "p2p-rabat.ma", label: "Rabat, Morocco" },
      { value: "p2p-buenos-aires.ar", label: "Buenos Aires, Argentina" },
      { value: "p2p-rosario.ar", label: "Rosario, Argentina" },
      { value: "p2p-santa-rosa.ar", label: "Santa Rosa, Argentina" },
      { value: "p2p-lima.pe", label: "Lima, Peru" },
      { value: "p2p-mexico-city.mx", label: "Mexico City, Mexico" },
      { value: "p2p-monterrey.mx", label: "Monterrey, Mexico" },
      { value: "p2p-chihuahua.mx", label: "Chihuahua, Mexico" },
      { value: "p2p-vancouver.ca", label: "Vancouver, Canada" },
      { value: "p2p-ontario.ca", label: "Ontario, Canada" },
      { value: "p2p-apopa.sv", label: "Apopa, El Salvador" },
      { value: "p2p-colon.sv", label: "Colon, El Salvador" },
      { value: "p2p-san-pedro-sula.hn", label: "San Pedro Sula, Honduras" },
      { value: "p2p-la-paz.hn", label: "La Paz, Honduras" },
      { value: "p2p-sao-paulo.br", label: "Sao Paulo, Brazil" },
      { value: "p2p-rio-de-janeiro.br", label: "Rio de Janeiro, Brazil" },
      { value: "p2p-curitiba.br", label: "Curitiba, Brazil" },
      { value: "p2p-montevideo.uy", label: "Montevideo, Uruguay" },
      { value: "p2p-asuncion.py", label: "Asuncion, Paraguay" },
      { value: "p2p-ciudad-del-este.py", label: "Ciudad del Este, Paraguay" },
      { value: "p2p-oslo.no", label: "Oslo, Norway" },
      { value: "p2p-tonnsberg.no", label: "Tonsberg, Norway" },
      { value: "p2p-sandefjord.no", label: "Sandefjord, Norway" },
      { value: "p2p-stockholm.se", label: "Stockholm, Sweden" },
      { value: "p2p-solna.se", label: "Solna, Sweden" },
      { value: "p2p-laholm.se", label: "Laholm, Sweden" },
      { value: "p2p-doha.qa", label: "Doha, Qatar" },
      { value: "p2p-mebaireek.qa", label: "Mebaireek, Qatar" },
      { value: "p2p-kuwait-city.kw", label: "Kuwait City, Kuwait" },
      { value: "p2p-islamabad.pk", label: "Islamabad, Pakistan" },
      { value: "p2p-lahore.pk", label: "Lahore, Pakistan" }
    ];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.populateLocationDropdown();
    this.loadStoredPreferences();
    this.startStatusPolling();
  }

  setupEventListeners() {
    document.getElementById("vpnToggle").addEventListener("change", (e) => {
      this.handleVPNToggle(e.target.checked);
    });

    document.getElementById("killSwitchToggle").addEventListener("change", (e) => {
      this.handleKillSwitchToggle(e.target.checked);
    });

    document.getElementById("locationSelect").addEventListener("change", (e) => {
      this.handleLocationChange(e.target.value);
    });

    window.addEventListener("beforeunload", () => {
      this.sendBackgroundMessage({ type: "POPUP_CLOSING" });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.sendBackgroundMessage({ type: "APP_HIDDEN" });
      }
    });
  }

  populateLocationDropdown() {
    const select = document.getElementById("locationSelect");
    select.innerHTML = '<option value="" disabled selected>-- Choose a location --</option>';

    // Group by country
    const countries = {};
    this.p2pNodes.forEach(node => {
      const parts = node.label.split(", ");
      const city = parts[0];
      const country = parts[1];
      if (!countries[country]) countries[country] = [];
      countries[country].push({ value: node.value, label: city });
    });

    Object.keys(countries).sort().forEach(country => {
      const group = document.createElement("optgroup");
      group.label = country;
      countries[country].forEach(city => {
        const option = document.createElement("option");
        option.value = city.value;
        option.textContent = `${city.label}, ${country}`;
        group.appendChild(option);
      });
      select.appendChild(group);
    });
  }

  async loadStoredPreferences() {
    try {
      const resp = await this.sendBackgroundMessage({ type: "GET_PREVIOUS_STATE" });
      if (resp?.success) {
        if (resp.isConnected !== undefined) {
          this.isConnected = resp.isConnected;
          this.updateToggleUI(resp.isConnected);
          this.updateConnectionUI(resp.isConnected);
        }
        if (resp.killSwitch !== undefined) {
          document.getElementById("killSwitchToggle").checked = resp.killSwitch;
        }
        if (resp.exitLocation) {
          document.getElementById("locationSelect").value = resp.exitLocation;
          this.currentLocation = resp.exitLocation;
        }
      }
    } catch (e) {
      console.error("Failed to load preferences:", e);
    }
  }

  async handleVPNToggle(isEnabled) {
    if (isEnabled && !this.currentLocation) {
      this.showError("Please select a P2P location first");
      document.getElementById("vpnToggle").checked = false;
      return;
    }

    this.setConnectingState(true);

    try {
      const resp = await this.sendBackgroundMessage({
        type: "TOGGLE_VPN",
        enabled: isEnabled
      });

      if (resp?.success) {
        this.isConnected = isEnabled;
        this.updateConnectionUI(isEnabled);
        this.setConnectingState(false);
        
        if (!isEnabled) {
          document.getElementById("locationSelect").value = "";
          this.currentLocation = null;
        }
      } else {
        this.showError(resp?.error || "Failed to toggle VPN");
        this.setConnectingState(false);
        document.getElementById("vpnToggle").checked = false;
      }
    } catch (e) {
      this.showError("Error: " + e.message);
      this.setConnectingState(false);
      document.getElementById("vpnToggle").checked = false;
    }
  }

  async handleKillSwitchToggle(isEnabled) {
    try {
      await this.sendBackgroundMessage({ type: "UPDATE_KILL_SWITCH", enabled: isEnabled });
      chrome.storage.local.set({ killSwitch_preston_vpn: isEnabled });
    } catch (e) {
      console.error("Kill switch update failed:", e);
    }
  }

  async handleLocationChange(value) {
    if (!value) return;
    this.currentLocation = value;
    
    try {
      const resp = await this.sendBackgroundMessage({ type: "SET_EXIT_LOCATION", location: value });
      if (resp?.success) {
        const label = this.p2pNodes.find(n => n.value === value)?.label || value;
        document.getElementById("currentLocation").textContent = label;
        chrome.storage.local.set({ exitLocation_preston_vpn: value, exitLocationLabel_preston_vpn: label });
      } else {
        this.showError(resp?.error || "Failed to set location");
      }
    } catch (e) {
      this.showError("Error: " + e.message);
    }
  }

  setConnectingState(isConnecting) {
    const badge = document.getElementById("statusBadge");
    const label = document.getElementById("toggleLabel");
    if (isConnecting) {
      badge.textContent = "Connecting";
      badge.classList.add("connecting");
    } else {
      badge.classList.remove("connecting");
    }
  }

  updateConnectionUI(isConnected) {
    const badge = document.getElementById("statusBadge");
    const label = document.getElementById("toggleLabel");
    badge.textContent = isConnected ? "Connected" : "Disconnected";
    badge.classList.toggle("connected", isConnected);
    label.textContent = isConnected ? "Connected" : "Connect VPN";
  }

  updateToggleUI(checked) {
    document.getElementById("vpnToggle").checked = checked;
  }

  updateIPDisplay(ip) {
    document.getElementById("currentIp").textContent = ip || "--.--.--.--";
  }

  updateP2PStatus(status) {
    document.getElementById("p2pStatus").textContent = status || "--";
  }

  startStatusPolling() {
    const poll = async () => {
      try {
        const resp = await this.sendBackgroundMessage({ type: "GET_STATUS" });
        if (resp?.success) {
          if (resp.ip && resp.ip !== this.currentIP) {
            this.currentIP = resp.ip;
            this.updateIPDisplay(resp.ip);
          }
          if (resp.p2pStatus !== this.p2pNodeStatus) {
            this.p2pNodeStatus = resp.p2pStatus;
            this.updateP2PStatus(resp.p2pStatus);
          }
          if (resp.isConnected !== this.isConnected) {
            this.isConnected = resp.isConnected;
            this.updateToggleUI(resp.isConnected);
            this.updateConnectionUI(resp.isConnected);
          }
        }
      } catch (e) {
        // Ignore - may just be transient
      }
    };

    poll();
    this.pollInterval = setInterval(poll, 3000);
  }

  sendBackgroundMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  showError(message) {
    console.error(message);
    const existing = document.querySelector(".error-msg");
    if (existing) existing.remove();
    
    const el = document.createElement("div");
    el.className = "error-msg";
    el.textContent = message;
    el.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#e74c3c;color:#fff;padding:10px 15px;border-radius:5px;font-size:12px;z-index:1000;";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

new PrestonVPN();