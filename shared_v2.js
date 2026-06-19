window.PickleShared = (() => {
    function formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'b';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'm';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    function getLocalStorage(key, fallback) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return fallback;
        }
    }

    function setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }

    // Modal implementations that rely on the DOM
    // They fetch elements lazily so that it works across games
    function showConfirmModal(message) {
        return new Promise((resolve) => {
            const customModal = document.getElementById('custom-modal');
            const customModalMessage = document.getElementById('custom-modal-message');
            const customModalYes = document.getElementById('custom-modal-yes');
            const customModalNo = document.getElementById('custom-modal-no');

            if (!customModal) {
                console.error("Confirm modal element not found.");
                resolve(false);
                return;
            }

            customModalMessage.textContent = message;
            customModal.classList.remove('hidden');

            const handleYes = () => {
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                customModal.classList.add('hidden');
                customModalYes.removeEventListener('click', handleYes);
                customModalNo.removeEventListener('click', handleNo);
            };

            customModalYes.addEventListener('click', handleYes);
            customModalNo.addEventListener('click', handleNo);
        });
    }

    let alertModalActive = false;
    function showAlertModal(message, iconSrc, titleText) {
        if (alertModalActive) return Promise.resolve(true);
        alertModalActive = true;
        return new Promise((resolve) => {
            const alertModal = document.getElementById('alert-modal');
            const alertModalMessage = document.getElementById('alert-modal-message');
            const alertModalIcon = document.getElementById('alert-modal-icon');
            const alertModalTitle = document.getElementById('alert-modal-title');
            const alertModalOk = document.getElementById('alert-modal-ok');

            if (!alertModal) {
                console.error("Alert modal element not found.");
                alertModalActive = false;
                resolve(true);
                return;
            }

            alertModalMessage.textContent = message;
            alertModalIcon.src = iconSrc;
            alertModalTitle.textContent = titleText;
            alertModal.classList.remove('hidden');

            const handleOk = () => {
                alertModal.classList.add('hidden');
                alertModalOk.removeEventListener('click', handleOk);
                alertModalActive = false;
                resolve(true);
            };

            alertModalOk.addEventListener('click', handleOk);
        });
    }

    function showStoreItemModal(item) {
        const storeItemModal = document.getElementById('store-item-modal');
        const storeItemModalIcon = document.getElementById('store-item-modal-icon');
        const storeItemModalTitle = document.getElementById('store-item-modal-title');
        const storeItemModalDesc = document.getElementById('store-item-modal-desc');
        const storeItemModalEffect = document.getElementById('store-item-modal-effect');
        const storeItemModalOk = document.getElementById('store-item-modal-ok');

        if (!storeItemModal) return;

        storeItemModalIcon.src = item.icon;
        storeItemModalTitle.textContent = item.name;
        storeItemModalDesc.textContent = item.desc || "A valuable asset.";
        storeItemModalEffect.textContent = item.effect || "Affects the stonk market.";
        storeItemModal.classList.remove('hidden');

        // Simple closure to handle Ok since this doesn't strictly return a Promise in the original
        // but we need to ensure event listener is removed.
        const handleOk = () => {
            storeItemModal.classList.add('hidden');
            storeItemModalOk.removeEventListener('click', handleOk);
        };
        storeItemModalOk.addEventListener('click', handleOk);
    }

    return {
        formatNumber,
        getLocalStorage,
        setLocalStorage,
        showConfirmModal,
        showAlertModal,
        showStoreItemModal
    };
})();
