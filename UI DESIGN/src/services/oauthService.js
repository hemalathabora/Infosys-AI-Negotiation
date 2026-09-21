// Real Google and GitHub OAuth Authentication Service

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}/auth`
  : "http://localhost:8000/api/auth";

let cachedOauthConfig = null;

// Fetch OAuth Client IDs from backend configuration
export async function getOauthConfig() {
  if (cachedOauthConfig) return cachedOauthConfig;
  try {
    const res = await fetch(`${API_BASE_URL}/config`);
    if (res.ok) {
      cachedOauthConfig = await res.json();
      return cachedOauthConfig;
    }
  } catch (err) {
    console.warn("Could not load backend OAuth config:", err);
  }
  return {
    google_client_id: "1020175991005-aci29ngmc4u3c2227i4d3ct6t3c8dj20.apps.googleusercontent.com",
    github_client_id: "Ov23liGUUoaQ4lwt12Cm",
  };
}

// Load Google Identity Services (GIS) Script dynamically
let googleGisLoaded = false;
function loadGoogleGisScript() {
  return new Promise((resolve) => {
    if (googleGisLoaded || window.google?.accounts?.oauth2) {
      googleGisLoaded = true;
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleGisLoaded = true;
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Initiates Real Google Sign In popup.
 * Returns { provider: "google", token_or_code, redirect_uri }
 */
export async function startGoogleSignIn() {
  const config = await getOauthConfig();
  const googleClientId = config.google_client_id;

  if (!googleClientId) {
    throw new Error("Google Client ID is not configured on the backend.");
  }

  // Attempt 1: Try Official Google Identity Services GIS SDK popup first
  const gisLoaded = await loadGoogleGisScript();
  if (gisLoaded && window.google?.accounts?.oauth2) {
    return new Promise((resolve, reject) => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error || "Google sign-in was cancelled or failed."));
            } else if (response.access_token) {
              resolve({
                provider: "google",
                token_or_code: response.access_token,
                redirect_uri: window.location.origin,
              });
            } else {
              reject(new Error("No access token returned from Google."));
            }
          },
          onerror: (err) => reject(new Error("Google OAuth error: " + JSON.stringify(err))),
        });
        client.requestAccessToken();
      } catch (err) {
        console.warn("GIS Client failed, falling back to popup window:", err);
        openGooglePopup(googleClientId).then(resolve).catch(reject);
      }
    });
  }

  // Attempt 2: Fallback to standard Google OAuth 2.0 Popup window
  return openGooglePopup(googleClientId);
}

function openGooglePopup(googleClientId) {
  return new Promise((resolve, reject) => {
    const redirectUri = `${window.location.origin}/oauth/callback/google`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token%20id_token&` +
      `scope=${encodeURIComponent("openid email profile")}&` +
      `nonce=${Math.random().toString(36).substring(2)}&` +
      `prompt=select_account`;

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      googleAuthUrl,
      "Google OAuth",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      return reject(new Error("Popup window was blocked by browser. Please allow popups for Google sign-in."));
    }

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "NEGOMIND_OAUTH_RESPONSE") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        const { token, code } = event.data;
        if (token || code) {
          resolve({
            provider: "google",
            token_or_code: token || code,
            redirect_uri: redirectUri,
          });
        } else {
          reject(new Error("Failed to receive Google authorization response."));
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("Google sign-in popup was closed before completion."));
      }
    }, 1000);
  });
}

/**
 * Initiates Real GitHub OAuth popup.
 * Returns { provider: "github", token_or_code, redirect_uri }
 */
export async function startGithubSignIn() {
  const config = await getOauthConfig();
  const githubClientId = config.github_client_id;

  if (!githubClientId) {
    throw new Error("GitHub Client ID is not configured on the backend.");
  }

  return new Promise((resolve, reject) => {
    const redirectUri = `${window.location.origin}/oauth/callback/github`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${encodeURIComponent(githubClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent("read:user user:email")}&` +
      `state=${Math.random().toString(36).substring(2)}`;

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      githubAuthUrl,
      "GitHub OAuth",
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      return reject(new Error("Popup window was blocked by browser. Please allow popups for GitHub sign-in."));
    }

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "NEGOMIND_OAUTH_RESPONSE") {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkClosed);
        const { code, token } = event.data;
        if (code || token) {
          resolve({
            provider: "github",
            token_or_code: code || token,
            redirect_uri: redirectUri,
          });
        } else {
          reject(new Error("Failed to receive authorization code from GitHub."));
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("GitHub sign-in popup was closed before completion."));
      }
    }, 1000);
  });
}
