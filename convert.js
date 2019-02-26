const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');

const inPath = process.argv[2];
let outPath = "";

if(process.argv[3]){
    outPath = process.argv[3];
}
else{
    outPath = path.basename(inPath, '.csv') + ".json";
}

csv()
    .fromFile(inPath)
    .then((json) => {
        let mapped = json.map(star => {
            let d = 1.0 / star.parallax;
            let decrad = (Math.PI * star.dec) / 180.0;
            let rarad = (Math.PI * star.ra) / 180.0;
            let x = d * Math.cos(rarad) * Math.cos(decrad);
            let y = d * Math.sin(decrad);
            let z = d * Math.sin(rarad) * Math.cos(decrad);

            let ret = {position: {x, y, z}};
            for(let prop in star){
                if(prop != "dec" && prop != "ra" && prop != "parallax"){
                    ret[prop] = star[prop];
                }
            }
            return ret;
        });
        
        fs.writeFileSync(outPath, JSON.stringify(mapped), 'utf8');
    });