var http = require("http");
var server = http.createServer(handleRequest);
var fs = require("fs")
var qs = require("querystring")
var url = require("url")
var contactDir = __dirname + "/contacts/";
function handleRequest(req, res) {
    var store = '';
    let parsedUrl = url.parse(req.url, true)
    var fileName = parsedUrl.query.username + ".json";
    req.on("data", (chunk) => {
        store = store + chunk;
    })
    req.on("end", () => {
        if (req.method == "GET" && req.url == "/") {
            fs.readFile("./index.html", (err, content) => {
                res.write(content)
                res.end();
            })
        }
        if (req.method == "GET" && req.url == "/about") {
            fs.readFile("./about.html", (err, content) => {
                res.write(content)
                res.end();
            })
        }
        if (req.method == "GET" && req.url == "/contact") {
            res.setHeader("content-type", "text/html");
            fs.readFile("./contact.html", (err, content) => {
                res.write(content)
                res.end();
            })
        }
        else if (req.url.split('.').pop() === 'jpeg') {
            res.setHeader('Content-Type', `image/${req.url.split(".").pop()}`);
            fs.createReadStream(__dirname + req.url).pipe(res);
        }
        else if (req.url.split('.').pop() === 'css') {
            res.setHeader('Content-Type', 'text/css');
            fs.createReadStream(__dirname + req.url).pipe(res);
        }
        if (req.method == "POST" && req.url == "/form") {
            var formData = JSON.stringify(qs.parse(store));
            var username = qs.parse(store).username;
            fs.open(contactDir + username + ".json", "wx", (err, fd) => {
                if (err) return console.log(err)
                fs.writeFile(fd, formData, (err) => {
                    if (err) return console.log(err)
                    fs.close(fd, (err) => {
                        res.end(`${username} successfully created`);
                    });
                });
            });
        }
        if (req.method == "GET" && parsedUrl.pathname == "/users" && parsedUrl.query.username) {
            fs.readFile(`./contacts/${fileName}`, ((err, content) => {
                res.write(content)
                res.end();
            }));
        }
        if (req.method == "GET" && parsedUrl.pathname == "/users") {
            let fileNames = fs.readdirSync(__dirname + "/contacts")
            fileNames.forEach((fileName, i, arr) => {
                fs.readFile((contactDir + fileName), (err, content) => {
                    let stringData = qs.parse(content.toString());
                    console.log(stringData);
                    let username = stringData.username;
                    console.log(username);
                    res.write(`<a href="/users?username=${username}">${username}</a></br>`)
                    if(arr.length === i) res.end();
                })
            })
        }
    })
}
        server.listen(5000, () => { })