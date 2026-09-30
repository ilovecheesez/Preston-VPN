// Preston VPN Content Script
// Blocks WebRTC leaks and DNS leaks when VPN is active
// Runs on all pages to enforce privacy

(function() {
  "use strict";
  
  // Only operate when VPN is active
  let vpnActive = false;
  let killSwitchActive = false;
  
  // Message listener for VPN state changes
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "VPN_STATE_CHANGE") {
        vpnActive = message.active;
        killSwitchActive = message.killSwitch;
        
        if (killSwitchActive && !vpnActive) {
          blockAllRequests();
        }
      }
    });
  }
  
  // Block WebRTC leaks
  function blockWebRTC() {
    if (!vpnActive) return;
    
    // Override RTCPeerConnection to prevent IP leaks
    if (typeof RTCPeerConnection !== "undefined") {
      const originalRTCPeerConnection = RTCPeerConnection;
      window.RTCPeerConnection = function(...args) {
        const pc = new originalRTCPeerConnection(...args);
        
        // Filter out local IP addresses in ICE candidates
        const originalAddIceCandidate = pc.addIceCandidate.bind(pc);
        pc.addIceCandidate = function(candidate) {
          if (candidate && candidate.candidate) {
            // Block local IP candidates
            if (candidate.candidate.includes("host") || 
                candidate.candidate.includes("192.168") ||
                candidate.candidate.includes("10.") ||
                candidate.candidate.includes("172.16") ||
                candidate.candidate.includes("::1") ||
                candidate.candidate.includes("fe80")) {
              return Promise.resolve();
            }
          }
          return originalAddIceCandidate(candidate);
        };
        
        return pc;
      };
    }
  }
  
  // Block DNS leaks
  function blockDNSLeaks() {
    if (!vpnActive) return;
    
    // Override DNS resolution to prevent leaks
    if (typeof document !== "undefined") {
      // Block DNS prefetch
      const links = document.querySelectorAll('link[rel="dns-prefetch"]');
      links.forEach(link => link.remove());
      
      // Block preconnect
      const preconnects = document.querySelectorAll('link[rel="preconnect"]');
      preconnects.forEach(link => link.remove());
    }
  }
  
  // Block all requests when kill switch is triggered
  function blockAllRequests() {
    if (!killSwitchActive || vpnActive) return;
    
    // Prevent all network requests
    const block = () => {
      throw new Error("Network blocked by Preston VPN kill switch");
    };
    
    // Block fetch
    if (typeof fetch !== "undefined") {
      window.fetch = block;
    }
    
    // Block XMLHttpRequest
    if (typeof XMLHttpRequest !== "undefined") {
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(...args) {
        throw new Error("Network blocked by Preston VPN kill switch");
      };
    }
  }
  
  // Initialize leak protection
  function init() {
    blockWebRTC();
    blockDNSLeaks();
    
    // Monitor DOM changes for new DNS-related elements
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                const rel = node.getAttribute && node.getAttribute("rel");
                if (rel === "dns-prefetch" || rel === "preconnect") {
                  node.remove();
                }
              }
            });
          }
        });
      });
      
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();