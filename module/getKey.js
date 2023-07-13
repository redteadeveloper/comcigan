const http = require("http")
const got = require('got')

let html = ""

await got("http://comci.kr:4082/st").then(result => {
    let str = result.body.toString().match(/(function school_ra\(sc\)\{\$\.ajax\(\{ url:'\.\/)[0-9]+\?[0-9]+[a-z]\'\+sc\,/).toString()
    html = (str.replace("function school_ra(sc){$.ajax({ url:'./", "").replace("'+sc,,function school_ra(sc){$.ajax({ url:'./", ""))
}).catch(err => {
    console.log(err);
});

console.log(html)