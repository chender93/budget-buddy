let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("new_transaction", { autoIncrement: true });
};


request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        sendTransaction();
    }
};

request.onerror = function (event) {
    console.log("Error!" + event.target.errorCode);
};


function saveRecord(record) {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const store = transaction.objectStore('new_transaction');
    store.add(record);
}

function sendTransaction() {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const store = transaction.objectStore("new_transaction");
    const getAll = store.getAll();
   
    getAll.onsuccess = function () {
       
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(["new_transaction"], "readwrite");
                    const store = transaction.objectStore("new_transaction");
                    store.clear();

                    alert('Your ledged has been updated');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', sendTransaction);