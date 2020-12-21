let db;
const request = indexedDB.open('budget-buddy', 1);

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
    console.log("ERROR" + event.target.errorCode);
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

                    alert('Your ledger is now up-to-date!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// Function for when online functionality returns
window.addEventListener('online', sendTransaction);