class inputManager {

    constructor(){
        window.onkeydown = addEventListener('keydown', (e) => {this.keyEventDown(e)}, false);
        window.addEventListener('keyup',  (e) => {this.keyEventUp(e)}, false);
        return this;
    }
    states = [];

    get = (v) => {
        return this.states[v];
    }

    keyEventDown(e){
        this.states[e.key.toLowerCase()] = true;
    }

    keyEventUp(e){
        this.states[e.key.toLowerCase()] = false;
    }
}

export default inputManager;