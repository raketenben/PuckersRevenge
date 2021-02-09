class levelLoader {
    constructor(){
        return this;
    }

    load(levelname,res,upd,rej){
        fetch('https://puckersrevenge.if-loop.mywire.org/api/level').then(function(data){
            res(data)
        }).catch(function(err){
            rej(err)
        })
    }

}
export default levelLoader;