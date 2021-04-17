const apiEndpoint = "https://puckersrevenge.if-loop.mywire.org";
//const apiEndpoint = "";
const databaseName = "PuckersRevenge";
const databaseVersion = 2;
const objectStoreName = "assets";
const objectStoreKeyName = "name";

class assetManager {
    db;

    constructor(){
        return this;
    }

    init(){
        return new Promise((res,rej) => {
            let request = window.indexedDB.open(databaseName, databaseVersion);
            request.onerror = (err) => {
                rej(err);
            }
            request.onupgradeneeded = (event) => {
                let _db = event.target.result;
                if(_db.objectStoreNames.contains(objectStoreName)){
                    _db.deleteObjectStore(objectStoreName);
                }
                _db.createObjectStore(objectStoreName, { keyPath: objectStoreKeyName });
            }
            request.onsuccess = (event) => {
                this.db = event.target.result;
                res();
            }
        });
    }

    blobToDataURL(blob) {
        return new Promise(function(res,rej){
            let a = new FileReader();
            a.onload = function(e) {res(e.target.result);}
            a.onerror = function(e) {rej(e);}
            a.readAsDataURL(blob);
        });
    }

    downloadAsBlob(url,res,progress,rej){
        fetch(url).then((response) => {
            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength, 10); 
            let loaded = 0;
            
            let stream = new ReadableStream({
                start(controller) {
                    let reader = response.body.getReader();
    
                    function push(){
                        reader.read().then((update) => {
                            if (update.done) {
                                controller.close();
                                return;
                            }
                            loaded += update.value.byteLength;
                            progress({loaded, total})
    
                            controller.enqueue(update.value);
                            push();
                        })
                    }
                    push();
                }
            });
            new Response(stream).blob().then((blob) => {
                res(blob);
            },(err) => {
                rej(err);
            })
        });
    }

    convertObjectBlobToDataUrl(object){
        return new Promise((res,rej) => {
            this.blobToDataURL(object.object).then((modelDataUrl) => {
                this.blobToDataURL(object.env).then((enviromentDataUrl) => {
                    res({name:object.name,env:enviromentDataUrl,object:modelDataUrl,hitBoxes:object.hitBoxes});
                },rej);
            },rej);
        });
    }

    downloadObject(objectName,res,prog,rej){
        let currentTotal = 0;
        let previousTotal = 0;
        let loaded = 0;
        this.downloadAsBlob(`${apiEndpoint}/api/object/${objectName}`,(objectData) => {
            previousTotal = currentTotal;
            this.downloadAsBlob(`${apiEndpoint}/resources/${objectName}/model.glb`,(model) => {
                previousTotal = currentTotal;
                this.downloadAsBlob(`${apiEndpoint}/resources/${objectName}/env.png`,(enviroment) => {
                    objectData.text().then((dataText) => {
                        let data = JSON.parse(dataText);
                        res({name:objectName,env:enviroment,object:model,hitBoxes:data.hitBoxes})
                    })
                },(progress) => {
                    currentTotal = previousTotal + progress.total;
                    loaded = previousTotal + progress.loaded;
                    prog({total:currentTotal,loaded:loaded,tag:"enviroment"});
                },rej);
            },(progress) => {
                currentTotal = previousTotal + progress.total;
                loaded = previousTotal + progress.loaded;
                prog({total:currentTotal,loaded:loaded,tag:"model"});
            },rej);
        },(progress) => {
            currentTotal = previousTotal + progress.total;
            loaded = previousTotal + progress.loaded;
            prog({total:currentTotal,loaded:loaded,tag:"objectData"});
        },rej);
    }

    retrieveObject(objectName,res,prog,rej){
        this.checkIfObjectInCache(objectName).then(() => {
            //Object already present
            console.info("object already available")
            let gameObjectsStore = this.db.transaction(objectStoreName,"readonly").objectStore(objectStoreName);
            let request = gameObjectsStore.get(objectName);
            request.onsuccess = (data) => {
                this.convertObjectBlobToDataUrl(data.target.result).then(data => {
                    res(data)
                });
            }
            request.onerror = (err) => rej(err);
        },() => {
            //Object needs to be downlaoded
            console.info("object needs to be downloaded")
            this.downloadObject(objectName,(object) => {
                //save object
                let transaction = this.db.transaction(objectStoreName,"readwrite")
                let gameObjectsStore = transaction.objectStore(objectStoreName);
                let addObject = gameObjectsStore.add(object);
                addObject.onerror = rej;
                addObject.onsuccess = (event) => {
                    console.info("object finished downloading");
                    this.convertObjectBlobToDataUrl(object).then(data => {
                        res(data)
                    });
                };
            },prog,rej);
        });
    }

    checkIfObjectInCache(objectName){
        return new Promise((res,rej) => {
            //new transaction
            let transaction = this.db.transaction(objectStoreName,"readonly");
            let gameObjectsStore = transaction.objectStore(objectStoreName);
            let check = gameObjectsStore.get(objectName);
            check.onsuccess = (event) => {
                //check if resource available
                if (event.target.result !== undefined) {
                    res();
                } else {
                    rej(event.target.result);
                }
            };
            check.onerror = (err) => {
                //reject on fail
                rej(err);
            };
        })
    }
}
export default assetManager;