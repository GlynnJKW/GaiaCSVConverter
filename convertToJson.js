const parse = require('csv-parse');
const path = require('path');
const fs = require('fs');

const inPath = process.argv[2];
let outPath = "";

if(process.argv[3]){
    outPath = process.argv[3];
}
else{
    outPath = path.resolve(path.dirname(inPath), path.basename(inPath, '.csv') + ".json");
}
writeStream = fs.createWriteStream(outPath);
writeStream.write('[');
let count = 0;

let parser = parse({
    columns: true
});
parser.on('readable', function(){
    let record;
    while (star = parser.read()){
        if(count > 0){
            writeStream.write(',\n');
        }
        ++count;
        if(count % 100000 == 0){
            console.log(count + " done");
        }
        // console.log(star);
        let d = 1000.0 / star.parallax;
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
        writeStream.write(JSON.stringify(ret));
    }
});

parser.on('end', function(){
    writeStream.write('\n]')
});

fs.createReadStream(inPath).pipe(parser);