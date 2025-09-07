window.StorageSync = (function() {
  const key = 129;

  function encrypt(str) {
    return btoa([...str].map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join(''));
  }

  function decrypt(str) {
    return [...atob(str)].map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');
  }

  function getCookies() {
    const cookies = {};
    document.cookie.split(";").forEach(cookie => {
      const [name, ...rest] = cookie.split("=");
      if (!name) return;
      cookies[name.trim()] = rest.join("=");
    });
    return cookies;
  }

  function setCookies(cookies) {
    for (const k in cookies) {
      document.cookie = `${k}=${cookies[k]}; path=/`;
    }
  }

  function exportStorage() {
    const data = { localStorage: {}, sessionStorage: {}, cookies: getCookies() };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      data.localStorage[k] = localStorage.getItem(k);
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      data.sessionStorage[k] = sessionStorage.getItem(k);
    }
    return encrypt(JSON.stringify(data));
  }

  function importStorage(encryptedData) {
    try {
      const data = JSON.parse(decrypt(encryptedData));
      if (data.localStorage) Object.keys(data.localStorage).forEach(k => localStorage.setItem(k, data.localStorage[k]));
      if (data.sessionStorage) Object.keys(data.sessionStorage).forEach(k => sessionStorage.setItem(k, data.sessionStorage[k]));
      if (data.cookies) setCookies(data.cookies);
      return true;
    } catch {
      return false;
    }
  }

  function downloadEncrypted(filename = "browser-storage-export.enc.json") {
    const blob = new Blob([exportStorage()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { exportStorage, importStorage, downloadEncrypted };
})();
