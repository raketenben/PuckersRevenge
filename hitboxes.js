//ground
let groundDefine = [/*
    {
        type:'box',
        size:{x:2.25,y:0.015,z:2.25},
        offset:{x:0,y:-0.0075,z:0},
    },*/
    /*ground*/
    {
        type:'box',
        size:{x:0.875,y:0.015,z:2.25},
        offset:{x:1.4,y:-0.0075,z:0},
    },
    {
        type:'box',
        size:{x:0.875,y:0.015,z:2.25},
        offset:{x:-1.4,y:-0.0075,z:0},
    },
    {
        type:'box',
        size:{x:0.5,y:0.015,z:0.875},
        offset:{x:0,y:-0.0075,z:1.4},
    },
    {
        type:'box',
        size:{x:0.5,y:0.015,z:0.875},
        offset:{x:0,y:-0.0075,z:-1.4},
    },
    /*walls*/
    {
        type:'box',
        size:{x:2.27,y:1.5,z:0.02},
        offset:{x:0,y:1.5,z:2.25},
    },
    {
        type:'box',
        size:{x:2.27,y:1.5,z:0.02},
        offset:{x:0,y:1.5,z:-2.25},
    },
    {
        type:'box',
        size:{x:0.02,y:1.5,z:2.27},
        offset:{x:-2.25,y:1.5,z:0},
    },
    /*ceiling*/
    {
        type:'box',
        size:{x:2.25,y:0.015,z:2.25},
        offset:{x:0,y:3,z:0},
    },
];
//elevator
let hitboxDefine = [
    {
        type:'box',
        size:{x:0.5,y:0.02,z:0.5},
        offset:{x:0,y:-0.01,z:0},
    },
    {
        type:'box',
        size:{x:0.5,y:0.4,z:0.015},
        offset:{x:0,y:0.4,z:0.5},
    },
    {
        type:'box',
        size:{x:0.5,y:0.4,z:0.015},
        offset:{x:0,y:0.4,z:-0.5},
    },
];

export default {ground:groundDefine,elevator:hitboxDefine};